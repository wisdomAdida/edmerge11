import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { initiateWithdrawal } from "@/lib/flutterwave";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

// Form validation schema
const formSchema = z.object({
  amount: z
    .number()
    .min(50, "Minimum withdrawal amount is $50")
    .max(5000, "Maximum withdrawal amount is $5,000"),
  bank_code: z.string().min(1, "Bank code is required"),
  account_number: z.string().min(10, "Account number must be at least 10 digits").max(10, "Account number must be 10 digits"),
  account_name: z.string().min(3, "Account name is required"),
  narration: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WithdrawPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [withdrawalStatus, setWithdrawalStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Define type for the earnings data
  interface EarningsData {
    currentBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    coursesSold: number;
    recentActivity: any[];
  }
  
  // Fetch current balance
  const { data: earningsData, isLoading: isLoadingEarnings } = useQuery<EarningsData>({
    queryKey: ["/api/tutor/earnings"],
  });

  // Current available balance
  const availableBalance = earningsData?.currentBalance || 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Bank list (would be fetched from API in a real app)
  const banks = [
    { code: "044", name: "Access Bank" },
    { code: "023", name: "Citibank Nigeria" },
    { code: "050", name: "EcoBank Nigeria" },
    { code: "070", name: "Fidelity Bank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "214", name: "First City Monument Bank" },
    { code: "058", name: "Guaranty Trust Bank" },
    { code: "030", name: "Heritage Bank" },
    { code: "301", name: "Jaiz Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "526", name: "Parallex Bank" },
    { code: "076", name: "Polaris Bank" },
    { code: "039", name: "Stanbic IBTC Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "032", name: "Union Bank" },
    { code: "033", name: "United Bank for Africa" },
    { code: "215", name: "Unity Bank" },
    { code: "035", name: "Wema Bank" },
    { code: "057", name: "Zenith Bank" },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100,
      bank_code: "",
      account_number: "",
      account_name: "",
      narration: "Withdrawal from EdMerge platform",
    },
  });

  // Submit withdrawal request
  const withdrawalMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      setWithdrawalStatus('processing');

      try {
        // First call Flutterwave for payment processing
        await initiateWithdrawal(
          values.amount,
          {
            account_number: values.account_number,
            account_bank: values.bank_code,
          },
          // On success callback
          async () => {
            // Then record the withdrawal in our system
            await apiRequest("POST", "/api/withdrawals", {
              amount: values.amount,
              bankDetails: {
                bankCode: values.bank_code,
                accountNumber: values.account_number,
                accountName: values.account_name,
              },
              narration: values.narration || "Withdrawal from EdMerge platform",
            });

            // Update status
            setWithdrawalStatus('success');

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/earnings"] });
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/withdrawals"] });

            // Show success toast
            toast({
              title: "Withdrawal initiated!",
              description: `Your withdrawal of ${formatCurrency(values.amount)} has been initiated successfully.`,
            });
          },
          // On error callback
          (error) => {
            setWithdrawalStatus('error');
            setErrorMessage(error.message);
            toast({
              title: "Withdrawal failed",
              description: error.message,
              variant: "destructive",
            });
          }
        );
      } catch (error) {
        setWithdrawalStatus('error');
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setErrorMessage(errorMessage);
        throw error;
      }
    },
    onError: (error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    // Check if amount is greater than available balance
    if (values.amount > availableBalance) {
      toast({
        title: "Insufficient funds",
        description: `Your available balance is ${formatCurrency(availableBalance)}`,
        variant: "destructive",
      });
      return;
    }

    withdrawalMutation.mutate(values);
  };

  if (isLoadingEarnings) {
    return (
      <DashboardLayout title="Withdraw Funds">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading withdrawal information...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Withdraw Funds">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back button */}
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={() => navigate("/dashboard/tutor/earnings")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Earnings
        </Button>

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
          <p className="text-muted-foreground mt-2">
            Transfer your earnings to your bank account
          </p>
        </div>

        {/* Withdrawal form */}
        {withdrawalStatus === 'success' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Check className="mr-2 h-5 w-5" />
                Withdrawal Initiated Successfully
              </CardTitle>
              <CardDescription>
                Your withdrawal request has been processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your withdrawal request has been initiated successfully. The funds will be transferred to your bank account within 1-2 business days.
              </p>
              <p>
                You will receive an email notification once the funds have been transferred.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/dashboard/tutor/earnings")} className="w-full">
                Return to Earnings Dashboard
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
                  <p className="text-xs text-muted-foreground">Available for withdrawal</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Minimum Withdrawal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(50)}</div>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1-2 days</div>
                  <p className="text-xs text-muted-foreground">Business days</p>
                </CardContent>
              </Card>
            </div>

            {withdrawalStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || "There was an error processing your withdrawal. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
                <CardDescription>
                  Enter your bank account details for withdrawal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount to Withdraw</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="100.00" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(
                                  e.target.value === "" ? undefined : parseFloat(e.target.value)
                                );
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the amount you want to withdraw (minimum $50)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-4" />

                    <FormField
                      control={form.control}
                      name="bank_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your bank" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {banks.map((bank) => (
                                <SelectItem key={bank.code} value={bank.code}>
                                  {bank.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select your bank from the list
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="account_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="0123456789" 
                                maxLength={10}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="account_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John Doe" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="narration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Narration (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Withdrawal from EdMerge platform" />
                          </FormControl>
                          <FormDescription>
                            Add a note to this transaction (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Please ensure your bank details are correct. Incorrect details may result in failed transfers or loss of funds.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={withdrawalStatus === 'processing' || withdrawalMutation.isPending}
                    >
                      {withdrawalStatus === 'processing' || withdrawalMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Withdrawal...
                        </>
                      ) : (
                        "Withdraw Funds"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}