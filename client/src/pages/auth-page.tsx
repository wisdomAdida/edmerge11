import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  // Check if this is a new user to redirect to subscription
  useEffect(() => {
    if (!isLoading && user) {
      const isNewUser = localStorage.getItem('isNewUser');
      
      if (isNewUser === 'true') {
        // Clear the new user flag
        localStorage.removeItem('isNewUser');
        // Redirect to subscription page
        window.location.href = '/subscription';
      }
    }
  }, [isLoading, user]);

  // If user is already authenticated, redirect to dashboard
  if (!isLoading && user) {
    let dashboardPath = `/dashboard/${user.role}`;
    
    // For students, include their level in the redirect
    if (user.role === "student") {
      const studentLevel = user.studentLevel || "primary";
      dashboardPath = `/dashboard/student/${studentLevel}`;
    }
    
    return <Redirect to={dashboardPath} />;
  }

  const handleSwitchToSignup = () => {
    setActiveTab("register");
  };

  const handleSwitchToLogin = () => {
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-background rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">EdMerge</h2>
            <p className="text-muted-foreground">Premium E-Learning Platform</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-lg font-bold">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-lg font-bold">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onSwitchToSignup={handleSwitchToSignup} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block bg-gradient-to-br from-primary to-primary-foreground text-white">
          <div className="h-full flex flex-col justify-center p-12">
            <h1 className="text-4xl font-bold mb-6">Welcome to EdMerge</h1>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Learn Anywhere</h3>
                <p>Access courses and materials from any device at your own pace.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Expert Tutors</h3>
                <p>Learn from industry professionals and experienced educators.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">AI-Powered Learning</h3>
                <p>Get personalized assistance with our advanced AI tutor.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}