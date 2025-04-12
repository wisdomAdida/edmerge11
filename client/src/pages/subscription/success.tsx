import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function SubscriptionSuccessPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Extract plan ID from URL
  const params = new URLSearchParams(window.location.search);
  const planId = params.get('plan_id');
  
  // Get plan details
  const { data: plan } = useQuery({
    queryKey: ['/api/subscription-plans', planId],
    queryFn: async () => {
      if (!planId) return null;
      const res = await fetch(`/api/subscription-plans/${planId}`);
      if (!res.ok) throw new Error('Failed to fetch plan details');
      return res.json();
    },
    enabled: !!planId
  });
  
  // Refresh user subscription data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  }, [queryClient]);
  
  const handleContinue = () => {
    if (user?.role === 'student') {
      navigate('/dashboard/student');
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="container max-w-2xl py-20 flex items-center justify-center min-h-screen">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Subscription Successful!</CardTitle>
          <CardDescription className="text-lg">
            Your subscription has been activated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Subscription Details</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{plan?.name || 'EdMerge Subscription'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${plan?.price || '--'} for 3 months</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-600">Active</span>
              </li>
            </ul>
          </div>
          
          <div className="text-center mt-4">
            <p>You now have access to all the features included in your subscription plan.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg" onClick={handleContinue}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}