import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

// Edit form schema
const editProjectSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  status: z.enum(["draft", "active", "completed", "on_hold"]),
});

type FormValues = z.infer<typeof editProjectSchema>;

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

export default function EditResearchProject() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/researcher/projects/:id/edit');
  const projectId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch project data
  const { data: project, isLoading, error } = useQuery<ResearchProject>({
    queryKey: [`/api/research-projects/${projectId}`],
    enabled: !!projectId,
    retry: false,
  });
  
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      status: 'draft',
    },
    values: project ? {
      title: project.title,
      description: project.description,
      category: project.category,
      status: project.status,
    } : undefined,
  });
  
  // Update project mutation
  const updateProject = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('PATCH', `/api/research-projects/${projectId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/research-projects/researcher'] });
      queryClient.invalidateQueries({ queryKey: [`/api/research-projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/researchers/stats'] });
      
      // Show success message and navigate
      toast({
        title: "Project updated",
        description: "Your research project has been updated successfully.",
      });
      
      navigate(`/researcher/projects/${projectId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update project",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });
  
  // Delete project mutation
  const deleteProject = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/research-projects/${projectId}`);
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/research-projects/researcher'] });
      queryClient.invalidateQueries({ queryKey: ['/api/researchers/stats'] });
      
      // Show success message and navigate
      toast({
        title: "Project deleted",
        description: "Your research project has been deleted successfully.",
      });
      
      navigate('/researcher/projects');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete project",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    },
  });
  
  // Handle form submission
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    updateProject.mutate(data);
  };
  
  // Handle project deletion
  const handleDelete = () => {
    setIsDeleting(true);
    deleteProject.mutate();
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
  
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate(`/researcher/projects/${projectId}`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Edit Research Project</h2>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    research project and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Project'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <Separator />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Edit the information about your research project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear and concise title that describes your research project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A detailed description of your research project, objectives, and approach
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Research Category</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            The primary field or category of your research
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Status</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select project status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            The current status of your research project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/researcher/projects/${projectId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}