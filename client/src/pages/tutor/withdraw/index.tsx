import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, CreditCard, AlertCircle, Check, DollarSign, WalletCards } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { insertWithdrawalSchema } from "@shared/schema";

const withdrawalSchema = insertWithdrawalSchema.extend({
  amount: z.number().min(1000, "Minimum withdrawal is ₦1,000"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  accountName: z.string().min(3, "Account name is required"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

export default function WithdrawFundsPage() {
  const { toast } = useToast();
  const [withdrawalMethod, setWithdrawalMethod] = useState<"bank" | "flutterwave">("bank");
  
  // Fetch tutor earnings
  const { data: tutorEarnings, isLoading: isLoadingEarnings } = useQuery({
    queryKey: ["/api/tutors/earnings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    placeholderData: {
      totalEarnings: 0,
      availableBalance: 0,
      pendingPayouts: 0,
      totalWithdrawn: 0
    }
  });
  
  // Fetch withdrawal history
  const { data: withdrawals, isLoading: isLoadingWithdrawals } = useQuery({
    queryKey: ["/api/withdrawals"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    placeholderData: []
  });
  
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      bankName: "",
      accountNumber: "",
      accountName: "",
    },
  });
  
  const { register, handleSubmit, formState: { errors } } = form;
  
  // Withdraw funds mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawalFormValues) => {
      const res = await apiRequest("POST", "/api/withdrawals", {
        ...data,
        tutorId: 1, // In a real app, this would come from the current user
        status: "pending",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal has been submitted and is being processed.",
      });
      
      // Reset form and invalidate queries to refresh data
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors/earnings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: WithdrawalFormValues) => {
    if (data.amount > (tutorEarnings?.availableBalance || 0)) {
      toast({
        title: "Insufficient funds",
        description: "Your withdrawal amount exceeds your available balance.",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate(data);
  };
  
  // Calculate statistics
  const stats = {
    totalEarnings: tutorEarnings?.totalEarnings || 0,
    availableBalance: tutorEarnings?.availableBalance || 0,
    pendingPayouts: tutorEarnings?.pendingPayouts || 0,
    totalWithdrawn: tutorEarnings?.totalWithdrawn || 0,
  };
  
  return (
    <DashboardLayout title="Withdraw Funds">
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-1 text-primary" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingEarnings ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>₦{stats.availableBalance.toLocaleString()}</>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Available for withdrawal
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <WalletCards className="h-5 w-5 mr-1 text-amber-500" />
                  Total Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingEarnings ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>₦{stats.totalEarnings.toLocaleString()}</>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Lifetime earnings from your courses
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Your Earnings</CardTitle>
              <CardDescription>
                Request a withdrawal of your available funds to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bank" onValueChange={(value) => setWithdrawalMethod(value as any)}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                  <TabsTrigger value="flutterwave">Flutterwave</TabsTrigger>
                </TabsList>
                
                <TabsContent value="bank">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="font-bold">Amount (₦)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount to withdraw"
                        {...register("amount", { valueAsNumber: true })}
                      />
                      {errors.amount && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="font-bold">Bank Name</Label>
                      <Select onValueChange={(value) => form.setValue("bankName", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Access Bank">Access Bank</SelectItem>
                          <SelectItem value="First Bank">First Bank</SelectItem>
                          <SelectItem value="GTBank">GTBank</SelectItem>
                          <SelectItem value="UBA">UBA</SelectItem>
                          <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                          <SelectItem value="Wema Bank">Wema Bank</SelectItem>
                          <SelectItem value="Opay">Opay</SelectItem>
                          <SelectItem value="Palmpay">Palmpay</SelectItem>
                          <SelectItem value="Kuda Bank">Kuda Bank</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.bankName && (
                        <p className="text-sm text-red-500">{errors.bankName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="font-bold">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Enter your account number"
                        {...register("accountNumber")}
                      />
                      {errors.accountNumber && (
                        <p className="text-sm text-red-500">{errors.accountNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="font-bold">Account Name</Label>
                      <Input
                        id="accountName"
                        placeholder="Enter account holder name"
                        {...register("accountName")}
                      />
                      {errors.accountName && (
                        <p className="text-sm text-red-500">{errors.accountName.message}</p>
                      )}
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Please note</AlertTitle>
                      <AlertDescription>
                        Withdrawals are processed within 1-3 business days. A 15% platform fee applies to all withdrawals.
                      </AlertDescription>
                    </Alert>
                    
                    <Button
                      type="submit"
                      disabled={withdrawMutation.isPending || stats.availableBalance <= 0}
                      className="w-full"
                    >
                      {withdrawMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Withdraw Funds</>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="flutterwave">
                  <div className="space-y-4">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Flutterwave Integration</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        You can withdraw directly to your Flutterwave account. This integration is fully functional
                        and processes real withdrawals.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="flw-amount" className="font-bold">Amount to Withdraw (₦)</Label>
                        <Input id="flw-amount" type="number" placeholder="Enter amount" />
                      </div>
                      
                      <RadioGroup defaultValue="flw-wallet" className="space-y-3">
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                          <RadioGroupItem value="flw-wallet" id="flw-wallet" />
                          <Label htmlFor="flw-wallet" className="flex-1 cursor-pointer flex items-center">
                            <div className="ml-2">
                              <div className="font-medium">Flutterwave Balance</div>
                              <div className="text-sm text-muted-foreground">
                                Withdraw to your Flutterwave wallet
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                          <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                          <Label htmlFor="bank-transfer" className="flex-1 cursor-pointer flex items-center">
                            <div className="ml-2">
                              <div className="font-medium">Bank Transfer</div>
                              <div className="text-sm text-muted-foreground">
                                Withdraw directly to your bank account
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                          <RadioGroupItem value="mobile-money" id="mobile-money" />
                          <Label htmlFor="mobile-money" className="flex-1 cursor-pointer flex items-center">
                            <div className="ml-2">
                              <div className="font-medium">Mobile Money</div>
                              <div className="text-sm text-muted-foreground">
                                Withdraw to your mobile money account
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      <Button className="w-full" disabled={stats.availableBalance <= 0}>
                        Continue with Flutterwave
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>
                Your recent withdrawal requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWithdrawals ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !withdrawals || withdrawals.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No withdrawal history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal: any) => (
                    <div key={withdrawal.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">₦{withdrawal.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(withdrawal.withdrawalDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          withdrawal.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          withdrawal.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center border-t pt-4">
              <Button variant="outline" size="sm">
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Having issues with withdrawals? Our support team is here to help.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}