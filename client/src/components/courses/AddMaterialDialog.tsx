import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const materialSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  type: z.enum(["video", "document", "pdf", "quiz", "assignment", "link"]),
  url: z.string().url({ message: "Please enter a valid URL" }),
  duration: z.number().min(0).optional(),
  isRequired: z.boolean().default(false),
  thumbnailUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (material: MaterialFormValues) => void;
  sectionId: number | null;
  sectionTitle: string;
  isLoading?: boolean;
}

export function AddMaterialDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  sectionId,
  sectionTitle,
  isLoading = false
}: AddMaterialDialogProps) {
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "video",
      url: "",
      duration: 0,
      isRequired: true,
      thumbnailUrl: "",
    },
  });

  // Watch for material type to conditionally show fields
  const materialType = form.watch("type");

  const onSubmit = (data: MaterialFormValues) => {
    onAdd(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when dialog is closed
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Material to {sectionTitle}</DialogTitle>
          <DialogDescription>
            Add learning material to this section.
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
                    <Input placeholder="e.g., Introduction Video, Lecture Notes" {...field} />
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
                      placeholder="Provide a brief description of this material"
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
                  <FormDescription>
                    {materialType === "video" && "Upload or link to a video lecture or demonstration"}
                    {materialType === "document" && "A document or presentation file"}
                    {materialType === "pdf" && "A PDF file for reading materials"}
                    {materialType === "quiz" && "Interactive quiz or test"}
                    {materialType === "assignment" && "Homework or assignment for students"}
                    {materialType === "link" && "Link to external resource or website"}
                  </FormDescription>
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
                    {materialType === "video" && "URL to the video (YouTube, Vimeo, etc.)"}
                    {materialType === "document" && "URL to the document file"}
                    {materialType === "pdf" && "URL to the PDF file"}
                    {materialType === "quiz" && "URL to the quiz or assessment"}
                    {materialType === "assignment" && "URL to the assignment details or submission page"}
                    {materialType === "link" && "URL to the external resource"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {materialType === "video" && (
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
                    URL to an image that will be used as a thumbnail
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
                      Students must complete this material to progress
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !sectionId}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Material"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}