import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  Edit,
  ExternalLink,
  FileText,
  Loader2,
  Tag,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

interface ResearchProject {
  id: number;
  title: string;
  description: string;
  status: string;
  category: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  collaborators: number;
  researcherId: number;
}

export default function ResearchProjectDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/researcher/projects/:id');
  const projectId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: project, isLoading, error } = useQuery<ResearchProject>({
    queryKey: [`/api/research-projects/${projectId}`],
    enabled: !!projectId,
    retry: false,
  });
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !project) {
    return (
      <DashboardLayout>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Error Loading Project</CardTitle>
            <CardDescription>
              There was a problem loading the research project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try refreshing the page or contact support if the issue persists.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/researcher/projects')}
            >
              Return to Projects
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  const getStatusBadgeVariant = (status: string | null) => {
    if (!status) return 'outline';
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'draft': return 'secondary';
      case 'on_hold': return 'outline';
      default: return 'outline';
    }
  };
  
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/researcher/projects')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{project.title}</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center mt-2">
            <Badge variant={getStatusBadgeVariant(project.status)} className="capitalize">
              {project.status || 'Draft'}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {project.category}
            </Badge>
            {project.tags && project.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="ml-auto"
              onClick={() => navigate(`/researcher/projects/${projectId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
          
          <Separator />
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                  <CardDescription>
                    Basic information about this research project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-muted-foreground mt-2 whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                      <p>{project.category}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                      <p className="capitalize">{project.status}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                      <p>{formatDate(project.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                      <p>{formatDate(project.updatedAt)}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Collaborators</h4>
                      <p>{project.collaborators || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="collaborators" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Collaborators</CardTitle>
                  <CardDescription>
                    Researchers and collaborators working on this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No collaborators yet</h3>
                    <p className="text-muted-foreground mb-4">Invite researchers to collaborate on this project</p>
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Invite Collaborators
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Documents</CardTitle>
                  <CardDescription>
                    Research papers, data sets, and documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-8 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                    <p className="text-muted-foreground mb-4">Upload research papers, datasets, or other documents</p>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Activity</CardTitle>
                  <CardDescription>
                    Recent activity and changes to this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-8 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                    <p className="text-muted-foreground">Activity will be tracked once work begins on this project</p>
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