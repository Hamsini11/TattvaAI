from ayurveda_models import SimpleDocument
import os
import re
from pathlib import Path
import PyPDF2
import json
from collections import Counter
import math
import string

import pickle

class SimpleSearchEngine:
    def __init__(self, index_path="./processed_texts/search_index.json"):
        self.index_path = Path(index_path)
        self.index = self.load_index()

    def quick_search(self, query):
        """Ultra-fast search for common queries"""
        query_lower = query.lower()
        
        # Check for exact or partial matches in common responses
        for key, response in COMMON_RESPONSES.items():
            if key in query_lower:
                return True, response
        
        return False, None

COMMON_RESPONSES = {
    "what is dinacharya": "Dinacharya refers to the daily routine recommended in Ayurveda to maintain balance and health. It includes practices like waking early, self-massage, and consistent meal times.",
    "vata dosha": "Vata dosha is composed of air and space elements, governing movement and change in the body. People with Vata dominance tend to be creative, energetic, and quick-thinking.",
    "pitta dosha": "Pitta dosha is composed of fire and water elements, governing transformation and metabolism. Pitta-dominant individuals are typically intelligent, focused, and ambitious.",
    "kapha dosha": "Kapha dosha is composed of earth and water elements, governing structure and stability. Kapha-dominant people are often calm, compassionate, and physically strong.",
    "daily routine": "In Ayurveda, a daily routine (Dinacharya) helps maintain balance of the doshas. Key practices include rising early, self-massage with oil, consistent meal times, and early bedtime.",
    "abhyanga": "Abhyanga is the Ayurvedic practice of self-massage with warm oil. It calms the nervous system, improves circulation, and helps balance the doshas, especially Vata.",
    "best times for activities": "For Vata types, follow this schedule: Morning (6-10AM): Exercise and productive work when Kapha energy provides stability. Mid-day (10AM-2PM): Main meal and creative activities. Afternoon (2-6PM): Lighter activities and gentle movement. Evening (6-10PM): Wind down with relaxing activities and early dinner. Night: Be asleep by 10PM for optimal rest.",
    "vata daily schedule": "Vata benefits from a consistent daily schedule: 6AM: Wake up. 6-7AM: Morning hygiene and oil massage. 7-8AM: Gentle yoga and meditation. 8AM: Warm breakfast. 12-1PM: Main meal of the day. 6PM: Light dinner. 9-10PM: Relaxing bedtime routine. 10PM: Sleep.",
    "vata routine": "Vata thrives with routine: regular mealtimes, consistent sleep schedule, daily oil massage (abhyanga), gentle exercise, and warm foods. Avoid rushing, irregular schedules, and excessive stimulation.",
    "pitta daily schedule": "Optimal Pitta schedule: 5:30-6AM: Wake up. 6-7AM: Cooling exercise like swimming. 7:30AM: Moderate breakfast. 12-1PM: Main meal. 3PM: Cool drink or snack. 6-7PM: Light dinner. 7-9PM: Relaxing evening activities. 10PM: Sleep.",
    "kapha daily schedule": "Energizing Kapha schedule: 5-6AM: Wake up early. 6-7AM: Vigorous exercise. 8AM: Light breakfast. 12PM: Main meal of the day. 3-4PM: Active work or movement. 6PM: Light dinner. 7-9PM: Engaging evening activities. 10PM: Sleep."
}

class AyurvedaTextProcessor:
    def __init__(self, docs_dir=None, output_dir=None):
        # Use the absolute path to the project root
        project_root = Path.cwd()
        
        # Set docs directory (go up one level if needed)
        if docs_dir is None:
            if (project_root / "docs").exists():
                self.docs_dir = project_root / "docs"
            elif (project_root.parent / "docs").exists():
                self.docs_dir = project_root.parent / "docs"
            else:
                self.docs_dir = project_root / "docs"  # Default even if it doesn't exist
        else:
            self.docs_dir = Path(docs_dir)
        
        # Set output directory
        if output_dir is None:
            self.output_dir = project_root / "processed_texts"
        else:
            self.output_dir = Path(output_dir)
        
        os.makedirs(self.output_dir, exist_ok=True)
        
        print(f"Looking for PDFs in: {self.docs_dir}")
        print(f"Output will be saved to: {self.output_dir}")

    def process_all_pdfs(self):
        """Process all PDFs in the docs directory."""
        all_chunks = []
        
        # Get all PDF files
        pdf_files = list(self.docs_dir.glob("*.pdf"))
        
        # Process each PDF
        for pdf_path in pdf_files:
            print(f"\nProcessing: {pdf_path.name}")
            
            # Extract text
            raw_text = self.extract_text_from_pdf(pdf_path)
            
            # Clean the text
            cleaned_text = self.clean_text(raw_text)
            
            # Identify the text type and create metadata
            metadata = self.create_metadata(pdf_path)
            
            # Create chunks
            chunks = self.chunk_text(cleaned_text, metadata)
            all_chunks.extend(chunks)
            
            # Save the processed text
            self.save_processed_text(cleaned_text, pdf_path.stem)
            
        self.save_chunks(all_chunks)
        
        # Create a simple search index
        self.create_search_index(all_chunks)
        
        print(f"Processing complete! {len(all_chunks)} total chunks created from {len(pdf_files)} documents.")
        return all_chunks
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from a PDF file using PyPDF2."""
        text = ""
        try:
            reader = PyPDF2.PdfReader(pdf_path)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() + "\n\n"  # Add extra newlines between pages
            return text
        except Exception as e:
            print(f"Error extracting text from {pdf_path}: {e}")
            return ""
    
    def clean_text(self, text):
        """Clean and normalize the extracted text."""
        # Remove page numbers
        text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
        
        # Fix hyphenated words at line breaks
        text = re.sub(r'([a-zA-Z0-9,;:])-\n([a-zA-Z0-9])', r'\1\2', text)
        
        # Handle common PDF artifacts
        text = re.sub(r'[\r\t\f\v]', ' ', text)
        
        # Normalize whitespace
        text = re.sub(r' {2,}', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Standardize Sanskrit terms
        text = re.sub(r'\bKapha\b|\bCapa\b|\bKafa\b', 'Kapha', text, flags=re.IGNORECASE)
        text = re.sub(r'\bVata\b|\bVayu\b|\bVatha\b', 'Vata', text, flags=re.IGNORECASE)
        text = re.sub(r'\bPitta\b|\bPitha\b|\bPita\b', 'Pitta', text, flags=re.IGNORECASE)
        text = re.sub(r'\bDoshas?\b|\bDosas?\b', 'Dosha', text, flags=re.IGNORECASE)
        text = re.sub(r'\bPrakritis?\b|\bPrakrtis?\b', 'Prakriti', text, flags=re.IGNORECASE)
        
        # Remove common headers/footers
        text = re.sub(r'Copyright.*\n', '', text)
        
        return text.strip()
    
    def create_metadata(self, pdf_path):
        """Create metadata for the document."""
        filename = pdf_path.stem
        
        # Detect which text this is
        text_mapping = {
            "Caraka": {"text_name": "Charaka Samhita", "category": "Ayurvedic Classic"},
            "Charaka": {"text_name": "Charaka Samhita", "category": "Ayurvedic Classic"},
            "Sushruta": {"text_name": "Sushruta Samhita", "category": "Ayurvedic Classic"},
            "Sushrutha": {"text_name": "Sushruta Samhita", "category": "Ayurvedic Classic"},
            "Ashtanga": {"text_name": "Ashtanga Hridaya", "category": "Ayurvedic Classic"},
            "Sarangadhara": {"text_name": "Sarangadhara Samhita", "category": "Ayurvedic Classic"},
            "Gheranda": {"text_name": "Gheranda Samhita", "category": "Yoga Text"},
            "HathaYoga": {"text_name": "Hatha Yoga Pradipika", "category": "Yoga Text"},
            "Yoga Sutras": {"text_name": "Yoga Sutras of Patanjali", "category": "Yoga Text"},
            "Patanjali": {"text_name": "Yoga Sutras of Patanjali", "category": "Yoga Text"},
            "Divanji": {"text_name": "Yogayajnavalkya", "category": "Yoga Text"},
            "Bhavamisra": {"text_name": "Bhavaprakasa", "category": "Ayurvedic Classic"},
            "Shiva-Samhita": {"text_name": "Shiva Samhita", "category": "Yoga Text"},
            "Bhavaprakasa": {"text_name": "Bhavaprakasa", "category": "Ayurvedic Classic"},
        }
        
        metadata = {
            "source": filename,
            "text_name": "Unknown",
            "category": "Unknown",
            "file_path": str(pdf_path)
        }
        
        for key, value in text_mapping.items():
            if key in filename:
                metadata["text_name"] = value["text_name"]
                metadata["category"] = value["category"]
                break
        
        return metadata
    
    def chunk_text(self, text, metadata, chunk_size=1000, chunk_overlap=200):
        """Split text into overlapping chunks."""
        # Adjust chunk size based on text category
        if metadata["category"] == "Yoga Text":
            chunk_size = 800
            chunk_overlap = 150
        
        # Split text into chunks
        chunks = []
        start = 0
        
        # First try to split by paragraphs
        paragraphs = text.split("\n\n")
        current_chunk = ""
        
        for paragraph in paragraphs:
            # If adding this paragraph would exceed chunk_size, save current chunk
            if len(current_chunk) + len(paragraph) > chunk_size and current_chunk:
                # Create metadata for this chunk
                chunk_metadata = metadata.copy()
                chunk_metadata["chunk_id"] = len(chunks)
                
                chunks.append(SimpleDocument(
                    page_content=current_chunk.strip(),
                    metadata=chunk_metadata
                ))
                
                # Keep overlap from the end of the last chunk
                overlap_text = current_chunk[-chunk_overlap:] if len(current_chunk) > chunk_overlap else current_chunk
                current_chunk = overlap_text + "\n\n"
            
            current_chunk += paragraph + "\n\n"
            
            # If current_chunk exceeds chunk_size on its own, break it up
            while len(current_chunk) > chunk_size * 1.5:  # Allow some flexibility
                # Create metadata for this chunk
                chunk_metadata = metadata.copy()
                chunk_metadata["chunk_id"] = len(chunks)
                
                chunks.append(SimpleDocument(
                    page_content=current_chunk[:chunk_size].strip(),
                    metadata=chunk_metadata
                ))
                
                # Create overlap
                overlap_start = max(0, chunk_size - chunk_overlap)
                current_chunk = current_chunk[overlap_start:]
        
        # Add the last chunk if it's not empty
        if current_chunk.strip():
            chunk_metadata = metadata.copy()
            chunk_metadata["chunk_id"] = len(chunks)
            
            chunks.append(SimpleDocument(
                page_content=current_chunk.strip(),
                metadata=chunk_metadata
            ))
        
        print(f"  Split into {len(chunks)} chunks")
        return chunks
    
    def save_processed_text(self, text, filename):
        """Save the processed text to a file."""
        output_path = self.output_dir / f"{filename}.txt"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"  Saved processed text to {output_path}")
    
    def save_chunks(self, chunks):
        """Save chunks to a JSON file for later use."""
        chunks_data = []
        for chunk in chunks:
            chunks_data.append({
                "content": chunk.page_content,
                "metadata": chunk.metadata
            })
        
        output_path = self.output_dir / "all_chunks.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(chunks_data, f, indent=2)
        
        print(f"Saved {len(chunks)} chunks to {output_path}")
    
    def preprocess_text(self, text):
        """Preprocess text for TF-IDF index."""
        # Convert to lowercase
        text = text.lower()
        
        # Remove punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Tokenize
        tokens = text.split()
        
        # Remove common stop words (simplified)
        stop_words = {
            'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
            'which', 'this', 'that', 'these', 'those', 'then', 'just', 'so', 'than',
            'such', 'both', 'through', 'about', 'for', 'is', 'of', 'while', 'during',
            'to', 'from', 'in', 'on', 'by', 'with', 'be', 'was', 'were', 'are'
        }
        
        tokens = [token for token in tokens if token not in stop_words]
        
        return tokens
    
    def create_search_index(self, documents):
        """Create a simple TF-IDF search index using JSON instead of pickle."""
        # Create document term frequencies
        doc_term_freqs = []
        
        for doc in documents:
            tokens = self.preprocess_text(doc.page_content)
            term_freq = Counter(tokens)
            doc_term_freqs.append(dict(term_freq))
        
        # Calculate document frequency (df) for each term
        term_doc_freq = Counter()
        for term_freq in doc_term_freqs:
            term_doc_freq.update(term_freq.keys())
        
        # Calculate inverse document frequency (idf)
        num_docs = len(documents)
        idf = {}
        for term, df in term_doc_freq.items():
            idf[term] = math.log(num_docs / df)
        
        # Create JSON-serializable document objects
        json_documents = []
        for doc in documents:
            json_documents.append({
                "content": doc.page_content,
                "metadata": doc.metadata
            })
        
        # Create JSON-serializable TF-IDF vectors
        json_tfidf_vectors = []
        for term_freq in doc_term_freqs:
            tfidf = {}
            for term, tf in term_freq.items():
                tfidf[term] = tf * idf.get(term, 0)
            json_tfidf_vectors.append(tfidf)
        
        # Save the search index as JSON
        index = {
            'documents': json_documents,
            'tfidf_vectors': json_tfidf_vectors,
            'idf': idf
        }
        
        with open(self.output_dir / "search_index.json", 'w', encoding='utf-8') as f:
            json.dump(index, f)
        
        print(f"Created JSON search index with {len(documents)} documents")

class SimpleSearchEngine:
    def __init__(self, index_path="./processed_texts/search_index.json"):
        self.index_path = Path(index_path)
        self.index = self.load_index()
    
    def load_index(self):
        """Load the search index from JSON."""
        if not self.index_path.exists():
            print(f"Index not found at {self.index_path}")
            return None
        
        try:
            with open(self.index_path, 'r', encoding='utf-8') as f:
                index = json.load(f)
            
            # Convert back to SimpleDocument objects
            documents = []
            for doc_data in index['documents']:
                # Create SimpleDocument object using the current module
                documents.append(SimpleDocument(
                    page_content=doc_data["content"],
                    metadata=doc_data["metadata"]
                ))
            
            # Replace the JSON document list with SimpleDocument objects
            index['documents'] = documents
            
            return index
        except Exception as e:
            print(f"Error loading search index: {e}")
            return None    
    
    def preprocess_query(self, query):
        """Preprocess the query text."""
        # Convert to lowercase
        query = query.lower()
        
        # Remove punctuation
        query = query.translate(str.maketrans('', '', string.punctuation))
        
        # Tokenize
        tokens = query.split()
        
        # Remove common stop words (simplified)
        stop_words = {
            'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
            'which', 'this', 'that', 'these', 'those', 'then', 'just', 'so', 'than',
            'such', 'both', 'through', 'about', 'for', 'is', 'of', 'while', 'during',
            'to', 'from', 'in', 'on', 'by', 'with', 'be', 'was', 'were', 'are'
        }
        
        tokens = [token for token in tokens if token not in stop_words]
        
        return tokens
    
    def search(self, query, k=5, category=None, text_name=None):
        """Search for documents matching the query."""
        if not self.index:
            return [], "Search index not loaded"
        
        # Preprocess query
        query_tokens = self.preprocess_query(query)
        
        # Create query term frequency
        query_term_freq = Counter(query_tokens)
        
        # Create query TF-IDF vector
        query_tfidf = {}
        for term, tf in query_term_freq.items():
            query_tfidf[term] = tf * self.index['idf'].get(term, 0)
        
        # Calculate similarity scores
        scores = []
        for i, doc_tfidf in enumerate(self.index['tfidf_vectors']):
            # Calculate dot product
            score = 0
            for term, weight in query_tfidf.items():
                score += weight * doc_tfidf.get(term, 0)
            
            # Skip if no match at all
            if score > 0:
                scores.append((i, score))
        
        # Sort by score
        scores.sort(key=lambda x: x[1], reverse=True)
        
        # Get top results
        results = []
        for doc_idx, score in scores:
            doc = self.index['documents'][doc_idx]
            
            # Apply filters if provided
            if category and doc.metadata.get('category') != category:
                continue
            
            if text_name and doc.metadata.get('text_name') != text_name:
                continue
            
            results.append(doc)
            
            if len(results) >= k:
                break
        
        # Format context for Claude
        context = "\n\n".join([
            f"Source: {doc.metadata.get('text_name', 'Unknown')}\n"
            f"Category: {doc.metadata.get('category', 'Unknown')}\n"
            f"Content: {doc.page_content}"
            for doc in results
        ])
        
        return results, context

    def extract_metadata_from_filename(filename):
        """Extract metadata from standardized filename format."""
        parts = filename.split('_')
        metadata = {"source": filename}
        
        if len(parts) >= 2:
            # Category
            category_map = {"AC": "Ayurvedic Classic", "YT": "Yoga Text", "RT": "Ritual Text"}
            metadata["category"] = category_map.get(parts[0], "Unknown")
            
            # Text name
            metadata["text_name"] = parts[1]
            
            # Section if available
            if len(parts) >= 3:
                metadata["section"] = parts[2]
        
        return metadata
# Usage when run directly
if __name__ == "__main__":
    processor = AyurvedaTextProcessor()
    chunks = processor.process_all_pdfs()
    
    # Test search engine
    engine = SimpleSearchEngine()
    results, context = engine.search("Vata dosha characteristics")
    print(f"Found {len(results)} results")