import { ReactNode } from "react";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
}

export function DashboardLayout({ children, title, hideNav = false }: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title={title} />
      
      <div className="flex">
        {!isMobile && !hideNav && <DashboardSidebar />}
        
        <main className="flex-1 p-4 md:p-6 pt-20 md:ml-64">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
            </div>
          )}
          
          <div className="pb-20">{children}</div>
        </main>
      </div>
    </div>
  );
}