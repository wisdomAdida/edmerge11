import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Book,
  BookOpen,
  BookText,
  Brain,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageSquare,
  Microscope,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface DashboardSidebarProps {
  mobile?: boolean;
}

export function DashboardSidebar({ mobile = false }: DashboardSidebarProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  // Navigation item renderer
  const NavItem = ({ href, icon: Icon, children, isSub = false }: { 
    href: string; 
    icon: any; 
    children: React.ReactNode;
    isSub?: boolean;
  }) => {
    // Special handling for student dashboard with level parameter
    let isActive = false;
    
    if (href.includes("/dashboard/student") && href.split("/").length === 4) {
      // For level-specific student dashboard links
      const dashboardLevel = href.split("/")[3];
      // Check if current location is a dashboard with same level
      isActive = location.startsWith(`/dashboard/student/${dashboardLevel}`);
    } else {
      // Regular path matching
      isActive = location === href || 
                (href !== '/dashboard' && location.startsWith(href));
    }
    
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 pl-4 font-normal",
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
          isSub && "pl-9 py-1.5 h-9 text-sm"
        )}
        asChild
      >
        <Link href={href}>
          {Icon && <Icon className={cn("h-4 w-4", isActive && "text-primary")} />}
          <span>{children}</span>
        </Link>
      </Button>
    );
  };
  
  // Collapsible section renderer
  const NavSection = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    children 
  }: { 
    title: string; 
    icon: any; 
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    return (
      <Collapsible
        open={openSections[sectionKey]}
        onOpenChange={() => toggleSection(sectionKey)}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between pl-4 py-2 pr-2 text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4 w-4" />}
              <span className="font-medium">{title}</span>
            </div>
            {openSections[sectionKey] ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-1 pb-2">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  };
  
  // Render navigation items based on user role
  const renderRoleBasedNav = () => {
    if (!user) return null;
    
    switch (user.role) {
      case "student":
        // Create the correct dashboard URL with student level
        const dashboardUrl = user.studentLevel 
          ? `/dashboard/student/${user.studentLevel}` 
          : "/dashboard/student";
          
        return (
          <>
            <NavItem href={dashboardUrl} icon={LayoutDashboard}>
              Dashboard
            </NavItem>
            
            <NavItem href="/student/courses" icon={BookOpen}>
              My Courses
            </NavItem>
            
            <NavSection title="AI Assistance" icon={BrainCircuit} sectionKey="ai-assistance">
              <NavItem href="/student/ai-tutor" icon={Brain} isSub>
                AI Tutor
              </NavItem>
              <NavItem href="/student/advanced-ai-tutor" icon={BrainCircuit} isSub>
                Advanced AI Tutor
              </NavItem>
            </NavSection>
            
            <NavSection title="Learning" icon={Book} sectionKey="learning">
              <NavItem href="/student/library" icon={BookText} isSub>
                Library
              </NavItem>
              <NavItem href="/dashboard/student/notes" icon={FileSpreadsheet} isSub>
                My Notes
              </NavItem>
              <NavItem href="/student/progress" icon={GraduationCap} isSub>
                Progress Tracker
              </NavItem>
              <NavItem href="/student/focus-timer" icon={Clock} isSub>
                Focus Timer
              </NavItem>
            </NavSection>
            
            <NavItem href="/student/mentorship" icon={Users}>
              Mentorship
            </NavItem>
            
            <NavItem href="/student/messages" icon={MessageSquare}>
              Messages
            </NavItem>
            
            <NavItem href="/student/payments" icon={CreditCard}>
              Payment History
            </NavItem>
          </>
        );
        
      case "tutor":
        return (
          <>
            <NavItem href="/dashboard/tutor" icon={LayoutDashboard}>
              Dashboard
            </NavItem>
            
            <NavSection title="Courses" icon={Book} sectionKey="courses">
              <NavItem href="/tutor/courses" icon={BookOpen} isSub>
                My Courses
              </NavItem>
              <NavItem href="/tutor/courses/create" icon={BookText} isSub>
                Create Course
              </NavItem>
              <NavItem href="/tutor/courses/reviews" icon={FileSpreadsheet} isSub>
                Student Reviews
              </NavItem>
            </NavSection>
            
            <NavItem href="/tutor/students" icon={Users}>
              My Students
            </NavItem>
            
            <NavItem href="/tutor/messages" icon={MessageSquare}>
              Messages
            </NavItem>
            
            <NavSection title="Earnings" icon={Wallet} sectionKey="earnings">
              <NavItem href="/tutor/earnings" icon={CreditCard} isSub>
                Revenue
              </NavItem>
              <NavItem href="/tutor/earnings/withdraw" icon={Wallet} isSub>
                Withdraw Funds
              </NavItem>
            </NavSection>
            
            <NavItem href="/tutor/analytics" icon={FileSpreadsheet}>
              Analytics
            </NavItem>
          </>
        );
        
      case "mentor":
        return (
          <>
            <NavItem href="/dashboard/mentor" icon={LayoutDashboard}>
              Dashboard
            </NavItem>
            
            <NavItem href="/mentor/mentees" icon={Users}>
              My Mentees
            </NavItem>
            
            <NavItem href="/dashboard/mentor/sessions" icon={BookOpen}>
              Mentorship Sessions
            </NavItem>
            
            <NavItem href="/dashboard/mentor/messages" icon={MessageSquare}>
              Messages
            </NavItem>
            
            <NavItem href="/dashboard/mentor/resources" icon={Book}>
              Resources
            </NavItem>
            
            <NavItem href="/dashboard/mentor/earnings" icon={Wallet}>
              Earnings
            </NavItem>
          </>
        );
        
      case "researcher":
        return (
          <>
            <NavItem href="/researcher" icon={LayoutDashboard}>
              Dashboard
            </NavItem>
            
            <NavItem href="/researcher/projects" icon={Microscope}>
              Research Projects
            </NavItem>
            
            <NavItem href="/researcher/collaboration" icon={Users}>
              Collaborations
            </NavItem>
            
            <NavItem href="/researcher/publications" icon={Book}>
              Publications
            </NavItem>
            
            <NavItem href="/researcher/resources" icon={BookText}>
              Research Resources
            </NavItem>
            
            <NavItem href="/researcher/messages" icon={MessageSquare}>
              Messages
            </NavItem>
          </>
        );
        
      case "admin":
        return (
          <>
            <NavItem href="/dashboard/admin" icon={LayoutDashboard}>
              Dashboard
            </NavItem>
            
            <NavSection title="Users" icon={Users} sectionKey="users">
              <NavItem href="/admin/users/" icon={GraduationCap} isSub>
                Students
              </NavItem>
              <NavItem href="/admin/users/" icon={Book} isSub>
                Tutors
              </NavItem>
              <NavItem href="/admin/users/" icon={Brain} isSub>
                Mentors
              </NavItem>
              <NavItem href="/admin/users/" icon={Microscope} isSub>
                Researchers
              </NavItem>
            </NavSection>
            
            <NavSection title="Content" icon={BookOpen} sectionKey="content">
              <NavItem href="/dashboard/admin/courses" icon={BookText} isSub>
                Courses
              </NavItem>
              <NavItem href="/admin/dashboard.tsx" icon={Microscope} isSub>
                Research Projects
              </NavItem>
            </NavSection>
            
            <NavSection title="Finances" icon={Wallet} sectionKey="finances">
              <NavItem href="/dashboard/admin/finances/transactions" icon={CreditCard} isSub>
                Transactions
              </NavItem>
              <NavItem href="/dashboard/admin/finances/withdrawals" icon={Wallet} isSub>
                Withdrawals
              </NavItem>
              <NavItem href="/dashboard/admin/finances/revenue" icon={FileSpreadsheet} isSub>
                Revenue Reports
              </NavItem>
            </NavSection>
            
            <NavItem href="/dashboard/admin/security" icon={ShieldCheck}>
              Security
            </NavItem>
            
            <NavItem href="/dashboard/admin/system" icon={Settings}>
              System Settings
            </NavItem>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "w-64 z-30 bg-background pt-3 pb-10 overflow-y-auto",
      mobile ? "h-full" : "fixed left-0 bottom-0 top-16 border-r hidden md:block"
    )}>
      <div className="space-y-1 px-2">
        <NavItem href="/" icon={Home}>
          Home
        </NavItem>
        
        {renderRoleBasedNav()}
        
        <Separator className="my-3" />
        
        <NavItem href={`/dashboard/${user?.role}/settings`} icon={Settings}>
          Settings
        </NavItem>
      </div>
    </div>
  );
}