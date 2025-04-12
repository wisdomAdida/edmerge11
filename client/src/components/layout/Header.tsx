import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";

interface HeaderProps {
  title?: string;
}

export const Header = ({ title = "EdMerge" }: HeaderProps) => {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/auth");
  };

  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case "student":
        return [
          { name: "Dashboard", path: `/dashboard/student/${user.studentLevel}` },
          { name: "My Courses", path: "/courses" },
          { name: "AI Tutor", path: "/ai-tutor" },
          { name: "Ask a Mentor", path: "/mentors" },
          { name: "Learning Path", path: "/learning-path" }
        ];
      case "tutor":
        return [
          { name: "Dashboard", path: "/dashboard/tutor" },
          { name: "My Courses", path: "/tutor/courses" },
          { name: "Students", path: "/tutor/students" },
          { name: "Earnings", path: "/tutor/earnings" },
          { name: "Analytics", path: "/tutor/analytics" }
        ];
      case "mentor":
        return [
          { name: "Dashboard", path: "/dashboard/mentor" },
          { name: "My Students", path: "/mentor/students" },
          { name: "Sessions", path: "/mentor/sessions" },
          { name: "Resources", path: "/mentor/resources" }
        ];
      case "researcher":
        return [
          { name: "Dashboard", path: "/dashboard/researcher" },
          { name: "Projects", path: "/researcher/projects" },
          { name: "Publications", path: "/researcher/publications" },
          { name: "Collaborations", path: "/researcher/collaborations" }
        ];
      case "admin":
        return [
          { name: "Dashboard", path: "/dashboard/admin" },
          { name: "Users", path: "/admin/users" },
          { name: "Courses", path: "/admin/courses" },
          { name: "Payments", path: "/admin/payments" },
          { name: "Reports", path: "/admin/reports" },
          { name: "Settings", path: "/admin/settings" }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavigationItems();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-lg bg-primary-500 flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold font-heading">EM</span>
              </div>
              <span className="text-lg font-semibold text-gray-800 hidden md:block">{title}</span>
            </div>
          </div>
          
          {/* Middle Nav Items */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item, index) => (
              <button 
                key={index} 
                onClick={() => navigate(item.path)}
                className={`${
                  location === item.path 
                    ? "text-primary-500 border-b-2 border-primary-500" 
                    : "text-gray-500 hover:text-primary-500"
                } pb-2 px-1 text-sm font-medium`}
              >
                {item.name}
              </button>
            ))}
          </nav>
          
          {/* Right Side Items */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-1 rounded-full text-gray-500 hover:text-primary-500 relative">
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center">3</span>
              </button>
              
              {/* Messages */}
              <button className="p-1 rounded-full text-gray-500 hover:text-primary-500">
                <i className="ri-message-3-line text-xl"></i>
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={user.profileImage || "https://ui-avatars.com/api/?name=" + user.firstName + "+" + user.lastName} 
                      alt="Profile" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">{user.firstName} {user.lastName.charAt(0)}.</span>
                  
                  {/* Logout */}
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-primary-500"
                  >
                    <i className="ri-logout-box-line ml-2"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
