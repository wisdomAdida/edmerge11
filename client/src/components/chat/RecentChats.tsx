import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageSquare, 
  User2, 
  Loader2, 
  RefreshCw, 
  CircleAlert,
  Plus,
  Circle,
  Clock,
  CheckCheck
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';

type ChatPreview = {
  roomId: string;
  recipientId: number;
  recipientName: string;
  recipientProfileImage: string | null;
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
    isFromCurrentUser: boolean;
  };
  unreadCount: number;
  isOnline: boolean;
  role: string;
  studentLevel: string | null;
};

interface RecentChatsProps {
  selectedRoomId: string | null;
  onChatSelect: (roomId: string, recipientId: number, recipientName: string) => void;
  onNewChat: () => void;
}

export function RecentChats({ selectedRoomId, onChatSelect, onNewChat }: RecentChatsProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch recent chats
  const fetchRecentChats = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', '/api/messaging/recent');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent chats');
      }
      
      const data = await response.json();
      setChats(data);
      setFilteredChats(data);
    } catch (error) {
      console.error('Error fetching recent chats:', error);
      setError('Failed to load your conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Set up polling for new messages
  useEffect(() => {
    fetchRecentChats();
    
    // Poll for new messages every 30 seconds
    const intervalId = setInterval(() => {
      fetchRecentChats();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Filter chats based on search
  useEffect(() => {
    if (!chats.length) return;
    
    if (!searchQuery) {
      setFilteredChats(chats);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = chats.filter(
      chat => chat.recipientName.toLowerCase().includes(query)
    );
    
    setFilteredChats(filtered);
  }, [chats, searchQuery]);
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl">
            <MessageSquare className="mr-2 h-5 w-5" />
            Messages
          </CardTitle>
          <Button 
            onClick={onNewChat} 
            variant="outline" 
            size="sm"
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Separator className="mb-0" />
        
        {loading ? (
          <div className="flex items-center justify-center py-8 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 flex-1">
            <CircleAlert className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={fetchRecentChats}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : filteredChats.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-250px)] max-h-[600px]">
            <ul className="py-2 px-1 space-y-1">
              {filteredChats.map((chat) => {
                const isSelected = chat.roomId === selectedRoomId;
                const formattedTime = formatTime(chat.lastMessage.timestamp);
                
                return (
                  <li key={chat.roomId}>
                    <Button
                      variant={isSelected ? "secondary" : "ghost"}
                      className={`w-full justify-start p-2 hover:bg-muted ${
                        chat.unreadCount > 0 && !isSelected ? "bg-muted/50" : ""
                      }`}
                      onClick={() => onChatSelect(chat.roomId, chat.recipientId, chat.recipientName)}
                    >
                      <div className="flex items-center w-full">
                        <div className="relative">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage 
                              src={chat.recipientProfileImage || ''} 
                              alt={chat.recipientName} 
                            />
                            <AvatarFallback>
                              <User2 className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          {chat.isOnline && (
                            <span className="absolute bottom-0 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                          )}
                        </div>
                        
                        <div className="flex-1 overflow-hidden mr-2">
                          <div className="flex justify-between items-center">
                            <span className={`font-medium truncate ${chat.unreadCount > 0 && !isSelected ? "text-foreground" : ""}`}>
                              {chat.recipientName}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              {formattedTime}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className={`text-sm truncate ${
                              chat.unreadCount > 0 && !isSelected 
                                ? "text-foreground font-medium" 
                                : "text-muted-foreground"
                            }`}>
                              {chat.lastMessage.isFromCurrentUser && (
                                <span className="mr-1 inline-flex items-center">
                                  {chat.lastMessage.isRead ? (
                                    <CheckCheck className="h-3 w-3 text-primary" />
                                  ) : (
                                    <CheckCheck className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </span>
                              )}
                              {chat.lastMessage.content}
                            </span>
                            
                            {chat.unreadCount > 0 && !isSelected && (
                              <Badge className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 flex-1 flex flex-col items-center justify-center px-4">
            <MessageSquare className="h-10 w-10 mb-3 text-muted-foreground" />
            <h3 className="font-medium">No conversations yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Start a new chat by clicking the "New Chat" button
            </p>
            <Button 
              onClick={onNewChat} 
              variant="outline" 
              size="sm"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
  const isThisWeek = now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
  
  if (isToday) {
    return format(date, 'h:mm a');
  } else if (isYesterday) {
    return 'Yesterday';
  } else if (isThisWeek) {
    return format(date, 'EEE');
  } else {
    return format(date, 'MM/dd/yy');
  }
}