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
  Search, 
  Filter,
  Download, 
  Loader2, 
  ExternalLink,
  FileText,
  GraduationCap,
  BookOpen,
  Database,
  Share2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'dataset' | 'article' | 'tool' | 'course';
  url: string;
  category: string;
  tags: string[];
  isFeatured?: boolean;
}

export default function ResearcherResources() {
  const [activeTab, setActiveTab] = useState('datasets');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Fetch resources data
  const { data: resources, isLoading, error } = useQuery<Resource[]>({
    queryKey: ['/api/researchers/resources'],
    retry: false,
    enabled: false, // Disable for now since we're using mock data
  });
  
  const mockResources: Resource[] = [
    // Datasets
    {
      id: 1,
      title: "Educational Data Mining Dataset Collection",
      description: "A comprehensive collection of datasets for educational data mining research, including student performance, engagement, and learning outcomes.",
      type: "dataset",
      url: "https://example.com/edm-datasets",
      category: "Student Performance",
      tags: ["Education", "Data Mining", "Student Analytics"],
      isFeatured: true
    },
    {
      id: 2,
      title: "Global Education Statistics Dataset",
      description: "Comprehensive global education statistics from over 200 countries, including enrollment rates, literacy, educational attainment, and more.",
      type: "dataset",
      url: "https://example.com/global-education-stats",
      category: "Global Education",
      tags: ["Global", "Statistics", "Education Policy"]
    },
    {
      id: 3,
      title: "Learning Management System Interaction Logs",
      description: "Anonymized dataset of student interactions with learning management systems across multiple courses and institutions.",
      type: "dataset",
      url: "https://example.com/lms-logs",
      category: "Learning Analytics",
      tags: ["LMS", "Interaction Data", "Learning Analytics"]
    },
    
    // Research Tools
    {
      id: 4,
      title: "EduAnalytics Pro",
      description: "Advanced analytics tool specifically designed for educational data, featuring statistical analysis, visualization, and machine learning capabilities.",
      type: "tool",
      url: "https://example.com/eduanalytics",
      category: "Analytics",
      tags: ["Analytics", "Visualization", "Research Tools"],
      isFeatured: true
    },
    {
      id: 5,
      title: "Research Collaboration Platform",
      description: "All-in-one platform for research collaboration, including project management, document sharing, and version control for academic research.",
      type: "tool",
      url: "https://example.com/research-collab",
      category: "Collaboration",
      tags: ["Collaboration", "Project Management", "Version Control"]
    },
    
    // Articles & Resources
    {
      id: 6,
      title: "Best Practices for Educational Research Methods",
      description: "Comprehensive guide to research methodologies in education, covering qualitative, quantitative, and mixed methods approaches.",
      type: "article",
      url: "https://example.com/edu-research-methods",
      category: "Research Methods",
      tags: ["Methodology", "Best Practices", "Research Design"],
      isFeatured: true
    },
    {
      id: 7,
      title: "Guide to Securing Research Funding",
      description: "Step-by-step guide to finding and securing funding for educational research projects, including grant writing tips and funding source directories.",
      type: "article",
      url: "https://example.com/research-funding-guide",
      category: "Research Funding",
      tags: ["Funding", "Grants", "Research Support"]
    },
    
    // Courses
    {
      id: 8,
      title: "Advanced Research Methods in Education",
      description: "Online course covering advanced research methodologies specifically for educational researchers, including data collection, analysis, and interpretation.",
      type: "course",
      url: "https://example.com/advanced-research-methods",
      category: "Methodology",
      tags: ["Course", "Research Methods", "Professional Development"],
      isFeatured: true
    },
    {
      id: 9,
      title: "Statistical Analysis for Educational Research",
      description: "Comprehensive course on statistical methods and tools specifically for educational research contexts.",
      type: "course",
      url: "https://example.com/edu-statistics",
      category: "Statistics",
      tags: ["Statistics", "Data Analysis", "SPSS", "R"]
    }
  ];
  
  // Filter resources based on active tab, search term, and category filter
  const filteredResources = mockResources.filter(resource => {
    // Filter by tab (resource type)
    const matchesTab = 
      (activeTab === 'all') ||
      (activeTab === 'datasets' && resource.type === 'dataset') ||
      (activeTab === 'tools' && resource.type === 'tool') ||
      (activeTab === 'articles' && resource.type === 'article') ||
      (activeTab === 'courses' && resource.type === 'course');
    
    // Filter by search term
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category
    const matchesCategory = 
      categoryFilter === 'all' || 
      resource.category === categoryFilter;
    
    return matchesTab && matchesSearch && matchesCategory;
  });
  
  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(mockResources.map(resource => resource.category)));
  
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
              <h2 className="text-3xl font-bold tracking-tight">Research Resources</h2>
              <p className="text-muted-foreground mt-1">
                Discover datasets, tools, and resources for your research
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="datasets" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Resources</TabsTrigger>
              <TabsTrigger value="datasets">Datasets</TabsTrigger>
              <TabsTrigger value="tools">Research Tools</TabsTrigger>
              <TabsTrigger value="articles">Articles & Guides</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mt-6">
              <div className="relative w-full md:w-auto flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {renderResourceCards(filteredResources)}
              </div>
            </TabsContent>
            
            <TabsContent value="datasets" className="mt-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {renderResourceCards(filteredResources)}
              </div>
            </TabsContent>
            
            <TabsContent value="tools" className="mt-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {renderResourceCards(filteredResources)}
              </div>
            </TabsContent>
            
            <TabsContent value="articles" className="mt-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {renderResourceCards(filteredResources)}
              </div>
            </TabsContent>
            
            <TabsContent value="courses" className="mt-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {renderResourceCards(filteredResources)}
              </div>
            </TabsContent>
          </Tabs>
          
          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
  
  function renderResourceCards(resources: Resource[]) {
    return resources.map(resource => (
      <Card key={resource.id} className={`overflow-hidden ${resource.isFeatured ? 'border-primary' : ''}`}>
        <CardHeader className="relative">
          <div className="absolute top-4 right-4">
            {resource.isFeatured && (
              <Badge className="absolute top-0 right-0">Featured</Badge>
            )}
          </div>
          <div className="mb-2">
            {renderResourceTypeIcon(resource.type)}
          </div>
          <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
          <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="capitalize">{resource.type}</Badge>
            <Badge variant="secondary" className="capitalize">{resource.category}</Badge>
            {resource.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Resource
            </a>
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    ));
  }
  
  function renderResourceTypeIcon(type: string) {
    switch (type) {
      case 'dataset':
        return <Database className="h-8 w-8 text-primary" />;
      case 'tool':
        return <FileText className="h-8 w-8 text-primary" />;
      case 'article':
        return <BookOpen className="h-8 w-8 text-primary" />;
      case 'course':
        return <GraduationCap className="h-8 w-8 text-primary" />;
      default:
        return <FileText className="h-8 w-8 text-primary" />;
    }
  }
}