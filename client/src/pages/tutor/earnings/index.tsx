import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Calendar,
  Download,
  ChevronDown,
  ArrowUpRight,
  PiggyBank,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

export default function EarningsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");

  // Fetch earnings data
  const { data: earningsData, isLoading: isLoadingEarnings } = useQuery({
    queryKey: ["/api/tutor/earnings"],
  });

  // Fetch payments data
  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["/api/tutor/payments"],
  });

  // Fetch withdrawals data
  const { data: withdrawalsData, isLoading: isLoadingWithdrawals } = useQuery({
    queryKey: ["/api/tutor/withdrawals"],
  });

  // Current balance and stats
  const currentBalance = earningsData?.currentBalance || 1247.65;
  const pendingBalance = earningsData?.pendingBalance || 198.50;
  const totalEarnings = earningsData?.totalEarnings || 4287.32;
  const coursesSold = earningsData?.coursesSold || 86;

  // Sample monthly earnings data (would come from API)
  const monthlyData = [
    { month: 'Jan', earnings: 320 },
    { month: 'Feb', earnings: 450 },
    { month: 'Mar', earnings: 380 },
    { month: 'Apr', earnings: 620 },
    { month: 'May', earnings: 580 },
    { month: 'Jun', earnings: 720 },
    { month: 'Jul', earnings: 850 },
    { month: 'Aug', earnings: 940 },
    { month: 'Sep', earnings: 1120 },
    { month: 'Oct', earnings: 980 },
    { month: 'Nov', earnings: 1050 },
    { month: 'Dec', earnings: 1180 },
  ];

  // Sample recent payments (would come from API)
  const recentPayments = paymentsData?.slice(0, 10) || [
    { id: 1, courseTitle: "Web Development Bootcamp", student: "John Smith", amount: 59.99, date: "2023-11-15", status: "completed" },
    { id: 2, courseTitle: "Advanced JavaScript", student: "Emily Johnson", amount: 49.99, date: "2023-11-14", status: "completed" },
    { id: 3, courseTitle: "Python for Data Science", student: "Michael Brown", amount: 39.99, date: "2023-11-10", status: "completed" },
    { id: 4, courseTitle: "UX Design Fundamentals", student: "Sarah Wilson", amount: 29.99, date: "2023-11-05", status: "completed" },
    { id: 5, courseTitle: "Mobile App Development", student: "David Lee", amount: 69.99, date: "2023-11-01", status: "completed" },
  ];

  // Sample recent withdrawals (would come from API)
  const recentWithdrawals = withdrawalsData?.slice(0, 10) || [
    { id: 1, amount: 500.00, date: "2023-11-01", status: "completed", method: "Bank Transfer" },
    { id: 2, amount: 750.00, date: "2023-10-15", status: "completed", method: "Bank Transfer" },
    { id: 3, amount: 1000.00, date: "2023-09-30", status: "completed", method: "Bank Transfer" },
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Handle withdrawal
  const handleWithdraw = () => {
    if (currentBalance < 50) {
      toast({
        title: "Minimum withdrawal amount not met",
        description: "You need at least $50 to make a withdrawal",
        variant: "destructive",
      });
      return;
    }
    navigate("/dashboard/tutor/earnings/withdraw");
  };

  if (isLoadingEarnings || isLoadingPayments || isLoadingWithdrawals) {
    return (
      <DashboardLayout title="Earnings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading earnings data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Earnings & Finance">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your income and manage withdrawals
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleWithdraw}>
                Withdraw Funds
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Balance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingBalance)}</div>
              <p className="text-xs text-muted-foreground">Processing clearance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Courses Sold
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coursesSold}</div>
              <p className="text-xs text-muted-foreground">Total enrollments</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="w-full" onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-end space-x-2">
              <Button
                variant={selectedTimeframe === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe("weekly")}
              >
                Weekly
              </Button>
              <Button
                variant={selectedTimeframe === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={selectedTimeframe === "yearly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe("yearly")}
              >
                Yearly
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Earnings {selectedTimeframe === "monthly" ? "by Month" : selectedTimeframe === "weekly" ? "by Week" : "by Year"}</CardTitle>
                <CardDescription>
                  Your earnings over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, "Earnings"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorEarnings)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>
                    Latest payments received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{payment.courseTitle}</p>
                          <p className="text-xs text-muted-foreground">From {payment.student}</p>
                        </div>
                        <div className="text-sm font-medium">{formatCurrency(payment.amount)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setCurrentTab("payments")}>
                    View All Payments
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Withdrawals</CardTitle>
                  <CardDescription>
                    Your recent withdrawals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentWithdrawals.length > 0 ? (
                    <div className="space-y-4">
                      {recentWithdrawals.map((withdrawal) => (
                        <div key={withdrawal.id} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{withdrawal.method}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(withdrawal.date)}</p>
                          </div>
                          <div className="flex items-center">
                            <Badge variant={
                              withdrawal.status === "completed" ? "default" :
                              withdrawal.status === "pending" ? "secondary" :
                              "destructive"
                            }>
                              {withdrawal.status}
                            </Badge>
                            <span className="ml-2 text-sm font-medium">{formatCurrency(withdrawal.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <PiggyBank className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No withdrawal history yet</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setCurrentTab("withdrawals")}>
                    View All Withdrawals
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Payments</CardTitle>
                    <CardDescription>
                      Complete history of payments received from your courses
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.courseTitle}</TableCell>
                        <TableCell>{payment.student}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            payment.status === "completed" ? "default" :
                            payment.status === "pending" ? "secondary" :
                            "destructive"
                          }>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Withdrawals</h2>
                <p className="text-muted-foreground">
                  Manage your fund withdrawals
                </p>
              </div>
              <Button className="flex items-center gap-2" onClick={handleWithdraw}>
                <ArrowUpRight className="h-4 w-4" /> Withdraw Funds
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>
                  Complete history of your withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentWithdrawals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentWithdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{formatDate(withdrawal.date)}</TableCell>
                          <TableCell>{withdrawal.method}</TableCell>
                          <TableCell>
                            <Badge variant={
                              withdrawal.status === "completed" ? "default" :
                              withdrawal.status === "pending" ? "secondary" :
                              "destructive"
                            }>
                              {withdrawal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(withdrawal.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No withdrawals yet</h3>
                    <p className="text-muted-foreground text-center mt-2 max-w-md">
                      When you're ready to withdraw your earnings, you can do so with our secure withdrawal system.
                    </p>
                    <Button className="mt-4" onClick={handleWithdraw}>Make Your First Withdrawal</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}