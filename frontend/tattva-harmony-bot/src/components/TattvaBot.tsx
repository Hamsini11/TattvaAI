import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, MessageSquare, Mic, MicOff, Volume2, VolumeX, Square } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePrakritiStore } from "@/lib/store";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const TattvaBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Namaste! I'm Tattva, your guide to discovering your natural constitution (prakriti) through Ayurveda. This 5,000-year-old wisdom can reveal your natural tendencies and help you find balance in your daily life.\n\n\nBefore we begin our journey together, could you share which life stage you're currently in?\n\n\n- A young soul (under 16)\n- A seeker (16-30)\n- An established being (31-60)\n- A wise elder (over 60)\n\n\nYour answer will help me customize our conversation to best serve your unique path.",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceButton, setShowVoiceButton] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const { setPrakritiType, setDehaPrakriti, setManasPrakriti, setGunaPrakriti } = usePrakritiStore();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Session created:', data);
        
        if (!data.session_id) {
          throw new Error('No session ID received');
        }
        
        setSessionId(data.session_id);
      } catch (error) {
        console.error('Error creating session:', error);
        toast({
          title: "Error",
          description: "Failed to initialize chat session. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (open && !sessionId) {
      createSession();
    }
  }, [open]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          // Automatically send the message after recording
          setTimeout(() => {
            if (transcript.trim()) {
              handleSend();
            }
          }, 100);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          toast({
            title: "Speech Recognition Error",
            description: event.error === 'not-allowed' 
              ? "Microphone access was denied. Please check your browser permissions."
              : "Error recording speech. Please try again.",
            variant: "destructive",
            duration: 4000,
          });
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };

        setShowVoiceButton(true);
      }
    }
  }, []);

  const startRecording = async () => {
    try {
      if (!recognitionRef.current) {
        throw new Error('Speech recognition not initialized');
      }

      await recognitionRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak now...",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check your browser permissions.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Add text-to-speech functionality
  const speak = (text: string) => {
    try {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.15;    // Slightly faster but natural
      utterance.pitch = 1.2;    // Higher pitch for female voice
      utterance.volume = 1.0;   // Full volume

      // Get available voices and set a clear, natural voice
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => v.name)); // For debugging

      // Prioritize specific female voices known for clarity
      const preferredVoice = voices.find(voice => 
        (voice.name.includes('Google US English Female')) ||        // First choice: Google female
        (voice.name.includes('Microsoft Zira')) ||                 // Second choice: MS Zira
        (voice.name.includes('Female') && !voice.name.includes('Heera')) || // Third: Any female except Heera
        (voice.name.includes('en-US') && voice.name.includes('Female')) ||  // Fourth: Any US female
        (voice.name.includes('Google') && !voice.name.includes('Male'))     // Fifth: Any non-male Google voice
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Selected voice:', preferredVoice.name); // For debugging
      }

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

  // Add a useEffect to load voices when available
  useEffect(() => {
    const loadVoices = () => {
      // This triggers voice loading in some browsers
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

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

  const toggleSpeaking = () => {
    try {
      if (isSpeaking) {
        stopSpeaking();
      } else if (messages.length > 0) {
        const lastBotMessage = [...messages].reverse().find(msg => msg.sender === "bot");
        if (lastBotMessage) {
          speak(lastBotMessage.text);
        }
      }
    } catch (error) {
      console.error('Error toggling speech:', error);
      setIsSpeaking(false);
      speechRef.current = null;
    }
  };

  // Modify handleSend to include text-to-speech
  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      const trimmedInput = input.trim();
      
      const userMessage: Message = {
        id: messages.length + 1,
        text: trimmedInput,
        sender: "user",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      
      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages.concat(userMessage).map(msg => ({
              text: msg.text,
              sender: msg.sender,
              timestamp: msg.timestamp.toISOString(),
            })),
            session_id: sessionId,
          }),
        });
        const data = await response.json();
        let botMessage: Message;
        try {
          const jsonMatch = data.response.match(/\{.*\}/s);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[0]);
            if (jsonData.backend_code) {
              const [deha, manas, guna] = jsonData.backend_code.split(';').map(s => s.trim());
              const dehaCode = deha.split('-')[1];
              const manasCode = manas.split('-')[1];
              const gunaCode = guna.split('-')[1];
              const doshaMap = { 'V': 'Vata', 'P': 'Pitta', 'K': 'Kapha' };
              const gunaMap = { 'S': 'Saatvika', 'R': 'Raajasika', 'T': 'Taamasika' };
              const fullPrakritiType = `${gunaMap[gunaCode]} ${doshaMap[dehaCode]} ${doshaMap[manasCode]}`;
              console.log("Setting prakriti type:", fullPrakritiType);
              const { setPrakritiType } = usePrakritiStore.getState();
              setPrakritiType(fullPrakritiType);
              if (jsonData.deha_prakriti) {
                const { setDehaPrakriti } = usePrakritiStore.getState();
                setDehaPrakriti(jsonData.deha_prakriti);
              }
              if (jsonData.manas_prakriti) {
                const { setManasPrakriti } = usePrakritiStore.getState();
                setManasPrakriti(jsonData.manas_prakriti);
              }
              if (jsonData.guna_prakriti) {
                const { setGunaPrakriti } = usePrakritiStore.getState();
                setGunaPrakriti(jsonData.guna_prakriti);
              }
              botMessage = {
                id: messages.length + 2,
                text: "Thank you for completing the assessment. Your prakriti results are now available in the section below.",
                sender: "bot",
                timestamp: new Date(),
              };
            } else {
              botMessage = {
                id: messages.length + 2,
                text: data.response,
                sender: "bot",
                timestamp: new Date(),
              };
            }
          } else {
            botMessage = {
              id: messages.length + 2,
              text: data.response,
              sender: "bot",
              timestamp: new Date(),
            };
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          botMessage = {
            id: messages.length + 2,
            text: data.response,
            sender: "bot",
            timestamp: new Date(),
          };
        }
        setMessages(prev => [...prev, botMessage]);
        if (isSpeaking) {
          speak(botMessage.text);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.ctrlKey) {
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const value = target.value;
        setInput(value.substring(0, start) + "\n" + value.substring(end));
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1;
        }, 0);
      } else if (!e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  // Clean up speech synthesis on unmount and dialog close
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        speechRef.current = null;
      } catch (error) {
        console.error('Error cleaning up speech:', error);
      }
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-6 right-6 md:hidden z-10">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 w-14 rounded-full bg-tattva-orange hover:bg-tattva-orange-dark shadow-lg">
              <MessageSquare className="h-6 w-6" />
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen) {
          try {
            stopRecording();
            stopSpeaking();
          } catch (error) {
            console.error('Error closing dialog:', error);
          }
        }
        setOpen(newOpen);
        if (newOpen) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      }}>
        <DialogTrigger asChild>
          <Button className="tattva-btn-tertiary md:flex hidden">
            <Bot className="mr-2 h-5 w-5" />
            Know Your Prakriti
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="bg-tattva-green text-white p-4 rounded-t-lg shadow-sm">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                Tattva Bot
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 bg-tattva-green-light/20 overflow-y-auto">
            <div 
              className="space-y-4"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'PageUp') {
                  e.currentTarget.scrollTop -= e.currentTarget.clientHeight;
                } else if (e.key === 'PageDown') {
                  e.currentTarget.scrollTop += e.currentTarget.clientHeight;
                }
                else if (e.key === 'ArrowUp') {
                  e.currentTarget.scrollTop -= 50;
                } else if (e.key === 'ArrowDown') {
                  e.currentTarget.scrollTop += 50;
                }
              }}
            >
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
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4">
            <div className="relative flex items-end">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 pr-20"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white rounded-lg p-0`}
                  onClick={toggleRecording}
                  disabled={isLoading}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-0"
                  onClick={toggleSpeaking}
                  disabled={isLoading}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 flex items-center justify-center"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TattvaBot;
