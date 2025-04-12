import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Users, Calendar, Award, PenTool, BarChart, Clock, Check } from "lucide-react";
import { CourseEnrollmentStats } from "@/components/courses/CourseEnrollmentStats";

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = parseInt(id);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

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
    isLoading: isLoadingSections
  } = useQuery({
    queryKey: ["/api/courses", courseId, "sections"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${courseId}/sections`);
      return response.json();
    },
    enabled: !!courseId,
  });

  // Fetch course materials
  const {
    data: materials = [],
    isLoading: isLoadingMaterials
  } = useQuery({
    queryKey: ["/api/courses", courseId, "materials"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${courseId}/materials`);
      return response.json();
    },
    enabled: !!courseId,
  });

  // Fetch course enrollments count
  const {
    data: enrollmentStats,
    isLoading: isLoadingEnrollments
  } = useQuery({
    queryKey: ["/api/courses", courseId, "enrollments/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${courseId}/enrollments/stats`);
      return response.json();
    },
    enabled: !!courseId,
  });

  // If loading, show skeleton UI
  if (isLoadingCourse) {
    return (
      <DashboardLayout title="Course Details">
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-[300px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
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

  // Check if user has permission to view this course
  const canEdit = user && (user.id === course.tutorId || user.role === "admin");

  return (
    <DashboardLayout title={course.title}>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/tutor/courses")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        {canEdit && (
          <Button
            onClick={() => navigate(`/dashboard/tutor/courses/${courseId}/edit`)}
            variant="default"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div 
            className="w-full h-[300px] rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${course.coverImage || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80'})` }}
          >
            <div className="w-full h-full flex items-end bg-gradient-to-t from-black/60 to-transparent p-6 rounded-xl">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/70 hover:bg-primary/80">
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </Badge>
                  <Badge className="bg-secondary/70 hover:bg-secondary/80">
                    {course.category}
                  </Badge>
                  <Badge className={
                    course.status === "published" ? "bg-green-600/70 hover:bg-green-600/80" : 
                    course.status === "draft" ? "bg-amber-600/70 hover:bg-amber-600/80" : 
                    "bg-red-600/70 hover:bg-red-600/80"
                  }>
                    {course.status}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Course Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="text-sm font-medium">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Students</span>
                </div>
                <span className="text-sm font-medium">
                  {isLoadingEnrollments ? (
                    <Skeleton className="h-4 w-10" />
                  ) : (
                    enrollmentStats?.count || 0
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Sections</span>
                </div>
                <span className="text-sm font-medium">
                  {isLoadingSections ? (
                    <Skeleton className="h-4 w-10" />
                  ) : (
                    sections.length
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PenTool className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Materials</span>
                </div>
                <span className="text-sm font-medium">
                  {isLoadingMaterials ? (
                    <Skeleton className="h-4 w-10" />
                  ) : (
                    materials.length
                  )}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Pricing</span>
                </div>
                <span className="text-sm font-medium">
                  {course.isFree ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    `$${course.price.toFixed(2)}`
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Earnings</span>
                </div>
                <span className="text-sm font-medium">
                  {course.isFree ? (
                    "N/A"
                  ) : (
                    `$${((enrollmentStats?.earnings || 0) * 0.7).toFixed(2)}`
                  )}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => navigate(`/dashboard/tutor/courses/${courseId}/edit?tab=content`)}
                variant="secondary"
              >
                {sections.length === 0 ? "Add Content" : "Edit Content"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{course.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  course.status === "published" ? "bg-green-100" : 
                  course.status === "draft" ? "bg-amber-100" : 
                  "bg-red-100"
                }`}>
                  {course.status === "published" ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : course.status === "draft" ? (
                    <PenTool className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {course.status === "published" ? "Published" : 
                     course.status === "draft" ? "Draft" : "Archived"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {course.status === "published" ? 
                      "Your course is live and available for enrollment." : 
                     course.status === "draft" ? 
                      "Your course is saved as a draft and not visible to students." : 
                      "Your course is archived and not available for enrollment."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {course.status === "draft" && (
                <Button className="w-full" onClick={() => navigate(`/dashboard/tutor/courses/${courseId}/edit`)}>
                  Continue Editing
                </Button>
              )}
              {course.status === "published" && (
                <Button variant="secondary" className="w-full">
                  Unpublish Course
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {sections.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Content Added</CardTitle>
                <CardDescription>
                  This course doesn't have any content sections yet.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Start Creating Content</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Add sections and materials to your course using our intuitive drag-and-drop course builder.
                </p>
                <Button onClick={() => navigate(`/dashboard/tutor/courses/${courseId}/edit?tab=content`)}>
                  Create Course Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </span>
                      {section.title}
                    </CardTitle>
                    {section.description && (
                      <CardDescription>{section.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {materials
                        .filter(material => material.sectionId === section.id)
                        .sort((a, b) => a.order - b.order)
                        .map((material, materialIndex) => (
                          <div 
                            key={material.id}
                            className="flex items-center justify-between border rounded-md p-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">
                                {materialIndex + 1}
                              </span>
                              <div>
                                <h4 className="text-sm font-medium">{material.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                                  {material.duration ? ` • ${Math.floor(material.duration / 60)}:${String(material.duration % 60).padStart(2, '0')}` : ''}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {material.isRequired ? "Required" : "Optional"}
                            </Badge>
                          </div>
                        ))}
                      
                      {materials.filter(material => material.sectionId === section.id).length === 0 && (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No materials in this section
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => navigate(`/dashboard/tutor/courses/${courseId}/edit?tab=content`)} 
                  variant="outline"
                >
                  Edit Course Content
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                Manage students enrolled in your course.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEnrollments ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : enrollmentStats?.count === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Students Yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mx-auto">
                    Once students enroll in your course, you'll be able to manage them from here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {enrollmentStats?.count} Students Enrolled
                    </h3>
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="bg-muted/50 p-3 border-b grid grid-cols-12 text-sm font-medium">
                      <div className="col-span-1">#</div>
                      <div className="col-span-3">Student</div>
                      <div className="col-span-2">Enrolled</div>
                      <div className="col-span-2">Last Activity</div>
                      <div className="col-span-2">Progress</div>
                      <div className="col-span-2 text-right">Status</div>
                    </div>
                    <div className="divide-y">
                      {enrollmentStats?.recentEnrollments?.map((enrollment, index) => (
                        <div key={enrollment.id} className="p-3 grid grid-cols-12 text-sm items-center">
                          <div className="col-span-1 text-muted-foreground">{index + 1}</div>
                          <div className="col-span-3">
                            <div className="font-medium">Student #{enrollment.userId}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-muted-foreground">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-muted-foreground">
                              {new Date(enrollment.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Progress value={enrollment.progress} className="h-2" />
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round(enrollment.progress)}%
                            </div>
                          </div>
                          <div className="col-span-2 text-right">
                            <Badge variant={enrollment.isCompleted ? "outline" : "secondary"} className={enrollment.isCompleted ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                              {enrollment.isCompleted ? "Completed" : "In Progress"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CourseEnrollmentStats courseId={courseId} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}