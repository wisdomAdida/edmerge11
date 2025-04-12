import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Calendar, 
  Mail, 
  Phone, 
  BookOpen, 
  User,
  Clock,
  KeyRound,
  ShieldCheck,
  CreditCard,
  School
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function UserDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Get user details from API
  const { data: userData, isLoading } = useQuery({
    queryKey: [`/api/users/${id}`],
    queryFn: async () => {
      // Normally, this would fetch from API endpoint
      // For now, we're getting all users and finding the one with matching id
      const res = await fetch('/api/users');
      const users = await res.json();
      return users.find((user: any) => user.id === Number(id));
    },
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="User Details">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/admin/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Skeleton className="h-8 w-[200px]" />
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout title="User Not Found">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <User className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="text-muted-foreground">
            The user with ID {id} could not be found or may have been deleted.
          </p>
          <Button asChild>
            <Link href="/dashboard/admin/users">Go Back to Users</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-500/10 text-blue-500";
      case "tutor":
        return "bg-emerald-500/10 text-emerald-500";
      case "mentor":
        return "bg-purple-500/10 text-purple-500";
      case "researcher":
        return "bg-amber-500/10 text-amber-500";
      case "admin":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  // Get subscription badge
  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };

  return (
    <DashboardLayout title={`${userData.firstName} ${userData.lastName}`}>
      <div className="space-y-6">
        {/* Back button and page title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/admin/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/admin/users/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit User
              </Link>
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        {/* User profile card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                {userData.profileImage ? (
                  <AvatarImage src={userData.profileImage} alt={`${userData.firstName} ${userData.lastName}`} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-2xl font-bold">{userData.firstName} {userData.lastName}</h2>
                  <Badge className={getRoleBadgeColor(userData.role)}>
                    {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                    {userData.studentLevel ? ` (${userData.studentLevel})` : ''}
                  </Badge>
                </div>
                <p className="text-muted-foreground">@{userData.username}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex flex-wrap gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member since</p>
                      <p className="font-medium">{formatDate(userData.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription</p>
                      <div className="flex items-center gap-2 font-medium">
                        {getSubscriptionBadge(userData.subscriptionStatus)}
                        <span className="ml-2">{userData.subscriptionType !== "none" ? userData.subscriptionType : "No subscription"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Tabs for user details */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Basic details about the user's account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium">{userData.id}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">@{userData.username}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{userData.phone || "Not provided"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Account Role</p>
                    <p className="font-medium">
                      {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                    </p>
                  </div>
                  
                  {userData.studentLevel && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Education Level</p>
                      <p className="font-medium">{userData.studentLevel}</p>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
                
                {userData.bio && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Bio</p>
                      <p>{userData.bio}</p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/admin/users/${id}/edit`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Information
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Subscription Information */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>User's subscription information and history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <div className="font-medium">
                      {userData.subscriptionType !== "none" 
                        ? userData.subscriptionType.charAt(0).toUpperCase() + userData.subscriptionType.slice(1) 
                        : "No subscription"}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div>
                      {getSubscriptionBadge(userData.subscriptionStatus)}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Next Billing</p>
                    <p className="font-medium">
                      {userData.subscriptionEndDate 
                        ? formatDate(userData.subscriptionEndDate) 
                        : "Not applicable"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  toast({
                    title: "Subscription key generated",
                    description: `A new subscription key has been generated for ${userData.firstName} ${userData.lastName}.`,
                  });
                }}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Generate Subscription Key
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Recent login and platform activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <p className="text-sm font-medium">Logged in from Mumbai, India</p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">Today, 12:34 PM</p>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <p className="text-sm font-medium">Enrolled in a new course: "Advanced Python Programming"</p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">Yesterday, 3:15 PM</p>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <p className="text-sm font-medium">Subscription plan renewed: Premium</p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">Mar 28, 2023, 9:00 AM</p>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <p className="text-sm font-medium">Logged in from New Delhi, India</p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">Mar 27, 2023, 7:45 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription History</CardTitle>
                <CardDescription>Past and present subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <Badge className="bg-green-500 mb-2">Active</Badge>
                        <h3 className="text-lg font-semibold">Premium Plan</h3>
                        <p className="text-sm text-muted-foreground">Subscribed on {formatDate(userData.subscriptionStartDate || new Date())}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">$10.00</p>
                        <p className="text-sm text-muted-foreground">for 3 months</p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Next billing</p>
                        <p className="font-medium">{formatDate(userData.subscriptionEndDate || new Date())}</p>
                      </div>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="mb-2">Expired</Badge>
                        <h3 className="text-lg font-semibold">Basic Plan</h3>
                        <p className="text-sm text-muted-foreground">Dec 15, 2022 - Mar 15, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">$3.00</p>
                        <p className="text-sm text-muted-foreground">for 3 months</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscription Keys</CardTitle>
                <CardDescription>Generated keys for this user</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-500">Active</Badge>
                      <p className="text-sm text-muted-foreground">Generated on Apr 1, 2023</p>
                    </div>
                    <p className="font-mono bg-muted p-2 rounded mt-2">SK-TESTKEY-123456-PREMIUM</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <KeyRound className="h-3.5 w-3.5 mr-1" />
                      <span>Premium subscription (3 months)</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Used</Badge>
                      <p className="text-sm text-muted-foreground">Generated on Jan 1, 2023</p>
                    </div>
                    <p className="font-mono bg-muted p-2 rounded mt-2">SK-TESTKEY-654321-BASIC</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <KeyRound className="h-3.5 w-3.5 mr-1" />
                      <span>Basic subscription (3 months)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button onClick={() => {
                    toast({
                      title: "Subscription key generated",
                      description: `A new subscription key has been generated for ${userData.firstName} ${userData.lastName}.`,
                    });
                  }}>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}