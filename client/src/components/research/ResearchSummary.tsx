import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Loader2, FileText, Users, Beaker } from 'lucide-react';
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

interface ResearchProject {
  id: number;
  title: string;
  description: string;
  status: string;
  category: string;
  collaborators: number;
  tags?: string[];
}

export const ResearchSummary = () => {
  const [, navigate] = useLocation();
  
  const { data: projects, isLoading, error } = useQuery<ResearchProject[]>({
    queryKey: ['/api/research-projects/researcher'],
    retry: false
  });

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !projects) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Research Projects Summary</CardTitle>
          <CardDescription>Error loading your research data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There was an error loading your research project data. Please try again later.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const draftProjects = projects.filter(p => p.status === 'draft').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;
  const totalCollaborators = projects.reduce((sum, project) => sum + (project.collaborators || 0), 0);

  // Calculate completion percentage (active projects / total projects)
  const completionPercentage = totalProjects > 0 
    ? Math.round((completedProjects / totalProjects) * 100) 
    : 0;

  return (
    <>
      {/* Summary Stats */}
      <Card className="col-span-3 sm:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Projects
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeProjects} active, {completedProjects} completed
          </p>
        </CardContent>
      </Card>
      
      <Card className="col-span-3 sm:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Collaborators
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCollaborators}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {projects.filter(p => p.collaborators > 0).length} projects
          </p>
        </CardContent>
      </Card>
      
      <Card className="col-span-3 sm:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Project Status
          </CardTitle>
          <Beaker className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
          <Progress value={completionPercentage} className="mt-2" />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Project Status Breakdown</CardTitle>
          <CardDescription>
            Overview of your research projects by status
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-muted-foreground mb-1">Draft</div>
              <div className="font-bold text-xl">{draftProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalProjects > 0 ? Math.round((draftProjects / totalProjects) * 100) : 0}% of total
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium text-muted-foreground mb-1">Active</div>
              <div className="font-bold text-xl">{activeProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0}% of total
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium text-muted-foreground mb-1">Completed</div>
              <div className="font-bold text-xl">{completedProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% of total
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium text-muted-foreground mb-1">On Hold</div>
              <div className="font-bold text-xl">{onHoldProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalProjects > 0 ? Math.round((onHoldProjects / totalProjects) * 100) : 0}% of total
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => navigate('/researcher/projects')}
          >
            View All Projects
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};