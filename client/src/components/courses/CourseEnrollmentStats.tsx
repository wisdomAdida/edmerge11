import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Award, TrendingUp, DollarSign } from "lucide-react";

interface CourseEnrollmentStatsProps {
  courseId: number;
}

interface EnrollmentStats {
  count: number;
  completedCount: number;
  averageProgress: number;
  earnings: number;
  tutorEarnings: number;
  courseTitle: string;
  recentEnrollments: {
    id: number;
    userId: number;
    courseId: number;
    progress: number;
    isCompleted: boolean;
    enrolledAt: string;
    updatedAt: string;
  }[];
}

export function CourseEnrollmentStats({ courseId }: CourseEnrollmentStatsProps) {
  const { data: stats, isLoading, error } = useQuery<EnrollmentStats>({
    queryKey: ["/api/courses", courseId, "enrollments", "stats"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/enrollments/stats`);
      if (!res.ok) {
        throw new Error("Failed to fetch enrollment statistics");
      }
      return res.json();
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-2/3" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>Failed to load enrollment statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const completionRate = stats.count > 0 
    ? Math.round((stats.completedCount / stats.count) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Statistics</CardTitle>
        <CardDescription>
          Enrollment and progress data for {stats.courseTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Total Students</span>
              </div>
              <Badge variant="secondary">{stats.count}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Completed</span>
              </div>
              <Badge variant="secondary">{stats.completedCount}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Total Earnings</span>
              </div>
              <Badge variant="secondary">${stats.earnings.toFixed(2)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Tutor Share</span>
              </div>
              <Badge variant="secondary">${stats.tutorEarnings.toFixed(2)}</Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Average Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(stats.averageProgress)}%</span>
          </div>
          <Progress value={stats.averageProgress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Completion Rate</span>
            <span className="text-sm text-muted-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        
        {stats.recentEnrollments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Enrollments</h4>
            <div className="rounded-md border">
              <div className="divide-y">
                {stats.recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">Student #{enrollment.userId}</p>
                      <p className="text-xs text-muted-foreground">
                        Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Progress 
                      value={enrollment.progress} 
                      className="h-2 w-16" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </p>
      </CardFooter>
    </Card>
  );
}