import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { CourseMaterial } from "@shared/schema";
import { 
  Grip, MoreHorizontal, Pencil, Trash2, FileText, VideoIcon, 
  FileQuestion, LinkIcon, FileIcon, Download, ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MaterialItemProps {
  id: string;
  material: CourseMaterial;
  isDragging?: boolean;
}

export function MaterialItem({ id, material, isDragging = false }: MaterialItemProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSorting ? 0.4 : 1,
  };

  // Material editing schema
  const formSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().optional(),
    type: z.string(),
    url: z.string().url({ message: "Please enter a valid URL" }),
    duration: z.number().min(0).optional(),
    isRequired: z.boolean().default(false),
    thumbnailUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: material.title,
      description: material.description || "",
      type: material.type,
      url: material.url,
      duration: material.duration || 0,
      isRequired: material.isRequired,
      thumbnailUrl: material.thumbnailUrl || "",
    },
  });

  // Update material mutation
  const updateMaterial = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/courses/materials/${material.id}`, data);
      return response.json();
    },
    onSuccess: (updatedMaterial) => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", material.courseId, "materials"] });
      toast({
        title: "Material updated",
        description: "The material has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update material. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete material mutation
  const deleteMaterial = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/courses/materials/${material.id}`);
      return response.status === 200;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", material.courseId, "materials"] });
      toast({
        title: "Material deleted",
        description: "The material has been deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete material. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle material edit form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateMaterial.mutate(data);
  };

  // Handle material deletion
  const handleDelete = () => {
    deleteMaterial.mutate();
  };

  // Get material type icon
  const getTypeIcon = () => {
    switch (material.type) {
      case 'video':
        return <VideoIcon className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'pdf':
        return <FileIcon className="h-4 w-4" />;
      case 'quiz':
        return <FileQuestion className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Format duration for display
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`flex items-center p-3 ${isDragging || isSorting ? 'border-primary' : ''}`}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground mr-3"
        >
          <Grip className="h-4 w-4" />
        </div>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="p-1.5 rounded-md bg-muted">
            {getTypeIcon()}
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-medium">{material.title}</h4>
            {material.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{material.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {material.duration && formatDuration(material.duration) && (
              <Badge variant="outline" className="text-xs">
                {formatDuration(material.duration)}
              </Badge>
            )}
            
            {material.isRequired && (
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsPreviewDialogOpen(true)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Material
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(material.url, '_blank')}>
                  <Download className="mr-2 h-4 w-4" />
                  Open URL
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Material
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Edit material dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Update the details of this learning material.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter material title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a brief description"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/content" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to the content (video link, document, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("type") === "video" && (
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="Duration in seconds"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)} 
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormDescription>
                        Length of the video in seconds (e.g., 300 for 5 minutes)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional thumbnail image URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Required Material</FormLabel>
                      <FormDescription>
                        Mark as required for course completion
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMaterial.isPending}>
                  {updateMaterial.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{material.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMaterial.isPending}
            >
              {deleteMaterial.isPending ? "Deleting..." : "Delete Material"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{material.title}</DialogTitle>
            {material.description && (
              <DialogDescription>{material.description}</DialogDescription>
            )}
          </DialogHeader>
          
          <div className="mt-2">
            {material.type === 'video' && (
              <div className="aspect-video rounded-md bg-muted overflow-hidden">
                {material.url.includes('youtube.com') || material.url.includes('youtu.be') ? (
                  <iframe
                    src={material.url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={material.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <a 
                      href={material.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open video in new tab
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {material.type === 'pdf' && (
              <div className="aspect-video rounded-md bg-muted overflow-hidden flex items-center justify-center">
                <a 
                  href={material.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View PDF
                </a>
              </div>
            )}
            
            {(material.type === 'link' || material.type === 'document' || material.type === 'assignment') && (
              <div className="p-6 rounded-md bg-muted flex items-center justify-center">
                <a 
                  href={material.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open {material.type === 'link' ? 'link' : material.type} in new tab
                </a>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => setIsPreviewDialogOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={() => window.open(material.url, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Original
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}