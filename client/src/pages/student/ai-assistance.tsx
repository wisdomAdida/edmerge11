import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BrainCircuit, 
  Loader2, 
  Lightbulb, 
  Send, 
  History, 
  Star, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Pencil, 
  Calculator,
  Code,
  Rocket,
  MessageSquare,
  PlusCircle,
  Save,
  Trash2,
  GraduationCap,
  BookmarkPlus
} from "lucide-react";

// Types for AI Interactions
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

export default function AiAssistancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock capabilities for different AI modes
  const aiCapabilities = {
    general: {
      title: "General Assistant",
      description: "Your all-purpose learning assistant",
      examples: [
        "Explain the concept of photosynthesis",
        "Help me understand Newton's laws of motion",
        "What are the key events of World War II?",
        "Explain how the digestive system works"
      ]
    },
    math: {
      title: "Math Solver",
      description: "Get step-by-step solutions to math problems",
      examples: [
        "Solve 3x + 5 = 20",
        "Find the derivative of f(x) = x² + 3x - 2",
        "Calculate the area of a circle with radius 7",
        "What is the formula for the volume of a cylinder?"
      ]
    },
    writing: {
      title: "Writing Assistant",
      description: "Improve your essays and writing",
      examples: [
        "Help me outline an essay about climate change",
        "Review this paragraph for grammar issues: 'The cat sat on the mat. He was happy.'",
        "Help me brainstorm ideas for a creative story",
        "Suggest a conclusion for my research paper on renewable energy"
      ]
    },
    code: {
      title: "Code Tutor",
      description: "Learn programming with guided examples",
      examples: [
        "Explain how to create a simple HTML webpage",
        "Help me understand for loops in Python",
        "What's the difference between let and const in JavaScript?",
        "How do I create a function that calculates the factorial of a number?"
      ]
    }
  };
  
  // Simulated chat history
  useEffect(() => {
    // Simulate loading chat history from API
    const mockConversations: Conversation[] = [
      {
        id: "conv1",
        title: "Learning about Photosynthesis",
        messages: [
          {
            id: "msg1",
            role: "user",
            content: "Can you explain photosynthesis to me?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
          },
          {
            id: "msg2",
            role: "assistant",
            content: 
              "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy, usually from the sun, into chemical energy in the form of glucose or other sugars. This happens primarily in plant leaves, specifically in chloroplasts containing the green pigment chlorophyll.\n\n" +
              "The basic equation for photosynthesis is:\n" +
              "6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ (Glucose) + 6O₂\n\n" +
              "In simpler terms, plants take in carbon dioxide and water, use sunlight as energy, and produce glucose (sugar) and oxygen. The glucose is used by the plant for energy and growth, while the oxygen is released into the atmosphere.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 2) // 1 day ago + 2 minutes
          }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 2)
      },
      {
        id: "conv2",
        title: "Help with Algebra",
        messages: [
          {
            id: "msg3",
            role: "user",
            content: "I need help solving this equation: 2x + 5 = 13",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
          },
          {
            id: "msg4",
            role: "assistant",
            content: 
              "I'd be happy to help you solve this equation: 2x + 5 = 13\n\n" +
              "Step 1: Subtract 5 from both sides to isolate the term with x.\n" +
              "2x + 5 - 5 = 13 - 5\n" +
              "2x = 8\n\n" +
              "Step 2: Divide both sides by 2 to solve for x.\n" +
              "2x ÷ 2 = 8 ÷ 2\n" +
              "x = 4\n\n" +
              "Step 3: Check your answer by substituting x = 4 back into the original equation.\n" +
              "2(4) + 5 = 13\n" +
              "8 + 5 = 13\n" +
              "13 = 13 ✓\n\n" +
              "Therefore, x = 4 is the solution to the equation 2x + 5 = 13.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60) // 2 hours ago + 1 minute
          }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60)
      }
    ];
    
    setConversations(mockConversations);
  }, []);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);
  
  // Format the timestamp
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Create a new conversation
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: `New Conversation`,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation);
  };
  
  // Select an existing conversation
  const selectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };
  
  // Handle sending a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date()
      };
      
      // This would be a real API call in production
      // Just simulating response for demonstration
      
      // Generate a response based on active tab
      let responseContent = "";
      switch (activeTab) {
        case "math":
          responseContent = "I can help you solve this math problem step by step. [Simulated math solution would appear here]";
          break;
        case "writing":
          responseContent = "Here's my feedback on your writing: [Simulated writing feedback would appear here]";
          break;
        case "code":
          responseContent = "Here's how you would approach this coding problem: [Simulated code explanation would appear here]";
          break;
        default:
          responseContent = "I understand your question. Let me provide a detailed explanation: [Simulated educational response would appear here]";
      }
      
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      return { userMessage, assistantMessage };
    },
    onSuccess: (data) => {
      const { userMessage, assistantMessage } = data;
      
      // If no active conversation, create one
      if (!activeConversation) {
        const newConversation: Conversation = {
          id: `conv-${Date.now()}`,
          title: prompt.length > 20 ? `${prompt.substring(0, 20)}...` : prompt,
          messages: [userMessage, assistantMessage],
          createdAt: new Date(),
          lastUpdated: new Date()
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation);
      } else {
        // Update existing conversation
        const updatedConversation = {
          ...activeConversation,
          messages: [...activeConversation.messages, userMessage, assistantMessage],
          lastUpdated: new Date()
        };
        
        // Update in conversations array
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeConversation.id ? updatedConversation : conv
          )
        );
        
        setActiveConversation(updatedConversation);
      }
      
      // Clear prompt
      setPrompt("");
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });
  
  // Handle prompt submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    sendMessageMutation.mutate(prompt.trim());
  };
  
  // Delete a conversation
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    if (activeConversation?.id === id) {
      setActiveConversation(null);
    }
    
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed from your history.",
    });
  };
  
  return (
    <DashboardLayout title="AI Learning Assistant">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with conversation history */}
        <Card className="md:col-span-1 flex flex-col h-[700px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <History className="h-5 w-5 mr-2" />
              Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 flex-1 overflow-hidden">
            <Button 
              variant="outline" 
              className="w-full mb-4 text-primary flex items-center" 
              onClick={createNewConversation}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
            
            <ScrollArea className="h-[550px] pr-4">
              <div className="space-y-2">
                {conversations.length > 0 ? (
                  conversations.map(conversation => (
                    <div 
                      key={conversation.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors flex justify-between group ${
                        activeConversation?.id === conversation.id 
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="overflow-hidden">
                        <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conversation.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No conversations yet</p>
                    <p className="text-sm mt-1">Ask a question to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Main chat area */}
        <Card className="md:col-span-3 flex flex-col h-[700px]">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
                {aiCapabilities[activeTab as keyof typeof aiCapabilities]?.title || "AI Learning Assistant"}
              </CardTitle>
              
              <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                  <TabsTrigger value="math" className="text-xs">Math</TabsTrigger>
                  <TabsTrigger value="writing" className="text-xs">Writing</TabsTrigger>
                  <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              {aiCapabilities[activeTab as keyof typeof aiCapabilities]?.description || "Your personalized learning assistant"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 flex-1 overflow-hidden flex flex-col">
            {!activeConversation ? (
              // Welcome screen when no conversation is active
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <BrainCircuit className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Welcome to Your AI Learning Assistant</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Ask questions, get homework help, practice concepts, or explore new subjects.
                </p>
                
                <div className="w-full max-w-md">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                    Try asking about:
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {aiCapabilities[activeTab as keyof typeof aiCapabilities]?.examples.map((example, i) => (
                      <div 
                        key={i}
                        className="p-3 bg-card border rounded-md text-sm text-left cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => {
                          setPrompt(example);
                          // Focus the input
                          document.getElementById('prompt-input')?.focus();
                        }}
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Message thread when a conversation is active
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {activeConversation.messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center mb-2">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src="/ai-avatar.png" />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <div className="text-xs font-medium">EdMerge AI</div>
                          </div>
                        )}
                        
                        <div className="whitespace-pre-line">{message.content}</div>
                        
                        <div className={`text-xs mt-1 text-right ${
                          message.role === 'user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </CardContent>
          
          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSubmit} className="w-full flex space-x-2">
              <Input
                id="prompt-input"
                placeholder="Ask anything about your studies..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !prompt.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
      
      {/* Additional resources and tools */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Star className="h-4 w-4 mr-2 text-amber-500" />
              Top Subject Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="cursor-pointer">
                Mathematics
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Physics
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Chemistry
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Biology
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                History
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Literature
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Computer Science
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
              Learning Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start h-10">
                <Calculator className="h-4 w-4 mr-2" />
                <span className="text-xs">Calculator</span>
              </Button>
              <Button variant="outline" className="justify-start h-10">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-xs">Flashcards</span>
              </Button>
              <Button variant="outline" className="justify-start h-10">
                <Pencil className="h-4 w-4 mr-2" />
                <span className="text-xs">Note Taker</span>
              </Button>
              <Button variant="outline" className="justify-start h-10">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                <span className="text-xs">Bookmarks</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Rocket className="h-4 w-4 mr-2 text-purple-500" />
              Learning Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Questions Asked</span>
              <span className="font-medium">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Concepts Mastered</span>
              <span className="font-medium">7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Practice Sessions</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Active Learning Days</span>
              <span className="font-medium">15</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}