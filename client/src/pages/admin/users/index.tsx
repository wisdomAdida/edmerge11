import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Search, 
  Download, 
  Pencil, 
  Trash2, 
  UserCheck, 
  UserX,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  KeyRound
} from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function UsersManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isGeneratingKeyDialogOpen, setIsGeneratingKeyDialogOpen] = useState<boolean>(false);
  const [subscriptionType, setSubscriptionType] = useState<string>("basic");
  const itemsPerPage = 10;

  // Get all users using API call
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ["/api/users"],
    staleTime: 60000, // Refresh every minute
  });

  // Filter users based on search and role filters
  const filteredUsers = allUsers.filter((user) => {
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesSearch = 
      searchQuery === "" ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get user counts by role
  const userCounts = {
    total: allUsers.length,
    students: allUsers.filter(u => u.role === "student").length,
    tutors: allUsers.filter(u => u.role === "tutor").length,
    mentors: allUsers.filter(u => u.role === "mentor").length,
    researchers: allUsers.filter(u => u.role === "researcher").length,
    admins: allUsers.filter(u => u.role === "admin").length,
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get badge color based on subscription status
  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };

  // Get color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "tutor":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "mentor":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "researcher":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      case "admin":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    toast({
      title: "User deleted",
      description: `${selectedUser.firstName} ${selectedUser.lastName} has been deleted from the system.`,
    });
    
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // Generate subscription key for the user
  const handleGenerateKey = () => {
    if (!selectedUser) return;
    
    toast({
      title: "Subscription key generated",
      description: `A new ${subscriptionType} subscription key has been generated for ${selectedUser.firstName} ${selectedUser.lastName}.`,
    });
    
    setIsGeneratingKeyDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage all users on the EdMerge platform
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto flex gap-2 items-center">
              <Download className="h-4 w-4" />
              Export Users
            </Button>
            <Link href="/dashboard/admin/users/add">
              <Button className="w-full sm:w-auto flex gap-2 items-center">
                <UserPlus className="h-4 w-4" />
                Add New User
              </Button>
            </Link>
          </div>
        </div>

        {/* User Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Total Users</p>
              </div>
              <p className="text-2xl font-bold mt-2">{userCounts.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">Students</p>
              </div>
              <p className="text-2xl font-bold mt-2">{userCounts.students}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium">Tutors</p>
              </div>
              <p className="text-2xl font-bold mt-2">{userCounts.tutors}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <p className="text-sm font-medium">Mentors</p>
              </div>
              <p className="text-2xl font-bold mt-2">{userCounts.mentors}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium">Researchers</p>
              </div>
              <p className="text-2xl font-bold mt-2">{userCounts.researchers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-500" />
                <p className="text-sm font-medium">Admins</p>
              </div>
              <p className="text-2xl font-bold mt-2">{userCounts.admins}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="tutor">Tutors</SelectItem>
                <SelectItem value="mentor">Mentors</SelectItem>
                <SelectItem value="researcher">Researchers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Showing {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingUsers ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="h-8 w-8 mb-2" />
                            <p className="text-lg font-medium">No users found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                {user.profileImage ? (
                                  <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                                ) : null}
                                <AvatarFallback>
                                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              {user.studentLevel ? ` (${user.studentLevel})` : ''}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {getSubscriptionBadge(user.subscriptionStatus)}
                            <p className="text-xs text-muted-foreground mt-1">
                              {user.subscriptionType !== "none" ? user.subscriptionType : "No subscription"}
                            </p>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Link href={`/dashboard/admin/users/${user.id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </Link>
                                <Link href={`/dashboard/admin/users/${user.id}/edit`}>
                                  <DropdownMenuItem>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsGeneratingKeyDialogOpen(true);
                                  }}
                                >
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Generate Subscription Key
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-500 focus:text-red-500"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate Subscription Key Dialog */}
      <Dialog open={isGeneratingKeyDialogOpen} onOpenChange={setIsGeneratingKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Subscription Key</DialogTitle>
            <DialogDescription>
              Generate a subscription key for {selectedUser?.firstName} {selectedUser?.lastName}. 
              The key will grant access to platform features based on the subscription level.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Type</label>
              <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subscription type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic ($3 for 3 months)</SelectItem>
                  <SelectItem value="premium">Premium ($10 for 3 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGeneratingKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateKey}>
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}