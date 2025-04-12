import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LockIcon, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { handleFlutterwavePayment, generateTransactionRef } from "@/lib/flutterwave";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  
  // Subscription key states
  const [subscriptionKey, setSubscriptionKey] = useState("");
  const [keyRedeemInProgress, setKeyRedeemInProgress] = useState(false);
  const [showKeySuccess, setShowKeySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("payment");
  
  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const res = await fetch('/api/subscription-plans');
      if (!res.ok) throw new Error('Failed to fetch subscription plans');
      return res.json();
    }
  });
  
  // Check if user already has an active subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/user/subscription'],
    queryFn: async () => {
      const res = await fetch('/api/user/subscription');
      if (!res.ok) throw new Error('Failed to fetch subscription status');
      return res.json();
    },
    enabled: !!user
  });
  
  // Mutation for verifying and saving a successful payment
  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: { 
      planId: number; 
      transactionId: string; 
      amount: number;
      tx_ref: string;
    }) => {
      const response = await apiRequest('POST', '/api/verify-subscription-payment', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate user and subscription queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
      
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated successfully",
      });
      
      // Navigate to success page
      navigate(`/subscription/success?plan_id=${data.planId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Verification Failed",
        description: error.message || "We couldn't verify your payment. Please contact support.",
        variant: "destructive"
      });
      setPaymentInProgress(false);
    }
  });
  
  // Mutation for redeeming subscription key
  const redeemKeyMutation = useMutation({
    mutationFn: async (keyValue: string) => {
      console.log("Attempting login with key", keyValue, "to endpoint", '/api/subscription-key-login');
      const response = await apiRequest('POST', '/api/subscription-key-login', { keyValue });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login with subscription key");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      // If successful, show success dialog and update cache
      setShowKeySuccess(true);
      
      // Update user cache with the user object from the response
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      } else if (data) {
        queryClient.setQueryData(["/api/user"], data);
      }
      
      // Update subscription status
      queryClient.invalidateQueries({queryKey: ["/api/user/subscription"]});
      
      toast({
        title: "Success!",
        description: "Your subscription key has been successfully activated.",
        variant: "default"
      });
      
      setKeyRedeemInProgress(false);
      
      // Immediately show success message
      console.log("Login successful, data received:", data);
      
      // Determine if the response contains a specific success message
      let successMessage = "Your subscription key has been successfully activated.";
      if (data.message) {
        successMessage = data.message;
      }
      
      // Show more specific toast based on the success type
      toast({
        title: "Success!",
        description: successMessage,
        variant: "default"
      });
      
      // After 2 seconds, redirect to dashboard
      setTimeout(() => {
        // Only redirect if we're not on the dashboard already
        if (window.location.pathname.indexOf('/dashboard') === -1) {
          const redirectPath = user?.role === "student" 
            ? "/dashboard/student"
            : `/dashboard/${user?.role}`;
          window.location.href = redirectPath;
        }
      }, 2000);
    },
    onError: (error) => {
      console.error("Key redemption error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to redeem subscription key",
        variant: "destructive"
      });
      setKeyRedeemInProgress(false);
    }
  });
  
  // Handle subscription key redemption
  const handleRedeemKey = () => {
    if (!subscriptionKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid subscription key",
        variant: "destructive"
      });
      return;
    }
    
    // Adding debugging
    console.log("Attempting to redeem key:", subscriptionKey);
    
    setKeyRedeemInProgress(true);
    redeemKeyMutation.mutate(subscriptionKey);
  };
  
  // Handle subscription process with Flutterwave
  const handleSubscribe = async (planId: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Find the selected plan
    const plan = plans?.find(p => p.id === planId);
    if (!plan) {
      toast({
        title: "Error",
        description: "Invalid subscription plan selected",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedPlan(planId);
    setPaymentInProgress(true);
    
    try {
      // Generate a transaction reference
      const tx_ref = generateTransactionRef();
      
      // Get customer name from user profile
      const customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;
      
      // Initiate Flutterwave payment
      const result = await handleFlutterwavePayment({
        amount: plan.price,
        currency: "NGN", // Default to NGN, can be made dynamic based on user's location
        customer_email: user.email,
        customer_name: customerName,
        tx_ref,
        description: `EdMerge ${plan.name} Subscription`,
        onClose: () => {
          setPaymentInProgress(false);
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment process",
          });
        },
        onSuccess: async (data: any) => {
          // Verify the payment on the server
          verifyPaymentMutation.mutate({
            planId,
            transactionId: data.transaction_id.toString(),
            amount: plan.price,
            tx_ref
          });
        }
      });
      
      console.log("Flutterwave payment result:", result);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: (error as Error).message || "Failed to process payment",
        variant: "destructive"
      });
      setPaymentInProgress(false);
    }
  };
  
  // If user has an active subscription, redirect to dashboard with hard redirect
  useEffect(() => {
    if (subscriptionData?.hasActiveSubscription && user?.role) {
      console.log("User has active subscription, redirecting to dashboard...");
      const redirectPath = user.role === "student" 
        ? `/dashboard/student`
        : `/dashboard/${user.role}`;
      
      // Use window.location for a full page reload to avoid client-side routing issues
      window.location.href = `${redirectPath}?t=${Date.now()}`;
    }
  }, [subscriptionData?.hasActiveSubscription, user?.role]);
  
  // Loading state
  if (plansLoading || subscriptionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">Loading subscription information...</h2>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-background to-muted">
      <div className="container max-w-6xl px-4 py-8 md:py-16">
        <div className="flex flex-col items-center gap-6 text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Choose Your EdMerge Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Unlock the full potential of EdMerge with our affordable subscription plans.
            Get access to premium features and maximize your learning experience.
          </p>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment">Pay Online</TabsTrigger>
            <TabsTrigger value="key">Use Subscription Key</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment" className="pt-6">
            <div className="grid gap-8 md:grid-cols-2">
              {plans?.map((plan) => (
                <Card key={plan.id} className={`overflow-hidden transition-all ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-3xl font-bold mb-2">
                      ₦{plan.price.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {plan.durationMonths} months
                      </span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features?.split(',').map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span>{feature.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={paymentInProgress}
                    >
                      {paymentInProgress && selectedPlan === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Subscribe Now</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="key" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activate with Subscription Key</CardTitle>
                <CardDescription>
                  Enter your subscription key to activate your EdMerge subscription.
                  If you don't have a key, contact your administrator or purchase a plan online.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <Input 
                      placeholder="Enter your subscription key" 
                      value={subscriptionKey}
                      onChange={(e) => setSubscriptionKey(e.target.value)}
                      className="text-center font-mono"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleRedeemKey}
                    disabled={keyRedeemInProgress || !subscriptionKey.trim()}
                    className="w-full"
                  >
                    {keyRedeemInProgress ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>Activate Subscription</>
                    )}
                  </Button>
                </div>
                
                {showKeySuccess && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-md text-center">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <h3 className="text-lg font-medium text-green-800">Subscription Activated!</h3>
                    <p className="text-green-600">Your subscription has been successfully activated.</p>
                    <Button 
                      variant="link" 
                      onClick={() => window.location.href = '/dashboard'} 
                      className="mt-2"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {user?.subscriptionStatus === "active" && user?.subscriptionEndDate && (
          <div className="mt-8 p-4 bg-primary/10 rounded-md max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Your Current Subscription</h3>
                <p className="text-sm text-muted-foreground">
                  You already have an active {user.subscriptionType} subscription until{' '}
                  {format(new Date(user.subscriptionEndDate), 'PPP')}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {user.subscriptionType === "basic" ? "Basic" : "Premium"}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
