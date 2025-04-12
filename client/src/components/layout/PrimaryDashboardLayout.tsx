import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Book, 
  Brain, 
  GraduationCap, 
  Home, 
  Library, 
  LogOut, 
  MessageSquare, 
  Settings, 
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function PrimaryDashboardLayout({ 
  children, 
  title = "Primary Student Dashboard"
}: PrimaryDashboardLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { name: "Home", href: "/dashboard/student/primary", icon: Home, current: location === "/dashboard/student/primary" },
    { name: "My Courses", href: "/dashboard/student/courses", icon: Book, current: location.includes("/dashboard/student/courses") },
    { name: "AI Helper", href: "/dashboard/student/ai-tutor", icon: Brain, current: location.includes("/dashboard/student/ai-tutor") },
    { name: "Library", href: "/dashboard/student/library", icon: Library, current: location === "/dashboard/student/library" },
    { name: "Messages", href: "/dashboard/student/messages", icon: MessageSquare, current: location === "/dashboard/student/messages" },
  ];

  const secondaryNavigation = [
    { name: "My Profile", href: "/dashboard/student/profile", icon: UserCircle },
    { name: "Settings", href: "/dashboard/student/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Navbar - Kid-friendly with rounded edges and colorful elements */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 shadow-md rounded-b-xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="md:hidden rounded-full p-2 text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-2 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
                EdMerge Kids
              </span>
            </div>
          </div>

          <div className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors",
                  item.current
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <div className="relative">
              <Link
                href="/dashboard/student/profile"
                className="flex items-center space-x-1 rounded-full bg-gray-100 p-1 px-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="text-xs font-bold">
                    {user?.firstName?.[0] || user?.username?.[0] || "S"}
                  </span>
                </div>
                <span className="hidden md:block">{user?.firstName || user?.username || "Student"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white rounded-r-2xl shadow-xl">
            <div className="pt-5 pb-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-full bg-primary p-2 text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="ml-3 text-xl font-bold text-primary">EdMerge Kids</span>
                </div>
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-8">
                <div className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "group flex items-center rounded-xl px-3 py-3 text-base font-medium transition-colors",
                        item.current
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-6 w-6 flex-shrink-0",
                          item.current ? "text-white" : "text-gray-500 group-hover:text-primary"
                        )}
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                <div className="mt-10 pt-6 border-t border-gray-200 px-2 space-y-1">
                  {secondaryNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className="group flex items-center rounded-xl px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-500 group-hover:text-primary" />
                      {item.name}
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="group flex w-full items-center rounded-xl px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="mr-3 h-6 w-6 flex-shrink-0 text-gray-500 group-hover:text-red-500" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-20 px-4 pb-12 min-h-screen">
        <div className="mx-auto max-w-7xl">
          {/* Dynamic content heading with decorative elements for kids */}
          <div className="mb-6 border-b-2 border-dashed border-primary/30 pb-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">{title}</h1>
            <p className="text-muted-foreground mt-1">
              Learning is fun! Let's explore and discover new things today.
            </p>
          </div>

          {/* Main content */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}