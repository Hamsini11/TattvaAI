import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { usePrakritiStore } from "@/lib/store";
import { Send, BookmarkPlus, Clock, VolumeX, Volume2, X, PlayCircle, PauseCircle } from "lucide-react";
import LeafIcon from "./icons/LeafIcon";
import { responseMap } from "@/lib/AyurvedicResponseData";

// Icons for categories
import { 
  Sun, // Daily Practices
  Utensils, // Nourishment
  Activity, // Movement
  Brain, // Mind & Breath
  Calendar, // Lifestyle
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

const askAyurveda = async (query: string): Promise<string> => {
    try {
      // Generate a UUID if one doesn't exist
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('session_id', sessionId);
      }
      const response = await fetch('http://localhost:8000/api/ayurveda/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          session_id: sessionId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error asking Ayurveda:", error);
      throw error;
    }
  };

// Add evening responses to responseMap
const eveningResponses = {
  "dinacharya_evening_vata": `For your Vata constitution, here's an ideal evening routine:

  • Begin winding down by 8:00 PM
  • Have a light dinner by 6:30 PM
  • Take a gentle walk after dinner
  • Enjoy warm milk with nutmeg or cardamom before bed
  • Apply warm sesame oil to your feet and scalp
  • Practice gentle stretching or restorative yoga
  • Read calming literature (avoid stimulating content)
  • Be in bed by 9:30-10:00 PM

  This routine helps ground Vata energy and prepare your nervous system for deep, restful sleep.`,

  "dinacharya_technique_evening_vata": `Evening techniques for your Vata constitution:

  1. Transition: Create a clear transition between work and rest (change clothes, light a candle)
  2. Nourishment: Have a light, warm dinner at least 2 hours before bed
  3. Digital sunset: End screen time 1-2 hours before sleep
  4. Warm oil: Massage your feet with warm sesame oil
  5. Warming drink: Enjoy warm milk with cardamom, cinnamon and a pinch of nutmeg
  6. Gentle movement: Practice 5-10 minutes of gentle, calming stretches
  7. Breath: Practice slow, extended exhalation breathing (ratio of 1:2 inhale to exhale)
  8. Sound: Listen to soothing music or nature sounds
  
  These practices create the stability and warmth that helps Vata types transition to restful sleep.`,

  "dinacharya_evening_pitta": `For your Pitta constitution, here's an ideal evening routine:

  • Finish work with a clear endpoint by 7:00 PM
  • Have a light, cooling dinner by 7:00 PM
  • Take a leisurely walk in nature during cooler evening hours
  • Practice cooling moon salutations or gentle yoga
  • Enjoy coconut or almond milk with cooling spices
  • Read or engage in calming, non-competitive activities
  • Create a cool, well-ventilated sleeping environment
  • Be in bed by 10:00-10:30 PM

  This routine helps release the day's heat and intensity, promoting peaceful sleep.`,

  "dinacharya_technique_evening_pitta": `Evening techniques for your Pitta constitution:

  1. Cooling transition: Splash cool water on face, wrists and feet after work
  2. Release: Write down accomplishments and tomorrow's plans to clear your mind
  3. Nourishment: Enjoy a light, slightly cooling dinner
  4. Cooling movement: Practice moon salutations or gentle stretching
  5. Hydration: Sip cool (not iced) water with mint or lime
  6. Environment: Ensure bedroom is well-ventilated and moderately cool
  7. Breath: Practice cooling Sheetali or Sheetkari pranayama for 5 minutes
  8. Visualization: Imagine moonlight or water as you settle into sleep
  
  These practices help release accumulated heat and intensity from your day.`,

  "dinacharya_evening_kapha": `For your Kapha constitution, here's an ideal evening routine:

  • Maintain activity through early evening
  • Have a light, warm dinner by 6:00 PM
  • Take a brisk walk after dinner
  • Engage in stimulating but not exhausting activities
  • Enjoy ginger tea with honey if desired
  • Practice a few energizing yoga poses before quieting down
  • Read or engage in mentally stimulating activities
  • Be in bed by 10:00-10:30 PM (not earlier)

  This routine maintains healthy activity while allowing for proper rest.`,

  "dinacharya_technique_evening_kapha": `Evening techniques for your Kapha constitution:

  1. Active transition: Do 5 minutes of invigorating movement after work
  2. Nourishment: Have a light, easily digestible dinner at least 3 hours before bed
  3. Engagement: Spend time in stimulating conversation or activities
  4. Aromatherapy: Use uplifting essential oils like basil, rosemary or cinnamon (avoid right before sleep)
  5. Warmth: Ensure your environment is warm and dry
  6. Reading: Engage with inspiring or thought-provoking content
  7. Preparation: Set out clothes and prepare for an early start the next day
  8. Intention: Set a mental alarm to wake refreshed and energized
  
  These practices help prevent evening heaviness while still allowing for restful sleep.`
};

// Add evening responses to responseMap
Object.assign(responseMap, eveningResponses);

const AyurvedicRecommendations: React.FC = () => {
  const testPrakriti = {
    prakritiType: "Taamasika Kapha Pitta",
    deha_prakriti: {
      vata: 15,
      pitta: 10,
      kapha: 75
    },
    manas_prakriti: {
      vata: 20,
      pitta: 65,
      kapha: 15
    },
    guna_prakriti: {
      sattva: 15,
      rajas: 25,
      tamas: 60
    }
  };
  const { prakritiType, deha_prakriti, manas_prakriti, guna_prakriti } = testPrakriti;
  // const { prakritiType, deha_prakriti, manas_prakriti, guna_prakriti } = usePrakritiStore();
  const [activeCategory, setActiveCategory] = useState("daily");
  const [activeSubcategory, setActiveSubcategory] = useState("dinacharya");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300); // 5 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Consolidated categories with subcategories
  const categories = [
    { 
      id: "daily", 
      name: "Daily Practices", 
      sanskrit: "Dinacharya & Nidra", 
      english: "Daily Routine & Sleep",
      icon: Sun,
      subcategories: [
        { id: "dinacharya", name: "Dinacharya", english: "Daily Routine" },
        { id: "nidra", name: "Nidra", english: "Sleep" }
      ] 
    },
    { 
      id: "nourishment", 
      name: "Nourishment", 
      sanskrit: "Ahara", 
      english: "Food & Diet",
      icon: Utensils,
      subcategories: [
        { id: "ahara", name: "Ahara", english: "Food & Diet" }
      ] 
    },
    { 
      id: "movement", 
      name: "Movement", 
      sanskrit: "Vyayama & Yoga", 
      english: "Exercise & Postures",
      icon: Activity,
      subcategories: [
        { id: "vyayama", name: "Vyayama", english: "Exercise" },
        { id: "yoga", name: "Yoga", english: "Postures" }
      ] 
    },
    { 
      id: "mind", 
      name: "Mind & Breath", 
      sanskrit: "Pranayama & Dhyana", 
      english: "Breathing & Meditation",
      icon: Brain,
      subcategories: [
        { id: "pranayama", name: "Pranayama", english: "Breath Control" },
        { id: "dhyana", name: "Dhyana", english: "Meditation" }
      ] 
    },
    { 
      id: "lifestyle", 
      name: "Lifestyle", 
      sanskrit: "Ritucharya, Rasayana & Sadvritta", 
      english: "Seasonal, Rejuvenation & Conduct",
      icon: Calendar,
      subcategories: [
        { id: "ritucharya", name: "Ritucharya", english: "Seasonal Routine" },
        { id: "rasayana", name: "Rasayana", english: "Rejuvenation" },
        { id: "sadvritta", name: "Sadvritta", english: "Code of Conduct" }
      ] 
    }
  ];

  // Get active category and subcategory names
  const getActiveCategoryData = () => {
    const category = categories.find(c => c.id === activeCategory);
    const subcategory = category?.subcategories.find(s => s.id === activeSubcategory);
    return {
      categoryName: category?.name || "",
      categoryEnglish: category?.english || "",
      categorySanskrit: category?.sanskrit || "",
      subcategoryName: subcategory?.name || "",
      subcategoryEnglish: subcategory?.english || ""
    };
  };

  const { categoryName, categoryEnglish, categorySanskrit, subcategoryName, subcategoryEnglish } = getActiveCategoryData();

  // Get the dominant dosha for physical constitution (Deha Prakriti)
const getDominantDehaDosha = () => {
  const doshas = {
    vata: deha_prakriti.vata,
    pitta: deha_prakriti.pitta,
    kapha: deha_prakriti.kapha
  };
  
  return Object.entries(doshas).reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

// Get the dominant dosha for mental constitution (Manas Prakriti)
const getDominantManasDosha = () => {
  const doshas = {
    vata: manas_prakriti.vata,
    pitta: manas_prakriti.pitta,
    kapha: manas_prakriti.kapha
  };
  
  return Object.entries(doshas).reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

  // Get the dominant quality for nature constitution (Guna Prakriti)
  const getDominantGuna = () => {
    const gunas = {
      sattva: guna_prakriti.sattva,
      rajas: guna_prakriti.rajas,
      tamas: guna_prakriti.tamas
    };
    
    return Object.entries(gunas).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  // Now get the dominant qualities for each category
  const dominantDehaDosha = getDominantDehaDosha();  // For physical aspects
  const dominantManasDosha = getDominantManasDosha(); // For mental aspects
  const dominantGuna = getDominantGuna();            // For quality of nature

  // Map subcategories to their dominant dosha or guna type
  const getCategoryDominant = (subcategory) => {
    // Physical-focused subcategories
    if (['ahara', 'vyayama', 'yoga', 'pranayama'].includes(subcategory)) {
      return dominantDehaDosha;
    } 
    // Mental-focused subcategories
    else if (['dhyana', 'dinacharya', 'nidra'].includes(subcategory)) {
      return dominantManasDosha;
    } 
    // Quality/nature-focused subcategories
    else if (['ritucharya', 'rasayana', 'sadvritta'].includes(subcategory)) {
      return dominantGuna;
    }
    // Default fallback to physical dosha
    else {
      return dominantDehaDosha;
    }
  };

  const dominantDosha = getCategoryDominant(activeSubcategory);

  // Get response based on user query, subcategory, and constitution
  // Enhanced getResponseForQuery function with semantic matching

  const getResponseForQuery = async (
    query: string, 
    subcategory: string, 
    dosha: string, 
    prakritiType: string
  ): Promise<string> => {
    try {
      // First, try to get a response from the Ayurvedic texts via your API
      // Construct a more specific query based on the subcategory and dosha
      const enhancedQuery = `${query} for ${dosha} dosha in the context of ${subcategory}`;
      const textResponse = await askAyurveda(enhancedQuery);
      
      // If we got a meaningful response (not just a fallback)
      if (textResponse && !textResponse.includes("doesn't contain relevant information")) {
        return textResponse;
      }
      
      // If no useful results from texts, check for specific patterns for enhanced responses
      const specificResponseKey = getMoreSpecificResponse(query, subcategory, dosha);
      if (specificResponseKey && responseMap[specificResponseKey]) {
        return responseMap[specificResponseKey];
      }
      
      // Time-specific responses
      if (query.toLowerCase().includes("evening") || query.toLowerCase().includes("night")) {
        const eveningKey = `${subcategory}_evening_${dosha}`;
        if (responseMap[eveningKey]) {
          return responseMap[eveningKey];
        }
      }
      
      // [Rest of your existing fallback logic...]
      
    } catch (error) {
      console.error("Error in getResponseForQuery:", error);
      
      // If the API call fails, fall back to canned responses
      const generalKey = `${subcategory}_general_${dosha}`;
      return responseMap[generalKey] || 
        `For ${subcategory} with your ${prakritiType} constitution, I can provide guidance on general practices, techniques, and benefits.`;
    }
  };

    const getMoreSpecificResponse = (query: string, subcategory: string, dosha: string): string | null => {
        const lowercaseQuery = query.toLowerCase();
        
        // Specific patterns to check (checking in order of specificity)
        const specificPatterns = [
        // Nidra (Sleep) patterns
        { regex: /insomnia|can't sleep|difficulty (falling|getting) asleep/i, key: `${subcategory}_technique_${dosha}_insomnia` },
        { regex: /wak(e|ing) up.*middle|wake up .*(night|3 am|early)/i, key: `${subcategory}_technique_${dosha}_waking_up` },
        { regex: /jet lag|travel.*sleep|time zone/i, key: `${subcategory}_technique_${dosha}_jet_lag` },
        { regex: /(too )?hot.*sleep|night sweat|overheating/i, key: `${subcategory}_technique_${dosha}_overheating` },
        { regex: /racing mind|thoughts.*sleep|can't turn off.*mind/i, key: `${subcategory}_technique_${dosha}_racing_mind` },
        { regex: /oversleep|sleep too (much|long)|hard to wake/i, key: `${subcategory}_technique_${dosha}_oversleeping` },
        { regex: /morning.*(heavy|groggy)|foggy.*wake up/i, key: `${subcategory}_technique_${dosha}_morning_heaviness` },
        { regex: /sleepy during day|daytime.*tired|afternoon.*(sleepy|drowsy)/i, key: `${subcategory}_technique_${dosha}_daytime_sleepiness` },
        
        // Ahara (Diet) patterns
        { regex: /digest(ion|ive)|(gas|bloat)/i, key: `${subcategory}_technique_${dosha}_digestion` },
        { regex: /constipat(ed|ion)|irregular.*(bowel|stool)|hard stool/i, key: `${subcategory}_technique_${dosha}_constipation` },
        
        // Vyayama (Exercise) patterns
        { regex: /(joint|arthritis|knee|shoulder).*pain|protect.*joint/i, key: `${subcategory}_technique_${dosha}_joint_protection` },
        
        // Yoga patterns
        { regex: /ground(ing|ed)|stabilize|centering|balance/i, key: `${subcategory}_poses_${dosha}_grounding` },
        
        // Pranayama patterns
        { regex: /anxiety|stress|worry|calm/i, key: `${subcategory}_technique_${dosha}_anxiety` },
        
        // Dhyana (Meditation) patterns
        { regex: /focus|concentrate|distract(ed|ion)|attention/i, key: `${subcategory}_technique_${dosha}_focus` },
        
        // Ritucharya (Seasonal) patterns
        { regex: /winter|cold season|dry season|winter care/i, key: `${subcategory}_technique_${dosha}_winter` },
        { regex: /summer|hot season|heat|summer care/i, key: `${subcategory}_technique_${dosha}_summer` },
        ];
        
        // Check for matches in order
        for (const pattern of specificPatterns) {
        if (pattern.regex.test(lowercaseQuery)) {
            return pattern.key;
        }
        }
        
        // Return null if no specific match found
        return null;
    };
  
  // Simplified semantic matching function
  // In a real implementation, you'd use a more sophisticated approach with embeddings or NLP
  function findBestCategoryMatch(query: string): string {
    // Category descriptions that capture the semantic meaning
    const categoryDescriptions = {
      general: "general information overview explanation basics fundamentals introduction",
      timing: "when timing schedule frequency time clock hour how often how long duration",
      technique: "how to method technique practice procedure steps implementation approach process",
      avoid: "avoid problems challenges weakness caution warning dangerous harmful issue difficulty risk negative",
      benefits: "benefit advantage good helpful positive improvement strength value gain healing power",
      food: "food eat eating meal diet nutrition recipe ingredient cooking consume digest",
      poses: "pose position posture asana movement form alignment stretch"
    };
    
    // Initialize scores
    const scores: Record<string, number> = {
      general: 0,
      timing: 0,
      technique: 0,
      avoid: 0,
      benefits: 0,
      food: 0,
      poses: 0
    };
    
    // Split query into words
    const queryWords = query.toLowerCase().split(/\s+/);
    
    // Score each category based on word overlap
    for (const [category, description] of Object.entries(categoryDescriptions)) {
      const descWords = description.split(/\s+/);
      
      // Count matching words
      for (const word of queryWords) {
        if (word.length > 3 && descWords.includes(word)) { // Only count meaningful words
          scores[category] += 1;
        }
      }
    }
    
    // Find category with highest score
    let bestCategory = "general";
    let highestScore = 0;
    
    for (const [category, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }
  
  // Example implementation with common question patterns
  function detectQuestionType(query: string): string {
    const lowercaseQuery = query.toLowerCase();
    
    // Common patterns that indicate question types
    const patterns = [
      { regex: /what (is|are) .*\?/i, type: "general" },
      { regex: /how (do|can|to) .*\?/i, type: "technique" },
      { regex: /when (should|to|do) .*\?/i, type: "timing" },
      { regex: /(what are|list|tell me) .*(weaknesses|problems).*\?/i, type: "avoid" },
      { regex: /(what are|list|tell me) .*(benefits|advantages).*\?/i, type: "benefits" },
      { regex: /(should i avoid|what not to do).*\?/i, type: "avoid" }
    ];
    
    for (const { regex, type } of patterns) {
      if (regex.test(lowercaseQuery)) {
        return type;
      }
    }
    
    return "general"; // Default
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Initialize with a welcome message
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: 1,
          text: `Namaste! I'll help you with personalized ${subcategoryName} (${subcategoryEnglish}) recommendations for your ${prakritiType} constitution.\n\nYour dominant dosha is ${dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)}. What specific aspect would you like guidance on?`,
          sender: "bot",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [chatOpen, subcategoryName, subcategoryEnglish, prakritiType, dominantDosha, messages.length]);

  // Reset messages when subcategory changes
  useEffect(() => {
    setMessages([]);
    if (chatOpen) {
      const welcomeMessage: Message = {
        id: 1,
        text: `Namaste! I'll help you with personalized ${subcategoryName} (${subcategoryEnglish}) recommendations for your ${prakritiType} constitution.\n\nYour dominant dosha is ${dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)}. What specific aspect would you like guidance on?`,
        sender: "bot",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [activeSubcategory, chatOpen, subcategoryName, subcategoryEnglish, prakritiType, dominantDosha]);

  // Timer functions
  const startTimer = () => {
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopTimer();
          toast({
            title: "Practice Complete",
            description: `Your ${timerDuration / 60} minute practice is complete.`,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
  };

  const stopTimer = () => {
    pauseTimer();
    setTimeRemaining(timerDuration);
  };

  const resetTimer = () => {
    stopTimer();
    startTimer();
  };

  const changeTimerDuration = (seconds: number) => {
    setTimerDuration(seconds);
    setTimeRemaining(seconds);
    stopTimer();
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Speech synthesis functions
  const speak = (text: string) => {
    try {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        speechRef.current = utterance;
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        speechRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        speechRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      speechRef.current = null;
    }
  };

  const stopSpeaking = () => {
    try {
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error('Error stopping speech:', error);
    } finally {
      setIsSpeaking(false);
      speechRef.current = null;
    }
  };

  const toggleSpeaking = (text: string) => {
    try {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        speak(text);
      }
    } catch (error) {
      console.error('Error toggling speech:', error);
      setIsSpeaking(false);
      speechRef.current = null;
    }
  };

  // Save a recommendation
  const saveRecommendation = (text: string) => {
    setSavedRecommendations(prev => [...prev, text]);
    toast({
      title: "Recommendation Saved",
      description: "Added to your personal library",
    });
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      const trimmedInput = input.trim();
      
      // Create user message
      const userMessage: Message = {
        id: messages.length + 1,
        text: trimmedInput,
        sender: "user",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      
      try {
        // Get response based on user query (now async)
        const responseText = await getResponseForQuery(
          trimmedInput, 
          activeSubcategory, 
          dominantDosha, 
          prakritiType
        );
        
        const botMessage: Message = {
          id: messages.length + 2,
          text: responseText,
          sender: "bot",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error("Error getting response:", error);
        
        // Add an error message for the user
        const errorMessage: Message = {
          id: messages.length + 2,
          text: "I'm having trouble accessing the Ayurvedic wisdom right now. Please try again later.",
          sender: "bot",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle input key presses
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Automatically send after a short delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Get suggestions based on the active subcategory
  const getSuggestions = (subcategory: string) => {
    const suggestionsBySubcategory: Record<string, string[]> = {
      dinacharya: [
        "What's the ideal morning routine for me?",
        "How should I structure my evening?",
        "What are the best times for activities during the day?"
      ],
      nidra: [
        "What's the best sleep schedule for me?",
        "How can I improve my sleep quality?",
        "What should I do before bedtime?"
      ],
      ahara: [
        "What foods should I favor?",
        "What should my meal timing be?",
        "What foods should I avoid?"
      ],
      vyayama: [
        "What type of exercise is best for me?",
        "When is the best time to exercise?",
        "How intense should my workouts be?"
      ],
      yoga: [
        "Which yoga asanas benefit me most?",
        "How should I structure my practice?",
        "Are there any poses I should avoid?"
      ],
      pranayama: [
        "Which breathing techniques are best for me?",
        "How long should I practice pranayama?",
        "Can you teach me a specific technique?"
      ],
      dhyana: [
        "What meditation style suits me best?",
        "How can I deepen my practice?",
        "What's a good beginner technique?"
      ],
      ritucharya: [
        "How should I adjust for the current season?",
        "What seasonal foods are recommended?",
        "How does the season affect my doshas?"
      ],
      rasayana: [
        "What rejuvenation practices are best for me?",
        "Are there herbs or supplements that help?",
        "How can I naturally detoxify?"
      ],
      sadvritta: [
        "What social behaviors strengthen my constitution?",
        "How can I manage stress according to Ayurveda?",
        "What daily ethics should I practice?"
      ]
    };
    
    return suggestionsBySubcategory[subcategory] || [];
  };

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.error('Error cleaning up speech:', error);
      }
    };
  }, []);

  // Helper function to handle subcategory change
  const handleSubcategoryChange = (subcategory: string) => {
    // Find which category this subcategory belongs to
    for (const category of categories) {
      if (category.subcategories.some(sub => sub.id === subcategory)) {
        setActiveCategory(category.id);
        break;
      }
    }
    
    setActiveSubcategory(subcategory);
  };

  return (
    <section className="py-12 px-4 bg-tattva-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-tattva-green-dark">
            Personalized Ayurvedic Guidance
          </h2>
          <p className="text-center mt-2 text-gray-600">
            Discover ancient wisdom tailored to your {prakritiType} constitution
          </p>
        </div>

        {/* Main content area with tabs */}
        <Tabs defaultValue="daily" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-5 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex flex-col items-center py-3">
                <category.icon className="h-5 w-5 mb-1" />
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-gray-500 italic">{category.sanskrit}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Content for each category */}
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              {/* Subcategory selection if there are multiple */}
              {category.subcategories.length >= 1 && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((subcategory) => (
                        <Button
                          key={subcategory.id}
                          variant={activeSubcategory === subcategory.id ? "default" : "outline"}
                          className={activeSubcategory === subcategory.id ? "bg-tattva-green text-white" : ""}
                          onClick={() => handleSubcategoryChange(subcategory.id)}
                        >
                          {subcategory.name}
                          <span className="ml-2 text-xs">({subcategory.english})</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left panel: Category/Subcategory information */}
                <Card className="col-span-1 md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {subcategoryName}
                      <span className="text-sm text-gray-500 ml-2">({subcategoryEnglish})</span>
                    </CardTitle>
                    <CardDescription>
                      Part of {categoryName} in Ayurveda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {getSubcategoryDescription(activeSubcategory)}
                    </p>
                    
                    {/* Timer for practices (visible for yoga, pranayama, dhyana) */}
                    {(activeSubcategory === 'yoga' || activeSubcategory === 'pranayama' || activeSubcategory === 'dhyana') && (
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center"
                          onClick={() => setTimerOpen(true)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Practice Timer
                        </Button>
                      </div>
                    )}
                    
                    {/* Chat interface button */}
                    <Button 
                      className="w-full mt-4 bg-tattva-green hover:bg-tattva-green-dark text-white"
                      onClick={() => setChatOpen(true)}
                    >
                      <LeafIcon className="h-4 w-4 mr-2" />
                      Get Personal Guidance
                    </Button>
                  </CardContent>
                </Card>

                {/* Right panel: Recommendations */}
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      Recommendations for {subcategoryName}
                    </CardTitle>
                    <CardDescription>
                      Personalized guidance for your {prakritiType} constitution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* General recommendation for subcategory */}
                    <p>
                      {responseMap[`${activeSubcategory}_general_${dominantDosha}`] || 
                       `Here are personalized recommendations for ${subcategoryName} based on your ${dominantDosha} constitution.`}
                    </p>
                    
                    {/* Quick suggestions */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Ask about:</h4>
                      <div className="flex flex-wrap gap-2">
                        {getSuggestions(activeSubcategory).map((suggestion, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setChatOpen(true);
                              setTimeout(() => {
                                handleSuggestionClick(suggestion);
                              }, 500);
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Saved recommendations section */}
        {savedRecommendations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Saved Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {savedRecommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="bg-tattva-green text-white p-4 rounded-t-lg shadow-sm">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl flex items-center">
                <LeafIcon className="mr-2 h-5 w-5" />
                {subcategoryName} Guidance
                <span className="text-sm ml-2">({subcategoryEnglish})</span>
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-white hover:bg-tattva-green-dark"
                onClick={() => setChatOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 bg-tattva-green-light/20 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.text}
                    
                    {/* Action buttons for bot messages */}
                    {message.sender === "bot" && (
                      <div className="flex items-center justify-end mt-2 gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                          onClick={() => toggleSpeaking(message.text)}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                          onClick={() => saveRecommendation(message.text)}
                        >
                          <BookmarkPlus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="relative flex items-end">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 pr-12"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute right-2 bottom-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4 text-tattva-green" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Timer Dialog */}
      <Dialog open={timerOpen} onOpenChange={setTimerOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Practice Timer
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="text-5xl font-bold mb-8">{formatTime(timeRemaining)}</div>
            
            <div className="flex justify-center space-x-4 mb-8">
              {timerRunning ? (
                <Button onClick={pauseTimer}>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={startTimer}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
              
              <Button variant="outline" onClick={resetTimer}>
                Reset
              </Button>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => changeTimerDuration(60 * 5)}
                className={timerDuration === 60 * 5 ? "bg-tattva-green-light text-tattva-green-dark" : ""}
              >
                5 min
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => changeTimerDuration(60 * 10)}
                className={timerDuration === 60 * 10 ? "bg-tattva-green-light text-tattva-green-dark" : ""}
              >
                10 min
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => changeTimerDuration(60 * 15)}
                className={timerDuration === 60 * 15 ? "bg-tattva-green-light text-tattva-green-dark" : ""}
              >
                15 min
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => changeTimerDuration(60 * 20)}
                className={timerDuration === 60 * 20 ? "bg-tattva-green-light text-tattva-green-dark" : ""}
              >
                20 min
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

// Helper function to get descriptions for each subcategory
function getSubcategoryDescription(subcategory: string): string {
  const descriptions: Record<string, string> = {
    dinacharya: "Daily routines and practices that align with your natural constitution to maintain balance throughout the day.",
    nidra: "Sleep practices and habits that support your constitution for deep, restorative rest and rejuvenation.",
    ahara: "Dietary guidelines including foods, spices, and eating habits that balance your specific constitution.",
    vyayama: "Exercise recommendations tailored to your constitution's unique needs for strength and vitality.",
    yoga: "Yoga postures (asanas) that specifically balance and support your constitution's tendencies.",
    pranayama: "Breathing techniques that regulate the flow of prana (life energy) according to your constitution.",
    dhyana: "Meditation approaches that calm and focus the mind in ways that balance your constitution.",
    ritucharya: "Seasonal adjustments to routine, diet, and lifestyle to maintain balance as external conditions change.",
    rasayana: "Rejuvenation practices and substances that revitalize and strengthen your constitutional type.",
    sadvritta: "Behavioral and ethical guidelines that support mental harmony in accordance with your constitution."
  };
  
  return descriptions[subcategory] || "Ayurvedic practices tailored to your unique constitution.";
}

export default AyurvedicRecommendations;