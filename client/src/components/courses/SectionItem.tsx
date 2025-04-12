import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MaterialItem } from "@/components/courses/MaterialItem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { CourseSection, CourseMaterial } from "@shared/schema";
import { Grip, MoreHorizontal, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SectionItemProps {
  id: string;
  section: CourseSection;
  materials: CourseMaterial[];
  onAddMaterial?: () => void;
  isDragging?: boolean;
}

export function SectionItem({ id, section, materials, onAddMaterial, isDragging = false }: SectionItemProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
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
    zIndex: isDragging ? 1 : 0,
  };

  // Edit section schema and form
  const formSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.title,
      description: section.description || "",
    },
  });

  // Update section mutation
  const updateSection = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/courses/sections/${section.id}`, data);
      return response.json();
    },
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", section.courseId, "sections"] });
      toast({
        title: "Section updated",
        description: "The section has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update section. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete section mutation
  const deleteSection = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/courses/sections/${section.id}`);
      return response.status === 200;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", section.courseId, "sections"] });
      toast({
        title: "Section deleted",
        description: "The section and all its content have been deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete section. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle section edit form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateSection.mutate(data);
  };

  // Handle section deletion
  const handleDelete = () => {
    deleteSection.mutate();
  };

  // Toggle section expansion
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`border ${isDragging || isSorting ? 'border-primary' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-muted-foreground hover:text-foreground"
              >
                <Grip className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleExpand}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Section
                        </DropdownMenuItem>
                        {onAddMaterial && (
                          <DropdownMenuItem onClick={onAddMaterial}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Material
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Section
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {section.description && (
                  <CardDescription className="mt-1">{section.description}</CardDescription>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <>
            <Separator />
            
            <CardContent className="pt-4">
              <div className="space-y-2">
                {materials.length > 0 ? (
                  <SortableContext
                    items={materials.map(material => `material-${material.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {materials.map((material) => (
                      <MaterialItem
                        key={material.id}
                        id={`material-${material.id}`}
                        material={material}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No materials added to this section yet
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter>
              {onAddMaterial && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={onAddMaterial}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              )}
            </CardFooter>
          </>
        )}
      </Card>

      {/* Edit section dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update the details of this section.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter section title" {...field} />
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
                        placeholder="Enter section description"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateSection.isPending}>
                  {updateSection.isPending ? "Saving..." : "Save Changes"}
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
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This will also delete all materials in this section. This action cannot be undone.
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
              disabled={deleteSection.isPending}
            >
              {deleteSection.isPending ? "Deleting..." : "Delete Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}