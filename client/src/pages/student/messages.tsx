import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { UserList } from '@/components/chat/UserList';
import { RecentChats } from '@/components/chat/RecentChats';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Users, Clock } from 'lucide-react';

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const dummyRoomId = 'placeholder'; // Just for initialization
  const { createRoomId } = useChat(dummyRoomId);
  
  const [activeTab, setActiveTab] = useState<string>('recent');
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(null);
  const [currentRecipientId, setCurrentRecipientId] = useState<number | null>(null);
  const [currentRecipientName, setCurrentRecipientName] = useState<string>('');
  
  // Handle user selection from the users list
  const handleUserSelect = (userId: number, username: string) => {
    if (!user) return;
    
    const roomId = createRoomId(user.id, userId);
    setCurrentChatRoomId(roomId);
    setCurrentRecipientId(userId);
    setCurrentRecipientName(username);
  };
  
  // Handle chat selection from recent chats
  const handleChatSelect = (roomId: string, userId: number, username: string) => {
    setCurrentChatRoomId(roomId);
    setCurrentRecipientId(userId);
    setCurrentRecipientName(username);
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          {/* Mobile Tabs - only visible on small screens */}
          <div className="md:hidden mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="recent" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent">
                <RecentChats 
                  onChatSelect={handleChatSelect}
                  selectedRoomId={currentChatRoomId || undefined}
                />
              </TabsContent>
              
              <TabsContent value="users">
                <UserList onUserSelect={handleUserSelect} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Desktop Layout - only visible on medium+ screens */}
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Conversations
            </h2>
            <RecentChats 
              onChatSelect={handleChatSelect}
              selectedRoomId={currentChatRoomId || undefined}
            />
            
            <Separator className="my-6" />
            
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Find Users
            </h2>
            <UserList onUserSelect={handleUserSelect} />
          </div>
        </div>
        
        <div className="md:col-span-2">
          {currentChatRoomId && currentRecipientId ? (
            <ChatInterface 
              roomId={currentChatRoomId}
              recipientId={currentRecipientId}
              recipientName={currentRecipientName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] bg-muted/30 rounded-lg border p-8 text-center">
              <MessageCircle className="h-16 w-16 text-muted mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Conversation Selected</h2>
              <p className="text-muted-foreground max-w-md">
                Choose a user from the left sidebar to start a new conversation 
                or continue an existing one. All messages are encrypted end-to-end 
                for your privacy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}