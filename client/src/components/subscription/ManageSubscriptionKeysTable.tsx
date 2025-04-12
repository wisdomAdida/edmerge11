import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCaption
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Ban } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "used":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-amber-100 text-amber-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <Badge variant="outline" className={`${getStatusStyles()} border-none`}>
      {status}
    </Badge>
  );
};

export function ManageSubscriptionKeysTable() {
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch subscription keys created by the admin
  const { 
    data: keys = [], 
    isLoading,
    isError 
  } = useQuery({
    queryKey: ["/api/subscription-keys/admin"],
    queryFn: async () => {
      const res = await fetch("/api/subscription-keys/admin");
      if (!res.ok) throw new Error("Failed to fetch subscription keys");
      return res.json();
    }
  });

  // Fetch subscription plans to display names
  const { data: plans = [] } = useQuery({
    queryKey: ["/api/subscription-plans"],
    queryFn: async () => {
      const res = await fetch("/api/subscription-plans");
      if (!res.ok) throw new Error("Failed to fetch subscription plans");
      return res.json();
    }
  });

  // Mutation to revoke a subscription key
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const res = await apiRequest("POST", `/api/subscription-keys/${keyId}/revoke`, {});
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to revoke subscription key");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-keys/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-keys"] });
      
      toast({
        title: "Key revoked",
        description: "The subscription key has been successfully revoked",
      });
      
      setSelectedKeyId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to revoke key",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });

  const handleRevoke = (keyId: number) => {
    revokeKeyMutation.mutate(keyId);
  };

  const getPlanName = (planId: number) => {
    const plan = plans.find((p: any) => p.id === planId);
    return plan ? plan.name : `Plan ID: ${planId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading subscription keys. Please try again.
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Subscription Keys</CardTitle>
        <CardDescription>
          View and manage subscription keys you've created
        </CardDescription>
      </CardHeader>
      <CardContent>
        {keys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No subscription keys found. Generate some keys to get started.
          </div>
        ) : (
          <Table>
            <TableCaption>A list of subscription keys you've created</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key: any) => (
                <TableRow key={key.id}>
                  <TableCell className="font-mono text-xs">{key.keyValue}</TableCell>
                  <TableCell>{getPlanName(key.planId)}</TableCell>
                  <TableCell>
                    <StatusBadge status={key.status} />
                  </TableCell>
                  <TableCell>{formatDate(key.createdAt)}</TableCell>
                  <TableCell>{formatDate(key.validUntil)}</TableCell>
                  <TableCell>
                    {key.userId ? `User ID: ${key.userId}` : "Not assigned"}
                  </TableCell>
                  <TableCell>
                    {key.status === "active" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setSelectedKeyId(key.id)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Subscription Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke this subscription key? 
                              This action cannot be undone and will prevent the key from being used.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevoke(key.id)}
                              disabled={revokeKeyMutation.isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {revokeKeyMutation.isPending && selectedKeyId === key.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Revoking...
                                </>
                              ) : (
                                "Revoke Key"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}