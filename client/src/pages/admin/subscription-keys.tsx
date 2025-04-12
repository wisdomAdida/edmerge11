import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, Key, Trash, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SubscriptionKey {
  id: number;
  keyValue: string;
  planId: number;
  createdById: number;
  userId: number | null;
  status: "active" | "used" | "expired" | "revoked";
  description: string | null;
  validUntil: string | null;
  createdAt: string;
  redeemedAt: string | null;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  description: string;
  durationMonths: number;
}

export default function AdminSubscriptionKeys() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  // Fetch subscription keys
  const {
    data: keys,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/subscription-keys/admin"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/subscription-keys/admin");
      return (await res.json()) as SubscriptionKey[];
    },
  });

  // Fetch subscription plans
  const { data: plans } = useQuery({
    queryKey: ["/api/subscription-plans"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/subscription-plans");
      return (await res.json()) as SubscriptionPlan[];
    },
  });

  // Create a new subscription key
  const createKeyMutation = useMutation({
    mutationFn: async (data: {
      planId: number;
      description?: string;
      validUntil?: string;
    }) => {
      const res = await apiRequest("POST", "/api/subscription-keys", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription key created successfully",
      });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-keys/admin"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create subscription key: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create multiple subscription keys
  const batchCreateKeysMutation = useMutation({
    mutationFn: async (data: {
      planId: number;
      count: number;
      description?: string;
      validUntil?: string;
    }) => {
      const res = await apiRequest("POST", "/api/subscription-keys/batch", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data.length} subscription keys created successfully`,
      });
      setBatchDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-keys/admin"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create subscription keys: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Revoke a subscription key
  const revokeKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/subscription-keys/${id}/revoke`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription key revoked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-keys/admin"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to revoke subscription key: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form state for the create dialog
  const [formData, setFormData] = useState({
    planId: 0,
    description: "",
    validUntil: "",
  });

  // Form state for the batch create dialog
  const [batchFormData, setBatchFormData] = useState({
    planId: 0,
    count: 5,
    description: "",
    validUntil: "",
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle batch form input changes
  const handleBatchInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBatchFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle create form submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.planId) {
      toast({
        title: "Error",
        description: "Please select a subscription plan",
        variant: "destructive",
      });
      return;
    }
    
    createKeyMutation.mutate({
      planId: Number(formData.planId),
      description: formData.description || undefined,
      validUntil: formData.validUntil || undefined,
    });
  };

  // Handle batch create form submission
  const handleBatchCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFormData.planId) {
      toast({
        title: "Error",
        description: "Please select a subscription plan",
        variant: "destructive",
      });
      return;
    }

    if (batchFormData.count < 1 || batchFormData.count > 100) {
      toast({
        title: "Error",
        description: "Count must be between 1 and 100",
        variant: "destructive",
      });
      return;
    }
    
    batchCreateKeysMutation.mutate({
      planId: Number(batchFormData.planId),
      count: Number(batchFormData.count),
      description: batchFormData.description || undefined,
      validUntil: batchFormData.validUntil || undefined,
    });
  };

  // Handle revoking a key
  const handleRevokeKey = (id: number) => {
    if (confirm("Are you sure you want to revoke this subscription key? This action cannot be undone.")) {
      revokeKeyMutation.mutate(id);
    }
  };

  // Get badge color based on key status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case "used":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Used</Badge>;
      case "expired":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Expired</Badge>;
      case "revoked":
        return <Badge className="bg-red-500 hover:bg-red-600">Revoked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get plan name by ID
  const getPlanName = (planId: number) => {
    return plans?.find((plan) => plan.id === planId)?.name || `Plan #${planId}`;
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading subscription keys...</span>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="flex h-[50vh] w-full flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Error Loading Keys</h2>
            <p className="text-muted-foreground">
              There was a problem loading the subscription keys.
            </p>
          </div>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Keys</h1>
            <p className="text-muted-foreground">
              Manage subscription keys for users to access premium features.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            
            {/* Generate Multiple Keys Button */}
            <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Multiple
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Multiple Subscription Keys</DialogTitle>
                  <DialogDescription>
                    Create multiple subscription keys for a plan. Keys can be shared with users.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBatchCreateSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="batch-planId">Subscription Plan</Label>
                      <Select
                        name="planId"
                        value={batchFormData.planId.toString()}
                        onValueChange={(value) =>
                          setBatchFormData((prev) => ({
                            ...prev,
                            planId: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Plans</SelectLabel>
                            {plans?.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id.toString()}>
                                {plan.name} (${plan.price} - {plan.durationMonths} months)
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="batch-count">Number of Keys</Label>
                      <Input
                        id="batch-count"
                        name="count"
                        type="number"
                        min="1"
                        max="100"
                        value={batchFormData.count}
                        onChange={handleBatchInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="batch-description">Description (Optional)</Label>
                      <Textarea
                        id="batch-description"
                        name="description"
                        value={batchFormData.description}
                        onChange={handleBatchInputChange}
                        placeholder="Purpose of these keys"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="batch-validUntil">Valid Until (Optional)</Label>
                      <Input
                        id="batch-validUntil"
                        name="validUntil"
                        type="date"
                        value={batchFormData.validUntil}
                        onChange={handleBatchInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={batchCreateKeysMutation.isPending || !batchFormData.planId}
                    >
                      {batchCreateKeysMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generate Keys
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            {/* Create Single Key Button */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Key className="mr-2 h-4 w-4" />
                  Create Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subscription Key</DialogTitle>
                  <DialogDescription>
                    Generate a subscription key that can be used to provide access to premium features.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="planId">Subscription Plan</Label>
                      <Select
                        name="planId"
                        value={formData.planId.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            planId: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Plans</SelectLabel>
                            {plans?.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id.toString()}>
                                {plan.name} (${plan.price} - {plan.durationMonths} months)
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Purpose of this key"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                      <Input
                        id="validUntil"
                        name="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createKeyMutation.isPending || !formData.planId}
                    >
                      {createKeyMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Key
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {keys && keys.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Redeemed</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-mono text-xs">
                      {key.keyValue}
                    </TableCell>
                    <TableCell>{getPlanName(key.planId)}</TableCell>
                    <TableCell>{getStatusBadge(key.status)}</TableCell>
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
                    <TableCell>{formatDate(key.redeemedAt)}</TableCell>
                    <TableCell>{formatDate(key.validUntil)}</TableCell>
                    <TableCell>{key.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      {key.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeKey(key.id)}
                          disabled={revokeKeyMutation.isPending}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-[30vh] w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <Key className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Subscription Keys</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't created any subscription keys yet. Create one to get started.
            </p>
            <Button className="mt-6" onClick={() => setCreateDialogOpen(true)}>
              <Key className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}