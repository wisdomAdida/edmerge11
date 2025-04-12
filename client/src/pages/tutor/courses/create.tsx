import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCourseSchema, studentLevelEnum } from "@shared/schema";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft } from "lucide-react";

// Course creation schema
const courseSchema = insertCourseSchema.extend({
  confirmPrice: z.number().optional(),
}).refine((data) => {
  if (!data.isFree && data.price === undefined) {
    return false;
  }
  return true;
}, {
  message: "Price is required for paid courses",
  path: ["price"],
}).refine((data) => {
  if (!data.isFree && data.price !== undefined && data.confirmPrice !== undefined) {
    return data.price === data.confirmPrice;
  }
  return true;
}, {
  message: "Price confirmation does not match",
  path: ["confirmPrice"],
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CreateCoursePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with default values
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "primary",
      isFree: true,
      price: 0,
      coverImage: "",
      status: "draft",
    },
  });

  // Set tutorId when user data is available
  useEffect(() => {
    if (user?.id) {
      form.setValue('tutorId', user.id);
    }
  }, [user, form]);

  // Watch for isFree value to conditionally show/hide price fields
  const isFree = form.watch("isFree");

  const onSubmit = async (data: CourseFormValues) => {
    setIsLoading(true);
    try {
      // Ensure we have a tutorId from the authenticated user
      if (!user?.id) {
        throw new Error("You must be logged in as a tutor to create a course");
      }
      
      // Remove the confirm price field before submitting
      const { confirmPrice, ...courseData } = data;
      
      // Ensure tutorId is set
      courseData.tutorId = user.id;
      
      console.log("Submitting course data:", courseData);
      
      // API request to create course
      const response = await apiRequest("POST", "/api/courses", courseData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Course creation failed:", response.status, errorData);
        throw new Error(`Failed with status ${response.status}: ${errorData.message || 'Unknown error'}`);
      }
      
      const course = await response.json();
      console.log("Course created successfully:", course);
      
      // Invalidate courses cache to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      toast({
        title: "Course created",
        description: `"${data.title}" has been created successfully.`,
      });
      
      // Redirect directly to tutor dashboard instead of course details page
      navigate(`/dashboard/tutor`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create New Course">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => navigate("/dashboard/tutor/courses")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Button>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Provide the basic information about your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Introduction to Mathematics" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a clear and descriptive title for your course.
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
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what students will learn in this course..." 
                        className="resize-none" 
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a comprehensive description of your course content, learning outcomes, and target audience.
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
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics, Science, Language" {...field} />
                      </FormControl>
                      <FormDescription>
                        The subject category of your course.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="tertiary">Tertiary</SelectItem>
                          <SelectItem value="individual">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The education level your course is designed for.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL for your course cover image. Recommended size: 1280x720px.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set the pricing for your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Free Course</FormLabel>
                      <FormDescription>
                        Make this course available for free
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
              
              {!isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Price (USD)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="e.g., 29.99" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value === "" ? undefined : parseFloat(e.target.value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Set the price for your course in USD. You will receive 85% of this amount after platform fees.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Price (USD)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="Re-enter the price" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value === "" ? undefined : parseFloat(e.target.value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Re-enter the price to confirm.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
              <CardDescription>
                Choose whether to publish your course immediately or save it as a draft.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft - Save for later</SelectItem>
                        <SelectItem value="published">Published - Make available immediately</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Draft courses are only visible to you. Published courses are available for enrollment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Course...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </DashboardLayout>
  );
}