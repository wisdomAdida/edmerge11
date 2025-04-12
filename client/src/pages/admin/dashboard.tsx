import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  UserCog, 
  Layers, 
  CreditCard, 
  BarChart, 
  Settings,
  CheckCircle,
  XCircle,
  User,
  Eye,
  Clock,
  AlertCircle,
  PlusCircle,
  Key
} from "lucide-react";
import { Link } from "wouter";
import { BarChart as ReBarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Get all users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Get all courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  // Cards data
  const statCards = [
    {
      title: "Total Users",
      value: users.length || 482,
      change: "+24 this week",
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Active Courses",
      value: courses.filter((c: any) => c.status === "published").length || 87,
      change: "+12 new courses",
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Total Revenue",
      value: "$78,650.40",
      change: "+15% this month",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Platform Growth",
      value: "+28%",
      change: "Year over year",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
    },
  ];

  // Revenue data for chart
  const revenueData = [
    { month: 'Jan', revenue: 4800, courses: 8 },
    { month: 'Feb', revenue: 6700, courses: 10 },
    { month: 'Mar', revenue: 8200, courses: 12 },
    { month: 'Apr', revenue: 7500, courses: 15 },
    { month: 'May', revenue: 9800, courses: 18 },
    { month: 'Jun', revenue: 12400, courses: 22 },
    { month: 'Jul', revenue: 15300, courses: 25 },
  ];

  // User distribution data for pie chart
  const userDistributionData = [
    { name: 'Students', value: 320 },
    { name: 'Tutors', value: 85 },
    { name: 'Mentors', value: 45 },
    { name: 'Researchers', value: 32 },
  ];
  
  const COLORS = ['#3563E9', '#16B364', '#F97316', '#8B5CF6'];

  // Recent users
  const recentUsers = [
    { id: 1, name: "Emma Johnson", email: "emma.j@example.com", role: "student", studentLevel: "tertiary", joinDate: "Aug 15, 2023" },
    { id: 2, name: "Michael Chen", email: "michael.c@example.com", role: "tutor", joinDate: "Aug 14, 2023" },
    { id: 3, name: "Sarah Williams", email: "sarah.w@example.com", role: "student", studentLevel: "secondary", joinDate: "Aug 13, 2023" },
    { id: 4, name: "Robert Davis", email: "robert.d@example.com", role: "mentor", joinDate: "Aug 12, 2023" },
    { id: 5, name: "Jennifer Thompson", email: "jennifer.t@example.com", role: "researcher", joinDate: "Aug 11, 2023" },
  ];

  // Recent payments
  const recentPayments = [
    { id: 1, user: "Emma Johnson", course: "Advanced Calculus", amount: 59.99, date: "Aug 15, 2023", status: "completed", commission: 9.00 },
    { id: 2, user: "Thomas Wilson", course: "Web Development Masterclass", amount: 79.99, date: "Aug 14, 2023", status: "completed", commission: 12.00 },
    { id: 3, user: "Sarah Williams", course: "Data Science Fundamentals", amount: 69.99, date: "Aug 13, 2023", status: "completed", commission: 10.50 },
    { id: 4, user: "James Brown", course: "UX/UI Design Principles", amount: 49.99, date: "Aug 12, 2023", status: "completed", commission: 7.50 },
    { id: 5, user: "Linda Martinez", course: "Digital Marketing Mastery", amount: 89.99, date: "Aug 11, 2023", status: "completed", commission: 13.50 },
  ];

  // Pending withdrawals
  const pendingWithdrawals = [
    { id: 1, tutor: "Michael Chen", amount: 345.67, requestDate: "Aug 15, 2023", status: "pending" },
    { id: 2, tutor: "Jessica Wong", amount: 210.45, requestDate: "Aug 14, 2023", status: "pending" },
    { id: 3, tutor: "David Smith", amount: 678.90, requestDate: "Aug 13, 2023", status: "pending" },
  ];

  // Top performing courses
  const topCourses = [
    { id: 1, title: "Web Development Bootcamp", tutor: "Michael Chen", students: 245, revenue: 19600, rating: 4.9 },
    { id: 2, title: "Data Science and Machine Learning", tutor: "Jessica Wong", students: 189, revenue: 15120, rating: 4.8 },
    { id: 3, title: "UX/UI Design Masterclass", tutor: "David Smith", students: 167, revenue: 8350, rating: 4.7 },
    { id: 4, title: "Digital Marketing Strategy", tutor: "Amanda Rodriguez", students: 156, revenue: 14040, rating: 4.6 },
    { id: 5, title: "Advanced JavaScript", tutor: "Robert Johnson", students: 142, revenue: 8520, rating: 4.8 },
  ];

  if (isLoadingUsers || isLoadingCourses) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of the EdMerge platform performance.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4 mb-8 admin-quick-actions">
        <Link href="/admin/users/manage">
          <Button className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Manage Users
          </Button>
        </Link>
        <Link href="/admin/courses/manage">
          <Button variant="outline" className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Manage Courses
          </Button>
        </Link>
        <Link href="/admin/subscription-keys">
          <Button variant="outline" className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Key className="h-4 w-4" /> Subscription Keys
          </Button>
        </Link>
        <Link href="/admin/payments/manage">
          <Button variant="outline" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Manage Payments
          </Button>
        </Link>
        <Link href="/admin/reports">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" /> View Reports
          </Button>
        </Link>
        <Link href="/admin/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Platform Settings
          </Button>
        </Link>
      </div>
      
      {/* Subscription Key Management Card */}
      <Card className="mb-8 border-primary/20 bg-primary/5 admin-subscription-keys">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-medium">Subscription Key Management</CardTitle>
              <CardDescription>Generate and manage subscription keys for users</CardDescription>
            </div>
            <Link href="/admin/subscription-keys">
              <Button size="sm" className="flex items-center gap-1">
                <Key className="h-3.5 w-3.5" /> Manage Keys
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Recent Subscription Keys</h3>
              <div className="space-y-3">
                <div className="bg-background p-3 rounded-md border flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm">SK-TESTKEY-123456-BASIC</div>
                    <div className="text-xs text-muted-foreground mt-1">Basic Plan • Generated 2 days ago</div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    Active
                  </Badge>
                </div>
                <div className="bg-background p-3 rounded-md border flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm">SK-TESTKEY-789012-PREMIUM</div>
                    <div className="text-xs text-muted-foreground mt-1">Premium Plan • Generated 1 day ago</div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    Active
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/subscription-keys">
                  <Button variant="outline" size="sm" className="w-full">View All Keys</Button>
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Quick Key Generation</h3>
              <div className="bg-background p-4 rounded-md border">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center">
                      <PlusCircle className="h-5 w-5 mb-1" />
                      <span className="text-sm font-medium">Basic Plan</span>
                      <span className="text-xs text-muted-foreground">$3 / 3 months</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center">
                      <PlusCircle className="h-5 w-5 mb-1" />
                      <span className="text-sm font-medium">Premium Plan</span>
                      <span className="text-xs text-muted-foreground">$10 / 3 months</span>
                    </Button>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    Or use the full generator for custom quantities and options
                  </div>
                  <Link href="/admin/subscription-keys/generate">
                    <Button className="w-full">Generate New Keys</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 admin-stats-cards">
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
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 admin-charts">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Course Growth</CardTitle>
              <CardDescription>Number of courses added over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="courses" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses with highest enrollment and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Course Title</th>
                      <th className="text-left py-3 px-4">Tutor</th>
                      <th className="text-left py-3 px-4">Students</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCourses.map((course, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">{course.title}</td>
                        <td className="py-3 px-4">{course.tutor}</td>
                        <td className="py-3 px-4">{course.students}</td>
                        <td className="py-3 px-4">${course.revenue.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                              {course.rating} ★
                            </span>
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

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export Users</Button>
              <Link href="/admin/users/add">
                <Button>Add New User</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent User Registrations</CardTitle>
              <CardDescription>Users who recently joined the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full admin-users-table">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Join Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {user.role}{user.studentLevel ? ` (${user.studentLevel})` : ''}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{user.joinDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <UserCog className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Link href="/admin/users">
                  <Button variant="outline">View All Users</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', users: 45 },
                      { month: 'Feb', users: 52 },
                      { month: 'Mar', users: 68 },
                      { month: 'Apr', users: 74 },
                      { month: 'May', users: 92 },
                      { month: 'Jun', users: 115 },
                      { month: 'Jul', users: 136 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Active users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { role: 'Students', active: 285, inactive: 35 },
                      { role: 'Tutors', active: 72, inactive: 13 },
                      { role: 'Mentors', active: 38, inactive: 7 },
                      { role: 'Researchers', active: 28, inactive: 4 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="role" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="active" fill="hsl(var(--chart-1))" name="Active" />
                      <Bar dataKey="inactive" fill="hsl(var(--chart-4))" name="Inactive" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4 admin-content-section">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Course Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export Data</Button>
              <Link href="/admin/courses/approve">
                <Button>Review Pending Courses</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
              <CardDescription>Overview of platform courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-800">87</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-secondary-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +12 this month
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Published Courses</p>
                  <p className="text-2xl font-bold text-gray-800">74</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-secondary-500 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> 85% of total
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-800">4.7</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-accent-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +0.2 from last month
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Categories</CardTitle>
              <CardDescription>Course distribution by subject area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { category: 'Computer Science', count: 24 },
                    { category: 'Business', count: 18 },
                    { category: 'Mathematics', count: 15 },
                    { category: 'Science', count: 12 },
                    { category: 'Engineering', count: 10 },
                    { category: 'Languages', count: 8 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses with highest enrollment and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Course Title</th>
                      <th className="text-left py-3 px-4">Tutor</th>
                      <th className="text-left py-3 px-4">Students</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">Rating</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCourses.map((course, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">{course.title}</td>
                        <td className="py-3 px-4">{course.tutor}</td>
                        <td className="py-3 px-4">{course.students}</td>
                        <td className="py-3 px-4">${course.revenue.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                              {course.rating} ★
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Link href="/admin/courses">
                  <Button variant="outline">View All Courses</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4 admin-finance-section">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payment Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export Financial Data</Button>
              <Link href="/admin/payments/settings">
                <Button>Payment Settings</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Statistics</CardTitle>
              <CardDescription>Financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">$78,650.40</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-secondary-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +15% this month
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Platform Commission</p>
                  <p className="text-2xl font-bold text-gray-800">$11,797.56</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-secondary-500 flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" /> 15% average rate
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Pending Payouts</p>
                  <p className="text-2xl font-bold text-gray-800">$1,235.02</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-accent-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> 3 withdrawal requests
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest course purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Course</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Platform Fee</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">{payment.user}</td>
                        <td className="py-3 px-4">{payment.course}</td>
                        <td className="py-3 px-4">${payment.amount}</td>
                        <td className="py-3 px-4">${payment.commission}</td>
                        <td className="py-3 px-4">{payment.date}</td>
                        <td className="py-3 px-4">
                          <Badge variant={payment.status === "completed" ? "default" : "outline"} className="bg-green-100 text-green-800 hover:bg-green-100">
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Link href="/admin/payments">
                  <Button variant="outline">View All Payments</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4 admin-settings-section">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Withdrawal Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">View Payment History</Button>
              <Link href="/admin/withdrawals/settings">
                <Button>Withdrawal Settings</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Pending Withdrawal Requests</CardTitle>
              <CardDescription>Tutor payout requests requiring approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tutor</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Request Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWithdrawals.map((withdrawal, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">{withdrawal.tutor}</td>
                        <td className="py-3 px-4">${withdrawal.amount}</td>
                        <td className="py-3 px-4">{withdrawal.requestDate}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            {withdrawal.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Decline
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Processed Withdrawals</CardTitle>
              <CardDescription>Successfully processed tutor payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tutor</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Request Date</th>
                      <th className="text-left py-3 px-4">Processing Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Amanda Rodriguez</td>
                      <td className="py-3 px-4">$425.50</td>
                      <td className="py-3 px-4">Aug 10, 2023</td>
                      <td className="py-3 px-4">Aug 12, 2023</td>
                      <td className="py-3 px-4">
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          completed
                        </Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Robert Johnson</td>
                      <td className="py-3 px-4">$312.75</td>
                      <td className="py-3 px-4">Aug 08, 2023</td>
                      <td className="py-3 px-4">Aug 10, 2023</td>
                      <td className="py-3 px-4">
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          completed
                        </Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Michael Chen</td>
                      <td className="py-3 px-4">$578.90</td>
                      <td className="py-3 px-4">Aug 05, 2023</td>
                      <td className="py-3 px-4">Aug 07, 2023</td>
                      <td className="py-3 px-4">
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          completed
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Link href="/admin/withdrawals/history">
                  <Button variant="outline">View All Withdrawals</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tutor Earnings Overview</CardTitle>
              <CardDescription>Top earning tutors on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Michael Chen', earnings: 15600 },
                    { name: 'Jessica Wong', earnings: 12800 },
                    { name: 'David Smith', earnings: 9400 },
                    { name: 'Amanda Rodriguez', earnings: 8700 },
                    { name: 'Robert Johnson', earnings: 7200 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
