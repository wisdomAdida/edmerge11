import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Plus, Filter, ExternalLink, Tag, Calendar, MoreHorizontal } from 'lucide-react';
import { ResearchProject } from '@shared/schema';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

interface ResearchProjectsListProps {
  projects?: ResearchProject[];
}

export const ResearchProjectsList = ({ projects: propProjects }: ResearchProjectsListProps) => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: queryProjects, isLoading, error } = useQuery<ResearchProject[]>({
    queryKey: ['/api/research-projects/researcher'],
    retry: false,
    enabled: !propProjects,
  });
  
  const projects = propProjects || queryProjects;
  
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
          <CardTitle>Research Projects</CardTitle>
          <CardDescription>Error loading your research projects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There was an error loading your research projects. Please try again later.
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
  
  // Filter projects based on search term and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
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
  
  const handleCreateProject = () => {
    navigate('/researcher/projects/create');
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle>Research Projects</CardTitle>
          <CardDescription>View, filter and manage your research projects</CardDescription>
        </div>
        <Button size="sm" onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No projects found. Create a new project or adjust your filters.</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div 
                key={project.id} 
                className="border rounded-lg p-4 hover:border-primary transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(`/researcher/projects/${project.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={getStatusBadgeVariant(project.status || 'draft')} className="capitalize">
                      {project.status || 'Draft'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {project.category}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/researcher/projects/${project.id}`);
                        }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/researcher/projects/${project.id}/edit`);
                        }}>
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.collaborators && project.collaborators > 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Tag className="h-3.5 w-3.5 mr-1" />
                      {project.collaborators} collaborators
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Created: {formatDate(project.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      {filteredProjects.length > 0 && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </CardFooter>
      )}
    </Card>
  );
};