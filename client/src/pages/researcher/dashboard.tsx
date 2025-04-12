import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Separator } from '@/components/ui/separator';
import { ResearchProjectsList } from '@/components/research/ResearchProjectsList';
import { ResearchSummary } from '@/components/research/ResearchSummary';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AITutorSection } from '@/components/dashboard/AITutorSection';

export default function ResearcherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/researchers/stats'],
    retry: false
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

  if (error) {
    return (
      <DashboardLayout>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
            <CardDescription>
              There was a problem loading your researcher dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try refreshing the page or contact support if the issue persists.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  const researchQuestions = [
    'How can I improve my research methodology?',
    'What are the best practices for literature review?',
    'How to find collaborators for my research project?',
    'What tools can help with data analysis for my research?',
    'How to write a compelling research paper abstract?',
    'What are some effective strategies for research time management?'
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Researcher Dashboard</h2>
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                <ResearchSummary />
              </div>
              
              <h3 className="text-xl font-semibold mt-6">Your Recent Projects</h3>
              <Separator />
              
              <div className="grid gap-4">
                <ResearchProjectsList />
              </div>
            </TabsContent>
            
            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4">
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>Research Projects Dashboard</CardTitle>
                    <CardDescription>Manage and track all your research projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex flex-col p-4 border rounded-lg">
                        <span className="text-muted-foreground text-sm">Total Projects</span>
                        <span className="text-2xl font-bold">{stats?.totalProjects || 0}</span>
                      </div>
                      <div className="flex flex-col p-4 border rounded-lg">
                        <span className="text-muted-foreground text-sm">Active</span>
                        <span className="text-2xl font-bold">{stats?.activeProjects || 0}</span>
                      </div>
                      <div className="flex flex-col p-4 border rounded-lg">
                        <span className="text-muted-foreground text-sm">Completed</span>
                        <span className="text-2xl font-bold">{stats?.completedProjects || 0}</span>
                      </div>
                      <div className="flex flex-col p-4 border rounded-lg">
                        <span className="text-muted-foreground text-sm">Collaborators</span>
                        <span className="text-2xl font-bold">{stats?.totalCollaborators || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <ResearchProjectsList />
              </div>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <RecentActivity />
              </div>
            </TabsContent>
            
            <TabsContent value="ai-assistant" className="space-y-4">
              <div className="grid gap-4">
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>AI Research Assistant</CardTitle>
                    <CardDescription>Ask questions about research methodology, tools, and best practices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AITutorSection suggestedQuestions={researchQuestions} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}