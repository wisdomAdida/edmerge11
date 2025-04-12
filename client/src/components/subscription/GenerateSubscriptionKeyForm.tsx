import { useState } from "react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

// Form validation schema
const formSchema = z.object({
  planId: z.string().min(1, "Subscription plan is required"),
  description: z.string().optional(),
  count: z.number().int().min(1).max(100, "Maximum 100 keys can be generated at once")
});

type FormValues = z.infer<typeof formSchema>;

export function GenerateSubscriptionKeyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<any[]>([]);
  const { toast } = useToast();

  // Get subscription plans
  const { data: plans = [] } = useQuery({
    queryKey: ["/api/subscription-plans"],
    queryFn: async () => {
      const res = await fetch("/api/subscription-plans");
      if (!res.ok) throw new Error("Failed to fetch subscription plans");
      return res.json();
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: "",
      description: "",
      count: 1
    }
  });

  const generateKeysMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/subscription-keys", {
        planId: parseInt(data.planId),
        description: data.description,
        count: data.count
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to generate subscription keys");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedKeys(data);
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-keys/admin"] });
      toast({
        title: "Keys generated successfully",
        description: `Generated ${data.length} subscription key(s)`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate keys",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    setGeneratedKeys([]);
    generateKeysMutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Subscription Keys</CardTitle>
        <CardDescription>
          Create new subscription keys that users can use to activate premium features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Plan</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={generateKeysMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subscription plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} (${plan.price} - {plan.durationMonths} months)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose which plan these keys will provide access to
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a description for these keys"
                      {...field}
                      disabled={generateKeysMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Add notes about what these keys are for (e.g., "Promotion for Spring 2025")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Keys</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      min={1}
                      max={100}
                      disabled={generateKeysMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    How many unique keys to generate (1-100)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={generateKeysMutation.isPending}>
              {generateKeysMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Keys"
              )}
            </Button>
          </form>
        </Form>
        
        {generatedKeys.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Generated Subscription Keys</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Key</th>
                    <th className="px-4 py-2 text-left">Plan</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedKeys.map((key) => (
                    <tr key={key.id} className="border-t">
                      <td className="px-4 py-2 font-mono text-sm">{key.keyValue}</td>
                      <td className="px-4 py-2">{plans.find((p: any) => p.id === key.planId)?.name || key.planId}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {key.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Make sure to copy these keys before leaving this page!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}