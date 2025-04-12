import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { askGemini, isGeminiConfigured } from "@/lib/gemini";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BrainCircuit, 
  Send, 
  ChevronDown, 
  RefreshCw, 
  Info, 
  Star, 
  Lightbulb,
  Sparkles,
  CornerDownLeft,
  Mic,
  CircleCheck,
  CircleAlert,
  BookOpen,
  PenLine
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

interface AITutorChatProps {
  courseId?: number;
  level?: "primary" | "secondary" | "tertiary" | "individual";
  subject?: string;
  suggestedQuestions?: string[];
}

export function AITutorChat({ 
  courseId, 
  level = "secondary", 
  subject = "General",
  suggestedQuestions = [
    "Explain the concept of photosynthesis in simple terms",
    "What is the difference between mitosis and meiosis?",
    "How do I solve quadratic equations?",
    "Explain Newton's laws of motion"
  ]
}: AITutorChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>(level);
  
  // Check if the AI API is configured
  useEffect(() => {
    const checkConfig = async () => {
      const configured = await isGeminiConfigured();
      setIsConfigured(configured);
      
      // If configured, add initial welcome message
      if (configured && conversation.length === 0) {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Hello${user ? `, ${user.firstName}` : ""}! I'm your AI tutor for ${subject}. How can I help you today?`,
          timestamp: new Date(),
        };
        setConversation([welcomeMessage]);
      }
    };
    
    checkConfig();
  }, [user]);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);
  
  // Focus input field when AI responds
  useEffect(() => {
    if (conversation.length > 0 && conversation[conversation.length - 1].role === "assistant" && !isLoading) {
      inputRef.current?.focus();
    }
  }, [conversation, isLoading]);
  
  // Send a message to the AI
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!isConfigured) {
      toast({
        title: "AI not configured",
        description: "The AI tutor is not properly configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setConversation([...conversation, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Create temporary AI message with loading state
      const tempId = Date.now().toString();
      const tempMessage: Message = {
        id: tempId,
        role: "assistant",
        content: "...",
        timestamp: new Date(),
        status: "sending",
      };
      
      setConversation(prev => [...prev, tempMessage]);
      
      // Get response from AI
      const response = await askGemini(input, selectedLevel);
      
      // Replace temporary message with actual response
      setConversation(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? {
                id: tempId,
                role: "assistant",
                content: response,
                timestamp: new Date(),
                status: "sent"
              }
            : msg
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      // Update the temporary message with error state
      setConversation(prev => 
        prev.filter(msg => msg.status !== "sending")
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input submission via Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Handle selecting a suggested question
  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };
  
  // Format the conversation with markdown
  const formatMessage = (content: string) => {
    // For a proper implementation, you would use a markdown parser here
    return content;
  };
  
  // Check if the AI service is configured
  if (isConfigured === null) {
    return (
      <Card className="min-h-[600px]">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>AI Tutor</CardTitle>
              <CardDescription>Loading AI services...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[500px] flex flex-col justify-center items-center">
          <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-4 text-muted-foreground">Initializing AI tutor...</p>
        </CardContent>
      </Card>
    );
  }
  
  // If the AI service is not configured
  if (isConfigured === false) {
    return (
      <Card className="min-h-[600px]">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CircleAlert className="h-6 w-6 text-destructive" />
            <div>
              <CardTitle>AI Tutor Unavailable</CardTitle>
              <CardDescription>The AI tutor service is not configured</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[500px] flex flex-col justify-center items-center text-center">
          <CircleAlert className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-medium mb-2">AI Tutor Not Available</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            The AI tutoring service is currently not configured. Please contact
            the administrator to enable this feature.
          </p>
          <Button variant="outline">Contact Support</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="min-h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/ai-tutor-avatar.png" alt="AI Tutor" />
              <AvatarFallback className="bg-primary/10">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">AI Tutor</CardTitle>
              <CardDescription>Personalized learning assistant</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Learning Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary School</SelectItem>
                <SelectItem value="secondary">Secondary School</SelectItem>
                <SelectItem value="tertiary">Tertiary/University</SelectItem>
                <SelectItem value="individual">Individual/Professional</SelectItem>
              </SelectContent>
            </Select>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Tutor adapts to your learning level</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-4">
          {conversation.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <BrainCircuit className="h-16 w-16 text-primary/20 mb-4" />
              <h3 className="text-xl font-medium mb-2">AI Tutor Ready</h3>
              <p className="text-center text-muted-foreground mb-6">
                Ask any question about your studies and get personalized help
              </p>
              
              <div className="w-full max-w-md space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Try asking:
                </p>
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-6">
              {conversation.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src="/ai-tutor-avatar.png" alt="AI Tutor" />
                      <AvatarFallback className="bg-primary/10">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.status === "sending" ? (
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                        <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                        <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {formatMessage(message.content)}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 ml-2 mt-1">
                      <AvatarImage src={user?.profileImage || ""} />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {conversation.length > 0 && (
        <div className="px-4 pt-2">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="suggestions">
              <AccordionTrigger className="py-1 text-sm text-muted-foreground">
                Suggested questions
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="justify-start h-auto py-1.5 px-2"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <Lightbulb className="h-3 w-3 mr-2 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      
      <CardFooter className="p-4 border-t mt-auto">
        <div className="flex items-end w-full gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={inputRef}
              placeholder="Ask the AI tutor a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] resize-none pr-10 py-3"
              disabled={isLoading}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 bottom-2 h-6 w-6 p-0"
              onClick={() => {
                // Speech recognition could be implemented here
                toast({
                  title: "Voice input",
                  description: "Voice input feature coming soon",
                });
              }}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="h-[60px] px-4"
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}