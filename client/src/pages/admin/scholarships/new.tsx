import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';

// Form schema using zod
const scholarshipFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  organization: z.string().min(2, "Organization name is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  url: z.string().url("Please enter a valid URL"),
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  eligibility: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "expired", "coming_soon"]).nullable().optional(),
  applicationStartDate: z.date().nullable().optional(),
  applicationDeadline: z.date().nullable().optional(),
  imageUrl: z.string().url("Please enter a valid image URL").nullable().optional(),
});

type ScholarshipFormValues = z.infer<typeof scholarshipFormSchema>;

export default function NewScholarship() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Set up the form
  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipFormSchema),
    defaultValues: {
      title: "",
      organization: "",
      description: "",
      url: "",
      amount: null,
      currency: "USD",
      category: null,
      level: null,
      location: null,
      eligibility: null,
      requirements: null,
      status: "active",
      applicationStartDate: null,
      applicationDeadline: null,
      imageUrl: null,
    },
  });
  
  // Create scholarship mutation
  const createScholarshipMutation = useMutation({
    mutationFn: async (data: ScholarshipFormValues) => {
      const response = await apiRequest("POST", "/api/scholarships", data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create scholarship");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
      toast({
        title: "Scholarship Created",
        description: "The scholarship has been created successfully.",
      });
      navigate("/dashboard/admin/scholarships");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: ScholarshipFormValues) => {
    createScholarshipMutation.mutate(data);
  };
  
  return (
    <DashboardLayout title="Add New Scholarship">
      <div className="space-y-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/dashboard/admin/scholarships")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scholarships
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Add New Scholarship</CardTitle>
            <CardDescription>
              Create a new scholarship opportunity for students. Fill in all the details below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. STEM Excellence Scholarship 2025" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter a clear, descriptive title for the scholarship.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. National Science Foundation" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the name of the organization offering the scholarship.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the scholarship, its purpose, and benefits..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application URL*</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/apply" {...field} />
                        </FormControl>
                        <FormDescription>
                          Direct link to the scholarship application or information page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/scholarship-image.jpg" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} />
                        </FormControl>
                        <FormDescription>
                          URL to an image representing the scholarship (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || 'active'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="coming_soon">Coming Soon</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Current status of the scholarship opportunity.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="tertiary">Tertiary</SelectItem>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="postgraduate">Postgraduate</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="all">All Levels</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Target education level for this scholarship.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-3">Financial Details</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 5000" 
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>
                          Scholarship amount (leave empty if variable).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || 'USD'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NGN">NGN (₦)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-3">Additional Information</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Category of the scholarship.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Nigeria, Global, Remote" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} />
                        </FormControl>
                        <FormDescription>
                          Geographic eligibility for the scholarship.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="applicationStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Application Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the application period begins.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="applicationDeadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Application Deadline</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Final date for submissions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-3">Requirements & Eligibility</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="eligibility"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Eligibility Criteria</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe who is eligible for this scholarship..."
                            className="min-h-[120px]"
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain the eligibility criteria for the scholarship.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Application Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List the documents and requirements needed to apply..."
                            className="min-h-[120px]"
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify what applicants need to submit.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard/admin/scholarships")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={createScholarshipMutation.isPending}
            >
              {createScholarshipMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Scholarship'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}