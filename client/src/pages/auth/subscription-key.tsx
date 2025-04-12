import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";

export default function SubscriptionKeyPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [keyValue, setKeyValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  if (user) {
    // Use window.location with timestamp to force reload and bust cache
    const timestamp = new Date().getTime();
    
    // Redirect based on user role
    if (user.role === "student") {
      window.location.href = `/dashboard/student?t=${timestamp}`;
    } else if (user.role === "tutor") {
      window.location.href = `/dashboard/tutor?t=${timestamp}`;
    } else if (user.role === "mentor") {
      window.location.href = `/dashboard/mentor?t=${timestamp}`;
    } else if (user.role === "researcher") {
      window.location.href = `/dashboard/researcher?t=${timestamp}`;
    } else if (user.role === "admin") {
      window.location.href = `/dashboard/admin?t=${timestamp}`;
    } else {
      window.location.href = `/dashboard?t=${timestamp}`;
    }
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyValue.trim()) {
      setError("Please enter your subscription key");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting login with subscription key:", keyValue);
      
      // Use fetch directly with credentials included to ensure cookies are properly set
      const response = await fetch("/api/subscription-keys/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyValue }),
        credentials: "include" // Ensure cookies are sent with the request
      });
      
      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Login error:", error);
        throw new Error(error.message || "Failed to login with subscription key");
      }
      
      const data = await response.json();
      console.log("Login successful, response data:", data);
      
      toast({
        title: "Login successful",
        description: "Welcome back to EdMerge!",
      });
      
      // Log the data for debugging
      console.log("Subscription Key Login Response:", data);
      
      // Redirect based on user role with forced page reload
      if (data.user && data.user.role) {
        const userRole = data.user.role;
        console.log("User role for redirect:", userRole);
        
        // Force reload by using window.location (not navigate)
        // Add timestamp to bust cache
        const timestamp = new Date().getTime();
        
        // Small delay to ensure the toast is visible and state is updated
        setTimeout(() => {
          if (userRole === "student") {
            window.location.href = `/dashboard/student?t=${timestamp}`;
          } else if (userRole === "tutor") {
            window.location.href = `/dashboard/tutor?t=${timestamp}`;
          } else if (userRole === "mentor") {
            window.location.href = `/dashboard/mentor?t=${timestamp}`;
          } else if (userRole === "researcher") {
            window.location.href = `/dashboard/researcher?t=${timestamp}`;
          } else if (userRole === "admin") {
            window.location.href = `/dashboard/admin?t=${timestamp}`;
          } else {
            window.location.href = `/dashboard?t=${timestamp}`;
          }
        }, 500);
      } else {
        console.log("No user data found in response, using fallback redirect");
        // Fallback with a small delay
        setTimeout(() => {
          window.location.href = `/dashboard?t=${new Date().getTime()}`;
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to login with subscription key");
      toast({
        title: "Login failed",
        description: err.message || "Failed to login with subscription key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyValue.trim()) {
      setError("Please enter your subscription key");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to verify key:", keyValue);
      
      // First verify if the key is valid using direct fetch with credentials
      const verifyResponse = await fetch(`/api/subscription-keys/verify/${keyValue}`, {
        method: "GET",
        credentials: "include"
      });
      
      console.log("Verify response status:", verifyResponse.status);
      
      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        console.error("Verification error:", error);
        throw new Error(error.message || "Invalid subscription key");
      }
      
      // If valid, redirect to signup page with the key
      console.log("Key verification successful, redirecting to signup");
      navigate(`/auth?key=${encodeURIComponent(keyValue)}`);
    } catch (err: any) {
      setError(err.message || "Failed to verify subscription key");
      toast({
        title: "Verification failed",
        description: err.message || "Failed to verify subscription key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/50 to-muted p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-start mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <KeyRound className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl">Subscription Key</CardTitle>
            <CardDescription className="text-center">
              Enter your subscription key to access premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Subscription Key</Label>
                <Input
                  id="key"
                  placeholder="Enter your key (e.g., SK-XXXXXX-XXXXXX-XXXXXX)"
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  className="font-mono"
                />
                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login with Key"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Don't have an account yet? 
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleRedeem}
              disabled={isLoading}
            >
              Sign up with this key
            </Button>
            <div className="text-xs text-center text-muted-foreground px-6">
              Subscription keys provide access to premium features and can be used to log in on multiple devices
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}