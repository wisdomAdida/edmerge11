import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseSectionBuilder } from "@/components/courses/CourseSectionBuilder";
import { CourseDetailsForm } from "@/components/courses/CourseDetailsForm";
import { CoursePreview } from "@/components/courses/CoursePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function EditCoursePage() {
  const { id } = useParams();
  const courseId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch course details
  const { 
    data: course, 
    isLoading: isLoadingCourse,
    isError: isCourseError
  } = useQuery({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${courseId}`);
      return await response.json();
    },
    enabled: !!courseId,
  });

  // Fetch course sections
  const {
    data: sections = [],
    isLoading: isLoadingSections,
    isError: isSectionsError
  } = useQuery({
    queryKey: ["/api/courses", courseId, "sections"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${courseId}/sections`);
      return response.json();
    },
    enabled: !!courseId,
  });

  // Save course details mutation
  const saveCourse = useMutation({
    mutationFn: async (courseData: any) => {
      const response = await apiRequest("PUT", `/api/courses/${courseId}`, courseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId] });
      toast({
        title: "Course updated",
        description: "Your course has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating course:", error);
    }
  });

  // Check course ownership
  useEffect(() => {
    if (course && user && course.tutorId !== user.id && user.role !== "admin") {
      toast({
        title: "Access denied",
        description: "You do not have permission to edit this course.",
        variant: "destructive",
      });
      navigate("/dashboard/tutor/courses");
    }
  }, [course, user, navigate, toast]);

  // Handle course details save
  const handleSaveCourseDetails = async (formData: any) => {
    setIsSaving(true);
    try {
      await saveCourse.mutateAsync(formData);
    } finally {
      setIsSaving(false);
    }
  };

  // If loading, show skeleton UI
  if (isLoadingCourse) {
    return (
      <DashboardLayout title="Edit Course">
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // If course not found or error
  if (isCourseError || !course) {
    return (
      <DashboardLayout title="Course Not Found">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <h2 className="text-2xl font-semibold">Course Not Found</h2>
          <p className="text-muted-foreground">
            The course you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/dashboard/tutor/courses")}>
            Back to Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Edit Course: ${course.title}`}>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/tutor/courses")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <Button
          onClick={() => navigate(`/dashboard/tutor/courses/${courseId}`)}
          variant="outline"
        >
          View Course
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="content">Content Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <CourseDetailsForm 
            initialData={course} 
            onSave={handleSaveCourseDetails}
            isLoading={isSaving}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {isLoadingSections ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <CourseSectionBuilder 
              courseId={courseId} 
              initialSections={sections} 
            />
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <CoursePreview course={course} sections={sections} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}