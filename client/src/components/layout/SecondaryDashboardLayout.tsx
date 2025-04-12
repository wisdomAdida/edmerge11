import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Book, 
  BookOpen, 
  BrainCircuit, 
  Calendar, 
  GraduationCap, 
  Home, 
  Library, 
  LogOut, 
  MessageSquare, 
  Settings, 
  Sparkles, 
  Timer, 
  User, 
  UserCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SecondaryDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function SecondaryDashboardLayout({ 
  children, 
  title = "Secondary Student Dashboard"
}: SecondaryDashboardLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard/student/secondary", icon: Home },
    { name: "My Courses", href: "/dashboard/student/courses", icon: BookOpen },
    { name: "Academic Assistant", href: "/dashboard/student/ai-tutor", icon: BrainCircuit },
    { name: "Library", href: "/dashboard/student/library", icon: Library },
    { name: "Calendar", href: "/dashboard/student/calendar", icon: Calendar },
    { name: "Study Timer", href: "/dashboard/student/focus-timer", icon: Timer },
    { name: "Messages", href: "/dashboard/student/messages", icon: MessageSquare },
    { name: "My Progress", href: "/dashboard/student/progress", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar - More formal for older students */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="flex items-center gap-2 ml-2 lg:ml-0">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">EdMerge Academy</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/dashboard/student/messages"
                className="p-2 text-gray-500 hover:text-gray-700 relative"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </Link>
              
              <Link
                href="/dashboard/student/calendar"
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Calendar className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative">
              <Link
                href="/dashboard/student/profile"
                className="flex items-center gap-2 rounded-md py-1.5 px-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                  <span className="text-xs font-bold">
                    {user?.firstName?.[0] || user?.username?.[0] || "S"}
                  </span>
                </div>
                <span className="hidden md:inline-block">{user?.firstName || user?.username || "Student"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Left Sidebar - Fixed for desktop, sliding for mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow gap-y-1 pt-6 px-3 pb-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.href === location || 
              (item.href !== "/dashboard/student/secondary" && location.includes(item.href));
              
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-700" : "text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-3 border-t border-gray-200 space-y-1">
          <Link
            href="/dashboard/student/settings"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-500" />
            Settings
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="pt-5 pb-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <span className="ml-3 text-xl font-bold">EdMerge Academy</span>
                </div>
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-md text-gray-400 hover:text-gray-500"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 space-y-1">
                {navigation.map((item) => {
                  const isActive = item.href === location || 
                    (item.href !== "/dashboard/student/secondary" && location.includes(item.href));
                    
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-base font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <item.icon 
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-blue-700" : "text-gray-500"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-1">
                <Link
                  href="/dashboard/student/settings"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-500" />
                  Settings
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-16 lg:pl-64">
        <div className="px-4 md:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 text-sm mt-1">
              Advance your academic journey with structured learning and comprehensive resources.
            </p>
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
}