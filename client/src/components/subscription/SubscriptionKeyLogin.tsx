import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Schema for subscription key validation
const subscriptionKeySchema = z.object({
  keyValue: z
    .string()
    .min(6, { message: "Subscription key must be at least 6 characters long" })
    .max(64, { message: "Subscription key cannot exceed 64 characters" }),
});

type SubscriptionKeyFormValues = z.infer<typeof subscriptionKeySchema>;

export function SubscriptionKeyLogin() {
  const { toast } = useToast();
  const { user } = useAuth(); // For checking if user is logged in
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SubscriptionKeyFormValues>({
    resolver: zodResolver(subscriptionKeySchema),
    defaultValues: {
      keyValue: "",
    },
  });

  // Mutation for redeeming subscription key
  const redeemKeyMutation = useMutation({
    mutationFn: async (data: SubscriptionKeyFormValues) => {
      const response = await apiRequest("POST", "/api/subscription-keys/login", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login with subscription key");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Login successful, user data:", data);
      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
        variant: "default",
      });
      
      // Redirect based on user role with timestamp to bust cache
      const timestamp = new Date().getTime();
      
      if (data.user && data.user.role) {
        const userRole = data.user.role;
        console.log(`Redirecting to /dashboard/${userRole}?t=${timestamp}`);
        
        // Small delay to ensure the toast is visible and state is updated
        setTimeout(() => {
          window.location.href = `/dashboard/${userRole}?t=${timestamp}`;
        }, 500);
      } else {
        console.log("No user role found, using fallback redirect");
        setTimeout(() => {
          window.location.href = `/dashboard?t=${timestamp}`;
        }, 500);
      }
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "An error occurred while logging in with the key");
      toast({
        title: "Error",
        description: error.message || "Failed to login with subscription key",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SubscriptionKeyFormValues) => {
    setErrorMessage(null);
    try {
      await redeemKeyMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-center">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="keyValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Subscription Key</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your subscription key" 
                    {...field} 
                    className="font-mono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={redeemKeyMutation.isPending}>
            {redeemKeyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Login with Key"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}