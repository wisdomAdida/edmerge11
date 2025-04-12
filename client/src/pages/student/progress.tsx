import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TrendingUp,
  Award,
  ArrowUp,
  Clock,
  Check,
  BookOpen,
  Star,
  BarChart3,
  PieChart,
  Trophy,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart as RPieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";

// Progress types
type ProgressOverview = {
  coursesCompleted: number;
  totalCourses: number;
  completionRate: number;
  averageGrade: number;
  totalPoints: number;
  streakDays: number;
  level: number;
  quizzesTaken: number;
  assignmentsCompleted: number;
};

type CourseProgress = {
  id: number;
  title: string;
  progress: number;
  grade?: number;
  lastAccessed: Date;
  dueDate?: Date;
  status: 'in-progress' | 'completed' | 'not-started';
  badgesEarned: string[];
};

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'academic' | 'engagement' | 'milestone';
  dateEarned: Date;
  points: number;
};

type ProgressData = {
  overview: ProgressOverview;
  courses: CourseProgress[];
  achievements: Achievement[];
  subjectPerformance: { subject: string; score: number; }[];
  weeklyActivity: { day: string; hours: number; }[];
  monthlyProgress: { month: string; completionRate: number; }[];
};

export default function ProgressPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch progress data
  const { data: progressData, isLoading } = useQuery<ProgressData>({
    queryKey: ["/api/student/progress"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // This simulates API data - in a real app this would be an actual API call
      return {
        overview: {
          coursesCompleted: 12,
          totalCourses: 20,
          completionRate: 60,
          averageGrade: 87,
          totalPoints: 3450,
          streakDays: 15,
          level: 8,
          quizzesTaken: 47,
          assignmentsCompleted: 35
        },
        courses: [
          {
            id: 1,
            title: "Mathematics Fundamentals",
            progress: 85,
            grade: 92,
            lastAccessed: new Date(2023, 10, 15),
            dueDate: new Date(2023, 11, 30),
            status: 'in-progress',
            badgesEarned: ["Quiz Master", "Fast Learner"]
          },
          {
            id: 2,
            title: "Introduction to Science",
            progress: 100,
            grade: 89,
            lastAccessed: new Date(2023, 10, 10),
            status: 'completed',
            badgesEarned: ["Course Champion", "Perfect Attendance"]
          },
          {
            id: 3,
            title: "Language Arts",
            progress: 65,
            grade: 84,
            lastAccessed: new Date(2023, 10, 17),
            dueDate: new Date(2023, 12, 15),
            status: 'in-progress',
            badgesEarned: ["Creative Writer"]
          },
          {
            id: 4,
            title: "History of Civilizations",
            progress: 45,
            grade: 78,
            lastAccessed: new Date(2023, 10, 12),
            dueDate: new Date(2023, 12, 5),
            status: 'in-progress',
            badgesEarned: []
          },
          {
            id: 5,
            title: "Art Appreciation",
            progress: 100,
            grade: 95,
            lastAccessed: new Date(2023, 9, 25),
            status: 'completed',
            badgesEarned: ["Top Performer", "Creative Genius"]
          }
        ],
        achievements: [
          {
            id: 1,
            name: "Perfect Score",
            description: "Achieved 100% on a quiz or exam",
            icon: "award",
            category: 'academic',
            dateEarned: new Date(2023, 9, 15),
            points: 150
          },
          {
            id: 2,
            name: "Learning Streak",
            description: "Logged in for 14 consecutive days",
            icon: "flame",
            category: 'engagement',
            dateEarned: new Date(2023, 10, 10),
            points: 100
          },
          {
            id: 3,
            name: "First Assignment",
            description: "Completed your first assignment",
            icon: "check-circle",
            category: 'milestone',
            dateEarned: new Date(2023, 8, 5),
            points: 50
          },
          {
            id: 4,
            name: "Math Wizard",
            description: "Completed 5 math quizzes with at least 90%",
            icon: "calculator",
            category: 'academic',
            dateEarned: new Date(2023, 10, 1),
            points: 200
          },
          {
            id: 5,
            name: "Course Completer",
            description: "Finished your first full course",
            icon: "book-open",
            category: 'milestone',
            dateEarned: new Date(2023, 9, 20),
            points: 300
          }
        ],
        subjectPerformance: [
          { subject: "Math", score: 92 },
          { subject: "Science", score: 89 },
          { subject: "Language", score: 84 },
          { subject: "History", score: 78 },
          { subject: "Art", score: 95 }
        ],
        weeklyActivity: [
          { day: "Mon", hours: 2.5 },
          { day: "Tue", hours: 1.8 },
          { day: "Wed", hours: 3.2 },
          { day: "Thu", hours: 2.0 },
          { day: "Fri", hours: 1.5 },
          { day: "Sat", hours: 0.8 },
          { day: "Sun", hours: 0.5 }
        ],
        monthlyProgress: [
          { month: "Jan", completionRate: 10 },
          { month: "Feb", completionRate: 18 },
          { month: "Mar", completionRate: 25 },
          { month: "Apr", completionRate: 32 },
          { month: "May", completionRate: 38 },
          { month: "Jun", completionRate: 42 },
          { month: "Jul", completionRate: 48 },
          { month: "Aug", completionRate: 52 },
          { month: "Sep", completionRate: 55 },
          { month: "Oct", completionRate: 60 },
          { month: "Nov", completionRate: 60 },
          { month: "Dec", completionRate: 60 }
        ]
      };
    }
  });

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-3 rounded-lg shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            {payload[0].name}: {payload[0].value}
            {payload[0].name === "completionRate" ? "%" : payload[0].name === "hours" ? " hrs" : ""}
          </p>
        </div>
      );
    }
    return null;
  };
  
  if (isLoading || !progressData) {
    return (
      <DashboardLayout title="Progress Tracking">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading progress data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Learning Progress">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your learning achievements and performance
          </p>
        </div>
        
        {/* Progress Overview Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold">
                  {progressData.overview.completionRate}%
                </div>
                <div className="text-xs text-emerald-500 flex items-center mb-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  8% this month
                </div>
              </div>
              <div className="mt-2 h-2 w-full bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progressData.overview.completionRate}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {progressData.overview.coursesCompleted} of {progressData.overview.totalCourses} courses completed
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Average Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold">
                  {progressData.overview.averageGrade}%
                </div>
                <div className="text-xs text-emerald-500 flex items-center mb-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  2.5% improvement
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground flex items-center">
                <Award className="h-4 w-4 mr-1 text-amber-500" />
                {progressData.overview.averageGrade >= 90 
                  ? "Excellent performance!" 
                  : progressData.overview.averageGrade >= 80 
                  ? "Good standing" 
                  : "Keep improving"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Learning Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {progressData.overview.totalPoints.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="h-2 w-2 rounded-full bg-muted"></div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Level {progressData.overview.level} • {1000 - (progressData.overview.totalPoints % 1000)} points to next level
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Learning Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold">
                  {progressData.overview.streakDays} days
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Quizzes: {progressData.overview.quizzesTaken}</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  <span>Assignments: {progressData.overview.assignmentsCompleted}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for different data views */}
        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Course Progress</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Monthly Progress Chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Overall Learning Progress</CardTitle>
                  <CardDescription>
                    Your completion rate progress over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progressData.monthlyProgress}>
                        <defs>
                          <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="completionRate" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorCompletion)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Weekly Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>
                    Hours spent learning each day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progressData.weeklyActivity}>
                        <XAxis dataKey="day" />
                        <YAxis tickFormatter={(value) => `${value}h`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Subject Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>
                    Your grades across different subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={progressData.subjectPerformance}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar 
                          name="Score" 
                          dataKey="score" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.5} 
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Course Progress Tab */}
          <TabsContent value="courses">
            <div className="space-y-6">
              {progressData.courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{course.title}</CardTitle>
                      <Badge variant={
                        course.status === 'completed' ? 'default' : 
                        course.status === 'in-progress' ? 'secondary' : 
                        'outline'
                      }>
                        {course.status === 'completed' ? 'Completed' : 
                         course.status === 'in-progress' ? 'In Progress' : 
                         'Not Started'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Last accessed: {formatDate(course.lastAccessed)}
                      {course.dueDate && ` • Due: ${formatDate(course.dueDate)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      {course.grade && (
                        <div>
                          <span className="text-sm text-muted-foreground">Current Grade:</span>
                          <span className="ml-2 font-medium">{course.grade}%</span>
                        </div>
                      )}
                      
                      {course.badgesEarned.length > 0 && (
                        <div className="flex gap-2">
                          {course.badgesEarned.map((badge, index) => (
                            <Badge key={index} variant="outline" className="flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Grade Performance Breakdown</CardTitle>
                  <CardDescription>
                    Your grades across different subjects and courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={progressData.courses.filter(c => c.grade !== undefined)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="grade" fill="hsl(var(--primary))">
                          {progressData.courses.filter(c => c.grade !== undefined).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                              (entry.grade || 0) >= 90 ? "hsl(var(--success))" :
                              (entry.grade || 0) >= 80 ? "hsl(var(--primary))" :
                              (entry.grade || 0) >= 70 ? "hsl(var(--warning))" :
                              "hsl(var(--destructive))"
                            } />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Learning Activity</CardTitle>
                  <CardDescription>
                    Daily learning activity hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData.weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="hours" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subject Distribution</CardTitle>
                  <CardDescription>
                    Course distribution by subject
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-[240px] w-full max-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie
                          data={progressData.subjectPerformance}
                          dataKey="score"
                          nameKey="subject"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          label={({ subject, score }) => `${subject}: ${score}%`}
                        >
                          {progressData.subjectPerformance.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                "hsl(var(--primary))", 
                                "hsl(var(--secondary))",
                                "hsl(var(--accent))",
                                "hsl(var(--muted))",
                                "hsl(var(--card))"
                              ][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {progressData.achievements.map((achievement) => (
                <Card key={achievement.id} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-1"></div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline">{achievement.category}</Badge>
                    </div>
                    <CardTitle className="mt-3">{achievement.name}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-amber-500" />
                        <span>{achievement.points} points</span>
                      </div>
                      <div className="text-muted-foreground">
                        {formatDate(achievement.dateEarned)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// RadarChart component (simplified version of Recharts RadarChart)
function RadarChart({ outerRadius, data, children }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <div className="flex items-center justify-center h-full">
        <PieChart>
          <Pie
            data={data}
            dataKey="score"
            nameKey="subject"
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            fill="hsl(var(--primary))"
            label={({ subject, score }) => `${subject}: ${score}%`}
          >
            {data.map((entry: any, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={[
                  "hsl(var(--primary))", 
                  "hsl(var(--secondary))",
                  "hsl(var(--accent))",
                  "hsl(var(--muted))",
                  "hsl(var(--card))"
                ][index % 5]} 
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </ResponsiveContainer>
  );
}

// RadarChart sub-components
const PolarGrid = () => null;
const PolarAngleAxis = () => null;
const PolarRadiusAxis = () => null;
const Radar = () => null;