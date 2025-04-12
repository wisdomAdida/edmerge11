import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, User, Bell, Lock, Shield, Settings as SettingsIcon, Save, Database, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Schema for profile settings
const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().optional(),
  position: z.string().optional(),
});

// Schema for security settings
const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Schema for system settings
const systemSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  supportEmail: z.string().email("Please enter a valid email"),
  maintenanceMode: z.boolean().default(false),
  defaultCommissionRate: z.number().min(0).max(100),
});

// Schema for payment settings
const paymentSchema = z.object({
  flutterwavePublicKey: z.string().min(1, "Flutterwave public key is required"),
  flutterwaveSecretKey: z.string().min(1, "Flutterwave secret key is required"),
  currencyCode: z.string().min(1, "Currency code is required"),
  minimumWithdrawalAmount: z.number().min(0),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;
type SystemFormValues = z.infer<typeof systemSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profileImage || null);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      position: "Platform Administrator",
    },
  });
  
  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // System settings form
  const systemForm = useForm<SystemFormValues>({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      siteName: "EdMerge",
      siteDescription: "Premium AI-enhanced E-learning Platform",
      supportEmail: "support@edmerge.com",
      maintenanceMode: false,
      defaultCommissionRate: 10,
    },
  });
  
  // Payment settings form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      flutterwavePublicKey: "",
      flutterwaveSecretKey: "",
      currencyCode: "NGN",
      minimumWithdrawalAmount: 5000,
    },
  });

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState({
    newUsers: true,
    newCourses: true,
    withdrawalRequests: true,
    systemAlerts: true,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    newUsers: true,
    newCourses: true,
    withdrawalRequests: true,
    systemAlerts: true,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      securityForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update system settings mutation
  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (data: SystemFormValues) => {
      const res = await apiRequest("PATCH", "/api/admin/system-settings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "System settings updated",
        description: "System settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update payment settings mutation
  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const res = await apiRequest("PATCH", "/api/admin/payment-settings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment settings updated",
        description: "Payment settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/user/notifications", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        setProfileImagePreview(result);
        setProfileImageFile(file);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    // In a real app, you would upload the profile image here
    updateProfileMutation.mutate(data);
  };
  
  // Handle security form submission
  const onSecuritySubmit = (data: SecurityFormValues) => {
    changePasswordMutation.mutate(data);
  };
  
  // Handle system settings form submission
  const onSystemSubmit = (data: SystemFormValues) => {
    updateSystemSettingsMutation.mutate(data);
  };
  
  // Handle payment settings form submission
  const onPaymentSubmit = (data: PaymentFormValues) => {
    updatePaymentSettingsMutation.mutate(data);
  };
  
  // Handle notification settings update
  const updateNotificationSettings = () => {
    updateNotificationsMutation.mutate({
      email: emailNotifications,
      push: pushNotifications,
    });
  };

  return (
    <DashboardLayout title="System Settings">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 max-w-2xl mb-8">
            <TabsTrigger value="profile" className="text-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="text-center">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="system" className="text-center">
              <SettingsIcon className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-center">
              <Wallet className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-center">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Administrator Profile</CardTitle>
                    <CardDescription>
                      Update your personal information and administrator profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-bold">First Name</Label>
                        <Input
                          id="firstName"
                          {...profileForm.register("firstName")}
                        />
                        {profileForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500">
                            {profileForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="font-bold">Last Name</Label>
                        <Input
                          id="lastName"
                          {...profileForm.register("lastName")}
                        />
                        {profileForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500">
                            {profileForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...profileForm.register("email")}
                      />
                      {profileForm.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position" className="font-bold">Position</Label>
                      <Input
                        id="position"
                        {...profileForm.register("position")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="font-bold">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Optional administrator bio"
                        rows={4}
                        {...profileForm.register("bio")}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="font-bold"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>
                      Upload a professional photo for your admin profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32 border-2 border-primary/20">
                      <AvatarImage src={profileImagePreview || undefined} />
                      <AvatarFallback className="text-2xl">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="w-full">
                      <Label htmlFor="profile-image" className="block text-center mb-2">
                        Change profile picture
                      </Label>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("profile-image")?.click()}
                      >
                        Upload Image
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Change Administrator Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your administrator account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="font-bold">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...securityForm.register("currentPassword")}
                      />
                      {securityForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500">
                          {securityForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="font-bold">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...securityForm.register("newPassword")}
                      />
                      {securityForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-500">
                          {securityForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-bold">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...securityForm.register("confirmPassword")}
                      />
                      {securityForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {securityForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="w-full mt-4 font-bold"
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Platform Security Settings</CardTitle>
                  <CardDescription>
                    Configure security settings for the entire platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Require two-factor authentication for all administrators.
                        </p>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Password Policy</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Minimum password length
                          </p>
                          <Select defaultValue="8">
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6">6</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Require uppercase letters
                          </p>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Require numbers
                          </p>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Require special characters
                          </p>
                          <Switch />
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* System Settings */}
          <TabsContent value="system">
            <form onSubmit={systemForm.handleSubmit(onSystemSubmit)}>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Platform Configuration</CardTitle>
                    <CardDescription>
                      Configure global settings for the EdMerge platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="siteName" className="font-bold">Site Name</Label>
                        <Input
                          id="siteName"
                          {...systemForm.register("siteName")}
                        />
                        {systemForm.formState.errors.siteName && (
                          <p className="text-sm text-red-500">
                            {systemForm.formState.errors.siteName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="supportEmail" className="font-bold">Support Email</Label>
                        <Input
                          id="supportEmail"
                          type="email"
                          {...systemForm.register("supportEmail")}
                        />
                        {systemForm.formState.errors.supportEmail && (
                          <p className="text-sm text-red-500">
                            {systemForm.formState.errors.supportEmail.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription" className="font-bold">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        rows={2}
                        {...systemForm.register("siteDescription")}
                      />
                      {systemForm.formState.errors.siteDescription && (
                        <p className="text-sm text-red-500">
                          {systemForm.formState.errors.siteDescription.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultCommissionRate" className="font-bold">Default Commission Rate (%)</Label>
                      <Input
                        id="defaultCommissionRate"
                        type="number"
                        min="0"
                        max="100"
                        {...systemForm.register("defaultCommissionRate", { valueAsNumber: true })}
                      />
                      <p className="text-sm text-muted-foreground">
                        Percentage of course revenue that goes to the platform.
                      </p>
                      {systemForm.formState.errors.defaultCommissionRate && (
                        <p className="text-sm text-red-500">
                          {systemForm.formState.errors.defaultCommissionRate.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between border p-4 rounded-md">
                      <div>
                        <p className="font-medium">Maintenance Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Enable maintenance mode to temporarily disable access to the platform.
                        </p>
                      </div>
                      <Switch 
                        checked={systemForm.watch("maintenanceMode")}
                        onCheckedChange={(checked) => systemForm.setValue("maintenanceMode", checked)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateSystemSettingsMutation.isPending}
                      className="font-bold"
                    >
                      {updateSystemSettingsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save System Settings"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>
                      Configure email settings for the platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost" className="font-bold">SMTP Host</Label>
                      <Input id="smtpHost" placeholder="e.g. smtp.example.com" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort" className="font-bold">SMTP Port</Label>
                        <Input id="smtpPort" placeholder="e.g. 587" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="smtpSecurity" className="font-bold">Security</Label>
                        <Select defaultValue="tls">
                          <SelectTrigger id="smtpSecurity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                            <SelectItem value="tls">TLS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername" className="font-bold">SMTP Username</Label>
                      <Input id="smtpUsername" placeholder="e.g. noreply@edmerge.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword" className="font-bold">SMTP Password</Label>
                      <Input id="smtpPassword" type="password" placeholder="Enter password" />
                    </div>
                    
                    <Button className="w-full mt-2">
                      Save Email Settings
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Storage Settings</CardTitle>
                    <CardDescription>
                      Configure storage settings for course materials and uploads.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="storageProvider" className="font-bold">Storage Provider</Label>
                      <Select defaultValue="local">
                        <SelectTrigger id="storageProvider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local Storage</SelectItem>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                          <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxUploadSize" className="font-bold">Maximum Upload Size (MB)</Label>
                      <Input id="maxUploadSize" type="number" defaultValue="50" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="allowedFileTypes" className="font-bold">Allowed File Types</Label>
                      <Input id="allowedFileTypes" placeholder="e.g. jpg,png,pdf,docx,mp4" defaultValue="jpg,jpeg,png,gif,pdf,docx,pptx,mp4,mp3" />
                    </div>
                    
                    <Button className="w-full mt-2">
                      Save Storage Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          </TabsContent>
          
          {/* Payment Settings */}
          <TabsContent value="payment">
            <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Flutterwave Payment Configuration</CardTitle>
                    <CardDescription>
                      Configure your Flutterwave payment settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="flutterwavePublicKey" className="font-bold">Public Key</Label>
                        <Input
                          id="flutterwavePublicKey"
                          {...paymentForm.register("flutterwavePublicKey")}
                        />
                        {paymentForm.formState.errors.flutterwavePublicKey && (
                          <p className="text-sm text-red-500">
                            {paymentForm.formState.errors.flutterwavePublicKey.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="flutterwaveSecretKey" className="font-bold">Secret Key</Label>
                        <Input
                          id="flutterwaveSecretKey"
                          type="password"
                          {...paymentForm.register("flutterwaveSecretKey")}
                        />
                        {paymentForm.formState.errors.flutterwaveSecretKey && (
                          <p className="text-sm text-red-500">
                            {paymentForm.formState.errors.flutterwaveSecretKey.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="currencyCode" className="font-bold">Currency Code</Label>
                        <Select
                          defaultValue={paymentForm.getValues("currencyCode")}
                          onValueChange={(value) => paymentForm.setValue("currencyCode", value)}
                        >
                          <SelectTrigger id="currencyCode">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                            <SelectItem value="GHS">Ghanaian Cedi (GHS)</SelectItem>
                            <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                            <SelectItem value="ZAR">South African Rand (ZAR)</SelectItem>
                          </SelectContent>
                        </Select>
                        {paymentForm.formState.errors.currencyCode && (
                          <p className="text-sm text-red-500">
                            {paymentForm.formState.errors.currencyCode.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="minimumWithdrawalAmount" className="font-bold">Minimum Withdrawal Amount</Label>
                        <Input
                          id="minimumWithdrawalAmount"
                          type="number"
                          min="0"
                          {...paymentForm.register("minimumWithdrawalAmount", { valueAsNumber: true })}
                        />
                        {paymentForm.formState.errors.minimumWithdrawalAmount && (
                          <p className="text-sm text-red-500">
                            {paymentForm.formState.errors.minimumWithdrawalAmount.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border p-4 rounded-md">
                      <div>
                        <p className="font-medium">Test Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Use sandbox environment for testing payments.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updatePaymentSettingsMutation.isPending}
                      className="font-bold"
                    >
                      {updatePaymentSettingsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Payment Settings"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal Settings</CardTitle>
                    <CardDescription>
                      Configure withdrawal settings for tutors.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawalFrequency" className="font-bold">Withdrawal Processing Frequency</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger id="withdrawalFrequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="withdrawalApproval" className="font-bold">Withdrawal Approval</Label>
                      <Select defaultValue="manual">
                        <SelectTrigger id="withdrawalApproval">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Approval</SelectItem>
                          <SelectItem value="automatic">Automatic Approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="font-medium">Hold Period</p>
                        <p className="text-sm text-muted-foreground">
                          Days to hold payments before allowing withdrawal
                        </p>
                      </div>
                      <Input className="w-20 text-right" type="number" defaultValue="7" />
                    </div>
                    
                    <Button className="w-full mt-4">
                      Save Withdrawal Settings
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Settings</CardTitle>
                    <CardDescription>
                      Configure commission rates for different types of content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Standard Courses</p>
                        <div className="flex items-center">
                          <Input className="w-16 text-right" type="number" defaultValue="10" min="0" max="100" />
                          <span className="ml-2">%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Premium Courses</p>
                        <div className="flex items-center">
                          <Input className="w-16 text-right" type="number" defaultValue="15" min="0" max="100" />
                          <span className="ml-2">%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Mentorship</p>
                        <div className="flex items-center">
                          <Input className="w-16 text-right" type="number" defaultValue="12" min="0" max="100" />
                          <span className="ml-2">%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Research Materials</p>
                        <div className="flex items-center">
                          <Input className="w-16 text-right" type="number" defaultValue="20" min="0" max="100" />
                          <span className="ml-2">%</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">
                      Save Commission Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Configure which administrative emails you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New User Registrations</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when new users register.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications.newUsers}
                        onCheckedChange={(checked) => setEmailNotifications({
                          ...emailNotifications,
                          newUsers: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Course Publications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when tutors publish new courses.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications.newCourses}
                        onCheckedChange={(checked) => setEmailNotifications({
                          ...emailNotifications,
                          newCourses: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Withdrawal Requests</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for tutor withdrawal requests.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications.withdrawalRequests}
                        onCheckedChange={(checked) => setEmailNotifications({
                          ...emailNotifications,
                          withdrawalRequests: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Receive critical system alerts and error notifications.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications.systemAlerts}
                        onCheckedChange={(checked) => setEmailNotifications({
                          ...emailNotifications,
                          systemAlerts: checked
                        })}
                      />
                    </div>
                  </div>
                  
                  <Button
                    className="w-full mt-6"
                    onClick={updateNotificationSettings}
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Email Preferences"
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>
                    Configure which administrative push notifications you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New User Registrations</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when new users register.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications.newUsers}
                        onCheckedChange={(checked) => setPushNotifications({
                          ...pushNotifications,
                          newUsers: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Course Publications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when tutors publish new courses.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications.newCourses}
                        onCheckedChange={(checked) => setPushNotifications({
                          ...pushNotifications,
                          newCourses: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Withdrawal Requests</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for tutor withdrawal requests.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications.withdrawalRequests}
                        onCheckedChange={(checked) => setPushNotifications({
                          ...pushNotifications,
                          withdrawalRequests: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Receive critical system alerts and error notifications.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications.systemAlerts}
                        onCheckedChange={(checked) => setPushNotifications({
                          ...pushNotifications,
                          systemAlerts: checked
                        })}
                      />
                    </div>
                  </div>
                  
                  <Button
                    className="w-full mt-6"
                    onClick={updateNotificationSettings}
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Push Notification Preferences"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Platform Privacy Settings</CardTitle>
                  <CardDescription>
                    Configure privacy settings for the entire platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">Data Collection</p>
                        <p className="text-sm text-muted-foreground">
                          Collect anonymized usage data to improve platform experience.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">Cookie Consent</p>
                        <p className="text-sm text-muted-foreground">
                          Require explicit cookie consent from all users.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">GDPR Compliance</p>
                        <p className="text-sm text-muted-foreground">
                          Enable GDPR compliance features including data export and deletion.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="space-y-2 pt-4">
                      <Label htmlFor="privacyPolicy" className="font-bold">Privacy Policy</Label>
                      <Textarea
                        id="privacyPolicy"
                        rows={8}
                        defaultValue="EdMerge Privacy Policy content goes here..."
                      />
                      <p className="text-sm text-muted-foreground">
                        This policy will be displayed on the platform's privacy policy page.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="termsOfService" className="font-bold">Terms of Service</Label>
                      <Textarea
                        id="termsOfService"
                        rows={8}
                        defaultValue="EdMerge Terms of Service content goes here..."
                      />
                      <p className="text-sm text-muted-foreground">
                        This policy will be displayed on the platform's terms of service page.
                      </p>
                    </div>
                    
                    <Button className="w-full">
                      Save Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}