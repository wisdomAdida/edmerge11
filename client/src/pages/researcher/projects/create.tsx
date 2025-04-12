import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { insertResearchProjectSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

// Extend the insert schema to include validation rules
const createResearchProjectSchema = insertResearchProjectSchema.extend({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  fundingSource: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
});

// Create a type from our schema
type CreateResearchProjectForm = z.infer<typeof createResearchProjectSchema>;

export default function CreateResearchProject() {
  const [, navigate] = useLocation();
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Initialize the form
  const form = useForm<CreateResearchProjectForm>({
    resolver: zodResolver(createResearchProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      status: 'draft',
      tags: [],
      isPublic: false,
      allowCollaborators: true,
      startDate: null,
      endDate: null,
      fundingSource: '',
      budget: 0,
    },
  });
  
  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateResearchProjectForm) => {
      const response = await apiRequest('POST', '/api/research-projects', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-projects/researcher'] });
      queryClient.invalidateQueries({ queryKey: ['/api/researchers/stats'] });
      
      toast({
        title: 'Project Created',
        description: 'Your research project has been created successfully.',
      });
      
      navigate('/researcher/projects');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create project: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleAddTag = () => {
    if (newTagInput.trim() && !newTags.includes(newTagInput.trim())) {
      const updatedTags = [...newTags, newTagInput.trim()];
      setNewTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = newTags.filter(t => t !== tag);
    setNewTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  const onSubmit = (data: CreateResearchProjectForm) => {
    createProjectMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => navigate('/researcher/projects')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Create Research Project</h2>
              <p className="text-muted-foreground">
                Create a new research project to collaborate with others
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Provide the basic information about your research project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Enter project title" 
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your research project in detail" 
                  rows={5}
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => form.setValue('category', value)}
                    defaultValue={form.getValues('category')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Social Sciences">Social Sciences</SelectItem>
                      <SelectItem value="Natural Sciences">Natural Sciences</SelectItem>
                      <SelectItem value="Arts & Humanities">Arts & Humanities</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    onValueChange={(value) => form.setValue('status', value)}
                    defaultValue={form.getValues('status')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add tags" 
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>Add</Button>
                </div>
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTags.map((tag, index) => (
                      <div key={index} className="bg-muted text-muted-foreground px-2 py-1 rounded-md flex items-center gap-1">
                        {tag}
                        <button 
                          type="button" 
                          className="text-muted-foreground hover:text-foreground" 
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Additional information about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker 
                    onChange={(date) => form.setValue('startDate', date)} 
                    value={form.getValues('startDate')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <DatePicker 
                    onChange={(date) => form.setValue('endDate', date)} 
                    value={form.getValues('endDate')}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fundingSource">Funding Source</Label>
                  <Input 
                    id="fundingSource" 
                    placeholder="e.g., National Science Foundation" 
                    {...form.register('fundingSource')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...form.register('budget', { valueAsNumber: true })}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isPublic" 
                    checked={form.getValues('isPublic')}
                    onCheckedChange={(checked) => form.setValue('isPublic', checked as boolean)}
                  />
                  <Label htmlFor="isPublic">Make this project public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowCollaborators" 
                    checked={form.getValues('allowCollaborators')}
                    onCheckedChange={(checked) => form.setValue('allowCollaborators', checked as boolean)}
                  />
                  <Label htmlFor="allowCollaborators">Allow collaborators to join this project</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/researcher/projects')}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending}
                className="ml-auto"
              >
                {createProjectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Project
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}