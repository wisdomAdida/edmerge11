import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const getNavigation = (role: string, studentLevel?: string) => {
  switch (role) {
    case "student":
      return [
        { name: "Dashboard", icon: "ri-dashboard-line", href: `/dashboard/student/${studentLevel}` },
        { name: "My Courses", icon: "ri-book-open-line", href: "/courses" },
        { name: "AI Tutor", icon: "ri-robot-line", href: "/ai-tutor" },
        { name: "Mentorship", icon: "ri-team-line", href: "/mentors" },
        { name: "Learning Path", icon: "ri-road-map-line", href: "/learning-path" },
        { name: "Notifications", icon: "ri-notification-3-line", href: "/notifications" },
        { name: "Settings", icon: "ri-settings-3-line", href: "/settings" }
      ];
    case "tutor":
      return [
        { name: "Dashboard", icon: "ri-dashboard-line", href: "/dashboard/tutor" },
        { name: "My Courses", icon: "ri-book-open-line", href: "/tutor/courses" },
        { name: "Create Course", icon: "ri-add-circle-line", href: "/tutor/courses/create" },
        { name: "Students", icon: "ri-user-line", href: "/tutor/students" },
        { name: "Earnings", icon: "ri-money-dollar-circle-line", href: "/tutor/earnings" },
        { name: "Analytics", icon: "ri-bar-chart-2-line", href: "/tutor/analytics" },
        { name: "Settings", icon: "ri-settings-3-line", href: "/tutor/settings" }
      ];
    case "mentor":
      return [
        { name: "Dashboard", icon: "ri-dashboard-line", href: "/dashboard/mentor" },
        { name: "My Students", icon: "ri-user-line", href: "/mentor/students" },
        { name: "Session Requests", icon: "ri-calendar-check-line", href: "/mentor/sessions" },
        { name: "Session History", icon: "ri-history-line", href: "/mentor/history" },
        { name: "Resources", icon: "ri-file-list-3-line", href: "/mentor/resources" },
        { name: "Settings", icon: "ri-settings-3-line", href: "/mentor/settings" }
      ];
    case "researcher":
      return [
        { name: "Dashboard", icon: "ri-dashboard-line", href: "/dashboard/researcher" },
        { name: "Projects", icon: "ri-folder-chart-line", href: "/researcher/projects" },
        { name: "Publications", icon: "ri-article-line", href: "/researcher/publications" },
        { name: "Collaborations", icon: "ri-team-line", href: "/researcher/collaborations" },
        { name: "Data Sets", icon: "ri-database-2-line", href: "/researcher/datasets" },
        { name: "Settings", icon: "ri-settings-3-line", href: "/researcher/settings" }
      ];
    case "admin":
      return [
        { name: "Dashboard", icon: "ri-dashboard-line", href: "/dashboard/admin" },
        { name: "User Management", icon: "ri-user-settings-line", href: "/admin/users" },
        { name: "Course Management", icon: "ri-book-open-line", href: "/admin/courses" },
        { name: "Payments & Revenue", icon: "ri-money-dollar-circle-line", href: "/admin/payments" },
        { name: "Analytics", icon: "ri-bar-chart-2-line", href: "/admin/analytics" },
        { name: "Reports", icon: "ri-file-chart-line", href: "/admin/reports" },
        { name: "Platform Settings", icon: "ri-settings-3-line", href: "/admin/settings" }
      ];
    default:
      return [];
  }
};

export const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navigation = getNavigation(user.role, user.studentLevel);

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:z-20 bg-sidebar border-r border-sidebar-border">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* User Profile Summary */}
        <div className="flex items-center flex-shrink-0 px-4 py-6">
          <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center overflow-hidden mr-3">
            <img 
              src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3563E9&color=fff`} 
              alt="Profile" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div>
            <h2 className="text-sm font-medium text-sidebar-foreground">{user.firstName} {user.lastName}</h2>
            <p className="text-xs text-sidebar-foreground opacity-70">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-4 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
            >
              <a
                className={`${
                  location === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }
                group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
              >
                <i className={`${item.icon} flex-shrink-0 mr-3 text-lg`}></i>
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Bottom Section */}
      <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
        <a
          href="https://www.afrimerge.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sidebar-foreground opacity-70 hover:opacity-100 flex items-center"
        >
          <span>EdMerge by Afrimerge</span>
          <i className="ri-external-link-line ml-1"></i>
        </a>
      </div>
    </div>
  );
};
