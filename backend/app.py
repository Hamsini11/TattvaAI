import datetime
import json
from pathlib import Path
import os
import re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import anthropic
import uuid
import psycopg2
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from database.ayurvedic_retrieval import cached_retrieve
from functools import lru_cache

load_dotenv()
_response_cache = {}

# Initialize FastAPI
app = FastAPI()

def get_cached_response(messages, session_id):
    """Get cached response based on the last user message"""
    last_user_message = [msg for msg in messages if msg.sender == "user"][-1].text
    cache_key = f"{session_id}_{last_user_message}"
    return _response_cache.get(cache_key)

def save_cached_response(messages, session_id, response):
    """Save response to cache"""
    last_user_message = [msg for msg in messages if msg.sender == "user"][-1].text
    cache_key = f"{session_id}_{last_user_message}"
    _response_cache[cache_key] = response

# System prompt for Claude
SYSTEM_PROMPT = """
    You are an Ayurvedic expert named Tattvavid(translates to "knower of the truth" or "one who understands the essence" (tattva)) who helps people discover their Prakriti (constitution) through friendly conversation. 

    INITIAL APPROACH:
    - Begin by warmly greeting the user and asking which age group they belong to: child (under 16), young adult (16-30), adult (31-60), or senior (over 60)
    - Adapt your language and examples based on their age group
    - Ask questions in a conversational, respectful manner rather than clinical format
    - For sensitive topics (like digestion or elimination), use gentle phrasing and euphemisms appropriate to their age

    QUESTION MAPPING:
    - The questionnaire.json file contains the official assessment questions and options
    - You should ask these questions in a natural, conversational way
    - Map user responses back to the closest option in the questionnaire, even if they don't use the exact wording
    - For example, if they say "I'm always cold" you might map to "Tends to be dry or rough with visible veins" for skin quality

    INTERPRETATION GUIDELINES:
    - For ambiguous answers, ask follow-up questions to clarify
    - If a response seems to combine multiple doshas, weight it proportionally
    - When responses don't clearly align with any option, use your knowledge of Ayurvedic principles to make the best assessment
    - Certain questions are more significant indicators for specific doshas - prioritize these in your analysis

    After completing all questions, analyze their responses and determine the percentages of Vata, Pitta, and Kapha in:
    1. Deha Prakriti (Physical constitution)
    2. Manas Prakriti (Mental constitution)
    3. Guna Prakriti (Quality of nature)

    Return a JSON object with this structure:
        {
            "deha_prakriti": {"vata": number, "pitta": number, "kapha": number},
            "manas_prakriti": {"vata": number, "pitta": number, "kapha": number},
            "guna_prakriti": {"sattva": number, "rajas": number, "tamas": number},
            "backend_code": "D-X; M-Y; G-Z",
            "mixed_constitution": "Having a mixed constitution is common and reflects the complexity of individual nature.",
            "accuracy_disclaimer": "This assessment provides general insights based on your responses. For personalized guidance, consult an Ayurvedic practitioner.",
            "calculation_method": "Your responses are analyzed using Claude AI which weighs answers according to traditional Ayurvedic principles.",
            "reassessment": "We recommend reassessing every 6-12 months or after significant lifestyle changes."
        }

        Where:
        - Each set of percentages must add up to 100.
        - X in backend_code is the dominant dosha in deha_prakriti (P for Pitta, V for Vata, K for Kapha)
        - Y in backend_code is the dominant dosha in manas_prakriti (P for Pitta, V for Vata, K for Kapha)
        - Z in backend_code is the dominant guna in guna_prakriti (S for Sattva, R for Rajas, T for Tamas)

        After providing results, prompt the user to visit the home page for further insights about their prakriti.
"""

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080"],  # Add all frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    text: str
    sender: str
    timestamp: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: Optional[str] = None

# Database connection
def get_db_connection():
    try:
        print("Attempting database connection...")
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "postgres"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "adminh"),
            port=os.getenv("DB_PORT", "5432")
        )
        print(f"Connection successful: {conn}")
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None
# Creates a minimal search index if one doesn't exist
def ensure_search_index_exists():
    """Create a minimal search index file if it doesn't exist."""
    index_path = Path("processed_texts/search_index.json")
    
    # Create the directory if it doesn't exist
    os.makedirs(index_path.parent, exist_ok=True)
    
    if not index_path.exists():
        print(f"Creating minimal search index at {index_path}")
        
        # Create a basic document about Ayurveda
        minimal_doc = {
            "content": "Ayurveda is one of the world's oldest holistic healing systems. Developed more than 3,000 years ago in India, it's based on the belief that health and wellness depend on a delicate balance between the mind, body, and spirit. The primary focus of Ayurveda is to promote good health, rather than fight disease. According to Ayurvedic theory, everything in the universe – living or not – is connected. Good health is achieved when your mind, body, and spirit are in harmony with the universe. A disruption of this harmony can lead to poor health and sickness.",
            "metadata": {
                "source": "Basic Ayurvedic Information",
                "text_name": "Introduction to Ayurveda",
                "category": "Overview",
                "chunk_id": 0
            }
        }
        
        # Create a minimal index
        minimal_index = {
            'documents': [minimal_doc],
            'tfidf_vectors': [{"ayurveda": 2.0, "holistic": 1.5, "healing": 1.5, "health": 1.5}],
            'idf': {"ayurveda": 1.0, "holistic": 1.0, "healing": 1.0, "health": 1.0}
        }
        
        # Save the minimal index
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(minimal_index, f, indent=2)
        
        print(f"Created minimal search index at {index_path}")

# Claude API client
api_key = os.getenv("ANTHROPIC_API_KEY")
if api_key:
    client = anthropic.Anthropic(api_key=api_key)
else:
    client = None
    print("Warning: ANTHROPIC_API_KEY not set")

# Questionnaire
questions = json.load(open("../docs/questionnaire.json"))

# Routes
@app.get("/")
async def root():
    return {"message": "Prakriti Assessment API"}

@app.post("/api/session")
async def create_session():
    session_id = str(uuid.uuid4())
    
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("INSERT INTO users (session_id) VALUES (%s) RETURNING id", (session_id,))
            user_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return {"session_id": session_id, "user_id": user_id}
        except Exception as e:
            print(f"Database error: {e}")
    
    # Fallback if database connection fails
    return {"session_id": session_id}

@app.get("/api/questions")
async def get_questions():
    return {"questions": questions}

@app.post("/api/analyze")
async def analyze(request: Request):
    try:
        data = await request.json()
        responses = data.get("responses", {})
        user_age = data.get("user_age")
        user_expertise = data.get("user_expertise")
        session_id = data.get("session_id")

        if not responses or not session_id:
            return {"error": "Missing required data"}, 400

        # Get analysis from Claude
        result = analyze_prakriti(responses, user_age, user_expertise)

        # Store results in database
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO prakriti_results 
                (session_id, deha_prakriti, manas_prakriti, guna_prakriti, backend_code)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (
                session_id,
                json.dumps(result['deha_prakriti']),
                json.dumps(result['manas_prakriti']),
                json.dumps(result['guna_prakriti']),
                result['backend_code']
            ))
            conn.commit()
            cur.close()
            conn.close()

        return result
    except Exception as e:
        print(f"Error in analyze route: {e}")
        return {"error": "Internal server error"}, 500

@app.get("/api/results/{session_id}")
async def get_results(session_id: str):
    try:
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT deha_prakriti, manas_prakriti, guna_prakriti, backend_code
                FROM prakriti_results
                WHERE session_id = %s
                ORDER BY created_at DESC
                LIMIT 1
            """, (session_id,))
            
            result = cur.fetchone()
            cur.close()
            conn.close()

            if result:
                return {
                    "deha_prakriti": result[0],
                    "manas_prakriti": result[1],
                    "guna_prakriti": result[2],
                    "backend_code": result[3]
                }
            
            return {"error": "No results found"}, 404

    except Exception as e:
        print(f"Error in get_results route: {e}")
        return {"error": "Internal server error"}, 500

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        print("Received chat request:", request)  # Debug log
        # Format messages for Claude
        formatted_messages = []
        for msg in request.messages:
            role = "user" if msg.sender == "user" else "assistant"
            formatted_messages.append({"role": role, "content": msg.text})
        
        print("Formatted messages:", formatted_messages)  # Debug log
        
        if client:
            print("Making Claude API call...")  # Debug log
            print("Using system prompt:", SYSTEM_PROMPT)  # Debug log
            
            cached_response = get_cached_response(request.messages, request.session_id)
            if cached_response:
                print("Using cached response")
                return {"response": cached_response}

            # Make API call to Claude
            message = client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=300,
                messages=formatted_messages,
                system=SYSTEM_PROMPT
            )
            
            response = message.content[0].text
            save_cached_response(request.messages, request.session_id, response)


            response = re.sub(r'<[^>]+>.*?</[^>]+>', '', response)
            response = re.sub(r'<[^>]+/>', '', response)

            # Remove markdown headers
            response = re.sub(r'#+\s+[^\n]+\n', '', response)

            # Remove numbered lists with bold formatting
            response = re.sub(r'\d+\.\s+\*\*([^*]+)\*\*', r'\1:', response)

            # Remove bold formatting
            response = re.sub(r'\*\*([^*]+)\*\*', r'\1', response)
            
            # Try to save chat to database if session_id is provided
            if request.session_id:
                try:
                    print(f"Attempting to save chat for session {request.session_id}")  # Debug log
                    conn = get_db_connection()
                    if conn:
                        # Debug database connection details
                        print("Database connection successful")  # Debug log
                        cur = conn.cursor()
                        messages_json = json.dumps([msg.dict() for msg in request.messages])
                        print(f"Prepared messages JSON: {messages_json}")  # Debug log
                        
                        # First check if user exists
                        cur.execute("SELECT id FROM users WHERE session_id = %s", (request.session_id,))
                        output = cur.fetchone()
                        if output is not None and len(output) > 0:
                            user_exists = True
                        else:
                            user_exists = False
                        # user_exists = cur.fetchone() is not None
                        print(f"User exists: {user_exists}")  # Debug log
                        
                        if not user_exists:
                            print("Creating new user record")  # Debug log
                            cur.execute("INSERT INTO users (session_id) VALUES (%s)", (request.session_id,))
                            conn.commit()
                        print("Inserting chat history")  # Debug log
                        print(f"DEBUG - About to insert chat history")
                        print(f"DEBUG - Session ID for chat history: {request.session_id}")
                        print(f"DEBUG - Messages JSON length: {len(messages_json)}")
                        cur.execute(
                            "INSERT INTO chat_history (session_id, messages) VALUES (%s, %s)",
                            (request.session_id, messages_json)
                        )
                        # Add after "Inserting chat history"
                        print("SQL query:", "INSERT INTO chat_history (session_id, messages) VALUES (%s, %s)", (request.session_id, messages_json))
                        conn.commit()
                        print("Chat history saved successfully")  # Debug log
                        cur.close()
                        conn.close()
                    else:
                        print("Failed to get database connection")  # Debug log
                except Exception as e:
                    print(f"Database error while saving chat: {str(e)}")  # Debug log
                    print(f"Error type: {type(e)}")  # Debug log
                    import traceback
                    print(f"Traceback: {traceback.format_exc()}")  # Debug log
                    # Continue even if database save fails
            
            return {"response": response}
        else:
            print("Claude client not initialized!")  # Debug log
            return {"response": "I apologize, but I'm not able to connect to the AI service right now. Please try again later."}
            
    except Exception as e:
        print(f"Chat API error: {e}")
        return {"response": "I apologize, but I'm having trouble processing your request right now. Could you please try again?"}

@app.post("/api/recommendations")
async def get_recommendations(request: Request):
    try:
        data = await request.json()
        prakriti = data.get("prakriti", {})  # e.g., {"vata": 60, "pitta": 30, "kapha": 10}
        topic = data.get("topic", "general")  # e.g., "sleep", "diet", "exercise"
        season = data.get("season")  # optional
        session_id = data.get("session_id")
        
        if not prakriti or not session_id:
            return {"error": "Missing required data"}, 400
            
        # Determine dominant dosha
        dominant_dosha = max(prakriti, key=prakriti.get)
        
        # Import the new retrieval function
        from database.ayurvedic_retrieval import retrieve_by_dosha
        
        # Map topics to focus areas
        topic_to_focus = {
            "diet": "ahara", 
            "food": "ahara",
            "yoga": "yoga",
            "breathing": "pranayama",
            "routine": "dinacharya",
            "daily": "dinacharya"
        }
        
        focus_area = topic_to_focus.get(topic.lower())
        
        # Retrieve with focus area
        docs, context = cached_retrieve(
            query=f"{dominant_dosha} dosha {topic} recommendations", 
            focus_area=focus_area
        )
        
        # Get sources for citation
        sources = [doc.metadata.get("text_name", "Unknown source") for doc in docs]
        
        # Create system prompt for Claude
        SYSTEM_PROMPT = """
            You are Tattvavid, an Ayurvedic expert who helps people understand personalized recommendations to them based on their identified prakriti.

            CONVERSATIONAL APPROACH:
            - Always respond in a natural, conversational manner as if speaking directly to the person
            - Never use markdown formatting (like # headers) in your responses
            - Avoid lengthy academic paragraphs - keep responses concise and friendly
            - Begin responses with a personalized greeting or acknowledgment
            - Use contractions and casual language appropriate for a friendly expert
            - Limit use of bullet points and numbered lists unless specifically requested
            - End with open-ended questions to maintain conversation flow

            RESPONSE OPTIMIZATION:
            - Keep responses under 3-5 sentences for faster generation
            - Respond within 5 seconds of receiving a question
            - Focus on answering the specific question directly
            - For complex topics, offer core insights and ask if more detail is needed

            TONE GUIDELINES:
            - Always maintain a warm, respectful, and friendly tone
            - Speak conversationally as if talking to a friend
            - Present information in a gentle, encouraging manner
            - If explaining technical Ayurvedic concepts, do so with patience and clarity
            - Respond with empathy and understanding to all questions

            WHEN RESPONDING ABOUT PRAKRITI:
            - Acknowledge the user's unique constitution
            - Frame recommendations as invitations rather than rigid prescriptions
            - Suggest manageable changes rather than overwhelming transformations
            - Connect recommendations to practical modern application
        """
        
        # Call Claude API
        if client:
            message = client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=300,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": f"Please provide me with personalized recommendations for {topic} based on my prakriti."}
                ]
            )
            
            response = message.content[0].text
            
            # Store results in database (optional)
            conn = get_db_connection()
            if conn:
                try:
                    cur = conn.cursor()
                    cur.execute("""
                        INSERT INTO recommendations
                        (session_id, topic, recommendations, sources)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """, (
                        session_id,
                        topic,
                        response,
                        json.dumps(sources)
                    ))
                    conn.commit()
                    cur.close()
                    conn.close()
                except Exception as e:
                    print(f"Database error: {e}")
            
            return {
                "recommendations": response,
                "sources": sources,
                "dominant_dosha": dominant_dosha
            }
        else:
            return {"error": "Claude client not initialized"}, 500
            
    except Exception as e:
        print(f"Error in recommendations route: {e}")
        return {"error": "Internal server error"}, 500

@app.post("/api/ayurveda/ask")
async def ask_ayurveda(request: Request):
    try:
        data = await request.json()
        query = data.get("query")
        session_id = data.get("session_id")

        try:
            results, context = cached_retrieve(query)
        except Exception as e:
            print(f"Error in retrieval: {str(e)}")
            # Fallback context if retrieval fails
            context = """Ayurveda is a holistic healing system that originated in India over 5,000 years ago. 
            It emphasizes balancing the body, mind, and spirit to promote wellness. 
            The three primary doshas (Vata, Pitta, and Kapha) form the foundation of Ayurvedic understanding of individual constitution."""
        
        # Use Claude to generate a response with the retrieved context
        if client:
            message = client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=300,
                system=f"""
                You are Tattvavid, an Ayurvedic expert who provides knowledge based on classical texts. 
                Use the following information to answer the user's question:
                
                {context}
                
                Answer in a friendly, informative way, citing the specific texts where the information comes from.
                If the context doesn't contain relevant information, acknowledge this and provide general Ayurvedic wisdom instead.
                """,
                messages=[
                    {"role": "user", "content": query}
                ]
            )
            
            response = message.content[0].text
            
            # Store the conversation in chat history
            formatted_messages = [
                {
                    "text": query,
                    "sender": "user",
                    "timestamp": datetime.datetime.now().isoformat()
                },
                {
                    "text": response,
                    "sender": "bot",
                    "timestamp": datetime.datetime.now().isoformat()
                }
            ]
            
            # Save to database
            conn = get_db_connection()
            if conn and session_id:
                try:
                    cur = conn.cursor()
                    messages_json = json.dumps(formatted_messages)
                    cur.execute(
                        "INSERT INTO chat_history (session_id, messages) VALUES (%s, %s)",
                        (session_id, messages_json)
                    )
                    conn.commit()
                    cur.close()
                    conn.close()
                except Exception as e:
                    print(f"Database error: {e}")
        else:
            response = "I apologize, but I'm not able to connect to the AI service right now. Please try again later."
        
        return {"response": response}
    
    except Exception as e:
        print(f"General API error: {str(e)}")
        return {"response": "I'm having trouble processing your request. Please try again later."}

@app.post("/api/holistic-recommendations")
async def get_holistic_recommendations(request: Request):
    try:
        data = await request.json()
        prakriti_type = data.get("prakritiType", "")
        deha_prakriti = data.get("deha_prakriti", {})
        manas_prakriti = data.get("manas_prakriti", {})
        guna_prakriti = data.get("guna_prakriti", {})
        prakriti_code = data.get("prakritiCode", "")
        session_id = data.get("session_id")
        
        if not prakriti_type or not session_id:
            return {"error": "Missing required data"}, 400
            
        # Generate a detailed system prompt for Claude
        system_prompt = f"""
        You are Tattvavid, an Ayurvedic expert with deep knowledge of classical texts.
        
        The user has the following prakriti profile:
        Constitution Type: {prakriti_type}
        
        Deha Prakriti (Physical):
        Vata: {deha_prakriti.get("vata")}%
        Pitta: {deha_prakriti.get("pitta")}%
        Kapha: {deha_prakriti.get("kapha")}%
        
        Manas Prakriti (Mental):
        Vata: {manas_prakriti.get("vata")}%
        Pitta: {manas_prakriti.get("pitta")}%
        Kapha: {manas_prakriti.get("kapha")}%
        
        Guna Prakriti (Quality):
        Sattva: {guna_prakriti.get("sattva")}%
        Rajas: {guna_prakriti.get("rajas")}%
        Tamas: {guna_prakriti.get("tamas")}%
        
        Prakriti Code: {prakriti_code}
        
        Create a comprehensive 21-day Ayurvedic wellness plan including:
        1. Sleep routine - optimal times and practices
        2. Yoga poses and sequences
        3. Pranayama techniques
        4. Meditation practices
        5. Self-care techniques (abhyanga, nasya, etc.)
        6. Optimal eating times and meal spacing
        
        Format the response as a structured JSON object with these components:
        1. A detailed HTML table ("chart") showing the daily routine across all 21 days
        2. Sections with detailed explanations for each practice area
        
        The HTML table should be formatted beautifully with colors that reflect the doshas 
        (use CSS classes like "vata-bg", "pitta-bg", "kapha-bg" for styling).
        
        Return a JSON object with this structure:
        {{
            "chart": "<div class='recommendations-chart'>...HTML TABLE HERE...</div>",
            "sections": [
                {{
                    "title": "Sleep Routine",
                    "content": "Detailed explanation..."
                }},
                // Additional sections for yoga, pranayama, etc.
            ]
        }}
        
        Base all recommendations on classical Ayurvedic texts while making them practical
        and accessible for modern life.
        """
        
        # Call Claude API
        if client:
            message = client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=1000,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": "Please generate my comprehensive 21-day Ayurvedic wellness plan based on my prakriti."}
                ]
            )
            
            response_text = message.content[0].text
            
            # Extract the JSON from the response
            import re
            import json
            
            json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                recommendations = json.loads(json_str)
            else:
                # Try to find JSON without markdown code block
                json_match = re.search(r'({[\s\S]*})', response_text)
                if json_match:
                    json_str = json_match.group(1)
                    recommendations = json.loads(json_str)
                else:
                    # Fallback - create a basic structure
                    recommendations = {
                        "chart": "<p>Could not generate chart. Please try again.</p>",
                        "sections": [
                            {
                                "title": "Holistic Recommendations",
                                "content": response_text
                            }
                        ]
                    }
            
            # Store results in database (optional)
            conn = get_db_connection()
            if conn:
                try:
                    cur = conn.cursor()
                    cur.execute("""
                        INSERT INTO holistic_recommendations
                        (session_id, prakriti_type, recommendations)
                        VALUES (%s, %s, %s)
                        RETURNING id
                    """, (
                        session_id,
                        prakriti_type,
                        json.dumps(recommendations)
                    ))
                    conn.commit()
                    cur.close()
                    conn.close()
                except Exception as e:
                    print(f"Database error: {e}")
            
            return {
                "recommendations": recommendations
            }
        else:
            return {"error": "Claude client not initialized"}, 500
            
    except Exception as e:
        print(f"Error in holistic recommendations route: {e}")
        return {"error": "Internal server error"}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)  # Changed from 0.0.0.0 to 127.0.0.1