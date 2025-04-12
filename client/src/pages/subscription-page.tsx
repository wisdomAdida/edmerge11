import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, Loader2, KeyRound, ArrowRightIcon, LockIcon, Unlock, CreditCard, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { handleFlutterwavePayment, generateTransactionRef } from "@/lib/flutterwave";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
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
  
  // Mutation for subscribing
  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest('POST', '/api/subscribe', { planId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paymentLink) {
        // Redirect to Flutterwave payment page
        window.location.href = data.paymentLink;
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize payment",
          variant: "destructive"
        });
        setPaymentInProgress(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process subscription",
        variant: "destructive"
      });
      setPaymentInProgress(false);
    }
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
      
      // Navigate to success page or dashboard
      if (data && data.planId) {
        navigate(`/subscription/success?plan_id=${data.planId}`);
      } else {
        // Determine the correct user role for redirection
        const redirectPath = user?.role === "student" 
          ? `/dashboard/student`
          : `/dashboard/${user?.role}`;
        
        // Add a cache-busting parameter to force a full page reload
        window.location.href = `${redirectPath}?t=${Date.now()}`;
      }
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
      
      // Determine the correct user role for redirection
      let userRole;
      let userData = data;
      
      // Check if the data has a user property (from API response)
      if (data.user && data.user.role) {
        userRole = data.user.role;
        userData = data.user;
      } 
      // Check if data itself has role (from some API responses)
      else if (data.role) {
        userRole = data.role;
      } 
      // Fallback to student
      else {
        userRole = "student";
      }
      
      // Force refresh of subscription status
      queryClient.invalidateQueries({queryKey: ["/api/user/subscription"]});
      
      console.log("Detected user role:", userRole, "- Preparing to redirect...");
      
      // Use direct window location change for most reliable redirection
      setTimeout(() => {
        console.log("Now redirecting to dashboard for role:", userRole);
        
        // Hard redirect based on role with forced page reload to ensure fresh data
        let dashboardUrl = '/dashboard';
        
        if (userRole === "student") {
          dashboardUrl = '/dashboard/student';
        } else if (userRole === "tutor") {
          dashboardUrl = '/dashboard/tutor';
        } else if (userRole === "mentor") {
          dashboardUrl = '/dashboard/mentor';
        } else if (userRole === "researcher") {
          dashboardUrl = '/dashboard/researcher';
        } else if (userRole === "admin") {
          dashboardUrl = '/dashboard/admin';
        }
        
        // Add a cache-busting parameter to force a full page reload
        window.location.href = `${dashboardUrl}?t=${Date.now()}`;
      }, 1500);
    },
    onError: (error: Error) => {
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
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Get Access to EdMerge
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your preferred method to access the platform for three months.
          </p>
        </div>
        
        {/* Tabs for subscription options */}
        <div className="max-w-4xl mx-auto mb-8">
          <Tabs 
            defaultValue="payment" 
            className="w-full" 
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="payment" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Pay Online</span>
                </TabsTrigger>
                <TabsTrigger value="key" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span>Use Subscription Key</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Payment tab content */}
            <TabsContent value="payment" className="mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Choose Your Subscription Plan</h2>
                <p className="text-muted-foreground">
                  Get full access to all features of EdMerge for three months. Select the plan that best suits your needs.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mx-auto">
                {plans?.map((plan: any) => (
                  <Card 
                    key={plan.id} 
                    className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedPlan === plan.id ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
                    }`}
                  >
                    {plan.name === "Premium" && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-2 rounded-bl-lg font-semibold">
                        MOST POPULAR
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="flex items-baseline mb-4 gap-2">
                        <span className="text-4xl font-bold text-primary">${plan.price}</span>
                        <span className="text-sm text-muted-foreground">/ 3 months</span>
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        {plan.features?.map((feature: string, i: number) => (
                          <li key={i} className="flex items-center text-sm">
                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full py-5 text-md font-semibold rounded-lg"
                        size="default"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={paymentInProgress}
                        variant={plan.name === "Premium" ? "default" : "outline"}
                      >
                        {paymentInProgress && selectedPlan === plan.id ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Subscribe Now`
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Subscription Key tab content */}
            <TabsContent value="key" className="mt-0">
              <div className="max-w-md mx-auto">
                <Card className="border-2 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-primary" />
                      Enter Your Subscription Key
                    </CardTitle>
                    <CardDescription>
                      If you've received a subscription key, enter it below to activate your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subscription-key">Subscription Key</Label>
                        <Input
                          id="subscription-key"
                          type="text"
                          placeholder="e.g. SK-TESTKEY-123456-BASIC"
                          value={subscriptionKey}
                          onChange={(e) => setSubscriptionKey(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={handleRedeemKey}
                        disabled={keyRedeemInProgress}
                      >
                        {keyRedeemInProgress ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Activating...
                          </>
                        ) : (
                          <>
                            <Unlock className="mr-2 h-5 w-5" />
                            Activate Subscription
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-start">
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2"><span className="font-semibold">Don't have a key?</span> You can purchase a subscription using the "Pay Online" tab.</p>
                      <div className="flex items-center gap-2 text-xs bg-primary/5 p-2 rounded-md">
                        <span className="text-primary">Test Keys:</span>
                        <code className="bg-background px-1 py-0.5 rounded font-mono">SK-TESTKEY-123456-BASIC</code>
                        <span>or</span>
                        <code className="bg-background px-1 py-0.5 rounded font-mono">SK-TESTKEY-789012-PREMIUM</code>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
                
                <div className="mt-8 p-4 bg-card border rounded-lg shadow-sm">
                  <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                    <LockIcon className="h-4 w-4 text-green-500" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Cross-device access with a single key</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Instant activation without payment info</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Easy to share with friends and classmates</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Available for both Basic and Premium plans</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-8 bg-card border rounded-xl p-6 max-w-4xl mx-auto shadow-sm">
          <h3 className="text-xl font-semibold text-center mb-4">All Subscription Plans Include</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-2 mb-2">
                <CheckIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-sm">3 Months Access</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-2 mb-2">
                <CheckIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-sm">Cancel Anytime</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-2 mb-2">
                <CheckIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-sm">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-2 mb-2">
                <CheckIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Dialog */}
      <Dialog open={showKeySuccess} onOpenChange={setShowKeySuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-green-500" />
              Subscription Activated
            </DialogTitle>
            <DialogDescription>
              Your subscription has been successfully activated. You're being redirected to the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}