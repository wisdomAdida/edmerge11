import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  UserCog, 
  Layers, 
  CreditCard, 
  BarChart, 
  Settings,
  Key
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboardFixed() {
  const { user } = useAuth();
  
  // Static data (no API calls)
  const statCards = [
    {
      title: "Total Users",
      value: "482",
      change: "+24 this week",
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Active Courses",
      value: "87",
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

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user?.firstName || 'Admin'}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of the EdMerge platform performance.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link href="/dashboard/admin/users">
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
      <Card className="mb-8 border-primary/20 bg-primary/5">
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
            </div>
          </div>
        </CardContent>
      </Card>

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
      <Tabs defaultValue="users" className="mb-8">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Currently 482 active users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">From this dashboard, you can manage all users registered on the EdMerge platform.</p>
              <div className="flex space-x-2">
                <Link href="/dashboard/admin/users">
                  <Button>View All Users</Button>
                </Link>
                <Link href="/dashboard/admin/users/add">
                  <Button variant="outline">Add New User</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Currently 87 active courses on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Manage courses, approve new content, and monitor course activity.</p>
              <div className="flex space-x-2">
                <Button>View All Courses</Button>
                <Button variant="outline">Add New Course</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Track revenue and process payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Manage platform payments, review withdrawal requests, and track revenue.</p>
              <div className="flex space-x-2">
                <Button>View Payment History</Button>
                <Button variant="outline">Process Withdrawals</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}