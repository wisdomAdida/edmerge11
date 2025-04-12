import { useState, useEffect, useRef } from 'react';
import { Loader2, Send, MessageSquare, PlusCircle, BrainCircuit } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { askGemini, isGeminiConfigured } from '@/lib/gemini';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';

interface AITutorSectionProps {
  suggestedQuestions?: string[];
  onViewAllClick?: () => void;
  studentLevel?: string;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Local storage key for saving chat history
const CHAT_HISTORY_KEY = 'edmerge_ai_chat_history';

export const AITutorSection = ({ 
  suggestedQuestions = [], 
  onViewAllClick, 
  studentLevel = 'tertiary' 
}: AITutorSectionProps) => {
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Determine the appropriate student level
  const userLevel = user?.studentLevel || studentLevel;

  // Check if Gemini API key is configured
  const { data: apiConfigured, isLoading: checkingApiConfig } = useQuery({
    queryKey: ['geminiApiConfigured'],
    queryFn: isGeminiConfigured,
    staleTime: 1000 * 60 * 5, // Cache result for 5 minutes
  });

  // Load chat history from local storage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Failed to load chat history from localStorage:', error);
    }
  }, []);

  // Save chat history to local storage
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save chat history to localStorage:', error);
      }
    }
  }, [history]);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isProcessing]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (!apiConfigured) {
      toast({
        title: 'AI Tutor is not available',
        description: 'The AI service is not properly configured. Please contact support.',
        variant: 'destructive'
      });
      return;
    }

    // Add user message to history
    const userMessage = { role: 'user' as const, content: inputValue, timestamp: new Date() };
    setHistory(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Send message to API and get response
      const response = await askGemini(inputValue, userLevel);
      
      // Add assistant response to history
      setHistory(prev => [...prev, { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error('Error communicating with AI service:', error);
      toast({
        title: 'Failed to get response',
        description: 'There was an error communicating with the AI service. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setHistory([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    toast({
      title: 'Chat cleared',
      description: 'Your conversation history has been cleared.'
    });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-sm border p-3 md:p-5">
      {/* Header with View All Link */}
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h3 className="text-base md:text-lg font-bold">AI Tutor</h3>
          {apiConfigured && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={clearChat}
            >
              Clear
            </Button>
          )}
          {onViewAllClick && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={onViewAllClick}
            >
              <span className={isMobile ? "" : "mr-1"}>
                {isMobile ? "Full" : "Full Assistant"}
              </span>
              <PlusCircle className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Check if API is configured */}
      {checkingApiConfig ? (
        <div className="flex-1 flex flex-col space-y-2 justify-center items-center p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : !apiConfigured ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">AI Tutor is not available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The AI service has not been configured. Please contact support for assistance.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-3 md:space-y-4 pr-1">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-6 text-muted-foreground">
                <Avatar className="h-12 w-12 mb-3 bg-primary/10">
                  <AvatarFallback className="text-primary">AI</AvatarFallback>
                </Avatar>
                <h3 className="text-base md:text-lg font-medium">Ask me anything!</h3>
                <p className="text-xs md:text-sm mt-1 max-w-md">
                  Your personal AI tutor is ready to help with your questions, explanations, and educational needs.
                </p>
              </div>
            ) : (
              history.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-start gap-2 md:gap-3 p-3 rounded-lg",
                    message.role === 'user' 
                      ? "ml-auto max-w-[85%] md:max-w-[80%] bg-primary text-primary-foreground" 
                      : "mr-auto max-w-[85%] md:max-w-[80%] bg-muted"
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-7 w-7 md:h-8 md:w-8 mt-0.5">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium">
                        {message.role === 'user' ? 'You' : 'AI Tutor'}
                      </span>
                      <span className="text-xs opacity-70 ml-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-xs md:text-sm break-words">{message.content}</div>
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex items-center p-3 rounded-lg bg-muted mr-auto max-w-[85%] md:max-w-[80%]">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-xs md:text-sm">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {suggestedQuestions.length > 0 && history.length === 0 && (
            <div className="mb-3 md:mb-4">
              <h4 className="text-xs md:text-sm font-medium mb-2">Try asking about:</h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {suggestedQuestions.slice(0, isMobile ? 3 : 4).map((question, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted/70 transition-colors py-1.5 px-2 text-xs"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input field and send button */}
          <div className="flex items-end gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 min-h-[60px] md:min-h-[80px] resize-none text-sm"
              disabled={isProcessing || !apiConfigured}
            />
            <Button 
              className="mb-[3px]" 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing || !apiConfigured}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};