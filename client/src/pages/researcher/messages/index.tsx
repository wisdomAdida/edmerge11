import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Send, 
  Plus,
  MessageSquare, 
  Users,
  ArrowRightCircle, 
  ArrowLeftCircle,
  Loader2, 
  UserPlus,
  ChevronLeft,
  MoreVertical,
  Paperclip
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: {
    text: string;
    timestamp: Date;
    unread: boolean;
  };
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export default function ResearcherMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showMobileContacts, setShowMobileContacts] = useState(true);
  
  // Mock contacts data
  const mockContacts: Contact[] = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      status: "online",
      lastMessage: {
        text: "Let's discuss the research proposal tomorrow.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        unread: true
      }
    },
    {
      id: 2,
      name: "Prof. Michael Johnson",
      status: "offline",
      lastMessage: {
        text: "I've shared the dataset you requested.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        unread: false
      }
    },
    {
      id: 3,
      name: "Dr. Aisha Patel",
      status: "away",
      lastMessage: {
        text: "The meeting is confirmed for next Thursday at 2PM.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        unread: false
      }
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      status: "online",
      lastMessage: {
        text: "Can you review the draft paper by Friday?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        unread: false
      }
    }
  ];
  
  // Mock messages data for the selected contact
  const mockMessages: Message[] = [
    {
      id: 1,
      senderId: 1, // Dr. Sarah Chen
      receiverId: 0, // User
      text: "Hi there! I was wondering if you've had a chance to review the draft research proposal?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true
    },
    {
      id: 2,
      senderId: 0, // User
      receiverId: 1, // Dr. Sarah Chen
      text: "Yes, I've gone through it. I have a few suggestions for the methodology section.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
      isRead: true
    },
    {
      id: 3,
      senderId: 1, // Dr. Sarah Chen
      receiverId: 0, // User
      text: "That's great! Could you share your thoughts in more detail?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isRead: true
    },
    {
      id: 4,
      senderId: 0, // User
      receiverId: 1, // Dr. Sarah Chen
      text: "Sure. I think we should consider a mixed-methods approach instead of purely quantitative. This would give us better insights into the 'why' behind the data.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      isRead: true
    },
    {
      id: 5,
      senderId: 1, // Dr. Sarah Chen
      receiverId: 0, // User
      text: "That's a really good point. Let's discuss this further in our meeting tomorrow. I'll prepare some examples of mixed-methods approaches that could work for our research question.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false
    }
  ];
  
  // Filter contacts based on search term
  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format message time
  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      // Today - show time
      return format(date, 'HH:mm');
    } else if (date >= yesterday) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Older - show date
      return format(date, 'MMM d');
    }
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeContact) return;
    
    // Here you would call your API to send the message
    // For demo purposes, we'll just reset the input
    setMessageText('');
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Mobile header */}
          <div className="md:hidden border-b p-3 flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-bold">Messages</h2>
            </div>
            {!showMobileContacts && activeContact && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowMobileContacts(true)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Contacts sidebar */}
          <div 
            className={`w-full md:w-80 border-r ${showMobileContacts ? 'block' : 'hidden'} md:block`}
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold mb-4 hidden md:block">Messages</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="divide-y">
                {filteredContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer ${activeContact?.id === contact.id ? 'bg-muted' : ''}`}
                    onClick={() => {
                      setActiveContact(contact);
                      setShowMobileContacts(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={contact.avatar} alt={contact.name} />
                          <AvatarFallback>{contact.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                          contact.status === 'online' ? 'bg-green-500' : 
                          contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">{contact.name}</h3>
                          {contact.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(contact.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {contact.lastMessage && (
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {contact.lastMessage.text}
                            </p>
                            {contact.lastMessage.unread && (
                              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                1
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredContacts.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No contacts found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Message area */}
          <div 
            className={`flex-1 flex flex-col ${!showMobileContacts ? 'block' : 'hidden'} md:block`}
          >
            {activeContact ? (
              <>
                {/* Chat header */}
                <div className="border-b p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-2">
                      <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                      <AvatarFallback>{activeContact.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeContact.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{activeContact.status}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Search in Conversation</DropdownMenuItem>
                      <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Clear Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {mockMessages.map(message => (
                      <div 
                        key={message.id}
                        className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.senderId === 0 ? 'order-2' : 'order-1 flex'}`}>
                          {message.senderId !== 0 && (
                            <Avatar className="h-8 w-8 mr-2 self-end mb-1">
                              <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                              <AvatarFallback>{activeContact.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div 
                              className={`rounded-lg p-3 ${
                                message.senderId === 0 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground flex justify-between">
                              <span>{format(message.timestamp, 'HH:mm')}</span>
                              {message.senderId === 0 && (
                                <span>{message.isRead ? 'Read' : 'Delivered'}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Message input */}
                <div className="border-t p-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Textarea 
                      placeholder="Type a message..." 
                      className="min-h-10 resize-none"
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your Messages</h3>
                  <p className="text-muted-foreground mb-6">
                    Select a contact to start a conversation, or create a new message to connect with researchers and collaborators.
                  </p>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}