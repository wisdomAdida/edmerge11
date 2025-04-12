import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { askGemini, isGeminiConfigured } from "@/lib/gemini";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Send, 
  Brain, 
  Lightbulb, 
  Clock, 
  BookText,
  RotateCcw,
  Save,
  Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Message type for chat history
type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AITutorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [isGeminiReady, setIsGeminiReady] = useState<boolean | null>(null);
  const [activeSession, setActiveSession] = useState("general");

  // Sample suggested questions based on education level
  const suggestedQuestions = {
    primary: [
      "What are the primary colors?",
      "Can you explain photosynthesis in simple terms?",
      "Help me with multiplication tables",
      "What happens when water freezes?",
    ],
    secondary: [
      "How do I solve quadratic equations?",
      "Explain the water cycle",
      "What caused World War II?",
      "How do I analyze a poem?",
    ],
    tertiary: [
      "Explain the concept of derivatives in calculus",
      "What are the key components of a research methodology?",
      "Compare and contrast different economic systems",
      "How does the human immune system work?",
    ],
    individual: [
      "How can I improve my critical thinking skills?",
      "What are effective study techniques?",
      "Explain blockchain technology",
      "What's the difference between machine learning and AI?",
    ],
  };

  // Get relevant suggested questions based on user level
  const getRelevantQuestions = () => {
    const level = user?.studentLevel || 'primary';
    // @ts-ignore - We know these keys exist
    return suggestedQuestions[level] || suggestedQuestions.primary;
  };

  // Recent learning topics - in a real app, these would be fetched from API
  const { data: recentTopics } = useQuery({
    queryKey: ["/api/student/recent-topics"],
    // If the API endpoint doesn't exist yet, use placeholders
    queryFn: async () => {
      return [
        { id: 1, title: "Mathematics", subtopic: "Algebra", lastAccessed: new Date() },
        { id: 2, title: "Science", subtopic: "Biology", lastAccessed: new Date(Date.now() - 86400000) },
        { id: 3, title: "History", subtopic: "World War II", lastAccessed: new Date(Date.now() - 172800000) },
      ];
    }
  });

  // Check if Gemini is configured on component mount
  useEffect(() => {
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
    
    // Add welcome message on first load
    setHistory([
      {
        role: 'assistant',
        content: `Hello ${user?.firstName || 'there'}! I'm your AI tutor. How can I help you with your studies today?`,
        timestamp: new Date(),
      }
    ]);
  }, [toast, user]);

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
    
    // Add user message to history
    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    
    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Call Gemini AI with the user's question and education level
      const response = await askGemini(question, user?.studentLevel || 'primary');
      
      // Add AI response to history
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setHistory(prev => [...prev, assistantMessage]);
      setQuestion("");
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

  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const clearChat = () => {
    // Keep only the welcome message
    setHistory([
      {
        role: 'assistant',
        content: `Hello ${user?.firstName || 'there'}! I'm your AI tutor. How can I help you with your studies today?`,
        timestamp: new Date(),
      }
    ]);
  };

  const saveChat = () => {
    // In a real app, this would save to the database
    toast({
      title: "Chat Saved",
      description: "Your conversation has been saved for future reference.",
    });
  };

  const downloadChat = () => {
    const chatContent = history.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI Tutor'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="AI Tutor">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Tutor</h1>
          <p className="text-muted-foreground mt-1">
            Get personalized assistance with your studies
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main chat section */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-2">
                    <AvatarImage src="/assets/ai-tutor-avatar.png" />
                    <AvatarFallback>
                      <Brain className="text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>EdMerge AI Tutor</CardTitle>
                    <CardDescription>Powered by Google Gemini</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
                  {history.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div 
                          className={`text-xs mt-2 ${
                            message.role === 'user' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-4 bg-muted flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <div className="flex w-full items-center space-x-2">
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask any question..."
                    className="flex-1 resize-none"
                    disabled={isLoading || !isGeminiReady}
                  />
                  <Button 
                    onClick={handleSendQuestion} 
                    disabled={isLoading || !question.trim() || !isGeminiReady}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex justify-between mt-4 w-full">
                  <Button variant="outline" size="sm" onClick={clearChat}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Chat
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={saveChat}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadChat}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Sidebar with suggested questions and history */}
          <div className="space-y-6">
            <Tabs defaultValue="suggestions">
              <TabsList className="w-full">
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="topics">Recent Topics</TabsTrigger>
                <TabsTrigger value="sessions" onClick={() => setActiveSession("general")}>Sessions</TabsTrigger>
              </TabsList>
              
              {/* Suggested Questions Tab */}
              <TabsContent value="suggestions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggested Questions</CardTitle>
                    <CardDescription>
                      Click on any question to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getRelevantQuestions().map((q, i) => (
                        <Button 
                          key={i} 
                          variant="outline" 
                          className="w-full justify-start h-auto py-2 px-3 text-left"
                          onClick={() => handleSuggestedQuestion(q)}
                        >
                          <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="line-clamp-2">{q}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Recent Topics Tab */}
              <TabsContent value="topics">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Learning Topics</CardTitle>
                    <CardDescription>
                      Your recently studied subjects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recentTopics?.map((topic) => (
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
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Learning Sessions Tab */}
              <TabsContent value="sessions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Sessions</CardTitle>
                    <CardDescription>
                      AI-powered learning paths
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Tabs value={activeSession} onValueChange={setActiveSession}>
                      <TabsList className="w-full">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="math">Math</TabsTrigger>
                        <TabsTrigger value="science">Science</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="general" className="mt-4 space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => handleSuggestedQuestion("How can you help me improve my study skills?")}
                        >
                          <div>
                            <div className="font-medium">Study Skills Improvement</div>
                            <div className="text-xs text-muted-foreground">Learn effective study techniques</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => handleSuggestedQuestion("Can you explain the learning process and how to make it more effective?")}
                        >
                          <div>
                            <div className="font-medium">Learning Psychology</div>
                            <div className="text-xs text-muted-foreground">Understand how we learn</div>
                          </div>
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="math" className="mt-4 space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => handleSuggestedQuestion("Create a step-by-step lesson on algebra fundamentals")}
                        >
                          <div>
                            <div className="font-medium">Algebra Fundamentals</div>
                            <div className="text-xs text-muted-foreground">Learn basic algebraic concepts</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => handleSuggestedQuestion("Help me understand geometry and trigonometry concepts")}
                        >
                          <div>
                            <div className="font-medium">Geometry & Trigonometry</div>
                            <div className="text-xs text-muted-foreground">Master spatial mathematics</div>
                          </div>
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="science" className="mt-4 space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => handleSuggestedQuestion("Explain the scientific method and how to apply it")}
                        >
                          <div>
                            <div className="font-medium">Scientific Method</div>
                            <div className="text-xs text-muted-foreground">Learn the foundation of all sciences</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => handleSuggestedQuestion("Can you teach me about biology basics: cells, genetics and evolution?")}
                        >
                          <div>
                            <div className="font-medium">Biology Fundamentals</div>
                            <div className="text-xs text-muted-foreground">Understanding life sciences</div>
                          </div>
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* AI Tutor Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">AI Tutor Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${isGeminiReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{isGeminiReady ? 'Active & Ready' : 'Offline'}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isGeminiReady 
                    ? 'Your AI tutor is ready to help with your questions!'
                    : 'AI tutor service is currently unavailable. Please try again later or contact support.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}