import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  BarChart, 
  PieChart, 
  Check, 
  PlusCircle, 
  Edit, 
  Trash, 
  RefreshCw,
  Send
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  isActive: boolean;
  totalVotes: number;
  createdBy: number;
  courseId: number;
  createdAt: Date;
}

interface LivePollingProps {
  courseId: number;
  isTutor?: boolean;
}

export function LivePolling({ courseId, isTutor = false }: LivePollingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [pollRefreshInterval, setPollRefreshInterval] = useState<number | false>(false);

  // Fetch active polls for this course
  const { data: polls, isLoading } = useQuery<Poll[]>({
    queryKey: ["/api/courses", courseId, "polls"],
    enabled: !!courseId,
    refetchInterval: pollRefreshInterval,
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (pollData: { question: string; options: string[] }) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/polls`, pollData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Poll created",
        description: "Your poll has been created successfully",
      });
      setIsCreatingPoll(false);
      setNewPollQuestion("");
      setPollOptions(["", ""]);
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "polls"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create poll",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vote on poll mutation
  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: number; optionId: number }) => {
      const res = await apiRequest("POST", `/api/polls/${pollId}/vote`, { optionId });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "polls"] });
      setSelectedOptionId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to vote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle poll active status mutation
  const togglePollStatusMutation = useMutation({
    mutationFn: async ({ pollId, isActive }: { pollId: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/polls/${pollId}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "polls"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update poll",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete poll mutation
  const deletePollMutation = useMutation({
    mutationFn: async (pollId: number) => {
      const res = await apiRequest("DELETE", `/api/polls/${pollId}`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Poll deleted",
        description: "The poll has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "polls"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete poll",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add poll option
  const addOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    } else {
      toast({
        title: "Maximum options reached",
        description: "You can have a maximum of 6 options",
        variant: "destructive",
      });
    }
  };

  // Remove poll option
  const removeOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    } else {
      toast({
        title: "Minimum options required",
        description: "You need at least 2 options for a poll",
        variant: "destructive",
      });
    }
  };

  // Update poll option text
  const updateOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Submit new poll
  const submitPoll = () => {
    // Validate
    if (!newPollQuestion.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question for your poll",
        variant: "destructive",
      });
      return;
    }

    const validOptions = pollOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast({
        title: "Options required",
        description: "Please enter at least 2 options for your poll",
        variant: "destructive",
      });
      return;
    }

    createPollMutation.mutate({
      question: newPollQuestion,
      options: validOptions,
    });
  };

  // Handle vote
  const handleVote = (pollId: number) => {
    if (!selectedOptionId) {
      toast({
        title: "Select an option",
        description: "Please select an option to vote",
        variant: "destructive",
      });
      return;
    }

    voteMutation.mutate({ pollId, optionId: selectedOptionId });
  };

  // Toggle live poll updates
  const toggleLiveUpdates = (enabled: boolean) => {
    setPollRefreshInterval(enabled ? 5000 : false);
  };

  // Calculate percentage for a poll option
  const calculatePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return (votes / totalVotes) * 100;
  };

  const mockPolls: Poll[] = [
    {
      id: 1,
      question: "What topic would you like to review in the next session?",
      options: [
        { id: 1, text: "Data Structures", votes: 12 },
        { id: 2, text: "Algorithms", votes: 8 },
        { id: 3, text: "System Design", votes: 5 }
      ],
      isActive: true,
      totalVotes: 25,
      createdBy: 1,
      courseId: courseId,
      createdAt: new Date()
    },
    {
      id: 2,
      question: "How do you prefer to receive feedback on assignments?",
      options: [
        { id: 1, text: "Written comments", votes: 15 },
        { id: 2, text: "Video feedback", votes: 7 },
        { id: 3, text: "One-on-one sessions", votes: 10 }
      ],
      isActive: true,
      totalVotes: 32,
      createdBy: 1,
      courseId: courseId,
      createdAt: new Date()
    }
  ];

  // Use mock polls if API data isn't available
  const displayPolls = polls || mockPolls;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Polls</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="live-updates" 
              onCheckedChange={toggleLiveUpdates}
            />
            <Label htmlFor="live-updates">Live Updates</Label>
          </div>
          
          {isTutor && (
            <Button 
              onClick={() => setIsCreatingPoll(!isCreatingPoll)} 
              variant={isCreatingPoll ? "secondary" : "default"}
            >
              {isCreatingPoll ? "Cancel" : "Create Poll"}
              {!isCreatingPoll && <PlusCircle className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      
      {isCreatingPoll && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Poll</CardTitle>
            <CardDescription>
              Ask a question and provide options for students to vote on
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Enter your question here..."
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Options (minimum 2)</Label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={pollOptions.length <= 2}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addOption}
                disabled={pollOptions.length >= 6}
                className="mt-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsCreatingPoll(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitPoll}
              disabled={createPollMutation.isPending}
            >
              {createPollMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Poll
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {isLoading ? (
        <div className="py-8 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading polls...</p>
        </div>
      ) : displayPolls.length === 0 ? (
        <Card className="py-8">
          <div className="text-center">
            <BarChart className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No active polls right now</p>
            {isTutor && !isCreatingPoll && (
              <Button 
                className="mt-4" 
                onClick={() => setIsCreatingPoll(true)}
              >
                Create First Poll
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {displayPolls.map((poll) => (
            <Card key={poll.id} className={poll.isActive ? "" : "opacity-75"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="mr-8">{poll.question}</CardTitle>
                  {isTutor && (
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => togglePollStatusMutation.mutate({ 
                                pollId: poll.id, 
                                isActive: !poll.isActive 
                              })}
                            >
                              {poll.isActive ? (
                                <Badge variant="outline" className="px-2 h-5">Live</Badge>
                              ) : (
                                <Badge variant="outline" className="px-2 h-5 bg-muted">Closed</Badge>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {poll.isActive ? "Close poll" : "Reopen poll"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deletePollMutation.mutate(poll.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Delete poll
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                <CardDescription>
                  {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'} • 
                  {new Date(poll.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {poll.options.map((option) => (
                    <div key={option.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`option-${poll.id}-${option.id}`}
                            name={`poll-${poll.id}`}
                            checked={selectedOptionId === option.id}
                            onChange={() => setSelectedOptionId(option.id)}
                            disabled={!poll.isActive}
                            className="h-4 w-4"
                          />
                          <label 
                            htmlFor={`option-${poll.id}-${option.id}`}
                            className="text-sm"
                          >
                            {option.text}
                          </label>
                        </div>
                        <span className="text-sm font-medium">
                          {calculatePercentage(option.votes, poll.totalVotes).toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={calculatePercentage(option.votes, poll.totalVotes)} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                {poll.isActive ? (
                  <Button 
                    className="w-full"
                    onClick={() => handleVote(poll.id)}
                    disabled={voteMutation.isPending || selectedOptionId === null}
                  >
                    {voteMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Voting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Submit Vote
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    disabled
                  >
                    Poll Closed
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}