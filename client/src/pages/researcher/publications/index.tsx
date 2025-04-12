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
  Plus, 
  FileText, 
  Download, 
  Loader2, 
  ExternalLink,
  Calendar,
  Book,
  BarChart,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';

interface Publication {
  id: number;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: Date;
  abstract: string;
  url?: string;
  pdfUrl?: string;
  keywords: string[];
  citations: number;
  type: 'journal' | 'conference' | 'book' | 'preprint';
}

export default function ResearcherPublications() {
  const [activeTab, setActiveTab] = useState('my-publications');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Fetch publications data
  const { data: publications, isLoading, error } = useQuery<Publication[]>({
    queryKey: ['/api/researchers/publications'],
    retry: false,
    enabled: false, // Disable for now since we're using mock data
  });
  
  const mockPublications: Publication[] = [
    {
      id: 1,
      title: "AI-Driven Adaptive Learning Systems: A Comprehensive Review",
      authors: ["James Smith", "Sarah Johnson", "Your Name"],
      journal: "Journal of Educational Technology",
      publicationDate: new Date("2023-08-15"),
      abstract: "This paper provides a comprehensive review of AI-driven adaptive learning systems, examining their effectiveness, implementation challenges, and future directions.",
      url: "https://example.com/publication1",
      pdfUrl: "https://example.com/publication1.pdf",
      keywords: ["Adaptive Learning", "AI in Education", "Educational Technology"],
      citations: 12,
      type: 'journal'
    },
    {
      id: 2,
      title: "Machine Learning Approaches for Improving Student Engagement in Online Learning",
      authors: ["Your Name", "Michael Chen", "Lisa Wong"],
      journal: "International Conference on Learning Analytics",
      publicationDate: new Date("2024-01-10"),
      abstract: "This conference paper presents novel machine learning approaches to measure and improve student engagement in online learning environments.",
      url: "https://example.com/publication2",
      pdfUrl: "https://example.com/publication2.pdf",
      keywords: ["Machine Learning", "Student Engagement", "Online Learning"],
      citations: 5,
      type: 'conference'
    },
    {
      id: 3,
      title: "Multimodal Learning Analytics: Integrating Video, Audio, and Text Data",
      authors: ["Your Name", "Robert Jones"],
      journal: "Educational Data Mining Journal",
      publicationDate: new Date("2023-05-22"),
      abstract: "This paper presents a novel framework for integrating video, audio, and text data in learning analytics to provide deeper insights into student learning processes.",
      keywords: ["Multimodal Analytics", "Learning Analytics", "Data Integration"],
      citations: 8,
      type: 'journal'
    }
  ];
  
  // Filter publications based on search term and type filter
  const filteredPublications = mockPublications.filter(publication => {
    const matchesSearch = 
      publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publication.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publication.journal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publication.authors.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      publication.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = 
      typeFilter === 'all' || 
      publication.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
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
              <h2 className="text-3xl font-bold tracking-tight">Research Publications</h2>
              <p className="text-muted-foreground mt-1">
                Manage and discover research publications
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Publication
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPublications.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Journal Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockPublications.filter(p => p.type === 'journal').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Citations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockPublications.reduce((sum, pub) => sum + pub.citations, 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Array.from(new Set(mockPublications.flatMap(pub => pub.authors))).length - 1}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="my-publications" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="my-publications">My Publications</TabsTrigger>
              <TabsTrigger value="discover">Discover Research</TabsTrigger>
              <TabsTrigger value="metrics">Publication Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-publications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Research Publications</CardTitle>
                  <CardDescription>
                    Publications you've authored or co-authored
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-auto flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by title, keywords, journal..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="journal">Journal Articles</SelectItem>
                        <SelectItem value="conference">Conference Papers</SelectItem>
                        <SelectItem value="book">Book Chapters</SelectItem>
                        <SelectItem value="preprint">Preprints</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-4">
                    {filteredPublications.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No publications found. Try adjusting your filters or add a new publication.</p>
                      </div>
                    ) : (
                      filteredPublications.map(publication => (
                        <div key={publication.id} className="border rounded-lg p-4 hover:border-primary transition-colors duration-200">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                              <Badge variant="outline" className="capitalize">{publication.type}</Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <BarChart className="h-4 w-4" />
                                <span>{publication.citations} citations</span>
                              </div>
                            </div>
                            
                            <h3 className="font-semibold text-lg">{publication.title}</h3>
                            
                            <div className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                              <span>{publication.authors.join(", ")}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Book className="h-4 w-4" />
                              <span>{publication.journal}</span>
                              <span className="mx-1">•</span>
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(publication.publicationDate)}</span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{publication.abstract}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {publication.keywords.map(keyword => (
                                <Badge key={keyword} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              {publication.url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={publication.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View
                                  </a>
                                </Button>
                              )}
                              
                              {publication.pdfUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={publication.pdfUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredPublications.length} of {mockPublications.length} publications
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="discover" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Discover Research</CardTitle>
                  <CardDescription>
                    Find relevant research publications in your field
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-8 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">Research Discovery Coming Soon</h3>
                    <p className="text-muted-foreground mb-4">Our research discovery feature is under development</p>
                    <Button>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Academic Databases
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Publication Metrics</CardTitle>
                  <CardDescription>
                    Track the impact of your research publications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-8 text-center">
                    <BarChart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">Publication Metrics Coming Soon</h3>
                    <p className="text-muted-foreground mb-4">Our advanced metrics and analytics features are under development</p>
                    <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto text-left">
                      <div>
                        <p className="text-sm font-medium">Total Citations</p>
                        <p className="text-2xl font-bold">25</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">h-index</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">i10-index</p>
                        <p className="text-2xl font-bold">1</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Publications</p>
                        <p className="text-2xl font-bold">{mockPublications.length}</p>
                      </div>
                    </div>
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