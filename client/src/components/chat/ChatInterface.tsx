import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  User2, 
  Loader2, 
  Circle,
  Image as ImageIcon,
  FileText,
  Download,
  ArrowLeft,
  Phone,
  Video,
  CircleAlert,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: number;
  content: string;
  senderId: number;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}

interface ChatInterfaceProps {
  roomId: string;
  recipientId: number;
  recipientName: string;
}

export function ChatInterface({ roomId, recipientId, recipientName }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    messages, 
    isLoadingMessages, 
    isLoadingRecipient,
    recipientDetails,
    error,
    sendMessage,
    sendFileMessage,
    markMessagesAsRead
  } = useChat(roomId);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mark messages as read when chat opens
  useEffect(() => {
    if (roomId) {
      markMessagesAsRead();
    }
  }, [roomId, markMessagesAsRead]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    setIsSending(true);
    const result = await sendMessage(inputMessage);
    setIsSending(false);
    
    if (result) {
      setInputMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    setIsSending(true);
    const result = await sendFileMessage(file);
    setIsSending(false);
    
    if (result) {
      // Reset file input for future uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Render message based on type
  const renderMessage = (message: Message) => {
    const isCurrentUser = message.senderId === user?.id;
    const messageTime = format(new Date(message.timestamp), 'h:mm a');
    
    if (message.type === 'system') {
      return (
        <div className="flex justify-center my-4">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {message.content}
          </Badge>
        </div>
      );
    }
    
    return (
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 mr-2 mt-0.5">
            <AvatarImage 
              src={recipientDetails?.profileImage || ''} 
              alt={recipientDetails?.firstName || recipientName} 
            />
            <AvatarFallback>
              <User2 className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[75%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {message.type === 'text' ? (
            <div 
              className={`rounded-lg px-4 py-2 ${
                isCurrentUser 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            </div>
          ) : message.type === 'image' ? (
            <div 
              className={`rounded-lg p-1 overflow-hidden ${
                isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block max-w-full"
              >
                <img 
                  src={message.fileUrl} 
                  alt={message.content} 
                  className="rounded max-w-full max-h-[300px] object-contain" 
                />
              </a>
              <div 
                className={`text-xs py-1 px-2 ${
                  isCurrentUser ? 'text-primary-foreground/90' : 'text-muted-foreground'
                }`}
              >
                {message.content}
              </div>
            </div>
          ) : message.type === 'file' ? (
            <div 
              className={`rounded-lg px-4 py-3 ${
                isCurrentUser 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              <div className="flex items-center mb-1">
                <FileText className="h-5 w-5 mr-2" />
                <div className="flex-1 text-sm font-medium truncate">
                  {message.fileName || 'File'}
                </div>
              </div>
              <div className="text-sm mb-2 text-wrap break-words">{message.content}</div>
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`text-xs flex items-center ${
                  isCurrentUser ? 'text-primary-foreground/90' : 'text-primary'
                }`}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </a>
            </div>
          ) : null}
          
          <div className={`text-xs mt-1 text-muted-foreground ${isCurrentUser ? 'text-right' : ''}`}>
            {messageTime}
          </div>
        </div>
        
        {isCurrentUser && (
          <Avatar className="h-8 w-8 ml-2 mt-0.5">
            <AvatarImage 
              src={user?.profileImage || ''} 
              alt={user?.firstName || ''} 
            />
            <AvatarFallback>
              <User2 className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };
  
  return (
    <Card className="flex flex-col h-full">
      {/* Chat Header */}
      <CardHeader className="p-4 border-b">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage 
              src={recipientDetails?.profileImage || ''} 
              alt={recipientDetails?.firstName || recipientName} 
            />
            <AvatarFallback>
              <User2 className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg font-medium">
              {recipientDetails 
                ? `${recipientDetails.firstName} ${recipientDetails.lastName}` 
                : recipientName}
            </CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
              {recipientDetails?.isOnline ? (
                <>
                  <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-1" />
                  <span>Online</span>
                </>
              ) : (
                <span>Offline</span>
              )}
              
              {recipientDetails?.role && (
                <>
                  <span className="mx-1">•</span>
                  <span className="capitalize">{recipientDetails.role}</span>
                </>
              )}
              
              {recipientDetails?.role === 'student' && recipientDetails?.studentLevel && (
                <>
                  <span className="mx-1">•</span>
                  <span className="capitalize">{recipientDetails.studentLevel}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Call</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Video Call</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      {/* Messages Area */}
      <CardContent className="flex-1 p-0 relative overflow-hidden">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center p-4">
            <CircleAlert className="h-12 w-12 text-destructive mb-3" />
            <h3 className="font-medium text-lg">Something went wrong</h3>
            <p className="text-muted-foreground text-center mt-1 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)] p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 opacity-70">
                <Send className="h-12 w-12 mb-4" />
                <h3 className="font-medium text-xl">Start Conversation</h3>
                <p className="text-muted-foreground text-center mt-2">
                  Send a message to start chatting with {recipientDetails?.firstName || recipientName}
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id}>
                    {renderMessage(message)}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>
        )}
      </CardContent>
      
      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0"
            onClick={handleFileSelect}
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Textarea
            placeholder="Type a message..."
            className="flex-1 min-h-[42px] max-h-[120px] resize-none"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          
          <Button
            className="rounded-full h-10 w-10 flex-shrink-0"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}