import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  Search, 
  Filter, 
  ArrowDown, 
  ArrowUp, 
  Download,
  CalendarDays,
  CreditCard,
  BookOpen,
  FileDown,
  DollarSign,
  Receipt,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShoppingCart,
  LineChart,
  Tag,
  Info,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types
type Payment = {
  id: number;
  date: Date;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: string;
  description: string;
  courseId?: number;
  courseName?: string;
  transactionId: string;
  receiptUrl?: string;
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  
  // Fetch payments data
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/student/payments"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // This simulates API data - in a real app this would be an actual API call
      return [
        {
          id: 1,
          date: new Date(2023, 10, 15),
          amount: 59.99,
          status: 'completed',
          method: 'Credit Card',
          description: 'Course Purchase',
          courseId: 1,
          courseName: 'Advanced Mathematics',
          transactionId: 'TRX-1001',
          receiptUrl: '/receipts/trx-1001.pdf'
        },
        {
          id: 2,
          date: new Date(2023, 10, 5),
          amount: 49.99,
          status: 'completed',
          method: 'Flutterwave',
          description: 'Course Purchase',
          courseId: 2,
          courseName: 'Introduction to Programming',
          transactionId: 'TRX-1002',
          receiptUrl: '/receipts/trx-1002.pdf'
        },
        {
          id: 3,
          date: new Date(2023, 9, 28),
          amount: 29.99,
          status: 'refunded',
          method: 'PayPal',
          description: 'Course Purchase (Refunded)',
          courseId: 3,
          courseName: 'English Literature',
          transactionId: 'TRX-1003',
          receiptUrl: '/receipts/trx-1003.pdf'
        },
        {
          id: 4,
          date: new Date(2023, 9, 15),
          amount: 79.99,
          status: 'completed',
          method: 'Credit Card',
          description: 'Course Purchase',
          courseId: 4,
          courseName: 'Science for Beginners',
          transactionId: 'TRX-1004',
          receiptUrl: '/receipts/trx-1004.pdf'
        },
        {
          id: 5,
          date: new Date(2023, 8, 20),
          amount: 19.99,
          status: 'completed',
          method: 'Flutterwave',
          description: 'Course Purchase',
          courseId: 5,
          courseName: 'History 101',
          transactionId: 'TRX-1005',
          receiptUrl: '/receipts/trx-1005.pdf'
        }
      ];
    }
  });
  
  // Filter payments based on search, status, and date
  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      payment.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    let matchesDate = true;
    const paymentDate = new Date(payment.date);
    const currentDate = new Date();
    
    if (dateFilter === "last30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      matchesDate = paymentDate >= thirtyDaysAgo;
    } else if (dateFilter === "last3months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
      matchesDate = paymentDate >= threeMonthsAgo;
    } else if (dateFilter === "last6months") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
      matchesDate = paymentDate >= sixMonthsAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];
  
  // Calculate total spent (completed payments only)
  const totalSpent = payments
    ? payments
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0)
    : 0;
  
  // Calculate total savings (refunded payments)
  const totalRefunded = payments
    ? payments
        .filter(payment => payment.status === 'refunded')
        .reduce((sum, payment) => sum + payment.amount, 0)
    : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // View receipt
  const viewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <DashboardLayout title="Payment History">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading payment history...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment History">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your course payments and transactions
          </p>
        </div>
        
        {/* Financial summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                <CreditCard className="h-3 w-3 mr-1" />
                On educational courses
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRefunded)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                Total refunded amount
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Courses Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments?.filter(p => p.status === 'completed').length || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                Successfully enrolled
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                  Failed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("refunded")}>
                  Refunded
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Date
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDateFilter("all")}>
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("last30days")}>
                  Last 30 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("last3months")}>
                  Last 3 Months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("last6months")}>
                  Last 6 Months
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Transaction History</CardTitle>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
            <CardDescription>
              A record of all your payments and refunds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{payment.description}</div>
                        {payment.courseName && (
                          <div className="text-xs text-muted-foreground">
                            {payment.courseName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewReceipt(payment)}
                          disabled={!payment.receiptUrl}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Learn about our payment methods and policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards, PayPal, and Flutterwave payments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Secure Transactions</h3>
                  <p className="text-sm text-muted-foreground">
                    All payments are encrypted and processed securely.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ArrowUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Refund Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    Refunds available within 14 days of purchase if you're not satisfied.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about your payments or need assistance, 
                please contact our support team at <span className="text-primary">support@edmerge.com</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Transaction details for {selectedPayment?.transactionId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">EdMerge</h2>
                  <p className="text-sm text-muted-foreground">Premium Learning Platform</p>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Receipt #</p>
                    <p className="font-medium">{selectedPayment.transactionId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(selectedPayment.date)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{selectedPayment.description}</span>
                </div>
                
                {selectedPayment.courseName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course</span>
                    <span className="font-medium">{selectedPayment.courseName}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{selectedPayment.method}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span>{getStatusBadge(selectedPayment.status)}</span>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>Thank you for your purchase!</p>
                <p>If you have any questions, please contact support@edmerge.com</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsReceiptDialogOpen(false)}>Close</Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Shield check icon
function ShieldCheck(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}