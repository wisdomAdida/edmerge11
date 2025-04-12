import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function SubscriptionErrorPage() {
  const [, navigate] = useLocation();
  
  // Extract error message from URL
  const params = new URLSearchParams(window.location.search);
  const errorMessage = params.get('message') || 'We encountered an issue processing your subscription.';
  
  const handleRetry = () => {
    navigate('/subscription');
  };
  
  const handleContact = () => {
    // Redirect to contact page or open email client
    window.location.href = "mailto:support@edmerge.com?subject=Subscription%20Payment%20Issue";
  };
  
  return (
    <div className="container max-w-2xl py-20 flex items-center justify-center min-h-screen">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-20 w-20 text-red-500" />
          </div>
          <CardTitle className="text-3xl">Payment Failed</CardTitle>
          <CardDescription className="text-lg">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium mb-2">What You Can Do</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Check your payment method and ensure you have sufficient funds</li>
              <li>Verify your billing information is correct</li>
              <li>Try again with a different payment method</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 flex-wrap">
          <Button variant="default" onClick={handleRetry}>
            Try Again
          </Button>
          <Button variant="outline" onClick={handleContact}>
            Contact Support
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}