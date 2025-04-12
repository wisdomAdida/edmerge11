import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  role?: string;
  level?: string;
}

export function ProtectedRoute({
  path,
  component: Component,
  role,
  level
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  
  // Check subscription status for students
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/user/subscription'],
    queryFn: async () => {
      if (user && user.role === 'student') {
        const res = await fetch('/api/user/subscription');
        if (!res.ok) throw new Error('Failed to fetch subscription status');
        return res.json();
      }
      return { hasActiveSubscription: true }; // Non-students don't need subscription
    },
    enabled: !!user && user.role === 'student',
  });

  if (isLoading || (user?.role === 'student' && subscriptionLoading)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If not logged in, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If role is specified and user doesn't have that role, redirect to appropriate dashboard
  if (role && user.role !== role) {
    let redirectPath = "/";
    
    // Redirect based on user's actual role
    if (user.role === "student") {
      // For students, include their level in the redirect
      const studentLevel = user.studentLevel || "primary";
      redirectPath = `/dashboard/student/${studentLevel}`;
    } else {
      redirectPath = `/dashboard/${user.role}`;
    }
    
    return (
      <Route path={path}>
        <Redirect to={redirectPath} />
      </Route>
    );
  }
  
  // Check if student has active subscription
  if (user.role === 'student' && subscriptionData && !subscriptionData.hasActiveSubscription) {
    return (
      <Route path={path}>
        <Redirect to="/subscription" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

// For student-specific routes
export function ProtectedStudentRoute({
  path,
  component: Component,
  level
}: ProtectedRouteProps) {
  return (
    <ProtectedRoute 
      path={path}
      component={Component}
      role="student"
      level={level}
    />
  );
}
