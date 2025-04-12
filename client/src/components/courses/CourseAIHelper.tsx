import { useState } from 'react';
import { Loader2, Send, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { askGemini, isGeminiConfigured } from '@/lib/gemini';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

interface CourseAIHelperProps {
  courseId: number;
  courseTitle: string;
  courseCategory: string;
  courseLevel: string;
}

export function CourseAIHelper({ courseId, courseTitle, courseCategory, courseLevel }: CourseAIHelperProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'assessments'>('general');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; timestamp: Date }[]>([
    {
      role: 'assistant',
      content: `I'm your course AI assistant for "${courseTitle}". Ask me any questions about this course!`,
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if Gemini API key is configured
  const { data: geminiConfigured, isLoading: checkingGemini } = useQuery({
    queryKey: ['geminiApiConfigured'],
    queryFn: isGeminiConfigured,
  });

  // Generate course-specific suggested questions based on the active tab
  const getSuggestedQuestions = () => {
    if (activeTab === 'general') {
      return [
        `What are the key concepts I should focus on in ${courseTitle}?`,
        `Can you explain how to get the most out of ${courseTitle}?`,
        `What prior knowledge is helpful for ${courseTitle}?`,
      ];
    } else if (activeTab === 'content') {
      return [
        `Explain the topic of ${courseCategory} in simple terms`,
        `How does this course connect to real-world applications?`,
        `What are the most challenging concepts in this course?`,
      ];
    } else if (activeTab === 'assessments') {
      return [
        `How should I prepare for assessments in ${courseTitle}?`,
        `Can you help me create a study plan for this course?`,
        `What types of questions might appear in this course's assessments?`,
      ];
    }
    return [];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!geminiConfigured) {
      toast({
        title: 'AI Assistant is not available',
        description: 'The AI service is not properly configured. Please contact support.',
        variant: 'destructive',
      });
      return;
    }

    // Add user message to conversation
    const userMessage = { role: 'user' as const, content: inputValue, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Create a course-specific prompt by adding context about the course
      const courseContext = `I'm asking about the course "${courseTitle}" in the category "${courseCategory}" at ${courseLevel} level. `;
      const response = await askGemini(courseContext + inputValue, user?.studentLevel || 'secondary');
      
      // Add assistant response to conversation
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response, timestamp: new Date() },
      ]);
    } catch (error) {
      console.error('Error communicating with AI service:', error);
      toast({
        title: 'Failed to get response',
        description: 'There was an error communicating with the AI service. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback>
                <BrainCircuit className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Course AI Assistant</CardTitle>
              <CardDescription>Get help with this course</CardDescription>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-[300px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col h-[300px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  message.role === 'user' 
                    ? "ml-auto max-w-[80%] bg-primary text-primary-foreground" 
                    : "mr-auto max-w-[80%] bg-muted"
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-7 w-7 mt-1">
                    <AvatarImage src="/ai-avatar.png" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className="mt-1 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex items-center p-3 rounded-lg bg-muted mr-auto">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
          
          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Suggested Questions</h4>
              <div className="flex flex-wrap gap-2">
                {getSuggestedQuestions().map((question, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex items-end gap-2 w-full">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this course..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isProcessing || !geminiConfigured}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing || !geminiConfigured}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}