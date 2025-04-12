import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, ExternalLinkIcon, GlobeIcon, SchoolIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

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

const formatCurrency = (amount: number | null, currency: string | null): string => {
  if (amount === null) return 'Variable';
  
  try {
    if (currency === 'NGN') return `₦${amount.toLocaleString()}`;
    if (currency === 'USD') return `$${amount.toLocaleString()}`;
    if (currency === 'EUR') return `€${amount.toLocaleString()}`;
    if (currency === 'GBP') return `£${amount.toLocaleString()}`;
    return `${amount.toLocaleString()} ${currency || ''}`;
  } catch (error) {
    return `${amount} ${currency || ''}`;
  }
};

export const ScholarshipSection: React.FC<{ 
  studentLevel?: string | null;
  maxItems?: number;
  showTitle?: boolean;
  showAddButton?: boolean;
  className?: string;
}> = ({ 
  studentLevel, 
  maxItems = 3, 
  showTitle = true, 
  showAddButton = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  
  // Fetch scholarships based on student level or all scholarships for admin
  const { data: scholarships, isLoading, error } = useQuery<Scholarship[]>({
    queryKey: studentLevel ? ['scholarships', 'level', studentLevel] : ['scholarships', 'active'],
    queryFn: async () => {
      const response = await fetch(
        studentLevel 
          ? `/api/scholarships/level/${studentLevel}` 
          : '/api/scholarships/active'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch scholarships');
      }
      return response.json();
    }
  });

  const handleOpenScholarship = (url: string) => {
    // Open the scholarship URL in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle>{showTitle ? 'Scholarships' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load scholarships. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        {showTitle && <CardTitle>Scholarships & Opportunities</CardTitle>}
        {showAddButton && user?.role === 'admin' && (
          <Button size="sm" variant="outline" asChild>
            <a href="/admin/scholarships/new">Add New</a>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          // Skeleton loader while loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-4 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))
        ) : scholarships && scholarships.length > 0 ? (
          <div className="space-y-4">
            {scholarships.slice(0, maxItems).map((scholarship) => (
              <Card key={scholarship.id} className="bg-accent/50 hover:bg-accent transition-colors duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold">{scholarship.title}</CardTitle>
                    <Badge variant={
                      scholarship.status === 'active' ? 'default' : 
                      scholarship.status === 'coming_soon' ? 'outline' :
                      scholarship.status === 'expired' ? 'destructive' : 'secondary'
                    }>
                      {scholarship.status === 'active' ? 'Active' : 
                       scholarship.status === 'coming_soon' ? 'Coming Soon' :
                       scholarship.status === 'expired' ? 'Expired' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <GlobeIcon className="mr-1 h-3 w-3" /> {scholarship.organization}
                  </div>
                </CardHeader>

                <CardContent className="pb-2">
                  <p className="text-sm line-clamp-2">{scholarship.description}</p>
                  
                  <div className="flex flex-wrap gap-3 mt-2">
                    {scholarship.amount !== null && (
                      <div className="text-xs font-medium">
                        <span className="text-primary">Amount:</span> {formatCurrency(scholarship.amount, scholarship.currency)}
                      </div>
                    )}
                    
                    {scholarship.applicationDeadline && (
                      <div className="text-xs font-medium flex items-center">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        <span>Deadline: {format(new Date(scholarship.applicationDeadline), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    
                    {scholarship.level && (
                      <div className="text-xs font-medium flex items-center">
                        <SchoolIcon className="mr-1 h-3 w-3" />
                        <span>Level: {scholarship.level}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedScholarship(scholarship)}
                  >
                    Details
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => handleOpenScholarship(scholarship.url)}
                    className="gap-1"
                  >
                    Apply <ExternalLinkIcon className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No scholarships available at the moment.
          </p>
        )}
      </CardContent>

      {scholarships && scholarships.length > maxItems && (
        <CardFooter className="flex justify-center">
          <Button variant="outline" size="sm" asChild>
            <a href="/scholarships">View All Scholarships</a>
          </Button>
        </CardFooter>
      )}

      {/* Scholarship details dialog */}
      <Dialog open={!!selectedScholarship} onOpenChange={(open) => !open && setSelectedScholarship(null)}>
        <DialogContent className="max-w-2xl">
          {selectedScholarship && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedScholarship.title}</DialogTitle>
                <DialogDescription className="flex items-center">
                  <span className="font-semibold">{selectedScholarship.organization}</span>
                  <span className="mx-2">•</span>
                  <Badge variant={
                    selectedScholarship.status === 'active' ? 'default' : 
                    selectedScholarship.status === 'coming_soon' ? 'outline' :
                    selectedScholarship.status === 'expired' ? 'destructive' : 'secondary'
                  }>
                    {selectedScholarship.status === 'active' ? 'Active' : 
                     selectedScholarship.status === 'coming_soon' ? 'Coming Soon' :
                     selectedScholarship.status === 'expired' ? 'Expired' : 'Inactive'}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              {selectedScholarship.imageUrl && (
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img 
                    src={selectedScholarship.imageUrl} 
                    alt={selectedScholarship.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 py-2">
                {selectedScholarship.amount !== null && (
                  <div>
                    <h4 className="text-sm font-semibold">Award Value</h4>
                    <p>{formatCurrency(selectedScholarship.amount, selectedScholarship.currency)}</p>
                  </div>
                )}
                
                {selectedScholarship.level && (
                  <div>
                    <h4 className="text-sm font-semibold">Education Level</h4>
                    <p>{selectedScholarship.level}</p>
                  </div>
                )}
                
                {selectedScholarship.location && (
                  <div>
                    <h4 className="text-sm font-semibold">Location</h4>
                    <p>{selectedScholarship.location}</p>
                  </div>
                )}
                
                {selectedScholarship.category && (
                  <div>
                    <h4 className="text-sm font-semibold">Category</h4>
                    <p>{selectedScholarship.category}</p>
                  </div>
                )}
                
                {selectedScholarship.applicationStartDate && (
                  <div>
                    <h4 className="text-sm font-semibold">Application Opens</h4>
                    <p>{format(new Date(selectedScholarship.applicationStartDate), 'MMMM dd, yyyy')}</p>
                  </div>
                )}
                
                {selectedScholarship.applicationDeadline && (
                  <div>
                    <h4 className="text-sm font-semibold">Application Deadline</h4>
                    <p>{format(new Date(selectedScholarship.applicationDeadline), 'MMMM dd, yyyy')}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold">Description</h4>
                  <p className="text-sm mt-1">{selectedScholarship.description}</p>
                </div>
                
                {selectedScholarship.eligibility && (
                  <div>
                    <h4 className="text-sm font-semibold">Eligibility</h4>
                    <p className="text-sm mt-1">{selectedScholarship.eligibility}</p>
                  </div>
                )}
                
                {selectedScholarship.requirements && (
                  <div>
                    <h4 className="text-sm font-semibold">Requirements</h4>
                    <p className="text-sm mt-1">{selectedScholarship.requirements}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 flex-row sm:justify-between">
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
                <Button 
                  onClick={() => handleOpenScholarship(selectedScholarship.url)}
                  className="gap-1"
                >
                  Apply Now <ExternalLinkIcon className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};