import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  Filter,
  BookOpen,
  Bookmark,
  FileText,
  Video,
  Headphones,
  Download,
  ExternalLink,
  Share2,
  Clock,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Resource type
type Resource = {
  id: number;
  title: string;
  description: string;
  type: 'ebook' | 'article' | 'video' | 'audio' | 'document';
  subject: string;
  coverImage?: string;
  url?: string;
  fileSize?: string;
  dateAdded: Date;
  isBookmarked: boolean;
  isCompleted: boolean;
};

export default function LibraryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceType, setResourceType] = useState("all");
  const [subject, setSubject] = useState("all");
  
  // Fetch library resources
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/student/library"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // This simulates API data - in a real app this would be an actual API call
      return [
        {
          id: 1,
          title: "Mathematics Fundamentals",
          description: "Core concepts in mathematics for primary education",
          type: "ebook",
          subject: "mathematics",
          coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
          fileSize: "8.5 MB",
          dateAdded: new Date(2023, 5, 15),
          isBookmarked: true,
          isCompleted: false
        },
        {
          id: 2,
          title: "Introduction to Photosynthesis",
          description: "Learn how plants convert light energy into chemical energy",
          type: "video",
          subject: "science",
          coverImage: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc",
          url: "https://example.com/photosynthesis-video",
          dateAdded: new Date(2023, 6, 3),
          isBookmarked: false,
          isCompleted: true
        },
        {
          id: 3,
          title: "The Solar System",
          description: "Explore the planets, moons, and other celestial bodies in our solar system",
          type: "article",
          subject: "science",
          coverImage: "https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700",
          dateAdded: new Date(2023, 7, 21),
          isBookmarked: true,
          isCompleted: false
        },
        {
          id: 4,
          title: "Basic Grammar Rules",
          description: "Essential grammar rules for clear and effective writing",
          type: "document",
          subject: "language",
          fileSize: "2.3 MB",
          dateAdded: new Date(2023, 8, 7),
          isBookmarked: false,
          isCompleted: false
        },
        {
          id: 5,
          title: "World History Timeline",
          description: "A comprehensive timeline of major historical events",
          type: "ebook",
          subject: "history",
          coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1",
          fileSize: "12.7 MB",
          dateAdded: new Date(2023, 9, 14),
          isBookmarked: false,
          isCompleted: false
        },
        {
          id: 6,
          title: "Storytelling Techniques",
          description: "Learn the art of effective storytelling",
          type: "audio",
          subject: "language",
          coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618",
          url: "https://example.com/storytelling-audio",
          dateAdded: new Date(2023, 10, 2),
          isBookmarked: false,
          isCompleted: false
        }
      ];
    }
  });

  // Filter resources based on search, type, and subject
  const filteredResources = resources?.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = resourceType === "all" || resource.type === resourceType;
    const matchesSubject = subject === "all" || resource.subject === subject;
    
    return matchesSearch && matchesType && matchesSubject;
  }) || [];

  // Get bookmarked resources
  const bookmarkedResources = resources?.filter(r => r.isBookmarked) || [];
  
  // Resource type icon mapping
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <BookOpen className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Resource subjects
  const subjects = ['mathematics', 'science', 'language', 'history', 'art', 'music'];
  
  if (isLoading) {
    return (
      <DashboardLayout title="Library">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading library resources...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Resource Library">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Resources</h1>
            <p className="text-muted-foreground mt-1">
              Access your educational materials and references
            </p>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Resource Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Filter Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setResourceType("all")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResourceType("ebook")}>
                eBooks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResourceType("article")}>
                Articles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResourceType("video")}>
                Videos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResourceType("audio")}>
                Audio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResourceType("document")}>
                Documents
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Subject
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Filter Subject</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSubject("all")}>
                All Subjects
              </DropdownMenuItem>
              {subjects.map((s) => (
                <DropdownMenuItem key={s} onClick={() => setSubject(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Tabs for resource categories */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>
          
          {/* All Resources Tab */}
          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredResources.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No resources found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Bookmarked Tab */}
          <TabsContent value="bookmarked" className="space-y-4 mt-6">
            {bookmarkedResources.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookmarkedResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No bookmarked resources</h3>
                <p className="mt-2 text-muted-foreground">
                  Bookmark resources to save them for quick access.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Recent Tab */}
          <TabsContent value="recent" className="space-y-4 mt-6">
            {resources && resources.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...resources]
                  .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime())
                  .slice(0, 6)
                  .map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No recent resources</h3>
                <p className="mt-2 text-muted-foreground">
                  Check back later for newly added resources.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Resource Card Component
function ResourceCard({ resource }: { resource: Resource }) {
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <BookOpen className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };
  
  // Subject badge color
  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'mathematics':
        return 'bg-blue-100 text-blue-800';
      case 'science':
        return 'bg-green-100 text-green-800';
      case 'language':
        return 'bg-purple-100 text-purple-800';
      case 'history':
        return 'bg-amber-100 text-amber-800';
      case 'art':
        return 'bg-pink-100 text-pink-800';
      case 'music':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="overflow-hidden flex flex-col">
      {resource.coverImage ? (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={resource.coverImage} 
            alt={resource.title} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/640x360?text=Learning+Resource";
            }}
          />
        </div>
      ) : (
        <div className="aspect-video w-full flex items-center justify-center bg-muted">
          {getResourceTypeIcon(resource.type)}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge 
            variant="outline" 
            className="capitalize"
          >
            {resource.type}
          </Badge>
          
          <div className="flex items-center gap-1">
            {resource.isBookmarked && (
              <Badge variant="secondary">
                <Bookmark className="h-3 w-3 mr-1 fill-current" />
                Bookmarked
              </Badge>
            )}
            {resource.isCompleted && (
              <Badge variant="default" className="bg-green-600">
                <Check className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
        
        <CardTitle className="mt-2 text-xl">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="flex justify-between text-sm">
          <Badge className={`text-xs ${getSubjectColor(resource.subject)}`}>
            {resource.subject.charAt(0).toUpperCase() + resource.subject.slice(1)}
          </Badge>
          
          {resource.fileSize && (
            <div className="text-muted-foreground text-xs">
              Size: {resource.fileSize}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <Clock className="inline h-3 w-3 mr-1" />
          Added: {new Date(resource.dateAdded).toLocaleDateString()}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          {resource.url ? (
            <Button variant="outline" className="flex-1" asChild>
              <Link href={resource.url} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          
          <Button variant="secondary" className="flex-1">
            <Bookmark className={`h-4 w-4 mr-2 ${resource.isBookmarked ? 'fill-current' : ''}`} />
            {resource.isBookmarked ? 'Saved' : 'Save'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}