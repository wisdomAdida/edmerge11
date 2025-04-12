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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter,
  UserPlus, 
  MessageSquare, 
  Mail, 
  Loader2, 
  Globe, 
  BookOpen,
  MoveRight
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Collaborator {
  id: number;
  name: string;
  email: string;
  role: string;
  institution: string;
  avatar?: string;
  expertise: string[];
  projects: number;
}

export default function ResearcherCollaboration() {
  const [activeTab, setActiveTab] = useState('network');
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  
  // Fetch collaborators data
  const { data: collaborators, isLoading, error } = useQuery<Collaborator[]>({
    queryKey: ['/api/researchers/collaborators'],
    retry: false,
    enabled: false, // Disable for now since we're using mock data
  });
  
  const mockCollaborators: Collaborator[] = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      email: "s.chen@research.edu",
      role: "Research Lead",
      institution: "Stanford University",
      expertise: ["Machine Learning", "Education Technology"],
      projects: 3
    },
    {
      id: 2,
      name: "Prof. Michael Johnson",
      email: "m.johnson@oxford.ac.uk",
      role: "Senior Researcher",
      institution: "Oxford University",
      expertise: ["Data Science", "Learning Analytics"],
      projects: 2
    },
    {
      id: 3,
      name: "Dr. Aisha Patel",
      email: "a.patel@mit.edu",
      role: "Researcher",
      institution: "MIT",
      expertise: ["AI Ethics", "Learning Design"],
      projects: 1
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      email: "j.wilson@california.edu",
      role: "Research Associate",
      institution: "University of California",
      expertise: ["Educational Psychology", "Student Assessment"],
      projects: 4
    }
  ];
  
  // Filter collaborators based on search term and institution filter
  const filteredCollaborators = mockCollaborators.filter(collaborator => {
    const matchesSearch = 
      collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesInstitution = 
      institutionFilter === 'all' || 
      collaborator.institution.toLowerCase() === institutionFilter.toLowerCase();
    
    return matchesSearch && matchesInstitution;
  });
  
  // Get unique institutions for filter dropdown
  const institutions = Array.from(new Set(mockCollaborators.map(c => c.institution)));
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Research Collaboration</h2>
              <p className="text-muted-foreground mt-1">
                Connect with researchers and collaborate on projects globally
              </p>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Find Collaborators
            </Button>
          </div>
          
          <Tabs defaultValue="network" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="network">Global Network</TabsTrigger>
              <TabsTrigger value="my-collaborators">My Collaborators</TabsTrigger>
              <TabsTrigger value="opportunities">Collaboration Opportunities</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="network" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Global Researcher Network</CardTitle>
                  <CardDescription>
                    Find and connect with researchers from across the world
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-auto flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search researchers by name, expertise..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                      <SelectTrigger className="w-full md:w-[250px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by institution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Institutions</SelectItem>
                        {institutions.map(institution => (
                          <SelectItem key={institution} value={institution}>{institution}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-4">
                    {filteredCollaborators.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No researchers found. Try adjusting your filters.</p>
                      </div>
                    ) : (
                      filteredCollaborators.map(collaborator => (
                        <div key={collaborator.id} className="border rounded-lg p-4 hover:border-primary transition-colors duration-200">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                                <AvatarFallback>{collaborator.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{collaborator.name}</h3>
                                <p className="text-sm text-muted-foreground">{collaborator.role} • {collaborator.institution}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 items-center">
                              <Badge variant="outline">
                                <BookOpen className="h-3.5 w-3.5 mr-1" />
                                {collaborator.projects} Projects
                              </Badge>
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                                <Button size="sm">
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Connect
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {collaborator.expertise.map(exp => (
                              <Badge key={exp} variant="secondary" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredCollaborators.length} of {mockCollaborators.length} researchers
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="my-collaborators" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Collaborators</CardTitle>
                  <CardDescription>
                    Researchers you're currently collaborating with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No active collaborations</h3>
                    <p className="text-muted-foreground mb-4">Connect with researchers to start collaborating on projects</p>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Collaborators
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Collaboration Opportunities</CardTitle>
                  <CardDescription>
                    Discover projects and research opportunities seeking collaborators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">AI-Enhanced Learning Methods Research</h3>
                          <p className="text-sm text-muted-foreground mt-1">Stanford University • Posted 2 days ago</p>
                          <p className="mt-2">Seeking collaborators with expertise in machine learning and educational psychology to join our research team investigating AI-enhanced learning methods.</p>
                        </div>
                        <div className="flex items-start">
                          <Button>
                            <MoveRight className="h-4 w-4 mr-2" />
                            Apply
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">Machine Learning</Badge>
                        <Badge variant="secondary">Educational Psychology</Badge>
                        <Badge variant="secondary">AI Ethics</Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">Cross-Cultural Education Research Initiative</h3>
                          <p className="text-sm text-muted-foreground mt-1">Oxford University • Posted 5 days ago</p>
                          <p className="mt-2">Looking for international collaborators to join our research on cross-cultural education methodologies and learning outcomes assessment.</p>
                        </div>
                        <div className="flex items-start">
                          <Button>
                            <MoveRight className="h-4 w-4 mr-2" />
                            Apply
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">Cross-Cultural</Badge>
                        <Badge variant="secondary">Learning Assessment</Badge>
                        <Badge variant="secondary">Comparative Education</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Research Messages</CardTitle>
                  <CardDescription>
                    Communicate with your research collaborators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-8 text-center">
                    <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p className="text-muted-foreground mb-4">Connect with researchers to start communicating</p>
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}