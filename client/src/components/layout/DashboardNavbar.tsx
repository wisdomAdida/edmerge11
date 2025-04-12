import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Bell, Search, User, Settings, LogOut, X, ChevronDown, MessageSquare } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardNavbarProps {
  title?: string;
}

export function DashboardNavbar({ title }: DashboardNavbarProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Clear any cached data
      localStorage.removeItem('isNewUser');
      // Use Wouter's navigate instead of window.location for client-side routing
      navigate('/auth');
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback - even if the API fails, we should redirect to auth
      navigate('/auth');
    }
  };
  
  // Get base dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/dashboard";
    
    switch (user.role) {
      case "student":
        return "/dashboard/student";
      case "tutor":
        return "/dashboard/tutor";
      case "mentor":
        return "/dashboard/mentor";
      case "researcher":
        return "/dashboard/researcher";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/dashboard";
    }
  };
  
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
              <DashboardSidebar mobile={true} />
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="text-muted-foreground"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Messages button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground"
                asChild
              >
                <Link href={`${getDashboardPath()}/messages`}>
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Messages</span>
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Notifications</p>
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={() => console.log('Marking all notifications as read')}>
                        Mark all as read
                      </Button>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/assets/avatar-1.jpg" />
                        <AvatarFallback>AN</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Ade Tunji</span> enrolled in your{" "}
                          <span className="font-medium">Mathematics 101</span> course
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/assets/avatar-2.jpg" />
                        <AvatarFallback>BJ</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Dr. Bunmi Johnson</span> reviewed your research proposal
                        </p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          New course materials have been added to{" "}
                          <span className="font-medium">Physics for Secondary Schools</span>
                        </p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Button variant="ghost" className="w-full justify-center text-sm" size="sm" asChild>
                    <Link href={`${getDashboardPath()}/notifications`}>
                      View all notifications
                    </Link>
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
                      <Link href={`${getDashboardPath()}`}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`${getDashboardPath()}/settings`}>
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