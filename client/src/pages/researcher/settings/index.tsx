import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, User, Bell, Lock, Shield, Microscope, Save, Bookmark } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
  institution: z.string().optional(),
  researchFocus: z.string().optional(),
  academicQualifications: z.string().optional(),
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

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

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
      institution: "",
      researchFocus: "",
      academicQualifications: "",
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

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState({
    researchUpdates: true,
    collaborationRequests: true,
    citations: true,
    systemUpdates: true,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    researchUpdates: true,
    collaborationRequests: true,
    citations: true,
    systemUpdates: false,
  });

  // Research interests
  const [researchInterests, setResearchInterests] = useState<string[]>([
    "Education Technology",
    "Machine Learning",
    "Cognitive Development"
  ]);
  const [newInterest, setNewInterest] = useState("");

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
  
  // Update research interests mutation
  const updateInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const res = await apiRequest("PATCH", "/api/researcher/interests", { interests });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Research interests updated",
        description: "Your research interests have been saved successfully.",
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
  
  // Handle notification settings update
  const updateNotificationSettings = () => {
    updateNotificationsMutation.mutate({
      email: emailNotifications,
      push: pushNotifications,
    });
  };
  
  // Handle adding a research interest
  const addResearchInterest = () => {
    if (newInterest.trim() && !researchInterests.includes(newInterest.trim())) {
      const updatedInterests = [...researchInterests, newInterest.trim()];
      setResearchInterests(updatedInterests);
      updateInterestsMutation.mutate(updatedInterests);
      setNewInterest("");
    }
  };
  
  // Handle removing a research interest
  const removeResearchInterest = (interest: string) => {
    const updatedInterests = researchInterests.filter(i => i !== interest);
    setResearchInterests(updatedInterests);
    updateInterestsMutation.mutate(updatedInterests);
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 max-w-xl mb-8">
            <TabsTrigger value="profile" className="text-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="research" className="text-center">
              <Microscope className="h-4 w-4 mr-2" />
              Research
            </TabsTrigger>
            <TabsTrigger value="security" className="text-center">
              <Lock className="h-4 w-4 mr-2" />
              Security
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
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and public researcher profile.
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
                      <Label htmlFor="institution" className="font-bold">Institution</Label>
                      <Input
                        id="institution"
                        placeholder="e.g. University of Lagos, Nigerian Institute of Education"
                        {...profileForm.register("institution")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="academicQualifications" className="font-bold">Academic Qualifications</Label>
                      <Input
                        id="academicQualifications"
                        placeholder="e.g. PhD in Education, MSc in Computer Science"
                        {...profileForm.register("academicQualifications")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="researchFocus" className="font-bold">Research Focus</Label>
                      <Input
                        id="researchFocus"
                        placeholder="e.g. Educational Technology in African Higher Education"
                        {...profileForm.register("researchFocus")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="font-bold">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Share your background, achievements, and research vision"
                        rows={4}
                        {...profileForm.register("bio")}
                      />
                      <p className="text-sm text-muted-foreground">
                        This will be displayed on your public researcher profile.
                      </p>
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
                      Upload a professional photo to enhance your researcher profile.
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
          
          {/* Research Interests */}
          <TabsContent value="research">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Research Interests</CardTitle>
                  <CardDescription>
                    Manage your research interests and focus areas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newInterest" className="font-bold">Add Research Interest</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newInterest"
                        placeholder="e.g. Educational Psychology"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={addResearchInterest}
                        disabled={!newInterest.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-bold">Current Research Interests</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {researchInterests.map((interest) => (
                        <div
                          key={interest}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          <Bookmark className="h-3 w-3" />
                          <span className="text-sm">{interest}</span>
                          <button
                            type="button"
                            className="text-primary/60 hover:text-primary"
                            onClick={() => removeResearchInterest(interest)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Publication Settings</CardTitle>
                  <CardDescription>
                    Configure how your research publications are displayed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Citation Count</p>
                        <p className="text-sm text-muted-foreground">
                          Display citation counts on your publications.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">External Links</p>
                        <p className="text-sm text-muted-foreground">
                          Show links to external research platforms (Google Scholar, ResearchGate, etc.).
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Publication Privacy</p>
                        <p className="text-sm text-muted-foreground">
                          Make your publications visible to all platform users.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Automatic Publication Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically update your publication list from connected accounts.
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
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
                  <CardTitle>Login Activity</CardTitle>
                  <CardDescription>
                    Manage your account's security settings and active sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account.
                        </p>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-xs text-muted-foreground">
                              Chrome on Windows • IP: 192.168.1.1
                            </p>
                          </div>
                          <p className="text-xs text-green-600 font-medium">Active Now</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-2">
                      Sign Out All Devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Configure which emails you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Research Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about your research projects.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications.researchUpdates}
                        onCheckedChange={(checked) => setEmailNotifications({
                          ...emailNotifications,
                          researchUpdates: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Collaboration Requests</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when you're invited to collaborate.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications.collaborationRequests}
                        onCheckedChange={(checked) => setEmailNotifications({
                          ...emailNotifications,
                          collaborationRequests: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Citations</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when your work is cited.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications.citations}
                        onCheckedChange={(checked) => setEmailNotifications({
                          ...emailNotifications,
                          citations: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Receive important platform updates and announcements.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications.systemUpdates}
                        onCheckedChange={(checked) => setEmailNotifications({
                          ...emailNotifications,
                          systemUpdates: checked
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
                    Configure which notifications you want to receive in-app.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Research Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about your research projects.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications.researchUpdates}
                        onCheckedChange={(checked) => setPushNotifications({
                          ...pushNotifications,
                          researchUpdates: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Collaboration Requests</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when you're invited to collaborate.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications.collaborationRequests}
                        onCheckedChange={(checked) => setPushNotifications({
                          ...pushNotifications,
                          collaborationRequests: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Citations</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when your work is cited.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications.citations}
                        onCheckedChange={(checked) => setPushNotifications({
                          ...pushNotifications,
                          citations: checked
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Receive important platform updates and announcements.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications.systemUpdates}
                        onCheckedChange={(checked) => setPushNotifications({
                          ...pushNotifications,
                          systemUpdates: checked
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
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your privacy and visibility on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">
                          Make your researcher profile visible to all users.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Research Publication Privacy</p>
                        <p className="text-sm text-muted-foreground">
                          Control who can view your research publications.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Research Analytics</p>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect analytics data to improve research features.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Third-Party Services</p>
                        <p className="text-sm text-muted-foreground">
                          Allow third-party services to enhance your research experience.
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      Download My Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4 md:mt-0">
                <CardHeader>
                  <CardTitle className="text-red-600">Delete Account</CardTitle>
                  <CardDescription>
                    Permanently remove your account and all associated data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Deleting your account will remove all your research projects, publications, and personal information. This action cannot be undone.
                    </p>
                    
                    <p className="text-sm">
                      Published research may still be available on the platform but will no longer be associated with your account.
                    </p>
                    
                    <div className="pt-2">
                      <Button variant="destructive" className="w-full">
                        Delete Account
                      </Button>
                    </div>
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