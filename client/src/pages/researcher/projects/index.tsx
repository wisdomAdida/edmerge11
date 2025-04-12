import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResearchProjectsList } from '@/components/research/ResearchProjectsList';
import { ResearchSummary } from '@/components/research/ResearchSummary';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

interface ResearchProjectsProps {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  collaborators: number;
}

export default function ResearcherProjects() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: researchStats, isLoading, error } = useQuery<ResearchProjectsProps>({
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
            <CardTitle>Error Loading Projects</CardTitle>
            <CardDescription>
              There was a problem loading your research projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try refreshing the page or contact support if the issue persists.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  const stats = {
    totalProjects: researchStats?.totalProjects || 0,
    activeProjects: researchStats?.activeProjects || 0,
    completedProjects: researchStats?.completedProjects || 0,
    collaborators: researchStats?.collaborators || 0
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Research Projects</h2>
              <p className="text-muted-foreground mt-1">
                Manage your research projects and collaborations
              </p>
            </div>
            <Button onClick={() => navigate('/researcher/projects/create')}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedProjects}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.collaborators}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Projects List */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <ResearchProjectsList />
            </TabsContent>
            
            <TabsContent value="active" className="space-y-4">
              <ResearchProjectsList />
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              <ResearchProjectsList />
            </TabsContent>
            
            <TabsContent value="draft" className="space-y-4">
              <ResearchProjectsList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}