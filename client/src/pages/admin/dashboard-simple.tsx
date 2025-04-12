import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

export default function AdminDashboardSimple() {
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
      <Tabs defaultValue="users" className="mb-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

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
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Course Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export Courses</Button>
              <Link href="/admin/courses/add">
                <Button>Add New Course</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses with highest enrollment and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full admin-content-section">
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
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Settings className="h-3 w-3" />
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
                <Link href="/admin/courses">
                  <Button variant="outline">View All Courses</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payment Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export Payments</Button>
              <Link href="/admin/payments/analyze">
                <Button>View Analytics</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest transactions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto admin-finance-section">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Course</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Commission</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">{payment.user}</td>
                        <td className="py-3 px-4">{payment.course}</td>
                        <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">{payment.date}</td>
                        <td className="py-3 px-4">
                          <Badge variant={payment.status === 'completed' ? 'outline' : 'secondary'} className={payment.status === 'completed' ? "bg-green-100 text-green-800 border-green-300" : ""}>
                            {payment.status === 'completed' ? (
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 mr-1" />
                            )}
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">${payment.commission.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Details
                          </Button>
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
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Withdrawal Requests</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export Report</Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Pending Withdrawal Requests</CardTitle>
              <CardDescription>Requests awaiting admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto admin-settings-section">
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
                        <td className="py-3 px-4">${withdrawal.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">{withdrawal.requestDate}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {withdrawal.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700">
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
              <div className="mt-4 text-center">
                <Link href="/admin/withdrawals">
                  <Button variant="outline">View All Withdrawals</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}