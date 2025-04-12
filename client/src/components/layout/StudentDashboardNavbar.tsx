import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Bell, Search, Sparkles, Book, MessageSquare, Calendar, User, Settings, LogOut, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "./DashboardSidebar";
import { useQuery } from "@tanstack/react-query";

interface StudentDashboardNavbarProps {
  title?: string;
}

export function StudentDashboardNavbar({ title }: StudentDashboardNavbarProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  
  // Fetch notifications
  const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  // Fetch upcoming classes/events
  const { data: upcomingEvents = [], isLoading: isLoadingEvents } = useQuery<any[]>({
    queryKey: ["/api/student/upcoming-events"],
    enabled: !!user,
  });

  // Fetch unread messages count
  const { data: unreadMessages = 0, isLoading: isLoadingMessages } = useQuery<number>({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user,
  });
  
  // Set active level based on URL or user's level
  useEffect(() => {
    // Parse from URL first if available
    if (location.includes('/dashboard/student/primary')) {
      setActiveLevel('primary');
    } else if (location.includes('/dashboard/student/secondary')) {
      setActiveLevel('secondary');
    } else if (location.includes('/dashboard/student/tertiary')) {
      setActiveLevel('tertiary');
    } else if (location.includes('/dashboard/student/individual')) {
      setActiveLevel('individual');
    } else if (user?.studentLevel) {
      // Default to user's level if no specific level in URL
      setActiveLevel(user.studentLevel);
    }
  }, [location, user]);
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Clear any cached data
      localStorage.removeItem('isNewUser');
      // Navigate to auth page using wouter's navigate
      navigate('/auth');
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the API fails, navigate to auth
      navigate('/auth');
    }
  };
  
  // Get the appropriate dashboard URL for the current student level
  const getDashboardUrl = () => {
    if (!user?.studentLevel) return "/dashboard/student";
    return `/dashboard/student/${user.studentLevel}`;
  };

  // Navigate to a specific level dashboard
  const navigateToLevel = (level: string) => {
    setActiveLevel(level);
  };

  // Format time to relative format (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Format notifications for display
  const formattedNotifications = notifications.map((notification: any) => ({
    id: notification.id,
    content: notification.content,
    sender: notification.senderName || "EdMerge System",
    time: notification.createdAt ? formatRelativeTime(notification.createdAt) : "recently",
    icon: notification.type === 'course' ? Book : notification.type === 'message' ? MessageSquare : Sparkles
  }));

  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur z-40">
      <div className="flex h-16 items-center px-4 md:px-6">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <DashboardSidebar />
            </SheetContent>
          </Sheet>
        ) : (
          <Link href="/">
            <Button variant="ghost" className="mr-4 hidden md:flex">
              <strong className="text-xl text-primary">EdMerge</strong>
            </Button>
          </Link>
        )}
        
        {isMobile && (
          <div className="flex items-center justify-center flex-1">
            <Link href="/">
              <Button variant="ghost" className="-ml-5">
                <strong className="text-xl text-primary">EdMerge</strong>
              </Button>
            </Link>
          </div>
        )}
        
        {/* Education level selector - only visible for students */}
        {!isMobile && user?.role === 'student' && (
          <div className="mx-4">
            <div className="flex items-center space-x-2">
              {["primary", "secondary", "tertiary", "individual"].map((level) => (
                <Button 
                  key={level}
                  variant={activeLevel === level ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  asChild
                >
                  <Link href={`/dashboard/student/${level}`}>
                    {level}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {isSearchOpen ? (
          <div className="relative flex-1 md:ml-auto md:max-w-sm lg:max-w-lg mx-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses, materials, tutors..."
              className="w-full pl-8 focus-visible:ring-primary"
              autoFocus
              onBlur={() => setIsSearchOpen(false)}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {title && !isMobile && (
              <div className="flex-1">
                <h1 className="text-lg font-bold">{title}</h1>
              </div>
            )}
            
            <div className="ml-auto flex items-center gap-2">
              {/* Upcoming events button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    {upcomingEvents.length > 0 && (
                      <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-amber-500" />
                    )}
                    <span className="sr-only">Upcoming Events</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Upcoming Events</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event: any) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                          <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs">{new Date(event.startTime).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-sm text-muted-foreground">
                        No upcoming events
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <Button variant="ghost" className="w-full justify-center text-sm" size="sm" asChild>
                    <Link href="/dashboard/student/calendar">
                      View calendar
                    </Link>
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Messages button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                asChild
              >
                <Link href='/dashboard/student/messages'>
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  {unreadMessages > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                    >
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </Badge>
                  )}
                  <span className="sr-only">Messages</span>
                </Link>
              </Button>

              {/* Search button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="text-muted-foreground"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              
              {/* Notifications dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary" />
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Notifications</p>
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                        Mark all as read
                      </Button>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {formattedNotifications.length > 0 ? (
                      formattedNotifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                          <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                            <notification.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm">{notification.content}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No new notifications</p>
                      </div>
                    )}
                  </div>
                  {formattedNotifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <Button variant="ghost" className="w-full justify-center text-sm" size="sm" asChild>
                        <Link href="/dashboard/student/notifications">
                          View all notifications
                        </Link>
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage || undefined} />
                      <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {user?.role} {user?.role === "student" && `• ${user.studentLevel}`}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardUrl()}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/student/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/student/courses">
                        <Book className="mr-2 h-4 w-4" />
                        <span>My Courses</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/student/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </header>
  );
}