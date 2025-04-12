import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  LayoutGrid, 
  List, 
  Download, 
  Eye, 
  Pencil, 
  Trash, 
  RefreshCw,
  FileText,
  CalendarDays
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { UserCv } from '@shared/schema';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CvLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState<UserCv | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch user's CVs
  const { data: userCvs, isLoading, error } = useQuery({
    queryKey: ['/api/user/cvs'],
    queryFn: async () => {
      const response = await fetch('/api/user/cvs');
      if (!response.ok) {
        throw new Error('Failed to fetch CVs');
      }
      return response.json();
    }
  });

  // Fetch user's CV generation count
  const { data: countData } = useQuery({
    queryKey: ['/api/user/cv-generation-count'],
    queryFn: async () => {
      const response = await fetch('/api/user/cv-generation-count');
      if (!response.ok) {
        throw new Error('Failed to fetch CV generation count');
      }
      return response.json();
    }
  });

  // Download CV mutation
  const downloadCvMutation = useMutation({
    mutationFn: async (cvId: number) => {
      const cv = userCvs.find((c: UserCv) => c.id === cvId);
      if (!cv || !cv.pdfUrl) {
        throw new Error('PDF URL not available');
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = cv.pdfUrl;
      link.download = `${cv.name.split(' ').join('_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Download successful",
        description: "Your CV has been downloaded successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error.message || "An error occurred while downloading your CV.",
        variant: "destructive",
      });
    }
  });

  // Delete CV mutation
  const deleteCvMutation = useMutation({
    mutationFn: async (cvId: number) => {
      const response = await apiRequest('DELETE', `/api/user/cvs/${cvId}`);
      if (!response.ok) {
        throw new Error('Failed to delete CV');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/cvs'] });
      
      toast({
        title: "CV deleted",
        description: "Your CV has been deleted successfully.",
        variant: "default",
      });
      
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message || "An error occurred while deleting your CV.",
        variant: "destructive",
      });
    }
  });

  // Handle actions
  const openPreview = (cv: UserCv) => {
    setSelectedCv(cv);
    setPreviewDialogOpen(true);
  };

  const handleEdit = (cv: UserCv) => {
    // Forward to edit page with CV ID
    window.location.href = `/cv-generator/edit/${cv.id}`;
  };

  const confirmDelete = (cv: UserCv) => {
    setSelectedCv(cv);
    setDeleteDialogOpen(true);
  };

  const executeDeletion = () => {
    if (selectedCv) {
      deleteCvMutation.mutate(selectedCv.id);
    }
  };

  // Format CV creation date
  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading your CVs: {error.toString()}</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/user/cvs'] })}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0">
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your CV Library</CardTitle>
              {countData && (
                <p className="text-sm text-muted-foreground mt-1">
                  {countData.count} of 10 free CV generations used 
                  {countData.count >= 10 && (
                    <Badge variant="destructive" className="ml-2">Limit Reached</Badge>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userCvs && userCvs.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCvs.map((cv: UserCv) => (
                  <Card key={cv.id} className="overflow-hidden">
                    <div 
                      className="h-40 bg-muted relative cursor-pointer"
                      onClick={() => openPreview(cv)}
                    >
                      {cv.pdfUrl ? (
                        <iframe 
                          src={cv.pdfUrl} 
                          className="w-full h-full pointer-events-none"
                          title={cv.name}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(cv);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm line-clamp-1">{cv.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {formatDate(cv.createdAt as unknown as string)}
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 pb-4 pt-0 flex justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadCvMutation.mutate(cv.id)}
                        disabled={downloadCvMutation.isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(cv)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => confirmDelete(cv)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {userCvs.map((cv: UserCv) => (
                  <div
                    key={cv.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-muted flex items-center justify-center rounded overflow-hidden">
                        {cv.pdfUrl ? (
                          <iframe 
                            src={cv.pdfUrl} 
                            className="w-full h-full pointer-events-none"
                            title={cv.name}
                          />
                        ) : (
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{cv.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {formatDate(cv.createdAt as unknown as string)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => openPreview(cv)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => downloadCvMutation.mutate(cv.id)}
                        disabled={downloadCvMutation.isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleEdit(cv)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => confirmDelete(cv)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">No CVs created yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first professional CV using our AI-powered CV generator.
              </p>
              <Button
                variant="default"
                onClick={() => window.location.href = '/cv-generator'}
              >
                Create New CV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CV Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedCv?.name}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] overflow-auto flex items-center justify-center bg-gray-100">
            {selectedCv?.pdfUrl ? (
              <iframe 
                src={selectedCv.pdfUrl} 
                className="w-full h-full border-none"
                title={selectedCv.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Preview not available
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setPreviewDialogOpen(false)}
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => selectedCv && downloadCvMutation.mutate(selectedCv.id)}
                disabled={downloadCvMutation.isPending}
              >
                {downloadCvMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  setPreviewDialogOpen(false);
                  selectedCv && handleEdit(selectedCv);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your CV "{selectedCv?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeletion}
              disabled={deleteCvMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteCvMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}