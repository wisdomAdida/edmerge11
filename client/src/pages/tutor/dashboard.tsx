import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Link, useLocation } from "wouter";
import { Loader2, Users, BookOpen, DollarSign, Plus, FileText, Star, TrendingUp, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TutorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("year");
  const [, navigate] = useLocation();

  // Define types for the data we'll be working with
  interface Course {
    id: number;
    title: string;
    description: string;
    status: string;
    category: string;
    level: string;
    tutorId: number;
    isFree: boolean;
    price?: number;
    rating?: number;
    coverImage?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  interface Enrollment {
    id: number;
    userId: number;
    courseId: number;
    progress: number;
    isCompleted: boolean;
    enrolledAt?: string;
    updatedAt?: string;
  }
  
  interface Payment {
    id: number;
    courseId: number;
    userId: number;
    amount: number;
    tutorAmount: number;
    adminAmount: number;
    courseName?: string;
    paymentDate: string;
    status: string;
  }
  
  interface Withdrawal {
    id: number;
    tutorId: number;
    amount: number;
    withdrawalDate: string;
    status: string;
  }
  
  interface Analytics {
    totalStudents: number;
    totalRevenue: number;
    completionRate: number;
    averageRating: number;
    studentGrowth: number;
    revenueGrowth: number;
    completionGrowth: number;
    ratingGrowth: number;
    enrollmentByMonth: Array<{month: string; count: number}>;
    revenueByMonth: Array<{month: string; amount: number}>;
    studentsByLocation?: Array<{country: string; students: number}>;
    completionStats: {
      completed: number;
      inProgress: number;
      notStarted: number;
    };
  }

  // Get tutor's courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses/tutor"],
  });

  // Get enrollments for tutor's courses (filtered on backend by tutor id)
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  // Get tutor analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery<Analytics>({
    queryKey: ["/api/tutor/analytics", timeRange],
    queryFn: async ({ queryKey }) => {
      const [_, range] = queryKey;
      const response = await fetch(`/api/tutor/analytics?timeRange=${range}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    }
  });

  // Get tutor payments (real earnings data)
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ["/api/tutor/payments"],
  });

  // Get tutor withdrawals
  const { data: withdrawals = [], isLoading: isLoadingWithdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["/api/tutor/withdrawals"],
  });
  
  // Process analytics data for charts
  const earningsData = analyticsData?.revenueByMonth || [];
  const studentsData = analyticsData?.enrollmentByMonth?.map(item => ({
    month: item.month,
    students: item.count
  })) || [];

  // Format courses data with enrollment counts and ratings
  const coursesWithStats = courses.map((course: Course) => {
    // Count enrollments for this course
    const courseEnrollments = enrollments.filter((e: Enrollment) => e.courseId === course.id);
    // Calculate average rating if available
    const avgRating = course.rating || (analyticsData?.averageRating || 4.5);
    
    return {
      ...course,
      students: courseEnrollments.length,
      rating: avgRating
    };
  });

  // Sort courses by student count to get top performing courses
  const topCourses = [...coursesWithStats]
    .sort((a, b) => b.students - a.students)
    .slice(0, 3);

  // Format courses for showing in table view
  const recentCourses = coursesWithStats.slice(0, 5);

  // Format real payments data
  const recentPayments = payments.slice(0, 5).map((payment: Payment) => ({
    id: payment.id,
    course: payment.courseName || courses.find((c: Course) => c.id === payment.courseId)?.title || "Unknown Course",
    amount: payment.tutorAmount,
    date: new Date(payment.paymentDate).toISOString().split('T')[0],
    status: payment.status
  }));

  // Format real withdrawals data
  const pendingWithdrawals = withdrawals
    .filter((w: Withdrawal) => w.status === "pending")
    .map((withdrawal: Withdrawal) => ({
      id: withdrawal.id,
      amount: withdrawal.amount,
      requestDate: new Date(withdrawal.withdrawalDate).toISOString().split('T')[0],
      status: withdrawal.status
    }));

  // Calculate total earnings from payments
  const totalEarnings = payments.reduce((sum: number, payment: Payment) => sum + (payment.tutorAmount || 0), 0);
  const formattedEarnings = totalEarnings.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Calculate stats for display cards using real data
  const statCards = [
    {
      title: "Total Students",
      value: analyticsData?.totalStudents || enrollments.length || 0,
      change: analyticsData?.studentGrowth ? 
        `${analyticsData.studentGrowth > 0 ? '+' : ''}${Math.round(analyticsData.studentGrowth * 100)}% growth` : 
        "Active learners",
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Active Courses",
      value: courses.filter((c: Course) => c.status === "published").length,
      change: `${courses.filter((c: Course) => c.status === "draft").length} drafts`,
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Total Earnings",
      value: formattedEarnings,
      change: analyticsData?.revenueGrowth ? 
        `${analyticsData.revenueGrowth > 0 ? '+' : ''}${Math.round(analyticsData.revenueGrowth * 100)}% growth` : 
        "Lifetime earnings",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Average Rating",
      value: (analyticsData?.averageRating || 0).toFixed(1),
      change: analyticsData?.ratingGrowth ? 
        `${analyticsData.ratingGrowth > 0 ? '+' : ''}${(analyticsData.ratingGrowth).toFixed(2)} points` : 
        "Course quality score",
      icon: <Star className="h-4 w-4 text-muted-foreground" />
    },
  ];

  if (isLoadingCourses || isLoadingEnrollments) {
    return (
      <DashboardLayout title="Tutor Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tutor Dashboard">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your courses and earnings.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link href="/tutor/courses/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create New Course
          </Button>
        </Link>
        <Link href="/tutor/earnings/withdraw">
          <Button variant="outline" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Withdraw Earnings
          </Button>
        </Link>
        <Link href="/tutor/students">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> View Students
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different dashboard sections */}
      <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your monthly earnings for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Growth</CardTitle>
                <CardDescription>Number of students enrolled in your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studentsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="students" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Your most popular courses by enrollment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.map((course: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted w-12 h-12 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.students} students</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm">{course.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Courses</h2>
            <Link href="/tutor/courses/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create New Course
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Course Title</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Students</th>
                      <th className="text-left py-3 px-4">Rating</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.map((course: any, i: number) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">{course.title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{course.students}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                            {course.rating || "N/A"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Earnings</h2>
            <Link href="/tutor/earnings/withdraw">
              <Button className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Withdraw Funds
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payments from your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{payment.course}</p>
                        <p className="text-xs text-muted-foreground">{payment.date}</p>
                      </div>
                      <div className="text-sm font-medium">${payment.amount}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Your recent and pending withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingWithdrawals.length > 0 ? (
                  <div className="space-y-4">
                    {pendingWithdrawals.map((withdrawal: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">${withdrawal.amount}</p>
                          <p className="text-xs text-muted-foreground">Requested on {withdrawal.requestDate}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          {withdrawal.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No recent withdrawals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Students</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export Data</Button>
              <Link href="/tutor/students">
                <Button>View All Students</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Student Distribution</CardTitle>
              <CardDescription>Students enrolled in your courses by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analyticsData?.studentsByLocation ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.studentsByLocation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No location data available</p>
                    <p className="text-muted-foreground text-sm">Student location information will appear here when available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
