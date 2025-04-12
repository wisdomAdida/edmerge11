import { ReactNode, useEffect, useState } from "react";
import { StudentDashboardNavbar } from "./StudentDashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface StudentDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
  studentLevel?: 'primary' | 'secondary' | 'tertiary' | 'individual';
}

export function StudentDashboardLayout({ 
  children, 
  title, 
  hideNav = false,
  studentLevel
}: StudentDashboardLayoutProps) {
  const isMobile = useIsMobile();
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [dashboardReady, setDashboardReady] = useState(false);
  
  // Redirect to the correct dashboard based on student level
  useEffect(() => {
    if (!isLoading && user) {
      // If no specific student level is provided to the component
      if (!studentLevel) {
        // If user has a student level, use that
        if (user.studentLevel) {
          const currentUrlLevel = location.split('/').pop();
          // Only redirect if we're not already on the correct level page
          if (currentUrlLevel !== user.studentLevel && 
              location.startsWith('/dashboard/student') && 
              !location.includes(`/dashboard/student/${user.studentLevel}`)) {
            navigate(`/dashboard/student/${user.studentLevel}`);
          } else {
            setDashboardReady(true);
          }
        } else {
          // If user doesn't have a level, they can use any dashboard
          setDashboardReady(true);
        }
      } else {
        // If a specific studentLevel is provided to the component, we don't need to redirect
        setDashboardReady(true);
      }
    } else if (!isLoading && !user) {
      // If not loading and no user, redirect to auth
      navigate('/auth');
    }
  }, [isLoading, user, navigate, location, studentLevel]);

  if (isLoading || !dashboardReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Format the title based on student level if not provided
  const displayTitle = title || (studentLevel 
    ? `${studentLevel.charAt(0).toUpperCase()}${studentLevel.slice(1)} Student Dashboard` 
    : "Student Dashboard");

  return (
    <div className="min-h-screen bg-background">
      <StudentDashboardNavbar title={displayTitle} />
      
      <div className="flex">
        {!isMobile && !hideNav && <DashboardSidebar />}
        
        <main className="flex-1 p-4 md:p-6 pt-20 md:ml-64">
          {/* Dashboard header with dynamic content */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{displayTitle}</h1>
            {studentLevel && (
              <p className="text-muted-foreground mt-1">
                {studentLevel === 'primary' && "Learning made fun for younger students"}
                {studentLevel === 'secondary' && "Advancing your knowledge for success"}
                {studentLevel === 'tertiary' && "University and college level education"}
                {studentLevel === 'individual' && "Personalized learning tailored to you"}
              </p>
            )}
          </div>
          
          <div className="pb-20">{children}</div>
        </main>
      </div>
    </div>
  );
}