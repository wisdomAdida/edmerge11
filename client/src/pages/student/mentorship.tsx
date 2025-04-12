import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  Search, 
  Filter, 
  CalendarPlus, 
  Calendar, 
  Clock, 
  Star, 
  Globe,
  MessageSquare,
  Laptop,
  Share2,
  Video,
  UserPlus,
  UserCheck,
  Users,
  ArrowUpRight,
  GraduationCap,
  BriefcaseBusiness,
  Building2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Types
type Mentor = {
  id: number;
  name: string;
  title: string;
  organization: string;
  expertise: string[];
  location: string;
  rating: number;
  totalStudents: number;
  bio: string;
  availability: string;
  avatar?: string;
  educationalBackground: string;
  languages: string[];
  isVerified: boolean;
  hourlyRate?: number;
  isAvailableNow: boolean;
};

type Mentorship = {
  id: number;
  mentorId: number;
  mentorName: string;
  mentorAvatar?: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  nextSessionDate?: Date;
  subject: string;
  goals: string[];
  progress: number;
  notes: string;
  meetingLink?: string;
};

type Session = {
  id: number;
  mentorshipId: number;
  mentorName: string;
  mentorAvatar?: string;
  date: Date;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  type: 'one-on-one' | 'group' | 'workshop';
  topic: string;
  meetingLink?: string;
};

export default function MentorshipPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("all");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // Fetch mentors
  const { data: mentors, isLoading: isLoadingMentors } = useQuery<Mentor[]>({
    queryKey: ["/api/mentors"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // This simulates API data - in a real app this would be an actual API call
      return [
        {
          id: 1,
          name: "Dr. Sarah Johnson",
          title: "Senior Mathematics Professor",
          organization: "Stanford University",
          expertise: ["mathematics", "data science", "statistics"],
          location: "California, USA",
          rating: 4.9,
          totalStudents: 128,
          bio: "Experienced professor specializing in applied mathematics with 15+ years of teaching and mentoring experience.",
          availability: "Weekends, Evenings (PST)",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          educationalBackground: "PhD in Applied Mathematics, MIT",
          languages: ["English", "Spanish"],
          isVerified: true,
          hourlyRate: 0, // Free mentorship
          isAvailableNow: false
        },
        {
          id: 2,
          name: "James Wilson",
          title: "Software Engineer",
          organization: "Google",
          expertise: ["computer science", "programming", "artificial intelligence"],
          location: "London, UK",
          rating: 4.7,
          totalStudents: 94,
          bio: "Tech industry professional passionate about sharing knowledge with the next generation of coders and computer scientists.",
          availability: "Weekdays after 6pm (GMT)",
          avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
          educationalBackground: "MSc Computer Science, Imperial College London",
          languages: ["English", "French"],
          isVerified: true,
          hourlyRate: 25,
          isAvailableNow: true
        },
        {
          id: 3,
          name: "Dr. Emily Chen",
          title: "Science Educator",
          organization: "National Science Foundation",
          expertise: ["biology", "chemistry", "environmental science"],
          location: "Boston, USA",
          rating: 4.8,
          totalStudents: 156,
          bio: "Dedicated to making science accessible and exciting for students at all levels. Specializes in biology and chemistry.",
          availability: "Flexible schedule",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
          educationalBackground: "PhD in Microbiology, Harvard University",
          languages: ["English", "Mandarin"],
          isVerified: true,
          hourlyRate: 0, // Free mentorship
          isAvailableNow: false
        },
        {
          id: 4,
          name: "Robert Garcia",
          title: "Literature Professor",
          organization: "Columbia University",
          expertise: ["literature", "creative writing", "literary analysis"],
          location: "New York, USA",
          rating: 4.6,
          totalStudents: 87,
          bio: "Award-winning author and professor helping students develop their writing skills and critical analysis.",
          availability: "Tuesday and Thursday afternoons (EST)",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
          educationalBackground: "PhD in English Literature, Oxford University",
          languages: ["English", "Spanish"],
          isVerified: true,
          hourlyRate: 30,
          isAvailableNow: false
        },
        {
          id: 5,
          name: "Akira Tanaka",
          title: "Physics Researcher",
          organization: "CERN",
          expertise: ["physics", "astrophysics", "quantum mechanics"],
          location: "Geneva, Switzerland",
          rating: 4.9,
          totalStudents: 62,
          bio: "Particle physicist with a passion for explaining complex scientific concepts in simple terms.",
          availability: "Weekends (CET)",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
          educationalBackground: "PhD in Theoretical Physics, University of Tokyo",
          languages: ["English", "Japanese", "French"],
          isVerified: true,
          hourlyRate: 0, // Free mentorship
          isAvailableNow: true
        }
      ];
    }
  });
  
  // Fetch active mentorships
  const { data: mentorships, isLoading: isLoadingMentorships } = useQuery<Mentorship[]>({
    queryKey: ["/api/student/mentorships"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // This simulates API data - in a real app this would be an actual API call
      return [
        {
          id: 1,
          mentorId: 1,
          mentorName: "Dr. Sarah Johnson",
          mentorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          startDate: new Date(2023, 8, 15),
          status: 'active',
          nextSessionDate: new Date(2023, 11, 10),
          subject: "Advanced Calculus",
          goals: ["Master differentiation techniques", "Understand multiple integrals", "Apply calculus to real-world problems"],
          progress: 65,
          notes: "Working on optimization problems this month",
          meetingLink: "https://meet.google.com/abc-defg-hij"
        },
        {
          id: 2,
          mentorId: 3,
          mentorName: "Dr. Emily Chen",
          mentorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
          startDate: new Date(2023, 6, 20),
          status: 'active',
          nextSessionDate: new Date(2023, 11, 15),
          subject: "Molecular Biology",
          goals: ["Understand DNA replication", "Learn about cell division", "Study protein synthesis"],
          progress: 80,
          notes: "Currently focusing on genetics",
          meetingLink: "https://zoom.us/j/123456789"
        }
      ];
    }
  });
  
  // Fetch upcoming sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: ["/api/student/mentorship-sessions"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // This simulates API data - in a real app this would be an actual API call
      return [
        {
          id: 1,
          mentorshipId: 1,
          mentorName: "Dr. Sarah Johnson",
          mentorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          date: new Date(2023, 11, 10, 15, 0), // December 10, 2023, 3:00 PM
          duration: 60,
          status: 'scheduled',
          notes: "Preparation: Review chapters 5-7 and come with questions",
          type: 'one-on-one',
          topic: "Integration techniques and applications",
          meetingLink: "https://meet.google.com/abc-defg-hij"
        },
        {
          id: 2,
          mentorshipId: 2,
          mentorName: "Dr. Emily Chen",
          mentorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
          date: new Date(2023, 11, 15, 14, 30), // December 15, 2023, 2:30 PM
          duration: 45,
          status: 'scheduled',
          type: 'one-on-one',
          topic: "Genetics and heredity",
          meetingLink: "https://zoom.us/j/123456789"
        },
        {
          id: 3,
          mentorshipId: 1,
          mentorName: "Dr. Sarah Johnson",
          mentorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          date: new Date(2023, 11, 24, 16, 0), // December 24, 2023, 4:00 PM
          duration: 60,
          status: 'scheduled',
          type: 'one-on-one',
          topic: "Exam preparation and review",
          meetingLink: "https://meet.google.com/abc-defg-hij"
        }
      ];
    }
  });
  
  // Filter mentors based on search and expertise
  const filteredMentors = mentors?.filter(mentor => {
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      mentor.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesExpertise = filterExpertise === "all" || mentor.expertise.includes(filterExpertise);
    
    return matchesSearch && matchesExpertise;
  }) || [];
  
  // Get list of all unique expertise areas
  const allExpertiseAreas = mentors 
    ? [...new Set(mentors.flatMap(mentor => mentor.expertise))]
    : [];
  
  // Format date and time
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };
  
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Calculate time until the session
  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    
    if (diff < 0) return "Past due";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hr${hours !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
  };
  
  // Open request dialog for a specific mentor
  const handleRequestMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowRequestDialog(true);
  };
  
  // Handle goal selection
  const handleGoalSelect = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };
  
  // Submit mentorship request
  const submitMentorshipRequest = useMutation({
    mutationFn: async () => {
      if (!selectedMentor) return;
      
      // In a real app, this would be an API call
      // const res = await apiRequest("POST", "/api/mentorship-requests", {
      //   mentorId: selectedMentor.id,
      //   notes: requestNotes,
      //   goals: selectedGoals
      // });
      // return await res.json();
      
      // Simulate success response
      return {
        success: true,
        message: "Request submitted successfully"
      };
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: `Your mentorship request has been sent to ${selectedMentor?.name}.`,
      });
      
      // Reset form and close dialog
      setShowRequestDialog(false);
      setSelectedMentor(null);
      setRequestNotes("");
      setSelectedGoals([]);
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to submit mentorship request",
        variant: "destructive",
      });
    }
  });
  
  // Common potential goals for mentorship
  const commonGoals = [
    "Improve academic performance",
    "Prepare for higher education",
    "Develop study skills",
    "Career guidance",
    "Subject-specific help",
    "College admission preparation",
    "Research project guidance",
    "Skill development"
  ];
  
  // Loading state
  const isLoading = isLoadingMentors || isLoadingMentorships || isLoadingSessions;
  
  if (isLoading) {
    return (
      <DashboardLayout title="Mentorship">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading mentorship data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Global Mentorship Network">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentorship</h1>
          <p className="text-muted-foreground mt-1">
            Connect with expert mentors from around the world
          </p>
        </div>
        
        {/* Mentorship overview dashboard */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Mentorships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {mentorships?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Ongoing mentoring relationships
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sessions?.filter(s => new Date(s.date) > new Date()).length || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Scheduled mentor meetings
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Next Session</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <>
                  <div className="font-medium">
                    {formatDateTime(sessions[0].date)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {getTimeUntil(sessions[0].date)} remaining
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">No upcoming sessions</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">My Mentorships</TabsTrigger>
            <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="find">Find Mentors</TabsTrigger>
          </TabsList>
          
          {/* Active Mentorships Tab */}
          <TabsContent value="active" className="space-y-6 mt-6">
            {mentorships && mentorships.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {mentorships.map((mentorship) => (
                  <Card key={mentorship.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={mentorship.mentorAvatar} />
                            <AvatarFallback>{mentorship.mentorName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl">{mentorship.mentorName}</CardTitle>
                            <CardDescription>{mentorship.subject}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={
                          mentorship.status === 'active' ? 'default' :
                          mentorship.status === 'pending' ? 'secondary' :
                          mentorship.status === 'completed' ? 'outline' :
                          'destructive'
                        }>
                          {mentorship.status.charAt(0).toUpperCase() + mentorship.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Goals:</div>
                          <ul className="text-sm space-y-1">
                            {mentorship.goals.map((goal, index) => (
                              <li key={index} className="flex items-start">
                                <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary" />
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Progress:</div>
                          <div className="h-2 w-full bg-muted rounded-full">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${mentorship.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {mentorship.progress}% complete
                          </div>
                        </div>
                        
                        {mentorship.nextSessionDate && (
                          <div className="flex justify-between text-sm">
                            <div>
                              <span className="font-medium">Next Session:</span>
                              <span className="ml-2">{formatDate(mentorship.nextSessionDate)}</span>
                            </div>
                            <div>
                              <span className="font-medium">Started:</span>
                              <span className="ml-2">{formatDate(mentorship.startDate)}</span>
                            </div>
                          </div>
                        )}
                        
                        {mentorship.notes && (
                          <div className="text-sm text-muted-foreground border-t pt-2 mt-2">
                            <span className="font-medium">Notes: </span>
                            {mentorship.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      {mentorship.meetingLink && (
                        <Button variant="default" className="flex-1">
                          <Video className="h-4 w-4 mr-2" />
                          Join Meeting
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No active mentorships</h3>
                <p className="mt-2 text-muted-foreground">
                  You haven't connected with any mentors yet. Find a mentor to get started.
                </p>
                <Button className="mt-4" onClick={() => document.getElementById('find-tab')?.click()}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Find a Mentor
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Upcoming Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6 mt-6">
            {sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions
                  .filter(session => new Date(session.date) > new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((session) => (
                    <Card key={session.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={session.mentorAvatar} />
                              <AvatarFallback>{session.mentorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle>Session with {session.mentorName}</CardTitle>
                              <CardDescription>{session.topic}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={
                            new Date(session.date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 
                              ? 'destructive' 
                              : 'outline'
                          }>
                            {new Date(session.date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 
                              ? 'Soon' 
                              : getTimeUntil(session.date)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{formatDateTime(session.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{session.duration} minutes</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Laptop className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{session.type === 'one-on-one' ? 'One-on-One Session' : session.type === 'group' ? 'Group Session' : 'Workshop'}</span>
                          </div>
                          
                          {session.notes && (
                            <div className="mt-2 text-muted-foreground border-t pt-2">
                              <span className="font-medium">Preparation: </span>
                              {session.notes}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="gap-2">
                        {session.meetingLink && (
                          <Button variant="default" className="flex-1">
                            <Video className="h-4 w-4 mr-2" />
                            Join Session
                          </Button>
                        )}
                        <Button variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Add to Calendar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No upcoming sessions</h3>
                <p className="mt-2 text-muted-foreground">
                  You don't have any mentorship sessions scheduled.
                </p>
                <Button className="mt-4" variant="outline">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Schedule a Session
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Find Mentors Tab */}
          <TabsContent id="find-tab" value="find" className="space-y-6 mt-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mentors..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select
                className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
              >
                <option value="all">All Areas of Expertise</option>
                {allExpertiseAreas.map((expertise) => (
                  <option key={expertise} value={expertise}>
                    {expertise.charAt(0).toUpperCase() + expertise.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Mentors Grid */}
            {filteredMentors.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMentors.map((mentor) => (
                  <Card key={mentor.id} className="overflow-hidden flex flex-col">
                    <div className={`h-1 w-full ${mentor.isAvailableNow ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <CardHeader>
                      <div className="flex justify-between mb-2">
                        <Avatar className="h-14 w-14 border-2 border-background">
                          <AvatarImage src={mentor.avatar} />
                          <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span className="ml-1 font-medium">{mentor.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{mentor.totalStudents} students</span>
                        </div>
                      </div>
                      <div>
                        <CardTitle className="flex items-center">
                          {mentor.name}
                          {mentor.isVerified && (
                            <Badge variant="secondary" className="ml-2">Verified</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {mentor.title} • {mentor.organization}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.expertise.map((exp, index) => (
                            <Badge key={index} variant="outline" className="capitalize">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-sm line-clamp-3">
                          {mentor.bio}
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{mentor.location}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{mentor.educationalBackground}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <BriefcaseBusiness className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{mentor.organization}</span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Languages: </span>
                          {mentor.languages.join(", ")}
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Availability: </span>
                          {mentor.availability}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="w-full flex justify-between items-center">
                        <div>
                          {mentor.hourlyRate === 0 ? (
                            <Badge variant="default" className="bg-green-600">Free</Badge>
                          ) : (
                            <div className="font-medium">
                              ${mentor.hourlyRate}/hour
                            </div>
                          )}
                        </div>
                        <Button onClick={() => handleRequestMentor(mentor)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Request Mentorship
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No mentors found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search filters or try again later.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Mentorship Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a mentorship request to {selectedMentor?.name}. Please provide details about what you're looking to learn.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMentor && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMentor.avatar} />
                  <AvatarFallback>{selectedMentor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedMentor.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedMentor.title}</div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="goals">
                  What are your learning goals? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonGoals.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleGoalSelect(goal)}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        selectedGoals.includes(goal)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="notes">
                  Additional Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Tell your potential mentor about your learning needs, background, and what you hope to achieve..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="resize-none"
                  rows={5}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  {selectedMentor.hourlyRate === 0 
                    ? 'This mentor offers free mentorship programs.'
                    : `This mentor charges $${selectedMentor.hourlyRate} per hour for mentorship sessions.`
                  }
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRequestDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => submitMentorshipRequest.mutate()}
              disabled={selectedGoals.length === 0 || submitMentorshipRequest.isPending}
            >
              {submitMentorshipRequest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}