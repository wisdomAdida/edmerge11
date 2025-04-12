import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Send, BrainCircuit, ArrowRight, Sparkles, Info } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";

// Import the AI APIs (this would be a real API in production)
import { askGemini, isGeminiConfigured } from "@/lib/gemini"; // Simulated API

const messageSchema = z.object({
  content: z.string().min(1, "Please enter a message"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  {
    subject: "Mathematics",
    prompts: [
      "Explain how to solve quadratic equations",
      "Help me understand calculus derivatives",
      "What is the Pythagorean theorem?",
      "Explain probability concepts"
    ]
  },
  {
    subject: "Science",
    prompts: [
      "How does photosynthesis work?",
      "Explain Newton's laws of motion",
      "What is the difference between atoms and molecules?",
      "How does the immune system protect the body?"
    ]
  },
  {
    subject: "Languages",
    prompts: [
      "Help me with essay writing structure",
      "What are the basic grammar rules?",
      "How to improve my vocabulary?",
      "Explain the difference between active and passive voice"
    ]
  },
  {
    subject: "History",
    prompts: [
      "Explain the causes of World War II",
      "Who were the key figures in the civil rights movement?",
      "How did ancient civilizations develop?",
      "What led to the fall of the Roman Empire?"
    ]
  }
];

export default function AITutorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello ${user?.firstName || "there"}! I'm your AI tutor. How can I help you with your studies today? Feel free to ask me any question about your schoolwork.`,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTopic, setActiveTopic] = useState("Mathematics");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  // Check if Gemini API is configured
  const { data: geminiConfigured, isLoading: checkingGemini } = useQuery({
    queryKey: ["/api/gemini/check-config"],
    queryFn: () => isGeminiConfigured(),
    staleTime: Infinity
  });

  // Fetch user's learning history to personalize suggestions
  const { data: learningHistory } = useQuery({
    queryKey: ["/api/student/learning-history"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    placeholderData: { recentTopics: [] }
  });

  const personalizedSuggestions = learningHistory?.recentTopics || [];

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to request Gemini API key
  const requestGeminiApiKey = () => {
    // Redirect the user to admin settings to configure API key
    window.location.href = "/admin/settings";
    
    // Notify the user
    toast({
      title: "Setup Required",
      description: "You'll be redirected to configure the Gemini API key. This is required for AI Tutor functionality.",
      duration: 5000,
    });
  };

  const handleSendMessage = async (data: MessageFormValues) => {
    // If Gemini is not configured, show a toast notification with instructions
    if (geminiConfigured === false) {
      toast({
        title: "Gemini API Key Required",
        description: "To use the AI Tutor feature, you need to provide a Gemini API key. Click 'Configure' to set it up.",
        action: (
          <Button variant="default" size="sm" onClick={requestGeminiApiKey}>
            Configure
          </Button>
        ),
        duration: 10000,
      });
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: data.content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    setIsTyping(true);

    try {
      // Use the imported askGemini function directly
      const response = await askGemini(data.content, user?.studentLevel || "tertiary");
      
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500); // Simulated delay for realism
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    form.setValue("content", prompt);
    handleSendMessage({ content: prompt });
  };

  return (
    <DashboardLayout title="AI Tutor">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-16rem)]">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src="/ai-tutor.png" />
                  <AvatarFallback className="bg-primary/20">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>EdMerge AI Tutor</CardTitle>
                  <CardDescription>
                    Powered by Gemini AI
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-muted/10">
              <div className="h-[calc(100vh-22rem)] overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-3">
              <form
                onSubmit={form.handleSubmit(handleSendMessage)}
                className="flex w-full items-center space-x-2"
              >
                <Input
                  id="message"
                  placeholder="Ask me anything about your studies..."
                  className="flex-1"
                  {...form.register("content")}
                  disabled={isTyping}
                />
                <Button type="submit" size="icon" disabled={isTyping}>
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                Suggested Questions
              </CardTitle>
              <CardDescription>
                Click on any question to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <Tabs defaultValue={activeTopic} onValueChange={setActiveTopic}>
                <TabsList className="w-full">
                  {SUGGESTED_PROMPTS.map((subject) => (
                    <TabsTrigger key={subject.subject} value={subject.subject} className="flex-1">
                      {subject.subject}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {SUGGESTED_PROMPTS.map((subject) => (
                  <TabsContent key={subject.subject} value={subject.subject} className="mt-4 space-y-3">
                    {subject.prompts.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-2 font-normal"
                        onClick={() => handleSuggestedPrompt(prompt)}
                        disabled={isTyping}
                      >
                        <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{prompt}</span>
                      </Button>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {personalizedSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Based on your learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {personalizedSuggestions.map((topic: string, i: number) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2 font-normal"
                    onClick={() => handleSuggestedPrompt(`Help me understand ${topic}`)}
                    disabled={isTyping}
                  >
                    <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Help me understand {topic}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle>About EdMerge AI Tutor</AlertTitle>
            <AlertDescription className="text-sm mt-2 text-muted-foreground">
              Our AI tutor uses Gemini AI to provide personalized learning assistance. It can help with homework, explain
              concepts, and answer questions across various subjects tailored to your education level.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </DashboardLayout>
  );
}