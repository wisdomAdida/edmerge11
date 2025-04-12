import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { CalendarClock, FileText, Users, Beaker, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type ActivityType = 'project_created' | 'project_updated' | 'collaboration_joined' | 'collaboration_invited';

interface ActivityItem {
  id: number;
  type: ActivityType;
  timestamp: string | Date;
  title: string;
  description: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  metadata?: Record<string, any>;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'project_created':
      return <FileText className="h-4 w-4 text-primary" />;
    case 'project_updated':
      return <Beaker className="h-4 w-4 text-amber-500" />;
    case 'collaboration_joined':
      return <Users className="h-4 w-4 text-green-500" />;
    case 'collaboration_invited':
      return <CalendarClock className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getActivityBadge = (type: ActivityType) => {
  switch (type) {
    case 'project_created':
      return <Badge variant="default">Created</Badge>;
    case 'project_updated':
      return <Badge variant="outline">Updated</Badge>;
    case 'collaboration_joined':
      return <Badge variant="secondary">Joined</Badge>;
    case 'collaboration_invited':
      return <Badge variant="secondary">Invited</Badge>;
    default:
      return null;
  }
};

export const RecentActivity = () => {
  const [, navigate] = useLocation();
  
  const { data: activities, isLoading, error } = useQuery<ActivityItem[]>({
    queryKey: ['/api/activities/recent'],
    retry: false
  });
  
  const formatDateTime = (dateTime: string | Date) => {
    if (!dateTime) return '';
    return format(new Date(dateTime), 'MMM d, yyyy');
  };
  
  const formatTimeAgo = (dateTime: string | Date) => {
    if (!dateTime) return '';
    return formatDistanceToNow(new Date(dateTime), { addSuffix: true });
  };
  
  const renderActivityItem = (activity: ActivityItem) => {
    return (
      <div key={activity.id} className="flex items-start space-x-4 py-3">
        <div className="mt-1">{getActivityIcon(activity.type)}</div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium">{activity.title}</p>
            <div className="flex items-center">
              {getActivityBadge(activity.type)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{activity.description}</p>
          <div className="flex items-center text-xs text-muted-foreground pt-1">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{formatTimeAgo(activity.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  const renderSkeletonItems = () => {
    return Array(4).fill(0).map((_, index) => (
      <div key={index} className="flex items-start space-x-4 py-3">
        <Skeleton className="h-4 w-4 rounded-full mt-1" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-3 w-[90%]" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    ));
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest activities and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          renderSkeletonItems()
        ) : error ? (
          <p className="text-center text-muted-foreground py-3">
            Unable to load recent activities. Please try again later.
          </p>
        ) : activities && activities.length > 0 ? (
          activities.map(renderActivityItem)
        ) : (
          <p className="text-center text-muted-foreground py-3">
            No recent activities found.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => navigate('/researcher/activity')}
        >
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  );
};