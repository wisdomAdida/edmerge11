import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Loader2, Users, Clock, Pencil, Tag, Link, Calendar, ArrowLeft, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ResearchProject, ResearchCollaborator } from '@shared/schema';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResearchWorkspaceComponent } from '@/components/research/ResearchWorkspace';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ResearchProjectView() {
  const [, params] = useRoute('/researcher/projects/:id');
  const [, navigate] = useLocation();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  
  const projectId = params?.id ? parseInt(params.id, 10) : null;
  
  // Fetch project data
  const { data: project, isLoading, error } = useQuery<ResearchProject>({
    queryKey: ['/api/research-projects', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await apiRequest('GET', `/api/research-projects/${projectId}`);
      return response.json();
    },
    enabled: !!projectId,
  });
  
  // Fetch collaborators
  const { data: collaborators, isLoading: collaboratorsLoading } = useQuery<ResearchCollaborator[]>({
    queryKey: ['/api/research-collaborators', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await apiRequest('GET', `/api/research-collaborators?projectId=${projectId}`);
      return response.json();
    },
    enabled: !!projectId,
  });
  
  // Invite collaborator mutation
  const inviteCollaboratorMutation = useMutation({
    mutationFn: async (data: { email: string; role: string; projectId: number }) => {
      const response = await apiRequest('POST', '/api/research-collaborators/invite', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-collaborators', projectId] });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      toast({
        title: 'Invitation Sent',
        description: 'The collaborator has been invited to join your project.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to invite collaborator: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle invite collaborator
  const handleInviteCollaborator = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!projectId) return;
    
    inviteCollaboratorMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
      projectId,
    });
  };
  
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 pt-6">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/researcher/projects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Project</CardTitle>
              <CardDescription>
                There was a problem loading this research project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>The project you're looking for might not exist or you may not have permission to view it.</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => navigate('/researcher/projects')}
              >
                Return to Projects
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 mt-1"
              onClick={() => navigate('/researcher/projects')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{project.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {project.status || 'Draft'}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {project.category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/researcher/projects/${projectId}/edit`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-line">{project.description}</p>
                
                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="capitalize">{project.status || 'Draft'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p>{project.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                      <p>{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">End Date</p>
                      <p>{formatDate(project.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Visibility</p>
                      <p>{project.isPublic ? 'Public' : 'Private'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Collaboration</p>
                      <p>{project.allowCollaborators ? 'Allowed' : 'Restricted'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Funding Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Funding Source</p>
                      <p>{project.fundingSource || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Budget</p>
                      <p>{project.budget ? `$${project.budget.toLocaleString()}` : 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="workspace">
            <ResearchWorkspaceComponent projectId={projectId} />
          </TabsContent>
          
          <TabsContent value="collaborators">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Collaborators</CardTitle>
                  <CardDescription>People working on this research project</CardDescription>
                </div>
                
                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Collaborator</DialogTitle>
                      <DialogDescription>
                        Invite someone to collaborate on your research project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          placeholder="Enter email address"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                          id="role"
                          className="w-full border rounded-md px-3 py-2"
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleInviteCollaborator}
                        disabled={inviteCollaboratorMutation.isPending}
                      >
                        {inviteCollaboratorMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Inviting...
                          </>
                        ) : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {collaboratorsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : collaborators && collaborators.length > 0 ? (
                  <div className="divide-y">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {collaborator.user?.firstName?.[0] || 'U'}
                              {collaborator.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {collaborator.user?.firstName} {collaborator.user?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {collaborator.user?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="capitalize">
                            {collaborator.role || 'Viewer'}
                          </Badge>
                          <p className="text-xs text-muted-foreground ml-4">
                            Joined {formatDate(collaborator.joinedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No collaborators yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Invite people to collaborate on your research project
                    </p>
                    <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Collaborators
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
                <CardDescription>
                  Track your project's progress and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Analytics coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    We're working on comprehensive analytics for your research projects
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}