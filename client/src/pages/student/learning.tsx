import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  Loader2, 
  Search, 
  Book, 
  FileText, 
  Clock, 
  GraduationCap, 
  BookOpen,
  Star,
  Bookmark,
  Library,
  Filter,
  CheckCircle2,
  BookmarkPlus,
  Eye,
  Download,
  Share,
  Calendar,
  ArrowUpRight,
  Brain,
  User,
  Users
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Type definitions
type Resource = {
  id: number;
  title: string;
  type: 'ebook' | 'video' | 'document' | 'article' | 'quiz';
  subject: string;
  coverImage?: string;
  author?: string;
  rating?: number;
  date: Date;
  isBookmarked: boolean;
  isCompleted: boolean;
  progress?: number;
  downloadUrl?: string;
  description: string;
};

type Subject = {
  id: string;
  name: string;
  resources: number;
  icon: React.ReactNode;
  color: string;
};

export default function LearningPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  
  // Fetch learning resources
  const { data: resources, isLoading: isLoadingResources } = useQuery<Resource[]>({
    queryKey: ["/api/learning/resources"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // Simulated API response
      return [
        {
          id: 1,
          title: "Introduction to Calculus",
          type: 'ebook',
          subject: 'mathematics',
          coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
          author: "Dr. Sarah Johnson",
          rating: 4.8,
          date: new Date(2023, 5, 15),
          isBookmarked: true,
          isCompleted: false,
          progress: 35,
          downloadUrl: "/resources/intro-to-calculus.pdf",
          description: "A comprehensive introduction to differential and integral calculus covering limits, derivatives, and integrals with practical examples."
        },
        {
          id: 2,
          title: "The Cell Structure and Function",
          type: 'document',
          subject: 'biology',
          coverImage: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8",
          author: "Prof. Michael Chen",
          rating: 4.5,
          date: new Date(2023, 7, 10),
          isBookmarked: false,
          isCompleted: true,
          downloadUrl: "/resources/cell-structure.pdf",
          description: "Detailed examination of cell biology, including organelles, cell membrane, and cellular processes."
        },
        {
          id: 3,
          title: "World History: Modern Era",
          type: 'video',
          subject: 'history',
          coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1",
          author: "Dr. Emily Rodriguez",
          rating: 4.7,
          date: new Date(2023, 8, 5),
          isBookmarked: true,
          isCompleted: false,
          progress: 75,
          description: "Video lecture series covering major historical events and movements from the 18th century to present day."
        },
        {
          id: 4,
          title: "Chemical Bonding and Molecular Structure",
          type: 'article',
          subject: 'chemistry',
          coverImage: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
          author: "Prof. James Wilson",
          rating: 4.6,
          date: new Date(2023, 6, 20),
          isBookmarked: false,
          isCompleted: false,
          progress: 20,
          description: "Comprehensive article on different types of chemical bonds, molecular geometry, and hybridization."
        },
        {
          id: 5,
          title: "Physics Mechanics Quiz",
          type: 'quiz',
          subject: 'physics',
          coverImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
          author: "Dr. Robert Lee",
          rating: 4.9,
          date: new Date(2023, 9, 12),
          isBookmarked: true,
          isCompleted: false,
          description: "Self-assessment quiz covering Newton's laws, kinematics, dynamics, and conservation laws."
        },
        {
          id: 6,
          title: "English Literature: Shakespeare",
          type: 'ebook',
          subject: 'literature',
          coverImage: "https://images.unsplash.com/photo-1629992101753-56d196c8aabb",
          author: "Dr. Lisa Thompson",
          rating: 4.7,
          date: new Date(2023, 5, 25),
          isBookmarked: false,
          isCompleted: false,
          progress: 40,
          downloadUrl: "/resources/shakespeare-literature.pdf",
          description: "Comprehensive analysis of Shakespeare's major works, themes, and literary significance."
        }
      ];
    }
  });
  
  // Fetch recent activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery<any[]>({
    queryKey: ["/api/learning/activity"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // Simulated API response
      return [
        {
          id: 1,
          type: 'opened',
          resource: "Introduction to Calculus",
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          progress: 35
        },
        {
          id: 2,
          type: 'completed',
          resource: "The Cell Structure and Function",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
        {
          id: 3,
          type: 'bookmarked',
          resource: "World History: Modern Era",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        }
      ];
    }
  });
  
  // Define subjects
  const subjects: Subject[] = [
    { id: 'mathematics', name: 'Mathematics', resources: 15, icon: <div className="bg-blue-100 p-2 rounded-full"><Book className="h-4 w-4 text-blue-600" /></div>, color: 'bg-blue-100 text-blue-600' },
    { id: 'biology', name: 'Biology', resources: 12, icon: <div className="bg-green-100 p-2 rounded-full"><Book className="h-4 w-4 text-green-600" /></div>, color: 'bg-green-100 text-green-600' },
    { id: 'physics', name: 'Physics', resources: 10, icon: <div className="bg-amber-100 p-2 rounded-full"><Book className="h-4 w-4 text-amber-600" /></div>, color: 'bg-amber-100 text-amber-600' },
    { id: 'chemistry', name: 'Chemistry', resources: 8, icon: <div className="bg-red-100 p-2 rounded-full"><Book className="h-4 w-4 text-red-600" /></div>, color: 'bg-red-100 text-red-600' },
    { id: 'history', name: 'History', resources: 9, icon: <div className="bg-orange-100 p-2 rounded-full"><Book className="h-4 w-4 text-orange-600" /></div>, color: 'bg-orange-100 text-orange-600' },
    { id: 'literature', name: 'Literature', resources: 7, icon: <div className="bg-purple-100 p-2 rounded-full"><Book className="h-4 w-4 text-purple-600" /></div>, color: 'bg-purple-100 text-purple-600' },
  ];
  
  // Filter resources based on search, subject, and type
  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = !activeSubject || resource.subject === activeSubject;
    const matchesType = !activeType || resource.type === activeType;
    
    return matchesSearch && matchesSubject && matchesType;
  }) || [];
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    return formatDate(date);
  };
  
  // Get icon based on resource type
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <BookOpen className="h-4 w-4" />;
      case 'video':
        return <Eye className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'article':
        return <Book className="h-4 w-4" />;
      case 'quiz':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Get badge variant based on resource type
  const getResourceTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'ebook':
        return 'default';
      case 'video':
        return 'secondary';
      case 'document':
        return 'outline';
      case 'article':
        return 'destructive';
      case 'quiz':
        return 'success';
      default:
        return 'outline';
    }
  };
  
  // Handle view resource
  const handleViewResource = (resourceId: number) => {
    navigate(`/dashboard/student/learning/resource/${resourceId}`);
  };
  
  if (isLoadingResources) {
    return (
      <DashboardLayout title="Learning Resources">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading learning resources...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Learning">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Resources</h1>
            <p className="text-muted-foreground mt-1">
              Explore educational materials, books, videos, and more
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4" />
              Bookmarked
            </Button>
            <Button className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Connect to Library
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search learning resources..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={activeSubject ? "default" : "outline"} 
              className="flex items-center gap-2"
              onClick={() => setActiveSubject(activeSubject ? null : subjects[0].id)}
            >
              <Book className="h-4 w-4" />
              Subject
              {activeSubject && <Badge variant="outline" className="ml-2">{subjects.find(s => s.id === activeSubject)?.name}</Badge>}
            </Button>
            
            <Button 
              variant={activeType ? "default" : "outline"} 
              className="flex items-center gap-2"
              onClick={() => setActiveType(activeType ? null : 'ebook')}
            >
              <Filter className="h-4 w-4" />
              Type
              {activeType && <Badge variant="outline" className="ml-2">{activeType}</Badge>}
            </Button>
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with subjects and activity */}
          <div className="lg:col-span-1 space-y-6">
            {/* Subjects list */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Library className="h-5 w-5 mr-2" />
                  Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <nav className="space-y-1">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer ${
                        activeSubject === subject.id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setActiveSubject(activeSubject === subject.id ? null : subject.id)}
                    >
                      <div className="flex items-center">
                        {subject.icon}
                        <span className="ml-2">{subject.name}</span>
                      </div>
                      <Badge variant="outline">{subject.resources}</Badge>
                    </div>
                  ))}
                </nav>
              </CardContent>
            </Card>
            
            {/* Recent activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                {isLoadingActivity ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentActivity?.map((activity) => (
                      <div key={activity.id} className="flex items-center p-2 rounded-md hover:bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                          {activity.type === 'opened' && <Eye className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {activity.type === 'bookmarked' && <Bookmark className="h-4 w-4 text-amber-500" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              {activity.type === 'opened' && 'Studied'}
                              {activity.type === 'completed' && 'Completed'}
                              {activity.type === 'bookmarked' && 'Bookmarked'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs font-medium">{activity.resource}</p>
                          
                          {activity.progress && (
                            <div className="w-full space-y-1">
                              <Progress value={activity.progress} className="h-1" />
                              <span className="text-xs text-muted-foreground">{activity.progress}% complete</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                        View All Activity
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Main resources grid */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Resources</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-0">
                {filteredResources.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredResources.map((resource) => (
                      <Card key={resource.id} className="overflow-hidden h-full flex flex-col">
                        {resource.coverImage && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img 
                              src={resource.coverImage} 
                              alt={resource.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                              }}
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <Badge variant={getResourceTypeBadgeVariant(resource.type)}>
                              <div className="flex items-center gap-1">
                                {getResourceTypeIcon(resource.type)}
                                <span className="capitalize">{resource.type}</span>
                              </div>
                            </Badge>
                            {resource.isBookmarked && (
                              <Bookmark className="h-4 w-4 fill-current text-amber-500" />
                            )}
                          </div>
                          <CardTitle className="line-clamp-1 mt-2 text-base">{resource.title}</CardTitle>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className={`${
                              subjects.find(s => s.id === resource.subject)?.color || 'bg-gray-100 text-gray-600'
                            }`}>
                              {resource.subject}
                            </Badge>
                            {resource.rating && (
                              <div className="flex items-center ml-2 text-xs text-muted-foreground">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                                {resource.rating}
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2 flex-1">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                          
                          {resource.progress !== undefined && (
                            <div className="w-full space-y-1 mt-4">
                              <div className="flex justify-between items-center text-xs">
                                <span>Progress</span>
                                <span>{resource.progress}%</span>
                              </div>
                              <Progress value={resource.progress} className="h-1" />
                            </div>
                          )}
                          
                          {resource.author && (
                            <div className="mt-4 flex items-center text-xs text-muted-foreground">
                              <User className="h-3 w-3 mr-1" />
                              {resource.author}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="pt-2 border-t flex justify-between">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleViewResource(resource.id)}
                          >
                            {resource.progress !== undefined ? 'Continue' : 'Start Learning'}
                          </Button>
                          
                          <div className="flex gap-1">
                            {resource.downloadUrl && (
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Library className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No resources found</h3>
                    <p className="mt-2 text-muted-foreground">
                      We couldn't find any learning resources matching your criteria.
                    </p>
                    <Button className="mt-4" onClick={() => {
                      setSearchQuery("");
                      setActiveSubject(null);
                      setActiveType(null);
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="in-progress" className="mt-0">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResources
                    .filter(resource => resource.progress !== undefined && resource.progress > 0 && resource.progress < 100)
                    .map((resource) => (
                      <Card key={resource.id} className="overflow-hidden h-full flex flex-col">
                        {/* Same card content as above, rendered for in-progress resources */}
                        {resource.coverImage && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img 
                              src={resource.coverImage} 
                              alt={resource.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                              }}
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <Badge variant={getResourceTypeBadgeVariant(resource.type)}>
                              <div className="flex items-center gap-1">
                                {getResourceTypeIcon(resource.type)}
                                <span className="capitalize">{resource.type}</span>
                              </div>
                            </Badge>
                            {resource.isBookmarked && (
                              <Bookmark className="h-4 w-4 fill-current text-amber-500" />
                            )}
                          </div>
                          <CardTitle className="line-clamp-1 mt-2 text-base">{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2 flex-1">
                          <div className="w-full space-y-1 mt-2">
                            <div className="flex justify-between items-center text-xs">
                              <span>Progress</span>
                              <span>{resource.progress}%</span>
                            </div>
                            <Progress value={resource.progress} className="h-1" />
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 border-t">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleViewResource(resource.id)}
                          >
                            Continue Learning
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="bookmarked" className="mt-0">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResources
                    .filter(resource => resource.isBookmarked)
                    .map((resource) => (
                      <Card key={resource.id} className="overflow-hidden h-full flex flex-col">
                        {/* Same card content as above, rendered for bookmarked resources */}
                        {resource.coverImage && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img 
                              src={resource.coverImage} 
                              alt={resource.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                              }}
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <Badge variant={getResourceTypeBadgeVariant(resource.type)}>
                              <div className="flex items-center gap-1">
                                {getResourceTypeIcon(resource.type)}
                                <span className="capitalize">{resource.type}</span>
                              </div>
                            </Badge>
                            <Bookmark className="h-4 w-4 fill-current text-amber-500" />
                          </div>
                          <CardTitle className="line-clamp-1 mt-2 text-base">{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2 flex-1">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-2 border-t">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleViewResource(resource.id)}
                          >
                            View Resource
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResources
                    .filter(resource => resource.isCompleted)
                    .map((resource) => (
                      <Card key={resource.id} className="overflow-hidden h-full flex flex-col">
                        {/* Same card content as above, rendered for completed resources */}
                        {resource.coverImage && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img 
                              src={resource.coverImage} 
                              alt={resource.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                              }}
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <Badge variant={getResourceTypeBadgeVariant(resource.type)}>
                              <div className="flex items-center gap-1">
                                {getResourceTypeIcon(resource.type)}
                                <span className="capitalize">{resource.type}</span>
                              </div>
                            </Badge>
                            <Badge variant="outline" className="bg-green-100 text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                          <CardTitle className="line-clamp-1 mt-2 text-base">{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2 flex-1">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleViewResource(resource.id)}
                          >
                            Review Again
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Learning Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Learning Statistics
            </CardTitle>
            <CardDescription>
              Track your learning progress and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">
                  {resources?.filter(r => r.isCompleted).length || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Resources Completed
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">
                  {resources?.filter(r => r.progress !== undefined && r.progress > 0 && r.progress < 100).length || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  In Progress
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">
                  {resources?.filter(r => r.isBookmarked).length || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Bookmarked
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">
                  12
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Learning Hours
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}