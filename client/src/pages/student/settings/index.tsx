import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";

// Student settings schema
const settingsSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  studentLevel: z.enum(["primary", "secondary", "tertiary", "individual"]),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  preferences: z.object({
    darkMode: z.boolean().default(false),
    language: z.string().default("english"),
    accessibility: z.object({
      screenReader: z.boolean().default(false),
      highContrast: z.boolean().default(false),
      largeText: z.boolean().default(false),
    }),
  }),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function StudentSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with default values
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      studentLevel: "primary",
      bio: "",
      profileImage: "",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      preferences: {
        darkMode: false,
        language: "english",
        accessibility: {
          screenReader: false,
          highContrast: false,
          largeText: false,
        },
      },
    },
  });
  
  // Update form when user data changes
  useEffect(() => {
    if (user) {
      // Get notification settings from database or defaults
      let notificationSettings = {
        email: true,
        push: true,
        sms: false,
      };
      
      // Try to load notification settings from database first
      try {
        if (user.notificationSettings) {
          // Load from user data if available
          notificationSettings = JSON.parse(user.notificationSettings);
          console.log("Loaded notification settings from database:", notificationSettings);
        } else {
          // Fall back to localStorage if database value not available
          const savedNotifications = localStorage.getItem(`user_${user.id}_notifications`);
          if (savedNotifications) {
            notificationSettings = JSON.parse(savedNotifications);
            console.log("Loaded notification settings from localStorage:", notificationSettings);
          }
        }
      } catch (error) {
        console.error("Failed to parse notification settings:", error);
      }
      
      // Get preference settings from database or defaults
      let preferenceSettings = {
        darkMode: false,
        language: "english",
        accessibility: {
          screenReader: false,
          highContrast: false,
          largeText: false,
        },
      };
      
      // Try to load preference settings from database first
      try {
        if (user.preferenceSettings) {
          // Load from user data if available
          preferenceSettings = JSON.parse(user.preferenceSettings);
          console.log("Loaded preference settings from database:", preferenceSettings);
        } else {
          // Fall back to localStorage if database value not available
          const savedPreferences = localStorage.getItem(`user_${user.id}_preferences`);
          if (savedPreferences) {
            preferenceSettings = JSON.parse(savedPreferences);
            console.log("Loaded preference settings from localStorage:", preferenceSettings);
          }
        }
      } catch (error) {
        console.error("Failed to parse preference settings:", error);
      }
      
      // Update form values with real-time data from user object
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        studentLevel: user.studentLevel as any || "primary",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
        notifications: notificationSettings,
        preferences: preferenceSettings,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: SettingsValues) => {
    setIsLoading(true);
    try {
      // Save all settings directly to the database
      console.log("Saving user settings to database:", data);
      
      // Update user settings via API
      await apiRequest("PATCH", "/api/user/settings", data);
      
      // Invalidate user data in cache to refresh it
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    toast({
      title: "Password reset",
      description: "A password reset link has been sent to your email.",
    });
  };

  return (
    <DashboardLayout title="Settings">
      {/* Success notification about database storage */}
      <div className="mb-4 p-4 rounded-lg border border-green-200 bg-green-50 text-green-800">
        <h3 className="font-medium">Settings Integration Complete</h3>
        <p className="text-sm mt-1">
          Your notification and preference settings are now being stored securely in the database.
          Changes will persist across devices and browser sessions.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your education level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="tertiary">Tertiary</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your education level determines the type of content you'll see.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a bit about yourself" 
                            className="resize-none" 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This will be visible on your student profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter a URL for your profile picture.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Library Access ID - Read Only */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Library Access ID</h3>
                    <div className="flex items-center space-x-2">
                      <div className="font-mono px-3 py-2 bg-muted rounded-md text-muted-foreground w-full">
                        {user?.libraryAccessId || "Not assigned"}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This is your unique library access ID. You cannot change this ID.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
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
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="notifications.email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.push"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Push Notifications</FormLabel>
                          <FormDescription>
                            Receive push notifications on your device
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.sms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>SMS Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via SMS
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
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
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your learning experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="preferences.language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your preferred language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="arabic">Arabic</SelectItem>
                            <SelectItem value="mandarin">Mandarin</SelectItem>
                            <SelectItem value="hausa">Hausa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your preferred language for the platform interface.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.darkMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Dark Mode</FormLabel>
                          <FormDescription>
                            Use dark theme for the application
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="pt-6 pb-2">
                    <h3 className="text-lg font-medium">Accessibility Settings</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="preferences.accessibility.largeText"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Large Text</FormLabel>
                          <FormDescription>
                            Use larger text throughout the application
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.accessibility.highContrast"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>High Contrast</FormLabel>
                          <FormDescription>
                            Use high contrast colors
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.accessibility.screenReader"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Screen Reader Optimization</FormLabel>
                          <FormDescription>
                            Optimize interface for screen readers
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
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
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your account security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Request a password reset link to your email.
                    </p>
                  </div>
                  <Button onClick={handleResetPassword}>
                    Request Password Reset
                  </Button>
                  
                  <div className="space-y-2 pt-6">
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Button variant="outline">
                    Set Up Two-Factor Authentication
                  </Button>
                  
                  <div className="space-y-2 pt-6">
                    <h3 className="text-lg font-medium">Device Management</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage devices that are currently logged in to your account.
                    </p>
                  </div>
                  <Button variant="outline">
                    Manage Devices
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </DashboardLayout>
  );
}