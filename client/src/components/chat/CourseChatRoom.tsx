import { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Users, MessagesSquare } from 'lucide-react';

interface CourseChatRoomProps {
  courseId: number;
  courseName: string;
  userId?: number;
}

export function CourseChatRoom({ courseId, courseName }: CourseChatRoomProps) {
  const [activeTab, setActiveTab] = useState('general');
  
  // Generate a room ID for the course's general chat
  const generalRoomId = `course-${courseId}-general`;
  // Generate a room ID for the course's Q&A chat
  const qaRoomId = `course-${courseId}-qa`;
  
  // Optional: Fetch enrolled students to show active participants 
  const { data: enrollments } = useQuery({
    queryKey: ['/api/courses', courseId, 'enrollments'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/courses/${courseId}/enrollments`);
      return response.json();
    }
  });
  
  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Course Chat</CardTitle>
        <CardDescription>
          Chat with other students and the course instructor
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 flex justify-between items-center border-b">
            <TabsList>
              <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessagesSquare className="w-4 h-4 mr-2" />
                General Chat
              </TabsTrigger>
              <TabsTrigger value="qa" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessagesSquare className="w-4 h-4 mr-2" />
                Questions & Answers
              </TabsTrigger>
            </TabsList>
            
            {enrollments && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                <span>{enrollments.length} enrolled</span>
              </div>
            )}
          </div>
          
          <TabsContent value="general" className="mt-0 border-0">
            <div className="h-[600px]">
              <ChatInterface 
                roomId={generalRoomId} 
                title={`${courseName} - General Discussion`} 
                height="500px"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="qa" className="mt-0 border-0">
            <div className="h-[600px]">
              <ChatInterface 
                roomId={qaRoomId} 
                title={`${courseName} - Questions & Answers`}
                height="500px"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}