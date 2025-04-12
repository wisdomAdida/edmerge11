import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreHorizontal, PlusIcon, Calendar, ExternalLink, Search, FileEdit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Scholarship type from server
interface Scholarship {
  id: number;
  title: string;
  description: string;
  organization: string;
  amount: number | null;
  currency: string | null;
  url: string;
  applicationStartDate: Date | null;
  applicationDeadline: Date | null;
  status: "active" | "inactive" | "expired" | "coming_soon" | null;
  category: string | null;
  level: string | null;
  location: string | null;
  eligibility: string | null;
  requirements: string | null;
  postedDate: Date | null;
  createdById: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  imageUrl: string | null;
}

export default function AdminScholarships() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [scholarshipToDelete, setScholarshipToDelete] = useState<number | null>(null);
  
  // Get all scholarships
  const { data: scholarships, isLoading, error } = useQuery<Scholarship[]>({
    queryKey: ['scholarships', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/scholarships');
      if (!response.ok) {
        throw new Error('scholarships Not Avialable');
      }
      return response.json();
    }
  });
  
  // Delete scholarship mutation
  const deleteScholarshipMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/scholarships/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete scholarship');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      toast({
        title: "Scholarship deleted",
        description: "The scholarship has been deleted successfully.",
      });
      setScholarshipToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (scholarshipToDelete !== null) {
      deleteScholarshipMutation.mutate(scholarshipToDelete);
    }
  };
  
  // Filter scholarships based on search query
  const filteredScholarships = scholarships?.filter(scholarship => 
    scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    scholarship.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (scholarship.level && scholarship.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <DashboardLayout title="Scholarship Management">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Manage Scholarships</CardTitle>
              <CardDescription>
                Create and manage scholarship opportunities for students.
              </CardDescription>
            </div>
            <Button onClick={() => navigate("/dashboard/admin/scholarships/new")}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Scholarship
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search scholarships..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading scholarships...</span>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-destructive">Scholarship Not Avialable Please try again.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableCaption>A list of all scholarships.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Title</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredScholarships && filteredScholarships.length > 0 ? (
                      filteredScholarships.map((scholarship) => (
                        <TableRow key={scholarship.id}>
                          <TableCell className="font-medium">{scholarship.title}</TableCell>
                          <TableCell>{scholarship.organization}</TableCell>
                          <TableCell>{scholarship.level || 'All levels'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              scholarship.status === 'active' ? 'default' : 
                              scholarship.status === 'coming_soon' ? 'outline' :
                              scholarship.status === 'expired' ? 'destructive' : 'secondary'
                            }>
                              {scholarship.status === 'active' ? 'Active' : 
                              scholarship.status === 'coming_soon' ? 'Coming Soon' :
                              scholarship.status === 'expired' ? 'Expired' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {scholarship.applicationDeadline ? (
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                <span>{format(new Date(scholarship.applicationDeadline), 'MMM dd, yyyy')}</span>
                              </div>
                            ) : (
                              'No deadline'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => window.open(scholarship.url, '_blank')}>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Visit Website
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/admin/scholarships/edit/${scholarship.id}`)}>
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setScholarshipToDelete(scholarship.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          {searchQuery ? (
                            <p>No scholarships found for "{searchQuery}"</p>
                          ) : (
                            <p>No scholarships have been added yet.</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={scholarshipToDelete !== null} onOpenChange={(open) => !open && setScholarshipToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scholarship. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteScholarshipMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}