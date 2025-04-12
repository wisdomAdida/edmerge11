import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Edit,
  MessageSquare,
  MoreVertical,
  PenTool,
  Plus,
  RefreshCw,
  SendHorizontal,
  Share2,
  Trash2,
  Users,
  Video,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface Message {
  id: number;
  content: string;
  createdAt: Date;
  sender: User;
  groupId: number;
}

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  courseId: number;
  createdBy: User;
  createdAt: Date;
  meetingLink?: string;
  nextMeetingDate?: Date;
  members: User[];
  tags: string[];
  isPublic: boolean;
}

interface VirtualStudyGroupProps {
  courseId: number;
}

export function VirtualStudyGroup({ courseId }: VirtualStudyGroupProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: "",
    description: "",
    isPublic: true,
    tags: "",
  });

  // Fetch study groups for this course
  const { data: studyGroups, isLoading: loadingGroups } = useQuery<StudyGroup[]>({
    queryKey: ["/api/courses", courseId, "study-groups"],
    enabled: !!courseId,
  });

  // Fetch messages for selected group
  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/study-groups", selectedGroupId, "messages"],
    enabled: !!selectedGroupId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Create study group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: Partial<StudyGroup>) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/study-groups`, groupData);
      return res.json();
    },
    onSuccess: (newGroup: StudyGroup) => {
      toast({
        title: "Group created",
        description: "Your study group has been created successfully",
      });
      setCreateDialogOpen(false);
      setNewGroupData({
        name: "",
        description: "",
        isPublic: true,
        tags: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "study-groups"] });
      // Auto-select the new group
      setSelectedGroupId(newGroup.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join study group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const res = await apiRequest("POST", `/api/study-groups/${groupId}/join`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Joined group",
        description: "You have joined the study group",
      });
      setJoinDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "study-groups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Leave study group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const res = await apiRequest("POST", `/api/study-groups/${groupId}/leave`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Left group",
        description: "You have left the study group",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "study-groups"] });
      if (selectedGroupId === leaveGroupMutation.variables) {
        setSelectedGroupId(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to leave group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ groupId, content }: { groupId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/study-groups/${groupId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups", selectedGroupId, "messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const res = await apiRequest("DELETE", `/api/study-groups/${groupId}`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Group deleted",
        description: "The study group has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "study-groups"] });
      if (selectedGroupId === deleteGroupMutation.variables) {
        setSelectedGroupId(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update group settings mutation
  const updateGroupMutation = useMutation({
    mutationFn: async ({ groupId, data }: { groupId: number; data: Partial<StudyGroup> }) => {
      const res = await apiRequest("PATCH", `/api/study-groups/${groupId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Group updated",
        description: "Study group settings have been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "study-groups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Schedule meeting mutation
  const scheduleMeetingMutation = useMutation({
    mutationFn: async ({ 
      groupId, 
      meetingDate, 
      meetingLink 
    }: { 
      groupId: number; 
      meetingDate: string;
      meetingLink: string;
    }) => {
      const res = await apiRequest("POST", `/api/study-groups/${groupId}/schedule-meeting`, {
        meetingDate,
        meetingLink
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Meeting scheduled",
        description: "The study group meeting has been scheduled",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "study-groups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule meeting",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!selectedGroupId) return;
    if (!newMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      groupId: selectedGroupId,
      content: newMessage,
    });
  };

  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString() + " at " + 
           new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Create mock study groups
  const mockStudyGroups: StudyGroup[] = [
    {
      id: 1,
      name: "Advanced Mathematics Study Group",
      description: "Weekly sessions for discussing advanced math problems and solutions",
      courseId: courseId,
      createdBy: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        avatar: "",
        role: "student"
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      meetingLink: "https://meet.google.com/abc-defg-hij",
      nextMeetingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      members: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          avatar: "",
          role: "student"
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          avatar: "",
          role: "student"
        },
        {
          id: 3,
          name: "Alex Johnson",
          email: "alex@example.com",
          avatar: "",
          role: "student"
        }
      ],
      tags: ["calculus", "linear algebra", "probability"],
      isPublic: true
    },
    {
      id: 2,
      name: "Programming Practice Group",
      description: "Practice coding problems together and review each other's solutions",
      courseId: courseId,
      createdBy: {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "",
        role: "student"
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      members: [
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          avatar: "",
          role: "student"
        },
        {
          id: 4,
          name: "Mike Wilson",
          email: "mike@example.com",
          avatar: "",
          role: "student"
        }
      ],
      tags: ["algorithms", "data structures", "problem solving"],
      isPublic: false
    }
  ];

  // Create mock messages
  const mockMessages: Message[] = [
    {
      id: 1,
      content: "Hello everyone! Looking forward to our next session.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      sender: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        avatar: "",
        role: "student"
      },
      groupId: 1
    },
    {
      id: 2,
      content: "Has anyone started working on the calculus assignment?",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      sender: {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "",
        role: "student"
      },
      groupId: 1
    },
    {
      id: 3,
      content: "Yes, I've completed the first 3 problems. Happy to discuss them in our next meeting.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      sender: {
        id: 3,
        name: "Alex Johnson",
        email: "alex@example.com",
        avatar: "",
        role: "student"
      },
      groupId: 1
    }
  ];

  // Display groups from API or mock data
  const displayGroups = studyGroups || mockStudyGroups;
  
  // Display messages from API or mock data for the selected group
  const displayMessages = messages || (selectedGroupId === 1 ? mockMessages : []);

  // Find the selected group
  const selectedGroup = displayGroups.find(group => group.id === selectedGroupId);

  // Check if user is a member of the selected group
  const isGroupMember = selectedGroup?.members.some(member => member.id === user?.id);

  // Check if user is the creator of the selected group
  const isGroupCreator = selectedGroup?.createdBy.id === user?.id;

  // Handle creating a new group
  const handleCreateGroup = () => {
    if (!newGroupData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your study group",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate({
      name: newGroupData.name,
      description: newGroupData.description,
      isPublic: newGroupData.isPublic,
      tags: newGroupData.tags.split(",").map(tag => tag.trim()),
      courseId,
    });
  };

  // Auto-select the first group if none is selected
  useEffect(() => {
    if (displayGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(displayGroups[0].id);
    }
  }, [displayGroups, selectedGroupId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left sidebar - Group list */}
      <div className="md:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>
        
        {loadingGroups ? (
          <Card className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading study groups...</p>
          </Card>
        ) : displayGroups.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No study groups yet</p>
            <Button 
              className="mt-4" 
              onClick={() => setCreateDialogOpen(true)}
            >
              Create your first group
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayGroups.map((group) => (
              <Card 
                key={group.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedGroupId === group.id ? "border-2 border-primary" : ""
                }`}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.members.length} members
                      </p>
                    </div>
                    {group.isPublic ? (
                      <Badge variant="outline">Public</Badge>
                    ) : (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </div>
                  
                  {group.nextMeetingDate && (
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(group.nextMeetingDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {group.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {group.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{group.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right side - Selected group details and chat */}
      <div className="md:col-span-2">
        {selectedGroupId && selectedGroup ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedGroup.name}</CardTitle>
                    <CardDescription>
                      Created by {selectedGroup.createdBy.name} • 
                      {selectedGroup.members.length} members
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedGroup.nextMeetingDate && (
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-1" />
                        Join Meeting
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isGroupMember ? (
                          <>
                            <DropdownMenuItem onClick={() => {}}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Group
                            </DropdownMenuItem>
                            {isGroupCreator && (
                              <>
                                <DropdownMenuItem onClick={() => {}}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Group
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {}}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule Meeting
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this group?")) {
                                      deleteGroupMutation.mutate(selectedGroup.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Group
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => leaveGroupMutation.mutate(selectedGroup.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Leave Group
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => joinGroupMutation.mutate(selectedGroup.id)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Join Group
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Tabs defaultValue="about">
                  <TabsList className="mb-2">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="meetings">Meetings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="space-y-2">
                    <p className="text-sm">{selectedGroup.description}</p>
                    
                    {selectedGroup.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedGroup.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="members">
                    <div className="space-y-2">
                      {selectedGroup.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                          {member.id === selectedGroup.createdBy.id && (
                            <Badge variant="outline" className="ml-auto">Creator</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="meetings">
                    {selectedGroup.nextMeetingDate ? (
                      <div>
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium">Next Meeting</span>
                        </div>
                        <p className="text-sm mb-1">
                          {formatDate(selectedGroup.nextMeetingDate)}
                        </p>
                        {selectedGroup.meetingLink && (
                          <div className="flex items-center mt-2">
                            <Video className="h-4 w-4 mr-2 text-blue-500" />
                            <a
                              href={selectedGroup.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Calendar className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">No meetings scheduled</p>
                        {isGroupCreator && (
                          <Button 
                            className="mt-2" 
                            variant="outline"
                            size="sm"
                          >
                            Schedule Meeting
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Chat section */}
            <Card className="min-h-[400px] flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Group Chat</CardTitle>
                  {isGroupMember ? (
                    <Badge variant="outline">Member</Badge>
                  ) : (
                    <Button 
                      onClick={() => joinGroupMutation.mutate(selectedGroup.id)}
                      disabled={joinGroupMutation.isPending}
                      size="sm"
                    >
                      {joinGroupMutation.isPending ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Users className="h-3 w-3 mr-1" />
                          Join to Chat
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden p-0">
                <ScrollArea className="h-[300px] px-4">
                  {loadingMessages ? (
                    <div className="py-8 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Loading messages...</p>
                    </div>
                  ) : displayMessages.length === 0 ? (
                    <div className="py-8 text-center">
                      <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">No messages yet</p>
                      {isGroupMember && (
                        <p className="text-sm text-muted-foreground">
                          Be the first to start the conversation!
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      {displayMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex gap-2 ${
                            message.sender.id === user?.id ? "justify-end" : ""
                          }`}
                        >
                          {message.sender.id !== user?.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender.avatar} />
                              <AvatarFallback>
                                {message.sender.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div 
                            className={`max-w-[70%] ${
                              message.sender.id === user?.id 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            } p-3 rounded-lg`}
                          >
                            {message.sender.id !== user?.id && (
                              <p className="text-xs font-medium mb-1">
                                {message.sender.name}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 text-right mt-1">
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 border-t">
                {isGroupMember ? (
                  <div className="flex gap-2 w-full">
                    <Input 
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <SendHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="w-full text-center text-muted-foreground">
                    <p>Join the group to participate in the chat</p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        ) : (
          <Card className="min-h-[400px] flex flex-col justify-center items-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Study Group Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select a group from the list or create a new one
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              Create New Group
            </Button>
          </Card>
        )}
      </div>

      {/* Create New Group Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Study Group</DialogTitle>
            <DialogDescription>
              Create a group to collaborate with classmates on course materials and assignments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input 
                id="group-name" 
                placeholder="Enter group name"
                value={newGroupData.name}
                onChange={(e) => setNewGroupData({
                  ...newGroupData,
                  name: e.target.value
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="group-description">Description</Label>
              <Textarea 
                id="group-description" 
                placeholder="What will your group focus on?"
                value={newGroupData.description}
                onChange={(e) => setNewGroupData({
                  ...newGroupData,
                  description: e.target.value
                })}
                className="resize-none min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="group-tags">Tags (comma separated)</Label>
              <Input 
                id="group-tags" 
                placeholder="e.g. calculus, homework, exam prep"
                value={newGroupData.tags}
                onChange={(e) => setNewGroupData({
                  ...newGroupData,
                  tags: e.target.value
                })}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="group-visibility" 
                checked={newGroupData.isPublic}
                onCheckedChange={(checked) => setNewGroupData({
                  ...newGroupData,
                  isPublic: checked
                })}
              />
              <Label htmlFor="group-visibility">
                Public group (anyone in the course can join)
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={createGroupMutation.isPending}
            >
              {createGroupMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}