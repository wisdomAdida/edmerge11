import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, Clock, Calendar, BookOpen, Award, PlayCircle, FileText, 
  FileQuestion, LinkIcon, FileIcon, ChevronDown, ChevronUp, Menu, FileVideo, Check
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CourseSection, CourseMaterial, Course } from "@shared/schema";

interface CoursePreviewProps {
  course: Course;
  sections: CourseSection[];
}

export function CoursePreview({ course, sections }: CoursePreviewProps) {
  const [activeTab, setActiveTab] = useState("student");
  
  // Fetch all materials for the course
  const { data: materials = [], isLoading: isLoadingMaterials } = useQuery({
    queryKey: ["/api/courses", course.id, "materials"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${course.id}/materials`);
      return response.json();
    },
  });

  // Calculate course statistics
  const stats = useMemo(() => {
    let videoCount = 0;
    let docCount = 0;
    let quizCount = 0;
    let totalDuration = 0;
    
    materials.forEach((material: CourseMaterial) => {
      if (material.type === 'video') {
        videoCount++;
        if (material.duration) {
          totalDuration += material.duration;
        }
      } else if (material.type === 'document' || material.type === 'pdf') {
        docCount++;
      } else if (material.type === 'quiz' || material.type === 'assignment') {
        quizCount++;
      }
    });
    
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    
    return {
      sectionCount: sections.length,
      materialCount: materials.length,
      videoCount,
      docCount,
      quizCount,
      totalHours: hours,
      totalMinutes: minutes,
      formattedDuration: hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes} min`
    };
  }, [sections, materials]);

  // Get materials for a specific section
  const getSectionMaterials = (sectionId: number) => {
    return materials
      .filter((material: CourseMaterial) => material.sectionId === sectionId)
      .sort((a: CourseMaterial, b: CourseMaterial) => a.order - b.order);
  };

  // Format material duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Get icon for material type
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FileVideo className="h-4 w-4 flex-shrink-0" />;
      case 'document':
        return <FileText className="h-4 w-4 flex-shrink-0" />;
      case 'pdf':
        return <FileIcon className="h-4 w-4 flex-shrink-0" />;
      case 'quiz':
        return <FileQuestion className="h-4 w-4 flex-shrink-0" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 flex-shrink-0" />;
      default:
        return <FileText className="h-4 w-4 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              <CardTitle className="text-2xl">Course Preview</CardTitle>
              <CardDescription>
                Preview how your course will appear to students and instructors.
              </CardDescription>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto mt-4 sm:mt-0">
              <TabsList className="grid grid-cols-2 w-full sm:w-[240px]">
                <TabsTrigger value="student">Student View</TabsTrigger>
                <TabsTrigger value="instructor">Instructor View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div 
              className="w-full h-[200px] rounded-lg bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: `url(${course.coverImage})` }}
            >
              <div className="w-full h-full flex items-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="text-white">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20">
                      {course.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20">
                      {course.level}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold mt-2">{course.title}</h2>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <span>Sections</span>
                  </div>
                  <span className="font-medium">{stats.sectionCount}</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>Duration</span>
                  </div>
                  <span className="font-medium">{stats.formattedDuration}</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-muted-foreground" />
                    <span>Videos</span>
                  </div>
                  <span className="font-medium">{stats.videoCount}</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span>Price</span>
                  </div>
                  <span className="font-medium">
                    {course.isFree ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      `$${course.price.toFixed(2)}`
                    )}
                  </span>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            {/* Course Content Preview */}
            <div>
              <h3 className="text-lg font-medium mb-4">Course Content</h3>
              
              {isLoadingMaterials ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : sections.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Content Added Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      You haven't added any content to this course yet. Use the Content Builder tab to create sections and add materials.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => {
                      const sectionMaterials = getSectionMaterials(section.id);
                      return (
                        <Collapsible key={section.id} className="border rounded-lg" defaultOpen={index === 0}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50 rounded-t-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium">{section.title}</h4>
                                {section.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {sectionMaterials.length} {sectionMaterials.length === 1 ? 'item' : 'items'}
                              </span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <Separator />
                            <div className="p-2">
                              {sectionMaterials.length > 0 ? (
                                <div className="space-y-1">
                                  {sectionMaterials.map((material, materialIndex) => (
                                    <div 
                                      key={material.id}
                                      className="flex items-center justify-between p-3 hover:bg-accent/40 rounded-md"
                                    >
                                      <div className="flex items-center gap-3">
                                        {getMaterialIcon(material.type)}
                                        <div>
                                          <h5 className="text-sm font-medium">{material.title}</h5>
                                          {material.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">{material.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {material.isRequired && (
                                          <Badge variant="outline" className="text-xs ml-auto">Required</Badge>
                                        )}
                                        {material.duration ? (
                                          <span className="text-xs text-muted-foreground">{formatDuration(material.duration)}</span>
                                        ) : (
                                          <span className="text-xs text-muted-foreground capitalize">{material.type}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-4 text-center text-muted-foreground text-sm">
                                  No materials in this section
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                </div>
              )}
            </div>
            
            {/* Course Description Preview */}
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">About This Course</h3>
              <Card>
                <CardContent className="p-6">
                  <p className="whitespace-pre-line">{course.description}</p>
                </CardContent>
              </Card>
            </div>
            
            {activeTab === "student" ? (
              <div className="flex justify-center">
                <Button className="w-full sm:w-auto">
                  {course.isFree ? "Enroll Now (Free)" : `Enroll for $${course.price.toFixed(2)}`}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Course Status</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`p-2 rounded-full ${
                        course.status === "published" ? "bg-green-100" : 
                        course.status === "draft" ? "bg-amber-100" : 
                        "bg-red-100"
                      }`}>
                        {course.status === "published" ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : course.status === "draft" ? (
                          <BookOpen className="h-5 w-5 text-amber-600" />
                        ) : (
                          <Menu className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{course.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.status === "published" 
                            ? "Your course is live and available for enrollment." 
                            : course.status === "draft" 
                            ? "Your course is not yet published."
                            : "Your course is hidden from all listings."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue Sharing</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    {!course.isFree ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm">Course Price:</span>
                          <span className="font-medium">${course.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Platform Fee (30%):</span>
                          <span className="text-sm">-${(course.price * 0.3).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Your Earnings Per Sale:</span>
                          <span className="font-medium text-emerald-600">${(course.price * 0.7).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-2">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Free Course</p>
                          <p className="text-sm text-muted-foreground">
                            This course is offered for free. No revenue sharing applies.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}