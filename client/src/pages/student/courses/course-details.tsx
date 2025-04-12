import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { purchaseCourse } from "@/lib/flutterwave";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Video,
  BookOpen,
  Users,
  Download,
  Lock,
  PlayCircle,
  CheckCircle,
  Clock,
  User,
  Loader2,
  BrainCircuit
} from "lucide-react";
import {
  LivePolling,
  AITutorChat,
  OfflineAccess
} from "@/components/interactive-learning";
import { CourseChatRoom } from "@/components/chat/CourseChatRoom";
import { CourseAIHelper } from "@/components/courses/CourseAIHelper";

// Interface for course data
interface CourseData {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  tutorId: number;
  isFree: boolean;
  price: number;
  coverImage: string;
  objectives: string[];
  resources: {
    title: string;
    type: string;
    url: string;
  }[];
}

// Interface for module content
interface ModuleContent {
  id: number;
  title: string;
  moduleItems: {
    id: number;
    title: string;
    type: string;
    duration?: string;
    fileSize?: string;
    completed: boolean;
    locked: boolean;
  }[];
  completedCount: number;
  totalItems: number;
}

// Interface for tutor data
interface TutorData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  bio: string;
}

// Interface for course stats
interface CourseStats {
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  averageDuration: string;
}

// Interface for enrollment data
interface EnrollmentData {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  updatedAt: string;
  lastAccessed: string;
}

// Interface for upcoming session
interface UpcomingSession {
  id: number;
  title: string;
  type: string;
  dateTime: string;
  tutorId: number;
  tutorName: string;
  participantsCount: number;
  isLive: boolean;
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Fetch course details
  const { data: course, isLoading: loadingCourse } = useQuery<CourseData>({
    queryKey: ["/api/courses", parseInt(courseId || "0")],
    enabled: !!courseId,
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      const res = await fetch(`/api/courses/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch course');
      }
      return res.json();
    }
  });

  // Fetch course modules and content
  const { data: moduleContent, isLoading: loadingModules } = useQuery<ModuleContent[]>({
    queryKey: ["/api/courses/modules", parseInt(courseId || "0")],
    enabled: !!courseId,
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      const res = await fetch(`/api/courses/${id}/modules`);
      if (!res.ok) {
        throw new Error('Failed to fetch course modules');
      }
      return res.json();
    }
  });

  // Fetch enrollment status
  const { data: enrollmentData, isLoading: loadingEnrollment } = useQuery<EnrollmentData>({
    queryKey: ["/api/enrollments/course", parseInt(courseId || "0")],
    enabled: !!courseId && !!user,
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      const res = await fetch(`/api/enrollments/course?courseId=${id}`);
      if (res.status === 404) {
        // Not enrolled
        return null;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch enrollment status');
      }
      return res.json();
    }
  });

  // Fetch course tutor details
  const { data: tutorData, isLoading: loadingTutor } = useQuery<TutorData>({
    queryKey: ["/api/users", course?.tutorId],
    enabled: !!course?.tutorId,
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tutor data');
      }
      return res.json();
    }
  });

  // Fetch course stats
  const { data: courseStats, isLoading: loadingStats } = useQuery<CourseStats>({
    queryKey: ["/api/courses/stats", parseInt(courseId || "0")],
    enabled: !!courseId,
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      const res = await fetch(`/api/courses/${id}/stats`);
      if (!res.ok) {
        throw new Error('Failed to fetch course stats');
      }
      return res.json();
    }
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions, isLoading: loadingSessions } = useQuery<UpcomingSession[]>({
    queryKey: ["/api/courses/sessions", parseInt(courseId || "0")],
    enabled: !!courseId,
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      const res = await fetch(`/api/courses/${id}/sessions/upcoming`);
      if (!res.ok) {
        throw new Error('Failed to fetch upcoming sessions');
      }
      return res.json();
    }
  });

  // Mutation for enrolling in the course
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to enroll in courses");

      const response = await apiRequest("POST", "/api/enrollments", {
        courseId: parseInt(courseId || "0"),
        userId: user.id
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to enroll in course");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully enrolled!",
        description: "You have been enrolled in the course.",
        variant: "default",
      });

      // Invalidate the enrollment data to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/course", parseInt(courseId || "0")] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handler for course payment
  const handleCoursePayment = async () => {
    if (!user || !course) {
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentProcessing(true);

    try {
      // Purchase the course with flutterwave
      await purchaseCourse(
        course.id,
        course.price,
        "NGN",
        {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          phone_number: user.phoneNumber || "N/A"
        },
        async (transactionId) => {
          // Payment successful, enroll in course
          try {
            // Record the payment
            const paymentResponse = await apiRequest("POST", "/api/payments", {
              courseId: course.id,
              userId: user.id,
              amount: course.price,
              transactionId,
              status: "completed"
            });

            if (!paymentResponse.ok) {
              throw new Error("Failed to record payment");
            }

            // Enroll in the course
            enrollMutation.mutate();

            toast({
              title: "Payment Successful!",
              description: "You have been enrolled in the course.",
              variant: "default",
            });
          } catch (error) {
            toast({
              title: "Enrollment Error",
              description: "Payment was successful but enrollment failed. Please contact support.",
              variant: "destructive",
            });
          } finally {
            setIsPaymentProcessing(false);
          }
        },
        (error) => {
          // Payment failed
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
          setIsPaymentProcessing(false);
        }
      );
    } catch (error) {
      toast({
        title: "Payment Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      setIsPaymentProcessing(false);
    }
  };

  // Loading state
  if (loadingCourse || loadingTutor || loadingStats) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-[70%]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Handle case where course doesn't exist
  if (!course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/courses")}>
            Return to Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              {course.isFree ? (
                <Badge variant="default">Free</Badge>
              ) : (
                <Badge variant="default">${course.price}</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {courseStats && (
              <>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{courseStats.enrollmentCount} students</span>
                </div>

                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{courseStats.averageDuration}</span>
                </div>

                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">{courseStats.averageRating.toFixed(1)}</span>
                  <span>({courseStats.reviewCount} reviews)</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div 
              className="w-full h-[300px] rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${course.coverImage})` }}
            >
              <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-lg">
                <Button size="lg" className="gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Watch Introduction
                </Button>
              </div>
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="interactive">Interactive</TabsTrigger>
                <TabsTrigger value="offline">Offline Access</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{course.description}</p>

                    {course.objectives && course.objectives.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">What You'll Learn</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {course.objectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Separator />

                    {tutorData && (
                      <div className="flex items-start gap-4">
                        <div 
                          className="h-12 w-12 rounded-full bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${tutorData.profileImage})` }}
                        />
                        <div>
                          <h3 className="font-medium">{tutorData.firstName} {tutorData.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{tutorData.bio}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {enrollmentData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {enrollmentData.progress}% Complete
                        </span>
                        {enrollmentData.isCompleted ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                      </div>
                      <Progress value={enrollmentData.progress} className="h-2" />

                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground">
                          Enrolled on {new Date(enrollmentData.enrolledAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last accessed on {new Date(enrollmentData.lastAccessed).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingModules ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : moduleContent && moduleContent.length > 0 ? (
                      <div className="space-y-4">
                        {moduleContent.map((module, index) => (
                          <div key={module.id}>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">Module {index + 1}: {module.title}</h3>
                              <Badge variant="outline">
                                {module.completedCount}/{module.totalItems} Completed
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {module.moduleItems.map(item => (
                                <div key={item.id} className="flex items-center p-2 rounded-md hover:bg-muted">
                                  <div className="mr-3 bg-primary/10 p-2 rounded-md">
                                    {item.type === 'video' && <Video className="h-4 w-4 text-primary" />}
                                    {item.type === 'document' && <FileText className="h-4 w-4 text-primary" />}
                                    {item.type === 'quiz' && <BookOpen className="h-4 w-4 text-primary" />}
                                    {item.locked && <Lock className="h-4 w-4 text-primary" />}
                                  </div>
                                  <div className="flex-grow">
                                    <h4 className="text-sm font-medium">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {item.duration && `${item.duration} • `}
                                      {item.fileSize && `${item.fileSize} • `}
                                      {item.type === 'video' && 'Video'}
                                      {item.type === 'document' && 'Reading'}
                                      {item.type === 'quiz' && 'Quiz'}
                                    </p>
                                  </div>
                                  {item.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Button variant="ghost" size="sm" className="h-7" disabled={item.locked}>
                                      {item.locked ? "Locked" : "Start"}
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p>No content has been added to this course yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussions" className="space-y-4">
                {enrollmentData ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Discussion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CourseChatRoom 
                          courseId={course.id} 
                          userId={user?.id || 0}
                          courseName={course.title} 
                        />
                      </CardContent>
                    </Card>

                    <CourseAIHelper 
                      courseId={course.id}
                      courseTitle={course.title}
                      courseCategory={course.category}
                      courseLevel={course.level}
                    />
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <h3 className="text-lg font-medium mb-2">Enroll to access discussions</h3>
                      <p className="text-muted-foreground mb-4">
                        Join this course to participate in discussions with other students and the instructor.
                      </p>
                      <Button onClick={() => enrollMutation.mutate()} disabled={course.isFree === false}>
                        {course.isFree ? "Enroll Now" : "Purchase to Unlock"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="interactive" className="space-y-8">
                {enrollmentData ? (
                  <>
                    <LivePolling courseId={course.id} />

                    <AITutorChat 
                      courseId={course.id} 
                      subject={course.category}
                      level={course.level as any}
                      suggestedQuestions={[
                        `Explain key concepts in ${course.category}`,
                        `What are common challenges in learning ${course.title}?`,
                        `How can I apply ${course.title} knowledge in practice?`,
                        `What are the prerequisites for mastering this subject?`
                      ]}
                    />
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <h3 className="text-lg font-medium mb-2">Enroll to access interactive features</h3>
                      <p className="text-muted-foreground mb-4">
                        Join this course to access AI tutoring, live polling, and other interactive features.
                      </p>
                      <Button onClick={() => enrollMutation.mutate()} disabled={course.isFree === false}>
                        {course.isFree ? "Enroll Now" : "Purchase to Unlock"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="offline">
                {enrollmentData ? (
                  <OfflineAccess courseId={course.id} />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <h3 className="text-lg font-medium mb-2">Enroll to access offline content</h3>
                      <p className="text-muted-foreground mb-4">
                        Join this course to download materials for offline access.
                      </p>
                      <Button onClick={() => enrollMutation.mutate()} disabled={course.isFree === false}>
                        {course.isFree ? "Enroll Now" : "Purchase to Unlock"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {/* Enrollment Card - Only show if not enrolled */}
            {!enrollmentData && (
              <Card>
                <CardHeader>
                  <CardTitle>Enroll in This Course</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">
                      {course.isFree ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        <span>${course.price}</span>
                      )}
                    </span>
                    {course.isFree && (
                      <Badge variant="outline" className="bg-emerald-50">No payment required</Badge>
                    )}
                  </div>

                  <div className="pt-2">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">Full course access</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">All course materials</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">Certificate of completion</span>
                      </li>
                      {!course.isFree && (
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm">Live session access</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => {
                      if (course.isFree) {
                        // For free courses, direct enrollment
                        enrollMutation.mutate();
                      } else {
                        // For premium courses, proceed to payment
                        handleCoursePayment();
                      }
                    }}
                    disabled={enrollMutation.isPending || isPaymentProcessing}
                  >
                    {enrollMutation.isPending || isPaymentProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {course.isFree ? "Enrolling..." : "Processing Payment..."}
                      </>
                    ) : (
                      <>{course.isFree ? "Enroll Now" : `Pay $${course.price} & Enroll`}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Course Resources Card */}
            {course.resources && course.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.resources.map((resource, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => window.open(resource.url, '_blank')}
                      disabled={!enrollmentData}
                    >
                      {resource.type === 'zip' && <Download className="h-4 w-4" />}
                      {resource.type === 'pdf' && <FileText className="h-4 w-4" />}
                      {resource.type === 'ai' && <BrainCircuit className="h-4 w-4" />}
                      {resource.title}
                    </Button>
                  ))}

                  {!enrollmentData && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                    available after enrollment
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Sessions Card */}
            {upcomingSessions && upcomingSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{session.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.dateTime).toLocaleString()}
                          </p>
                        </div>
                        {session.isLive ? (
                          <Badge>Live</Badge>
                        ) : (
                          <Badge variant="outline">{session.type}</Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        {session.type === 'group' ? (
                          <>
                            <Users className="h-3 w-3 mr-1" />
                            <span>{session.participantsCount} participants</span>
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            <span>With {session.tutorName}</span>
                          </>
                        )}
                      </div>
                      <Button 
                        variant={session.isLive ? "default" : "outline"} 
                        size="sm" 
                        className="mt-2 w-full"
                        disabled={!enrollmentData}
                      >
                        {session.isLive ? "Join Now" : "Set Reminder"}
                      </Button>

                      {!enrollmentData && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Available after enrollment
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          </div>
                </div>
              </DashboardLayout>
            );
          }