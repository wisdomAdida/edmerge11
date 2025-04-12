import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Download, MessageSquare, UserRound, Users, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ResearchAgentSectionProps {
  suggestedQueries?: string[];
  onViewAllClick?: () => void;
  studentLevel?: string;
  isCompact?: boolean;
}

type ResearchProject = {
  id: number;
  title: string;
  description: string;
  category: string;
  researcher: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  } | null;
};

type ResearchDocument = {
  id: number;
  title: string;
  documentUrl: string;
  createdAt: string;
};

type Message = {
  role: 'user' | 'researcher' | 'system';
  content: string;
  timestamp: Date;
  documentIds?: number[];
};

export const ResearchAgentSection = ({
  suggestedQueries = [],
  onViewAllClick,
  studentLevel = "secondary",
  isCompact = false
}: ResearchAgentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [selectedResearcher, setSelectedResearcher] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<string>('researchers');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch available researchers
  const { 
    data: researchers = [], 
    isLoading: isLoadingResearchers 
  } = useQuery({
    queryKey: ["/api/research-agent/researchers"],
    enabled: activeTab === 'researchers' || !isCompact
  });

  // Fetch available research projects
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects 
  } = useQuery({
    queryKey: ["/api/research-agent/projects"],
    enabled: activeTab === 'projects' || !isCompact
  });

  // Fetch project details with documents when a project is selected
  const { 
    data: projectDetails, 
    isLoading: isLoadingProjectDetails 
  } = useQuery({
    queryKey: ["/api/research-agent/projects", selectedProject],
    enabled: !!selectedProject
  });

  // Fetch conversation history when a researcher is selected
  const { 
    data: conversationHistory = [], 
    isLoading: isLoadingConversation,
    refetch: refetchConversation
  } = useQuery({
    queryKey: ["/api/research-agent/conversation", selectedResearcher, selectedProject],
    enabled: !!selectedResearcher,
  });

  // Effect to convert conversation history to messages
  useEffect(() => {
    if (conversationHistory && conversationHistory.length > 0) {
      const convertedMessages = conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        fileUrl: msg.fileUrl
      }));
      setMessages(convertedMessages);
    }
  }, [conversationHistory]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message to the researcher
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { researcherId: number; projectId?: number; message: string }) => {
      const response = await apiRequest("POST", "/api/research-agent/message", data);
      return await response.json();
    },
    onSuccess: () => {
      // Add the message to the UI immediately
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Clear the input field
      setMessage("");
      
      // Add a temporary "typing" message
      setTimeout(() => {
        const systemResponse: Message = {
          role: 'researcher',
          content: "I've received your message and will respond shortly. Please check back later for my response.",
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, systemResponse]);
      }, 1000);

      // Refresh the conversation after sending a message
      setTimeout(() => {
        refetchConversation();
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle selecting a researcher
  const handleSelectResearcher = (researcherId: number) => {
    setSelectedResearcher(researcherId);
    setSelectedProject(null);
    setActiveTab('chat');
  };

  // Handle selecting a project
  const handleSelectProject = (projectId: number) => {
    setSelectedProject(projectId);
    // Find the researcher of this project
    const project = projects.find((p: any) => p.id === projectId);
    if (project) {
      setSelectedResearcher(project.researcherId);
    }
    setActiveTab('chat');
  };

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedResearcher) return;

    sendMessageMutation.mutate({
      researcherId: selectedResearcher,
      projectId: selectedProject || undefined,
      message: message.trim()
    });
  };

  // Handle suggested query click
  const handleSuggestedQueryClick = (query: string) => {
    setMessage(query);
    // If no researcher is selected, select the first one
    if (!selectedResearcher && researchers.length > 0) {
      setSelectedResearcher(researchers[0].id);
      setActiveTab('chat');
    }
  };

  // Download a document
  const downloadDocument = (document: ResearchDocument) => {
    if (document.documentUrl) {
      window.open(document.documentUrl, '_blank');
    } else {
      toast({
        title: "Document unavailable",
        description: "This document is not available for download",
        variant: "destructive"
      });
    }
  };

  // Handle going back to the list
  const handleBackToList = () => {
    setSelectedResearcher(null);
    setSelectedProject(null);
    setMessages([]);
    setActiveTab('researchers');
  };

  // Format a date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render loading state
  if ((isLoadingResearchers || isLoadingProjects) && !isCompact) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm border">
      {/* Card header - changes based on state */}
      <CardHeader className="pb-4">
        {selectedResearcher && !isCompact ? (
          <div className="flex items-start justify-between">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList}
                className="mb-2 -ml-2 text-muted-foreground"
              >
                ← Back to list
              </Button>
              <CardTitle>
                {selectedProject ? 
                  (projectDetails?.project?.title || "Research Project") : 
                  "Chat with Researcher"
                }
              </CardTitle>
              <CardDescription>
                {selectedProject ? 
                  (projectDetails?.project?.description?.substring(0, 100) + "...") : 
                  "Get assistance with your academic research"
                }
              </CardDescription>
            </div>
            
            {selectedProject && projectDetails?.researcher && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={projectDetails.researcher.profileImage || ''} alt={`${projectDetails.researcher.firstName} ${projectDetails.researcher.lastName}`} />
                <AvatarFallback>
                  {projectDetails.researcher.firstName?.[0]}{projectDetails.researcher.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ) : (
          <>
            <CardTitle className="text-xl">Research Assistance</CardTitle>
            <CardDescription>
              Connect with researchers and access research materials
            </CardDescription>
          </>
        )}
      </CardHeader>

      {/* Card content */}
      <CardContent>
        {/* Compact view for dashboard */}
        {isCompact ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {suggestedQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => handleSuggestedQueryClick(query)}
                >
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{query}</span>
                </Button>
              ))}
            </div>
            <div>
              <form 
                className="flex gap-2" 
                onSubmit={handleSendMessage}
              >
                <Input
                  placeholder="Ask a research question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Send className="h-4 w-4" />
                  }
                </Button>
              </form>
            </div>
          </div>
        ) : (
          /* Full view with tabs */
          <div>
            {!selectedResearcher ? (
              <Tabs defaultValue="researchers" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="researchers">
                    <UserRound className="h-4 w-4 mr-2" />
                    Researchers
                  </TabsTrigger>
                  <TabsTrigger value="projects">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Projects
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="researchers" className="mt-4 space-y-4">
                  {researchers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No researchers available at the moment
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {researchers.map((researcher: any) => (
                        <div 
                          key={researcher.id} 
                          className="flex items-start space-x-4 p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleSelectResearcher(researcher.id)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={researcher.profileImage || ''} alt={`${researcher.firstName} ${researcher.lastName}`} />
                            <AvatarFallback>
                              {researcher.firstName?.[0]}{researcher.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{researcher.firstName} {researcher.lastName}</h4>
                              <Badge variant="outline">{researcher.specialization || 'Researcher'}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {researcher.bio || 'Research specialist available to help with your academic inquiries.'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Users className="h-3 w-3" />
                              <span>{researcher.projectCount || 0} Projects</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="projects" className="mt-4 space-y-4">
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No research projects available at the moment
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {projects.map((project: ResearchProject) => (
                        <div 
                          key={project.id} 
                          className="p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleSelectProject(project.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{project.title}</h4>
                            <Badge>{project.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          {project.researcher && (
                            <div className="flex items-center gap-2 text-xs">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={project.researcher.profileImage || ''} alt={`${project.researcher.firstName} ${project.researcher.lastName}`} />
                                <AvatarFallback>
                                  {project.researcher.firstName?.[0]}{project.researcher.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-muted-foreground">
                                By {project.researcher.firstName} {project.researcher.lastName}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              /* Chat interface */
              <div className="space-y-4">
                {selectedProject && projectDetails?.documents && projectDetails.documents.length > 0 && (
                  <div className="border rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">Research Documents</h4>
                    <div className="space-y-2">
                      {projectDetails.documents.map((doc: ResearchDocument) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <span className="truncate flex-1">{doc.title}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => downloadDocument(doc)}
                            className="ml-2"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <ScrollArea className="h-[300px] p-4 pt-2">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          Start a conversation with{" "}
                          {projectDetails?.researcher 
                            ? `${projectDetails.researcher.firstName} ${projectDetails.researcher.lastName}` 
                            : "the researcher"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.role === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="text-sm mb-1">{msg.content}</div>
                              <div className="text-xs opacity-70 text-right">
                                {formatDate(msg.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="p-3 border-t">
                    <form
                      className="flex gap-2"
                      onSubmit={handleSendMessage}
                    >
                      <Textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[60px] flex-1 resize-none"
                      />
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="self-end"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Card footer with action button */}
      {(isCompact || (!selectedResearcher && !isCompact)) && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onViewAllClick}
          >
            View All Research Resources
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};