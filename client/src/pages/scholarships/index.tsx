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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, CalendarIcon, ExternalLinkIcon, GlobeIcon, SchoolIcon, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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

export default function ScholarshipsPage() {
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Fetch all active scholarships
  const { data: scholarships, isLoading, error } = useQuery<Scholarship[]>({
    queryKey: ['scholarships', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/scholarships/active');
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
  
  // Filter scholarships based on search query and filters
  const filteredScholarships = scholarships?.filter(scholarship => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      scholarship.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scholarship.description && scholarship.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Level filter
    const matchesLevel = !levelFilter || scholarship.level === levelFilter;
    
    // Status filter
    const matchesStatus = !statusFilter || scholarship.status === statusFilter;
    
    // Category filter
    const matchesCategory = !categoryFilter || scholarship.category === categoryFilter;
    
    return matchesSearch && matchesLevel && matchesStatus && matchesCategory;
  });
  
  return (
    <DashboardLayout title="Scholarships & Opportunities">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Find Scholarships</CardTitle>
            <CardDescription>
              Browse through available scholarships and opportunities that match your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              
              <div className="flex gap-2">
                <Select onValueChange={(value) => setLevelFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="min-w-[150px]">
                    <SelectValue placeholder="Education Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="tertiary">Tertiary</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="min-w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic Merit</SelectItem>
                    <SelectItem value="financial-need">Financial Need</SelectItem>
                    <SelectItem value="minority">Minority</SelectItem>
                    <SelectItem value="stem">STEM</SelectItem>
                    <SelectItem value="arts">Arts & Humanities</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="community-service">Community Service</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading scholarships...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Failed to load scholarships. Please try again later.</p>
              </div>
            ) : filteredScholarships && filteredScholarships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="flex flex-col h-full transition-all hover:shadow-md">
                    {scholarship.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={scholarship.imageUrl} 
                          alt={scholarship.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold">{scholarship.title}</CardTitle>
                        {scholarship.status && (
                          <Badge variant={
                            scholarship.status === 'active' ? 'default' : 
                            scholarship.status === 'coming_soon' ? 'outline' :
                            scholarship.status === 'expired' ? 'destructive' : 'secondary'
                          }>
                            {scholarship.status === 'active' ? 'Active' : 
                            scholarship.status === 'coming_soon' ? 'Coming Soon' :
                            scholarship.status === 'expired' ? 'Expired' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <GlobeIcon className="mr-1 h-3 w-3" /> {scholarship.organization}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2 flex-grow">
                      <p className="text-sm line-clamp-3 mb-3">{scholarship.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        {scholarship.amount !== null && (
                          <div className="text-xs font-medium">
                            <span className="text-primary">Amount:</span> {formatCurrency(scholarship.amount, scholarship.currency)}
                          </div>
                        )}
                        
                        {scholarship.level && (
                          <div className="text-xs font-medium flex items-center">
                            <SchoolIcon className="mr-1 h-3 w-3" />
                            <span>{scholarship.level}</span>
                          </div>
                        )}
                        
                        {scholarship.applicationDeadline && (
                          <div className="text-xs font-medium flex items-center col-span-2">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            <span>Deadline: {format(new Date(scholarship.applicationDeadline), 'MMM dd, yyyy')}</span>
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
              <div className="text-center py-12 border rounded-md bg-accent/10">
                <p className="text-muted-foreground mb-2">No scholarships found matching your criteria.</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setLevelFilter(null);
                  setStatusFilter(null);
                  setCategoryFilter(null);
                }}>
                  <Filter className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
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
      </div>
    </DashboardLayout>
  );
}