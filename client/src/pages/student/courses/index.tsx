import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Search, 
  BookOpen, 
  Clock, 
  Star, 
  Filter,
  BookText,
  GraduationCap 
} from "lucide-react";

type Course = {
  id: number;
  tutorId: number;
  title: string;
  description: string;
  coverImage?: string;
  price: number;
  isFree: boolean;
  status: string;
  category: string;
  level: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties for UI display
  students?: number;
  rating?: number;
};

type Enrollment = {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  updatedAt: string;
  lastAccessed?: string;
  course?: Course;
};

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("enrolled");
  
  // Fetch enrolled courses
  const { data: enrollments = [], isLoading: isLoadingEnrolled } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
  });
  
  // Fetch all available courses
  const { data: coursesRaw = [], isLoading: isLoadingAll } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Fetching recommendations
  const { data: recommendedCoursesRaw = [], isLoading: isLoadingRecommended } = useQuery<Course[]>({
    queryKey: ["/api/courses/recommended"],
    enabled: user !== null, // Only fetch if user is logged in
  });
  
  // Query to get enrollment count for each course
  const { data: courseStats = {} } = useQuery<Record<number, { count: number, rating: string }>>({
    queryKey: ["/api/courses/stats"],
  });
  
  // Enhance courses with student count and ratings
  const courses = coursesRaw.map(course => ({
    ...course,
    students: courseStats[course.id]?.count || 0,
    rating: courseStats[course.id]?.rating || "4.0", // Default rating if none available
  }));
  
  const recommendedCourses = recommendedCoursesRaw.map(course => ({
    ...course,
    students: courseStats[course.id]?.count || 0,
    rating: courseStats[course.id]?.rating || "4.0", // Default rating if none available
  }));

  // Get enrolled course details by joining enrollment data with course data
  const enrolledCoursesWithDetails = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    return {
      ...enrollment,
      lastAccessed: enrollment.updatedAt, // Use updatedAt as lastAccessed time
      course: course || {
        id: enrollment.courseId,
        title: "Loading...",
        description: "Course details loading",
        category: "unknown",
        level: "unknown",
        isFree: false,
        price: 0,
        tutorId: 0,
        status: "unknown",
        createdAt: "",
        updatedAt: "",
        students: 0,
        rating: "0.0",
        coverImage: undefined
      }
    };
  });

  // Filter courses based on search query
  const filteredEnrolled = enrolledCoursesWithDetails.filter(enrollment => 
    enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enrollment.course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredAllCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredRecommended = recommendedCourses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to format category with proper capitalization
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (isLoadingEnrolled || isLoadingAll || isLoadingRecommended) {
    return (
      <DashboardLayout title="Courses">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading courses...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Courses">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground mt-1">
              Browse, enroll, and manage your educational journey
            </p>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Tabs for different course views */}
        <Tabs defaultValue="enrolled" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="enrolled">My Courses</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          
          {/* Enrolled Courses Tab */}
          <TabsContent value="enrolled" className="space-y-4">
            {filteredEnrolled.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEnrolled.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden">
                    {enrollment.course.coverImage && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={enrollment.course.coverImage} 
                          alt={enrollment.course.title} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                          }}
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Badge variant="outline">{formatCategory(enrollment.course.category)}</Badge>
                        <Badge>{enrollment.course.level}</Badge>
                      </div>
                      <CardTitle className="line-clamp-1 mt-2">{enrollment.course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {enrollment.course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="h-2 w-full bg-secondary rounded-full mb-2">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>{enrollment.progress}% completed</span>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span>{enrollment.lastAccessed ? new Date(enrollment.lastAccessed).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/dashboard/student/courses/${enrollment.courseId}`)}
                      >
                        Continue Learning
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No courses enrolled</h3>
                <p className="mt-2 text-muted-foreground">
                  You haven't enrolled in any courses yet. Browse the explore tab to find courses.
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("explore")}>
                  Explore Courses
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Explore Courses Tab */}
          <TabsContent value="explore" className="space-y-4">
            {filteredAllCourses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAllCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    {course.coverImage && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={course.coverImage} 
                          alt={course.title} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                          }}
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Badge variant="outline">{formatCategory(course.category)}</Badge>
                        <Badge>{course.level}</Badge>
                      </div>
                      <CardTitle className="line-clamp-1 mt-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <GraduationCap className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{course.students} students</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        {course.isFree ? (
                          <span className="text-emerald-600 font-medium">Free</span>
                        ) : (
                          <span className="font-medium">${course.price}</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/dashboard/student/courses/${course.id}`)}
                      >
                        View Course
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No courses found</h3>
                <p className="mt-2 text-muted-foreground">
                  We couldn't find any courses matching your search criteria.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Recommended Courses Tab */}
          <TabsContent value="recommended" className="space-y-4">
            {filteredRecommended.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecommended.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    {course.coverImage && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={course.coverImage} 
                          alt={course.title} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                          }}
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Badge variant="outline">{formatCategory(course.category)}</Badge>
                        <Badge>{course.level}</Badge>
                      </div>
                      <CardTitle className="line-clamp-1 mt-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <GraduationCap className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{course.students} students</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        {course.isFree ? (
                          <span className="text-emerald-600 font-medium">Free</span>
                        ) : (
                          <span className="font-medium">${course.price}</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/dashboard/student/courses/${course.id}`)}
                      >
                        View Course
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No recommendations yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Complete more courses to get personalized recommendations based on your interests.
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("explore")}>
                  Explore Courses
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}