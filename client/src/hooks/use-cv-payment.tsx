import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { CvPayment } from "@shared/schema";
import { handleFlutterwavePayment, FlutterwavePaymentConfig, generateTransactionRef } from "@/lib/flutterwave";

interface CreateCvPaymentParams {
  amount: number;
  currency: string;
  cvId?: number | null;
  transactionId: string;
}

export const useCvPayment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get current user's CV payments
  const { data: userCvPayments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ["/api/user/cv-payments"],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest("GET", "/api/user/cv-payments");
      return res.json();
    },
    enabled: !!user,
  });

  // Create a new CV payment
  const createCvPaymentMutation = useMutation({
    mutationFn: async (data: CreateCvPaymentParams) => {
      const res = await apiRequest("POST", "/api/cv-payments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/cv-payments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  // Initiate Flutterwave payment for CV generation
  const initiateCvPayment = async (amount: number, currency: string = "NGN") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to make a payment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const tx_ref = generateTransactionRef();
      const customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;

      const config: FlutterwavePaymentConfig = {
        amount,
        currency,
        customer_email: user.email,
        customer_name: customerName,
        tx_ref,
        description: "CV Generator One-time Payment",
        onClose: () => {
          setLoading(false);
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment process",
          });
        },
        onSuccess: async (data: any) => {
          setLoading(false);
          
          try {
            // Create payment record in our database
            await createCvPaymentMutation.mutateAsync({
              amount,
              currency,
              transactionId: data.transaction_id.toString(),
            });

            toast({
              title: "Payment Successful",
              description: "Your payment has been processed successfully",
            });

            return data;
          } catch (error) {
            console.error("Error saving payment:", error);
            toast({
              title: "Payment Error",
              description: "Your payment was successful, but we couldn't save the record. Please contact support.",
              variant: "destructive",
            });
          }
        }
      };

      // Initiate the payment
      return await handleFlutterwavePayment(config);
    } catch (error) {
      console.error("Payment initiation error:", error);
      setLoading(false);
      toast({
        title: "Payment Error",
        description: (error as Error).message || "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  // Check if user has made a successful payment for CV generation
  const hasValidCvPayment = () => {
    if (!userCvPayments || userCvPayments.length === 0) return false;
    
    // Check if user has any completed payments
    return userCvPayments.some((payment: CvPayment) => payment.status === "completed");
  };

  return {
    userCvPayments,
    isLoadingPayments,
    initiateCvPayment,
    loading,
    hasValidCvPayment,
  };
};