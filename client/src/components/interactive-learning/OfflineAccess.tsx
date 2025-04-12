import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DownloadCloud,
  FileText,
  Film,
  RefreshCw,
  Settings,
  Trash2,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Book,
  ClipboardList,
  Glasses,
  Upload,
  Cog,
  Play,
  Pause,
  XCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Types
interface CourseContent {
  id: number;
  title: string;
  type: "video" | "pdf" | "document" | "quiz";
  fileSize: number; // in bytes
  duration?: number; // in seconds, for videos
  url: string;
  courseId: number;
  createdAt: Date;
  thumbnailUrl?: string;
}

interface Course {
  id: number;
  title: string;
  coverImage: string;
  progress: number;
  totalContents: number;
}

interface DownloadState {
  contentId: number;
  status: "pending" | "downloading" | "complete" | "error";
  progress: number;
  error?: string;
}

interface OfflineAccessProps {
  courseId?: number; // Optional, if not provided will show all enrolled courses
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export function OfflineAccess({ courseId }: OfflineAccessProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [selectedTab, setSelectedTab] = useState<string>("available");
  const [downloads, setDownloads] = useState<DownloadState[]>([]);
  const [downloadQueue, setDownloadQueue] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState({
    downloadOnWifiOnly: true,
    maxStorageSize: 1024, // MB
    autoDownloadNewContent: false,
  });
  const [storageUsed, setStorageUsed] = useState<number>(0); // in MB
  const [storageAvailable, setStorageAvailable] = useState<number>(0); // in MB

  // Fetch enrolled courses (if courseId is not provided)
  const { 
    data: courses,
    isLoading: loadingCourses,
  } = useQuery<Course[]>({
    queryKey: ["/api/enrollments"],
    enabled: !courseId && !!user,
  });

  // Fetch course content for specific course or all enrolled courses
  const { 
    data: courseContents, 
    isLoading: loadingContents,
  } = useQuery<CourseContent[]>({
    queryKey: courseId 
      ? ["/api/courses", courseId, "contents"] 
      : ["/api/courses", "contents", "enrolled"],
    enabled: !!user && (!!courseId || !!courses),
  });

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Simulate storage check
  useEffect(() => {
    // In a real app, you would check indexedDB or localStorage usage
    const checkStorage = async () => {
      // Simulate storage check
      const mockUsed = 328; // MB
      const mockAvailable = navigator.storage 
        ? (await navigator.storage.estimate()).quota || 0 / (1024 * 1024)
        : 5120; // Default to 5GB if not available
      
      setStorageUsed(mockUsed);
      setStorageAvailable(mockAvailable);
    };
    
    checkStorage();
  }, []);

  // Process download queue
  useEffect(() => {
    const processQueue = async () => {
      if (downloadQueue.length === 0 || isDownloading) {
        return;
      }
      
      // Check if we're on WiFi if that setting is enabled
      if (settings.downloadOnWifiOnly && !isOnline) {
        return;
      }
      
      const nextContentId = downloadQueue[0];
      setIsDownloading(true);
      
      // Update status to downloading
      setDownloads(current => 
        current.map(d => 
          d.contentId === nextContentId 
            ? { ...d, status: "downloading", progress: 0 } 
            : d
        )
      );
      
      try {
        // Simulate download with progress updates
        const content = courseContents?.find(c => c.id === nextContentId);
        if (!content) throw new Error("Content not found");
        
        const totalSteps = 10;
        for (let step = 1; step <= totalSteps; step++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update progress
          setDownloads(current => 
            current.map(d => 
              d.contentId === nextContentId 
                ? { ...d, progress: (step / totalSteps) * 100 } 
                : d
            )
          );
        }
        
        // Update status to complete
        setDownloads(current => 
          current.map(d => 
            d.contentId === nextContentId 
              ? { ...d, status: "complete", progress: 100 } 
              : d
          )
        );
        
        toast({
          title: "Download complete",
          description: `${content.title} is now available offline`,
        });
      } catch (error) {
        // Update status to error
        setDownloads(current => 
          current.map(d => 
            d.contentId === nextContentId 
              ? { 
                  ...d, 
                  status: "error", 
                  error: error instanceof Error ? error.message : "Unknown error" 
                } 
              : d
          )
        );
        
        toast({
          title: "Download failed",
          description: "Failed to download content. Please try again.",
          variant: "destructive",
        });
      } finally {
        // Remove from queue and reset downloading state
        setDownloadQueue(current => current.slice(1));
        setIsDownloading(false);
      }
    };
    
    processQueue();
  }, [downloadQueue, isDownloading, isOnline, settings.downloadOnWifiOnly, courseContents, toast]);

  // Check and initiate downloads based on settings (auto-download)
  useEffect(() => {
    if (
      settings.autoDownloadNewContent && 
      isOnline && 
      (!settings.downloadOnWifiOnly || navigator.connection?.type === "wifi") &&
      courseContents?.length
    ) {
      // Find content not in downloads
      const contentIdsInDownloads = downloads.map(d => d.contentId);
      const newContents = courseContents.filter(
        content => !contentIdsInDownloads.includes(content.id)
      );
      
      if (newContents.length > 0) {
        // Add new contents to download queue
        newContents.forEach(content => {
          downloadContent(content.id);
        });
        
        toast({
          title: "Auto-downloading new content",
          description: `${newContents.length} new items will be downloaded for offline access`,
        });
      }
    }
  }, [courseContents, settings.autoDownloadNewContent, isOnline, settings.downloadOnWifiOnly]);

  // Start downloading content
  const downloadContent = (contentId: number) => {
    // Check if already downloading or downloaded
    const existingDownload = downloads.find(d => d.contentId === contentId);
    if (existingDownload && ["downloading", "complete"].includes(existingDownload.status)) {
      return;
    }
    
    // Check storage limits
    const contentToDownload = courseContents?.find(c => c.id === contentId);
    if (contentToDownload) {
      const contentSizeMB = contentToDownload.fileSize / (1024 * 1024);
      if (storageUsed + contentSizeMB > settings.maxStorageSize) {
        toast({
          title: "Storage limit reached",
          description: "Please free up space or increase storage limit in settings",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Add to downloads list if not exists
    if (!existingDownload) {
      setDownloads(current => [
        ...current,
        {
          contentId,
          status: "pending",
          progress: 0,
        }
      ]);
    } else {
      // Reset if it errored
      setDownloads(current => 
        current.map(d => 
          d.contentId === contentId 
            ? { ...d, status: "pending", progress: 0, error: undefined } 
            : d
        )
      );
    }
    
    // Add to download queue if not already there
    if (!downloadQueue.includes(contentId)) {
      setDownloadQueue(current => [...current, contentId]);
    }
  };

  // Cancel download
  const cancelDownload = (contentId: number) => {
    // Remove from queue
    setDownloadQueue(current => current.filter(id => id !== contentId));
    
    // Remove from downloads if pending, or mark as error if downloading
    setDownloads(current => 
      current.map(d => {
        if (d.contentId === contentId) {
          return d.status === "downloading"
            ? { ...d, status: "error", error: "Download cancelled" }
            : { ...d, status: "error", error: "Download cancelled" };
        }
        return d;
      })
    );
    
    toast({
      title: "Download cancelled",
      description: "Content download has been cancelled",
    });
  };

  // Delete downloaded content
  const deleteDownload = (contentId: number) => {
    // Remove from downloads
    setDownloads(current => current.filter(d => d.contentId !== contentId));
    
    // Update storage used (in a real app, you would free up the actual storage)
    const contentToDelete = courseContents?.find(c => c.id === contentId);
    if (contentToDelete) {
      const contentSizeMB = contentToDelete.fileSize / (1024 * 1024);
      setStorageUsed(current => Math.max(0, current - contentSizeMB));
    }
    
    toast({
      title: "Content deleted",
      description: "Downloaded content has been removed",
    });
  };

  // Check if content is downloaded
  const getDownloadStatus = (contentId: number) => {
    return downloads.find(d => d.contentId === contentId);
  };

  // Sort contents by type, title
  const sortedContents = [...(courseContents || [])].sort((a, b) => {
    // First sort by type
    if (a.type !== b.type) {
      const typeOrder = { video: 1, pdf: 2, document: 3, quiz: 4 };
      return typeOrder[a.type] - typeOrder[b.type];
    }
    // Then by title
    return a.title.localeCompare(b.title);
  });

  // Filter contents by download status
  const availableContents = sortedContents.filter(
    content => !downloads.some(d => d.contentId === content.id && d.status === "complete")
  );
  
  const downloadedContents = sortedContents.filter(
    content => downloads.some(d => d.contentId === content.id && d.status === "complete")
  );
  
  const inProgressContents = sortedContents.filter(
    content => downloads.some(
      d => d.contentId === content.id && 
      (d.status === "downloading" || d.status === "pending")
    )
  );
  
  // Mock data for a realistic demo
  const mockCourses: Course[] = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      coverImage: "/course-cs-intro.jpg",
      progress: 45,
      totalContents: 24
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      coverImage: "/course-math.jpg",
      progress: 30,
      totalContents: 18
    },
    {
      id: 3,
      title: "Business Communication",
      coverImage: "/course-business.jpg",
      progress: 70,
      totalContents: 15
    }
  ];
  
  const mockContents: CourseContent[] = [
    {
      id: 1,
      title: "Introduction to Algorithms",
      type: "video",
      fileSize: 120 * 1024 * 1024, // 120 MB
      duration: 1800, // 30 minutes
      url: "/videos/intro-algorithms.mp4",
      courseId: 1,
      createdAt: new Date(),
      thumbnailUrl: "/thumbnails/algo-intro.jpg"
    },
    {
      id: 2,
      title: "Data Structures Overview",
      type: "pdf",
      fileSize: 8 * 1024 * 1024, // 8 MB
      url: "/docs/data-structures.pdf",
      courseId: 1,
      createdAt: new Date()
    },
    {
      id: 3,
      title: "Sorting Algorithms",
      type: "video",
      fileSize: 250 * 1024 * 1024, // 250 MB
      duration: 2700, // 45 minutes
      url: "/videos/sorting-algos.mp4",
      courseId: 1,
      createdAt: new Date(),
      thumbnailUrl: "/thumbnails/sorting.jpg"
    },
    {
      id: 4,
      title: "Python Programming Guide",
      type: "document",
      fileSize: 4.5 * 1024 * 1024, // 4.5 MB
      url: "/docs/python-guide.docx",
      courseId: 1,
      createdAt: new Date()
    },
    {
      id: 5,
      title: "Database Systems",
      type: "video",
      fileSize: 180 * 1024 * 1024, // 180 MB
      duration: 3600, // 60 minutes
      url: "/videos/database-systems.mp4",
      courseId: 1,
      createdAt: new Date(),
      thumbnailUrl: "/thumbnails/database.jpg"
    },
    {
      id: 6,
      title: "Midterm Practice Quiz",
      type: "quiz",
      fileSize: 1 * 1024 * 1024, // 1 MB
      url: "/quizzes/midterm-practice.json",
      courseId: 1,
      createdAt: new Date()
    }
  ];
  
  // Use mock data if no real data available
  const displayCourses = courses || mockCourses;
  const displayContents = courseContents || mockContents;

  // Rendering content list
  const renderContentList = (contents: CourseContent[]) => {
    if (contents.length === 0) {
      return (
        <div className="text-center py-8">
          <DownloadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No content in this category</p>
        </div>
      );
    }
    
    // Group contents by type
    const groupedContents: Record<string, CourseContent[]> = {};
    contents.forEach(content => {
      if (!groupedContents[content.type]) {
        groupedContents[content.type] = [];
      }
      groupedContents[content.type].push(content);
    });
    
    const typeIcons = {
      video: <Film className="h-4 w-4" />,
      pdf: <FileText className="h-4 w-4" />,
      document: <Book className="h-4 w-4" />,
      quiz: <ClipboardList className="h-4 w-4" />
    };
    
    const typeLabels = {
      video: "Video Lectures",
      pdf: "PDF Materials",
      document: "Reading Materials",
      quiz: "Quizzes & Assessments"
    };
    
    return (
      <Accordion type="multiple" className="w-full">
        {Object.keys(groupedContents).map(type => (
          <AccordionItem key={type} value={type}>
            <AccordionTrigger className="py-4">
              <div className="flex items-center gap-2">
                {typeIcons[type as keyof typeof typeIcons]}
                <span>{typeLabels[type as keyof typeof typeLabels]}</span>
                <Badge variant="outline" className="ml-2">
                  {groupedContents[type].length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {groupedContents[type].map(content => {
                  const downloadStatus = getDownloadStatus(content.id);
                  
                  return (
                    <Card key={content.id} className="overflow-hidden">
                      <div className="flex items-center p-4">
                        <div className="mr-4 bg-muted rounded-md p-2">
                          {typeIcons[content.type as keyof typeof typeIcons]}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium text-sm truncate">{content.title}</h4>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="mr-2">{formatFileSize(content.fileSize)}</span>
                            {content.duration && (
                              <span className="ml-1">{formatDuration(content.duration)}</span>
                            )}
                          </div>
                          
                          {downloadStatus?.status === "downloading" && (
                            <div className="mt-1">
                              <Progress value={downloadStatus.progress} className="h-1 w-full" />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(downloadStatus.progress)}%
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-2 flex gap-1">
                          {!downloadStatus || downloadStatus.status === "error" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadContent(content.id)}
                              disabled={!isOnline}
                            >
                              <DownloadCloud className="h-4 w-4" />
                            </Button>
                          ) : downloadStatus.status === "complete" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteDownload(content.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (downloadStatus.status === "downloading" || downloadStatus.status === "pending") ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => cancelDownload(content.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          ) : null}
                          
                          {downloadStatus?.status === "complete" && (
                            <Button variant="ghost" size="icon">
                              <Glasses className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Offline Access</h2>
          <Badge variant={isOnline ? "default" : "destructive"} className="ml-2">
            {isOnline ? (
              <>
                <Wifi className="mr-1 h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="mr-1 h-3 w-3" />
                Offline
              </>
            )}
          </Badge>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>
            {formatFileSize(storageUsed * 1024 * 1024)} of {settings.maxStorageSize} MB used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress 
            value={(storageUsed / settings.maxStorageSize) * 100} 
            className="h-2"
          />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>
              {Math.round((storageUsed / settings.maxStorageSize) * 100)}% Used
            </span>
            <span>
              {formatFileSize((settings.maxStorageSize - storageUsed) * 1024 * 1024)} Available
            </span>
          </div>
        </CardContent>
      </Card>
      
      {!courseId && (
        <div>
          <h3 className="text-lg font-medium mb-3">Your Courses</h3>
          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="h-40 animate-pulse">
                  <div className="h-full bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayCourses.map(course => {
                // Count downloaded content for this course
                const courseDownloadedCount = downloads.filter(
                  d => d.status === "complete" && 
                  displayContents.find(c => c.id === d.contentId)?.courseId === course.id
                ).length;
                
                return (
                  <Card key={course.id} className="overflow-hidden">
                    <div 
                      className="h-24 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${course.coverImage})` }}
                    />
                    <CardContent className="p-4">
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>
                          {courseDownloadedCount} of {course.totalContents} downloaded
                        </span>
                        <span>
                          {Math.round(course.progress)}% complete
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      <Tabs 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="flex flex-col space-y-4"
      >
        <TabsList>
          <TabsTrigger value="available">
            Available Content
            <Badge variant="outline" className="ml-2">
              {availableContents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="downloads">
            Downloads in Progress
            <Badge variant="outline" className="ml-2">
              {inProgressContents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="offline">
            Saved for Offline
            <Badge variant="outline" className="ml-2">
              {downloadedContents.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4">
          {loadingContents ? (
            <div className="py-8 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading content...</p>
            </div>
          ) : (
            renderContentList(availableContents)
          )}
        </TabsContent>
        
        <TabsContent value="downloads" className="space-y-4">
          {inProgressContents.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No downloads in progress</p>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle>Current Downloads</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsDownloading(prev => !prev)}
                  >
                    {isDownloading ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause All
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume All
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription>
                  {isOnline ? (
                    `${inProgressContents.length} items in the download queue`
                  ) : (
                    "Downloads paused - You are offline"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressContents.map(content => {
                    const downloadStatus = getDownloadStatus(content.id);
                    if (!downloadStatus) return null;
                    
                    return (
                      <div key={content.id} className="flex items-center">
                        <div className="mr-3 bg-muted rounded-md p-2">
                          {content.type === "video" ? (
                            <Film className="h-4 w-4" />
                          ) : content.type === "pdf" ? (
                            <FileText className="h-4 w-4" />
                          ) : content.type === "document" ? (
                            <Book className="h-4 w-4" />
                          ) : (
                            <ClipboardList className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-sm truncate">{content.title}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatFileSize(content.fileSize)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Progress 
                              value={downloadStatus.progress} 
                              className="h-1.5 flex-grow mr-2" 
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {Math.round(downloadStatus.progress)}%
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-muted-foreground">
                              {downloadStatus.status === "pending" 
                                ? "Waiting in queue..." 
                                : "Downloading..."}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 ml-auto"
                              onClick={() => cancelDownload(content.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="ml-1 text-xs">Cancel</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="offline" className="space-y-4">
          {renderContentList(downloadedContents)}
        </TabsContent>
      </Tabs>
      
      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Offline Access Settings</DialogTitle>
            <DialogDescription>
              Configure your download and storage preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="wifi-only">Download on Wi-Fi only</Label>
                <p className="text-sm text-muted-foreground">
                  Prevent downloads on cellular data
                </p>
              </div>
              <Switch
                id="wifi-only"
                checked={settings.downloadOnWifiOnly}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, downloadOnWifiOnly: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-download">Auto-download new content</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically download new course content
                </p>
              </div>
              <Switch
                id="auto-download"
                checked={settings.autoDownloadNewContent}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoDownloadNewContent: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="storage-limit">Max Storage Usage</Label>
              <div className="flex items-center mt-2">
                <input
                  id="storage-limit"
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={settings.maxStorageSize}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      maxStorageSize: parseInt(e.target.value, 10) 
                    }))
                  }
                  className="w-full"
                />
                <span className="ml-4 text-sm font-medium w-20 text-right">
                  {settings.maxStorageSize} MB
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently using {Math.round(storageUsed)} MB of storage
              </p>
            </div>
            
            <Separator />
            
            <div>
              <Button 
                variant="destructive" 
                size="sm"
                className="w-full"
                onClick={() => {
                  // Would delete all downloaded content in a real app
                  setDownloads([]);
                  setStorageUsed(0);
                  setSettingsOpen(false);
                  
                  toast({
                    title: "Downloaded content cleared",
                    description: "All downloaded content has been removed from your device",
                  });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Downloaded Content
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSettingsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}