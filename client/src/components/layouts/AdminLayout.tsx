import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Book,
  KeySquare,
  Settings,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
        navigate("/auth");
      },
    });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-500">
          You don't have permission to access the admin dashboard.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string = "Admin User") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Add admin menu options
  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
      active: location === "/admin",
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
      active: location === "/admin/users",
    },
    {
      title: "Courses",
      icon: <Book className="h-5 w-5" />,
      href: "/admin/courses",
      active: location === "/admin/courses",
    },
    {
      title: "Subscription Keys",
      icon: <KeySquare className="h-5 w-5" />,
      href: "/admin/subscription-keys",
      active: location === "/admin/subscription-keys",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
      active: location === "/admin/settings",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-primary">EdMerge</span>
              <span className="text-sm text-muted-foreground">Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                View Site
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.profileImage || ""}
                      alt={user.firstName || ""}
                    />
                    <AvatarFallback>
                      {getInitials(`${user.firstName || ""} ${user.lastName || ""}`)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-6">
        {/* Sidebar */}
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
          <nav className="grid items-start gap-2 text-sm font-medium">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent ${
                  item.active ? "bg-accent text-accent-foreground" : "transparent"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.active && (
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex w-full flex-col overflow-hidden">
          {/* Children will be rendered here */}
          {/* This will render the actual page content */}
          {children}
        </main>
      </div>
    </div>
  );
}