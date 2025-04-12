import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Download, TrendingUp, Users, DollarSign, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TutorAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("year");

  // Fetch tutor analytics data
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
  } = useQuery({
    queryKey: ["/api/tutor/analytics", user?.id, timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/tutor/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch tutor courses data
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
  } = useQuery({
    queryKey: ["/api/tutor/courses/analytics"],
    queryFn: async () => {
      const response = await fetch("/api/tutor/courses/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch course analytics data");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  const enrollmentData = analyticsData?.enrollmentByMonth || [];
  const revenueData = analyticsData?.revenueByMonth || [];
  
  const completionData = [
    { name: 'Completed', value: analyticsData?.completionStats?.completed || 0 },
    { name: 'In Progress', value: analyticsData?.completionStats?.inProgress || 0 },
    { name: 'Not Started', value: analyticsData?.completionStats?.notStarted || 0 },
  ];
  
  const COLORS = ['#4f46e5', '#f97316', '#e11d48'];
  
  const coursePerformanceData = coursesData?.courses || [];
  
  return (
    <PageContainer title="Analytics" description="Track and analyze your teaching performance">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[250px]">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // This would typically trigger a download of analytics data as CSV
                const today = new Date().toISOString().split('T')[0];
                alert(`Analytics data export would be downloaded as edmerge-analytics-${today}.csv`);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Students</CardDescription>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">{analyticsData?.totalStudents || 0}</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-4 w-28" />
              ) : (
                <div className="text-xs text-muted-foreground flex items-center">
                  {analyticsData?.studentGrowth && analyticsData.studentGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">+{analyticsData.studentGrowth}%</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No change</span>
                  )}
                  <span className="ml-1">from last month</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Course Completion</CardDescription>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">{analyticsData?.completionRate || 0}%</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-4 w-28" />
              ) : (
                <div className="text-xs text-muted-foreground flex items-center">
                  {analyticsData?.completionGrowth && analyticsData.completionGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">+{analyticsData.completionGrowth}%</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No change</span>
                  )}
                  <span className="ml-1">from last month</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Rating</CardDescription>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">{analyticsData?.averageRating?.toFixed(1) || "N/A"}</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-4 w-28" />
              ) : (
                <div className="text-xs text-muted-foreground flex items-center">
                  {analyticsData?.ratingGrowth && analyticsData.ratingGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">+{analyticsData.ratingGrowth.toFixed(1)}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No change</span>
                  )}
                  <span className="ml-1">from last month</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">${analyticsData?.totalRevenue?.toFixed(2) || 0}</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-4 w-28" />
              ) : (
                <div className="text-xs text-muted-foreground flex items-center">
                  {analyticsData?.revenueGrowth && analyticsData.revenueGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">+{analyticsData.revenueGrowth}%</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No change</span>
                  )}
                  <span className="ml-1">from last month</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment</CardTitle>
              <CardDescription>Number of students enrolled over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoadingAnalytics ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-[250px] w-[90%]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={enrollmentData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Your earnings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoadingAnalytics ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-[250px] w-[90%]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#4f46e5" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Completion</CardTitle>
              <CardDescription>Student completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                {isLoadingAnalytics ? (
                  <Skeleton className="h-[200px] w-[200px] rounded-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Analytics for individual courses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCourses ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : coursePerformanceData.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Course Data Available</h3>
                  <p className="text-muted-foreground text-center max-w-md mx-auto">
                    Once you've created and published courses, their performance metrics will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {coursePerformanceData.map((course, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{course.name}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {course.students} students
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1 flex items-center">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Completion Rate
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${course.completion}%` }}
                            ></div>
                          </div>
                          <div className="text-xs mt-1">{course.completion}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1 flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Average Rating
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-full bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-amber-500 rounded-full" 
                                style={{ width: `${(course.rating / 5) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs ml-2">{course.rating}/5</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}