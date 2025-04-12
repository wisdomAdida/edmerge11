import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { askGemini, isGeminiConfigured, getPersonalizedRecommendations } from "@/lib/gemini";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Send, 
  Brain, 
  Lightbulb, 
  Clock, 
  BookText,
  RotateCcw,
  Save,
  Download,
  PencilRuler,
  GraduationCap,
  History,
  BarChart3,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  FileQuestion,
  List,
  Check,
  Award,
  Star,
  Zap,
  BookOpen,
  Compass
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';
import { apiRequest } from "@/lib/queryClient";

// Message type for chat history
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
};

type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic';

type StudySession = {
  id: string;
  title: string;
  lastAccessed: Date;
  messages: Message[];
  subject?: string;
  context?: string;
};

type LearningPath = {
  topic: string;
  steps: {
    title: string;
    description: string;
  }[];
}

type Resource = {
  name: string;
  type: string;
  description: string;
}

type ProjectIdea = {
  title: string;
  description: string;
  difficulty: string;
}

type Recommendations = {
  recommendedTopics: string[];
  learningPath: LearningPath;
  resources: Resource[];
  projectIdeas: ProjectIdea[];
}

// Preset interests for the student
const studentInterests = [
  "Mathematics", "Physics", "Computer Science", "History", "Literature",
  "Biology", "Chemistry", "Art", "Music", "Economics"
];

export default function AdvancedAITutorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [isGeminiReady, setIsGeminiReady] = useState<boolean | null>(null);
  const [activeSession, setActiveSession] = useState<string>("new");
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('visual');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Mathematics", "Computer Science"]);
  const [isGettingRecommendations, setIsGettingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [useFormattedOutput, setUseFormattedOutput] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Subject suggestions based on education level
  const suggestedQuestionsBySubject = {
    Mathematics: {
      primary: [
        "How do I add fractions?",
        "What is multiplication and how does it work?",
        "Can you explain shapes and geometry to me?",
        "How do I tell time on a clock?",
      ],
      secondary: [
        "How do I solve quadratic equations?",
        "What are trigonometric functions and how do I use them?",
        "Can you explain probability theory?",
        "What is algebra and how do I use it?",
      ],
      tertiary: [
        "Explain the concept of derivatives in calculus",
        "What is linear algebra used for?",
        "How do I solve differential equations?",
        "Explain statistical significance in research",
      ],
      individual: [
        "What mathematics concepts are important for machine learning?",
        "How is mathematics applied in finance?",
        "Explain the mathematics behind encryption",
        "What are the most important mathematical concepts for data science?",
      ]
    },
    Science: {
      primary: [
        "What are the states of matter?",
        "How do plants grow?",
        "Why is the sky blue?",
        "What makes a rainbow?",
      ],
      secondary: [
        "Explain the water cycle",
        "How does electricity work?",
        "What is photosynthesis?",
        "How do animals adapt to their environments?",
      ],
      tertiary: [
        "How does quantum mechanics work?",
        "Explain cellular respiration",
        "What are the principles of thermodynamics?",
        "How does natural selection drive evolution?",
      ],
      individual: [
        "What are the latest developments in renewable energy?",
        "How do vaccines work?",
        "Explain the science behind climate change",
        "What are the ethical considerations in genetic engineering?",
      ]
    },
    History: {
      primary: [
        "Who were the ancient Egyptians?",
        "What was life like for children in the past?",
        "Who were some important inventors?",
        "Why do we celebrate holidays?",
      ],
      secondary: [
        "What caused World War II?",
        "How did the Industrial Revolution change society?",
        "What was the Civil Rights Movement?",
        "Explain colonialism and its effects",
      ],
      tertiary: [
        "Analyze the causes of the French Revolution",
        "How did the Cold War shape modern geopolitics?",
        "What were the key philosophical ideas of the Enlightenment?",
        "Compare and contrast different economic systems throughout history",
      ],
      individual: [
        "How has technology changed warfare throughout history?",
        "What economic factors led to the 2008 financial crisis?",
        "How has globalization affected cultural identities?",
        "What role did religion play in ancient civilizations?",
      ]
    },
    Language: {
      primary: [
        "What are nouns, verbs, and adjectives?",
        "How do I write a good story?",
        "What's the difference between a fact and an opinion?",
        "How do I use punctuation correctly?",
      ],
      secondary: [
        "How do I analyze a poem?",
        "What makes a good essay?",
        "How do I cite sources in my writing?",
        "Can you explain literary devices like metaphor and simile?",
      ],
      tertiary: [
        "How do I structure a research paper?",
        "What are the major literary movements and their characteristics?",
        "How do I analyze themes in literature?",
        "Explain critical theory approaches to literature",
      ],
      individual: [
        "How can I improve my business writing?",
        "What techniques make public speaking more effective?",
        "How does language shape our perception of reality?",
        "What are the key elements of persuasive writing?",
      ]
    }
  };

  // Get recent learning topics through API
  const { data: recentTopics, isLoading: isLoadingTopics } = useQuery({
    queryKey: ["/api/student/recent-topics"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/student/recent-topics");
        if (!response.ok) {
          throw new Error("Failed to fetch recent topics");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching recent topics:", error);
        // Return some fallback topics when the API is not available yet
        return [
          { id: 1, title: "Mathematics", subtopic: "Algebra", lastAccessed: new Date().toISOString() },
          { id: 2, title: "Science", subtopic: "Biology", lastAccessed: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, title: "History", subtopic: "World War II", lastAccessed: new Date(Date.now() - 172800000).toISOString() },
        ];
      }
    }
  });

  // Get saved sessions from API
  const { data: savedSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/student/ai-sessions"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/student/ai-sessions");
        if (!response.ok) {
          throw new Error("Failed to fetch AI sessions");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching AI sessions:", error);
        // Return some initial sessions when the API is not available yet
        return [
          { 
            id: "session-1", 
            title: "Mathematics Help", 
            lastAccessed: new Date(Date.now() - 86400000).toISOString(),
            subject: "Mathematics",
            messages: []
          },
          { 
            id: "session-2", 
            title: "Science Concepts", 
            lastAccessed: new Date(Date.now() - 172800000).toISOString(),
            subject: "Science",
            messages: []
          },
        ];
      }
    }
  });

  // Save session mutation
  const saveSessionMutation = useMutation({
    mutationFn: async (session: StudySession) => {
      const response = await apiRequest("POST", "/api/student/ai-sessions", session);
      if (!response.ok) {
        throw new Error("Failed to save session");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/ai-sessions"] });
      toast({
        title: "Session Saved",
        description: "Your learning session has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Session",
        description: error instanceof Error ? error.message : "An error occurred while saving your session",
        variant: "destructive",
      });
    }
  });

  // Get relevant suggested questions based on user level and selected subject
  const getRelevantQuestions = (subject: keyof typeof suggestedQuestionsBySubject = 'Mathematics') => {
    const level = user?.studentLevel || 'primary';
    return suggestedQuestionsBySubject[subject][level as keyof typeof suggestedQuestionsBySubject.Mathematics] || 
           suggestedQuestionsBySubject.Mathematics.primary;
  };

  // Initialize component
  useEffect(() => {
    // Check if Gemini API is configured
    const checkGemini = async () => {
      const configured = await isGeminiConfigured();
      setIsGeminiReady(configured);
      
      if (!configured) {
        toast({
          title: "AI Tutor Setup Required",
          description: "Gemini API key needs to be configured for the AI tutor to work.",
          variant: "destructive",
        });
      }
    };
    
    checkGemini();
    
    // Initialize with a welcome message
    const welcomeMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setHistory([
      {
        id: welcomeMessageId,
        role: 'assistant',
        content: `Hello ${user?.firstName || 'there'}! I'm your AI tutor powered by Google's Gemini. I'm here to help with your ${user?.studentLevel || ''} level studies. You can ask me any questions, and I'll provide personalized explanations tailored to your educational needs.\n\nWhat would you like to learn about today?`,
        timestamp: new Date(),
      }
    ]);
    
    // Set up initial sessions from saved data if available
    if (savedSessions) {
      setSessions(savedSessions.map((session: any) => ({
        ...session,
        lastAccessed: new Date(session.lastAccessed),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })));
    }
  }, [toast, user, savedSessions]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Handle sending a question to the AI
  const handleSendQuestion = async () => {
    if (!question.trim()) return;
    
    if (!isGeminiReady) {
      toast({
        title: "AI Tutor Unavailable",
        description: "The AI tutor service is not configured properly. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    
    // Generate unique IDs for messages
    const userMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Add user message to history
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    
    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Call Gemini AI with the user's question and education level
      const response = await askGemini(question, user?.studentLevel || 'primary');
      
      // Generate ID for assistant message
      const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      // Add AI response to history
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setHistory(prev => [...prev, assistantMessage]);
      setQuestion("");
      
      // Update recent topics with subject from question (in a real app, this would be more sophisticated)
      const detectedSubject = detectSubjectFromQuestion(question);
      if (detectedSubject) {
        // In a real app, this would call an API to update recent topics
        console.log(`Detected subject: ${detectedSubject}`);
      }
    } catch (error) {
      toast({
        title: "Error getting response",
        description: error instanceof Error ? error.message : "Failed to get response from AI tutor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple subject detection from question text
  const detectSubjectFromQuestion = (question: string): string | null => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('math') || lowerQuestion.includes('algebra') || 
        lowerQuestion.includes('equation') || lowerQuestion.includes('calculus')) {
      return 'Mathematics';
    }
    
    if (lowerQuestion.includes('science') || lowerQuestion.includes('biology') || 
        lowerQuestion.includes('chemistry') || lowerQuestion.includes('physics')) {
      return 'Science';
    }
    
    if (lowerQuestion.includes('history') || lowerQuestion.includes('war') || 
        lowerQuestion.includes('civilization') || lowerQuestion.includes('revolution')) {
      return 'History';
    }
    
    if (lowerQuestion.includes('language') || lowerQuestion.includes('grammar') || 
        lowerQuestion.includes('essay') || lowerQuestion.includes('writing')) {
      return 'Language';
    }
    
    return null;
  };

  // Handle using a suggested question
  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q);
    // Optional: auto-send the question
    // setQuestion(q);
    // setTimeout(() => handleSendQuestion(), 100);
  };

  // Handle keypresses in the input field
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  // Clear the current chat
  const clearChat = () => {
    // Keep only the welcome message
    const welcomeMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setHistory([
      {
        id: welcomeMessageId,
        role: 'assistant',
        content: `Hello ${user?.firstName || 'there'}! I'm your AI tutor. How can I help you with your studies today?`,
        timestamp: new Date(),
      }
    ]);
  };

  // Create a new session
  const createNewSession = () => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const title = newSessionTitle || `Study Session ${sessions.length + 1}`;
    
    const newSession: StudySession = {
      id: sessionId,
      title,
      lastAccessed: new Date(),
      messages: [],
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSession(sessionId);
    setNewSessionTitle("");
    clearChat();
  };

  // Load a saved session
  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      // Update the messages to the session's messages
      if (session.messages.length > 0) {
        setHistory(session.messages);
      } else {
        // If the session has no messages, add a welcome message
        const welcomeMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setHistory([
          {
            id: welcomeMessageId,
            role: 'assistant',
            content: `Welcome to your "${session.title}" session. How can I help you with this topic today?`,
            timestamp: new Date(),
          }
        ]);
      }
      
      // Update the session's last accessed time
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, lastAccessed: new Date() } : s
      ));
      
      setActiveSession(sessionId);
    }
  };

  // Save the current session
  const saveCurrentSession = () => {
    if (activeSession === "new") {
      // Create a new session if none is selected
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const sessionTitle = newSessionTitle || `Study Session ${sessions.length + 1}`;
      
      const newSession: StudySession = {
        id: sessionId,
        title: sessionTitle,
        lastAccessed: new Date(),
        messages: history,
      };
      
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(sessionId);
      setNewSessionTitle("");
      
      // Save to the backend
      saveSessionMutation.mutate(newSession);
    } else {
      // Update existing session
      setSessions(prev => prev.map(s => 
        s.id === activeSession 
          ? { ...s, lastAccessed: new Date(), messages: history } 
          : s
      ));
      
      // Get the session data
      const sessionToSave = sessions.find(s => s.id === activeSession);
      if (sessionToSave) {
        saveSessionMutation.mutate({
          ...sessionToSave,
          lastAccessed: new Date(),
          messages: history
        });
      }
    }
    
    toast({
      title: "Session Saved",
      description: "Your conversation has been saved for future reference.",
    });
  };

  // Download the current chat
  const downloadChat = () => {
    const chatContent = history.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI Tutor'} (${msg.timestamp.toLocaleString()}):\n${msg.content}`
    ).join('\n\n---\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edmerge-ai-tutor-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle learning style
  const toggleLearningStyle = (style: LearningStyle) => {
    setLearningStyle(style);
    toast({
      title: "Learning Style Updated",
      description: `Your learning style is now set to ${style.charAt(0).toUpperCase() + style.slice(1)}.`,
    });
  };

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // Get personalized AI recommendations
  const getRecommendations = async () => {
    if (selectedInterests.length === 0) {
      toast({
        title: "No Interests Selected",
        description: "Please select at least one interest to get recommendations.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGettingRecommendations(true);
    
    try {
      const results = await getPersonalizedRecommendations(
        user?.studentLevel || 'primary',
        selectedInterests
      );
      
      setRecommendations(results);
    } catch (error) {
      toast({
        title: "Error Getting Recommendations",
        description: error instanceof Error ? error.message : "Failed to get personalized recommendations",
        variant: "destructive",
      });
    } finally {
      setIsGettingRecommendations(false);
    }
  };

  // Provide feedback on a message
  const provideFeedback = (messageId: string, feedback: 'helpful' | 'not-helpful') => {
    setHistory(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
    
    // In a real app, send feedback to the API
    toast({
      title: "Feedback Recorded",
      description: `Thank you for your feedback. This helps improve the AI tutor.`,
    });
  };

  return (
    <DashboardLayout title="Advanced AI Tutor">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced AI Tutor</h1>
            <p className="text-muted-foreground mt-1">
              Personalized learning powered by Google Gemini AI
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Tutor Settings</CardTitle>
              <CardDescription>
                Customize your AI tutor experience for better learning outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Preferred Learning Style</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={learningStyle === 'visual' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => toggleLearningStyle('visual')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Visual
                    </Button>
                    <Button 
                      variant={learningStyle === 'auditory' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => toggleLearningStyle('auditory')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Auditory
                    </Button>
                    <Button 
                      variant={learningStyle === 'reading' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => toggleLearningStyle('reading')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Reading/Writing
                    </Button>
                    <Button 
                      variant={learningStyle === 'kinesthetic' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => toggleLearningStyle('kinesthetic')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Kinesthetic
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="formatted-output"
                      checked={useFormattedOutput}
                      onCheckedChange={setUseFormattedOutput}
                    />
                    <Label htmlFor="formatted-output">Use formatted text output (markdown)</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Subjects of Interest</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {studentInterests.map((interest) => (
                      <Button 
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"} 
                        size="sm"
                        onClick={() => toggleInterest(interest)}
                      >
                        {selectedInterests.includes(interest) && <Check className="h-4 w-4 mr-2" />}
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main chat section */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            {/* Main chat card */}
            <Card className="flex-1">
              <CardHeader className="bg-muted/50 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-2 border border-primary/20">
                      <AvatarImage src="/assets/ai-tutor-avatar.png" />
                      <AvatarFallback>
                        <Brain className="text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>EdMerge AI Tutor</CardTitle>
                      <CardDescription>
                        {activeSession !== "new" 
                          ? sessions.find(s => s.id === activeSession)?.title || "New Session" 
                          : "New Session"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isGeminiReady && (
                      <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 mr-1"></div>
                        AI Ready
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div 
                  ref={chatContainerRef}
                  className="space-y-4 max-h-[500px] overflow-y-auto p-6"
                >
                  {history.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-lg p-4 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted border border-border/50'
                        }`}
                      >
                        {message.role === 'assistant' && message.content && useFormattedOutput ? (
                          <div className="prose dark:prose-invert prose-p:my-2 prose-headings:mb-2 prose-headings:mt-4 max-w-none whitespace-pre-wrap">
                            <ReactMarkdown>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-2">
                          <div 
                            className={`text-xs ${
                              message.role === 'user' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                          
                          {message.role === 'assistant' && (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`w-6 h-6 rounded-full ${message.feedback === 'helpful' ? 'bg-emerald-100 text-emerald-600' : ''}`}
                                onClick={() => provideFeedback(message.id, 'helpful')}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`w-6 h-6 rounded-full ${message.feedback === 'not-helpful' ? 'bg-rose-100 text-rose-600' : ''}`}
                                onClick={() => provideFeedback(message.id, 'not-helpful')}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg p-4 bg-muted flex items-center space-x-2 animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-muted-foreground">EdMerge AI is generating a response...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <div className="w-full space-y-4">
                  <div className="flex items-center space-x-2">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Ask any ${user?.studentLevel || 'educational'} question...`}
                      className="flex-1 resize-none"
                      disabled={isLoading || !isGeminiReady}
                    />
                    <Button 
                      onClick={handleSendQuestion} 
                      disabled={isLoading || !question.trim() || !isGeminiReady}
                      size="icon"
                      className="h-full aspect-square"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={clearChat}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadChat}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={saveCurrentSession}
                      disabled={saveSessionMutation.isPending}
                    >
                      {saveSessionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Session
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            {/* Personalized Study Recommendations */}
            {recommendations && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                    Personalized Learning Path
                  </CardTitle>
                  <CardDescription>
                    Based on your interests in {selectedInterests.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recommended Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendations.recommendedTopics.map((topic, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm" 
                            className="cursor-pointer" 
                            onClick={() => handleSuggestedQuestion(`Tell me about ${topic}`)}
                          >
                            {topic}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Learning Path: {recommendations.learningPath.topic}</h4>
                      <div className="space-y-2">
                        {recommendations.learningPath.steps.map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="bg-muted rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{step.title}</div>
                              <div className="text-xs text-muted-foreground">{step.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Recommended Resources</h4>
                        <div className="space-y-2">
                          {recommendations.resources.map((resource, index) => (
                            <div key={index} className="text-xs p-2 border rounded-md">
                              <div className="font-medium">{resource.name}</div>
                              <div className="text-muted-foreground">{resource.description}</div>
                              <div className="mt-1 text-primary text-[10px] uppercase font-semibold">{resource.type}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Project Ideas</h4>
                        <div className="space-y-2">
                          {recommendations.projectIdeas.map((project, index) => (
                            <div key={index} className="text-xs p-2 border rounded-md">
                              <div className="font-medium">{project.title}</div>
                              <div className="text-muted-foreground">{project.description}</div>
                              <div className="mt-1 text-primary text-[10px] uppercase font-semibold">{project.difficulty}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar with sessions, interests and suggestions */}
          <div className="space-y-6">
            {/* Sessions and learning tabs */}
            <Tabs defaultValue="sessions">
              <TabsList className="w-full">
                <TabsTrigger value="sessions">
                  <History className="h-4 w-4 mr-2" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="topics">
                  <BookText className="h-4 w-4 mr-2" />
                  Topics
                </TabsTrigger>
                <TabsTrigger value="tools">
                  <Compass className="h-4 w-4 mr-2" />
                  Learning Tools
                </TabsTrigger>
              </TabsList>
              
              {/* Study Sessions Tab */}
              <TabsContent value="sessions" className="space-y-4 pt-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="New session name..."
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={createNewSession}>Create</Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Your Study Sessions</h3>
                  
                  {isLoadingSessions ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No saved sessions yet. Create one to get started!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessions
                        .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
                        .map((session) => (
                        <Button 
                          key={session.id} 
                          variant={activeSession === session.id ? "default" : "outline"} 
                          className="w-full justify-start h-auto py-2 px-3 text-left"
                          onClick={() => loadSession(session.id)}
                        >
                          <div className="flex items-center w-full">
                            <div className="mr-2 bg-primary/10 p-1 rounded">
                              <FileQuestion className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 truncate">
                              <div className="font-medium text-sm truncate">{session.title}</div>
                              <div className="text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(session.lastAccessed).toLocaleDateString()}
                              </div>
                            </div>
                            {activeSession === session.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary ml-2"></div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Recent Topics Tab */}
              <TabsContent value="topics">
                <div className="space-y-4 pt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search topics..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Recent Learning Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {isLoadingTopics ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        ) : recentTopics && recentTopics.length > 0 ? (
                          recentTopics.map((topic: any) => (
                            <Button 
                              key={topic.id} 
                              variant="outline" 
                              className="w-full justify-start h-auto py-2 px-3"
                              onClick={() => handleSuggestedQuestion(`Help me understand ${topic.title}: ${topic.subtopic}`)}
                            >
                              <BookText className="h-4 w-4 mr-2 text-primary" />
                              <div className="text-left">
                                <div className="font-medium">{topic.title}</div>
                                <div className="text-xs text-muted-foreground">{topic.subtopic}</div>
                              </div>
                              <div className="ml-auto text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(topic.lastAccessed).toLocaleDateString()}
                              </div>
                            </Button>
                          ))
                        ) : (
                          <div className="text-center py-2 text-sm text-muted-foreground">
                            No recent topics found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Recommended Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.keys(suggestedQuestionsBySubject).map((subject) => (
                          <div key={subject} className="mb-3">
                            <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-1">{subject}</h4>
                            {getRelevantQuestions(subject as keyof typeof suggestedQuestionsBySubject)
                              .filter(q => !searchTerm || q.toLowerCase().includes(searchTerm.toLowerCase()))
                              .slice(0, 2) // Only show 2 questions per subject
                              .map((q, i) => (
                              <Button 
                                key={i} 
                                variant="outline" 
                                className="w-full justify-start h-auto py-2 px-3 text-left mb-1"
                                onClick={() => handleSuggestedQuestion(q)}
                              >
                                <Lightbulb className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                                <span className="line-clamp-2 text-sm">{q}</span>
                              </Button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Learning Tools Tab */}
              <TabsContent value="tools">
                <div className="space-y-4 pt-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Personalized Recommendations</CardTitle>
                      <CardDescription>
                        Get AI-powered learning recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">Select your interests:</div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {studentInterests.map((interest) => (
                            <Button
                              key={interest}
                              variant={selectedInterests.includes(interest) ? "default" : "outline"} 
                              size="sm"
                              className="text-xs"
                              onClick={() => toggleInterest(interest)}
                            >
                              {selectedInterests.includes(interest) && <Check className="h-3 w-3 mr-1" />}
                              {interest}
                            </Button>
                          ))}
                        </div>
                        <Button 
                          className="w-full"
                          onClick={getRecommendations}
                          disabled={isGettingRecommendations || selectedInterests.length === 0}
                        >
                          {isGettingRecommendations ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          Get Recommendations
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">AI Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start h-auto py-3"
                          onClick={() => handleSuggestedQuestion("Create a study plan for me based on my current educational level.")}
                        >
                          <PencilRuler className="h-4 w-4 mr-2 text-violet-500" />
                          <div className="text-left">
                            <div className="font-medium">Study Plan Generator</div>
                            <div className="text-xs text-muted-foreground">Get a personalized study schedule</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start h-auto py-3"
                          onClick={() => handleSuggestedQuestion("Can you explain a complex concept I'm struggling with and then quiz me on it to test my understanding?")}
                        >
                          <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                          <div className="text-left">
                            <div className="font-medium">Concept Clarifier + Quiz</div>
                            <div className="text-xs text-muted-foreground">Understand difficult topics</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start h-auto py-3"
                          onClick={() => handleSuggestedQuestion("Help me prepare for my upcoming exam by creating practice questions with detailed answers.")}
                        >
                          <FileQuestion className="h-4 w-4 mr-2 text-emerald-500" />
                          <div className="text-left">
                            <div className="font-medium">Exam Preparation</div>
                            <div className="text-xs text-muted-foreground">Practice questions & answers</div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper components
const ThumbsUp = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const ThumbsDown = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);