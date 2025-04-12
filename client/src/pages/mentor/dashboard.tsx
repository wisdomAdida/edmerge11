import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users, MessageCircle, Clock, ChevronRight, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

// Types for mentor dashboard
type MentorshipWithStudent = {
  id: number;
  mentorId: number;
  studentId: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string | null;
    studentLevel: string | null;
    bio: string | null;
  };
};

type MentorSession = {
  id: number;
  mentorshipId: number;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: string;
  notes: string | null;
  meetingUrl: string | null;
  studentName: string;
  studentId: number;
  createdAt: string;
};

type EarningsSummary = {
  totalEarnings: number;
  availableBalance: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  totalSessions: number;
};

export default function MentorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get mentorships with student information
  const { data: mentorshipsData, isLoading: isLoadingMentorships } = useQuery<{
    mentorships: MentorshipWithStudent[],
    totalCount: number
  }>({
    queryKey: ["/api/mentorships/mentor"],
    enabled: !!user && user?.role === "mentor"
  });

  // Get mentor's upcoming sessions
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery<MentorSession[]>({
    queryKey: ["/api/mentor/sessions"],
    enabled: !!user && user?.role === "mentor"
  });

  // Get mentor's earnings summary
  const { data: earningsSummary, isLoading: isLoadingEarnings } = useQuery<EarningsSummary>({
    queryKey: ["/api/mentor/earnings"],
    enabled: !!user && user?.role === "mentor"
  });

  // Get unread messages count
  const { data: unreadMessagesData = { count: 0, studentCount: 0 } } = useQuery<{
    count: number;
    studentCount: number;
  }>({
    queryKey: ["/api/mentor/messages/unread"],
    enabled: !!user && user?.role === "mentor"
  });

  // Mutation to accept/reject mentorship requests
  const updateMentorshipMutation = useMutation({
    mutationFn: async ({id, status}: {id: number, status: string}) => {
      const res = await apiRequest("PATCH", `/api/mentorships/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate mentorships query to refresh the data
      queryClient.invalidateQueries({queryKey: ["/api/mentorships/mentor"]});
      toast({
        title: "Success",
        description: "Mentorship request updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mentorship request",
        variant: "destructive",
      });
    },
  });

  const mentorships = mentorshipsData?.mentorships || [];
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const pendingRequests = mentorships.filter(m => m.status === 'pending');
  const activeStudents = mentorships.filter(m => m.status === 'active');

  // Cards data based on real data
  const statCards = [
    {
      title: "Active Students",
      value: activeStudents.length,
      description: activeStudents.length > 0 ? `${activeStudents.length} active mentorships` : "No active students",
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Pending Requests",
      value: pendingRequests.length,
      description: pendingRequests.length > 0 ? "Waiting for approval" : "No pending requests",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Upcoming Sessions",
      value: upcomingSessions.length,
      description: "Next 7 days",
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Unread Messages",
      value: unreadMessagesData.count,
      description: unreadMessagesData.count > 0 ? `From ${unreadMessagesData.studentCount} students` : "No unread messages",
      icon: <MessageCircle className="h-4 w-4 text-muted-foreground" />
    },
  ];

  if (isLoadingMentorships || isLoadingSessions || isLoadingEarnings) {
    return (
      <DashboardLayout title="Mentor Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading mentor data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mentor Dashboard">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground">
          You have {pendingRequests.length} pending mentorship requests and {upcomingSessions.length} upcoming sessions this week.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link href="/mentor/sessions/schedule">
          <Button className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Schedule Session
          </Button>
        </Link>
        <Link href="/mentor/requests">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> View Requests
          </Button>
        </Link>
        <Link href="/mentor/messages">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Messages
          </Button>
        </Link>
        <Link href="/mentor/earnings">
          <Button variant="outline" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Earnings
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
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings overview */}
      {earningsSummary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>Summary of your mentoring earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Total Earnings
                </div>
                <div className="text-2xl font-bold">
                  ${earningsSummary.totalEarnings.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Available Balance
                </div>
                <div className="text-2xl font-bold">
                  ${earningsSummary.availableBalance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Pending Withdrawals
                </div>
                <div className="text-2xl font-bold">
                  ${earningsSummary.pendingWithdrawals.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Total Sessions
                </div>
                <div className="text-2xl font-bold">
                  {earningsSummary.totalSessions}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Link href="/mentor/earnings">
                <Button size="sm">Withdraw Funds</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different dashboard sections */}
      <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled mentoring sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No upcoming sessions scheduled</p>
                    <Link href="/mentor/sessions/schedule">
                      <Button className="mt-4" variant="outline" size="sm">Schedule Now</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>{session.studentName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{session.studentName}</p>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4 mr-1" /> Add to Calendar
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.scheduledDate} • {session.scheduledTime}
                          </p>
                          <p className="text-xs">{session.notes || "No topic specified"}</p>
                          {session.meetingUrl && (
                            <div className="mt-2">
                              <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="w-full">
                                  Join Google Meet
                                </Button>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 text-center">
                      <Link href="/mentor/sessions">
                        <Button variant="outline" size="sm">View All Sessions</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Students waiting for your approval</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending mentorship requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={request.student.profileImage || undefined} />
                          <AvatarFallback>
                            {`${request.student.firstName.charAt(0)}${request.student.lastName.charAt(0)}`}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">
                              {request.student.firstName} {request.student.lastName}
                            </p>
                            <Badge>{request.student.studentLevel || "Not specified"}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => updateMentorshipMutation.mutate({ id: request.id, status: "active" })}
                              disabled={updateMentorshipMutation.isPending}
                            >
                              {updateMentorshipMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : null}
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => updateMentorshipMutation.mutate({ id: request.id, status: "rejected" })}
                              disabled={updateMentorshipMutation.isPending}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 text-center">
                      <Link href="/mentor/requests">
                        <Button variant="outline" size="sm">View All Requests</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Students */}
          <Card>
            <CardHeader>
              <CardTitle>Your Active Students</CardTitle>
              <CardDescription>Students you are currently mentoring</CardDescription>
            </CardHeader>
            <CardContent>
              {activeStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You don't have any active mentorships yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeStudents.map((mentorship) => (
                    <div key={mentorship.id} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={mentorship.student.profileImage || undefined} />
                        <AvatarFallback>
                          {`${mentorship.student.firstName.charAt(0)}${mentorship.student.lastName.charAt(0)}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            {mentorship.student.firstName} {mentorship.student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Started: {mentorship.startDate ? new Date(mentorship.startDate).toLocaleDateString() : 'Not started'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{mentorship.student.studentLevel || "Not specified"}</Badge>
                        </div>
                      </div>
                      <Link href={`/mentor/students/${mentorship.studentId}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Students</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export Data</Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {activeStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You don't have any active mentorships yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Student</th>
                        <th className="text-left py-3 px-4">Level</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Start Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeStudents.map((mentorship) => (
                        <tr key={mentorship.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={mentorship.student.profileImage || undefined} />
                                <AvatarFallback>
                                  {`${mentorship.student.firstName.charAt(0)}${mentorship.student.lastName.charAt(0)}`}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {mentorship.student.firstName} {mentorship.student.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{mentorship.student.studentLevel || "Not specified"}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">
                              {mentorship.startDate ? new Date(mentorship.startDate).toLocaleDateString() : 'Not started'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Link href={`/mentor/messages/${mentorship.student.id}`}>
                                <Button variant="outline" size="sm">Message</Button>
                              </Link>
                              <Link href={`/mentor/students/${mentorship.student.id}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mentoring Sessions</h2>
            <div className="flex space-x-2">
              <Button variant="outline">View Calendar</Button>
              <Link href="/mentor/sessions/schedule">
                <Button>Schedule New Session</Button>
              </Link>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled mentoring sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No upcoming sessions scheduled</p>
                      <Link href="/mentor/sessions/schedule">
                        <Button className="mt-4" variant="outline" size="sm">Schedule Now</Button>
                      </Link>
                    </div>
                  ) : (
                    upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>{session.studentName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{session.studentName}</p>
                            <Badge>{session.duration} min</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.scheduledDate} • {session.scheduledTime}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            {session.meetingUrl ? (
                              <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline">Join Meeting</Button>
                              </a>
                            ) : (
                              <Link href={`/mentor/sessions/${session.id}/start`}>
                                <Button size="sm" variant="outline">Start Meeting</Button>
                              </Link>
                            )}
                            <Link href={`/mentor/sessions/${session.id}/edit`}>
                              <Button size="sm" variant="outline">Reschedule</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Past Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Past Sessions</CardTitle>
                <CardDescription>Your completed mentoring sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.filter(s => s.status === 'completed').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No past sessions found</p>
                    </div>
                  ) : (
                    sessions.filter(s => s.status === 'completed').slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>{session.studentName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{session.studentName}</p>
                            <span className="text-xs text-muted-foreground">{session.scheduledDate}</span>
                          </div>
                          <p className="text-sm">Topic: {session.notes || "General Mentoring"}</p>
                          <div className="flex justify-end mt-2">
                            <Link href={`/mentor/sessions/${session.id}`}>
                              <Button size="sm" variant="ghost">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Link href="/mentor/sessions/history">
                    <Button variant="outline" size="sm">View All History</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mentorship Requests</h2>
            <div className="flex space-x-2">
              <Button variant="outline">Export</Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Request Date</th>
                      <th className="text-left py-3 px-4">Level</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No pending mentorship requests
                        </td>
                      </tr>
                    ) : (
                      pendingRequests.map((request) => (
                        <tr key={request.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={request.student.profileImage || undefined} />
                                <AvatarFallback>
                                  {`${request.student.firstName.charAt(0)}${request.student.lastName.charAt(0)}`}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {request.student.firstName} {request.student.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{request.student.studentLevel || "Not specified"}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{request.student.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm"
                                onClick={() => updateMentorshipMutation.mutate({ id: request.id, status: "active" })}
                                disabled={updateMentorshipMutation.isPending}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateMentorshipMutation.mutate({ id: request.id, status: "rejected" })}
                                disabled={updateMentorshipMutation.isPending}
                              >
                                Decline
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}