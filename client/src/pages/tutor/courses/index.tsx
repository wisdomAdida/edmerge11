import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileEdit, 
  Eye, 
  Copy, 
  Trash, 
  Users, 
  BookOpen, 
  DollarSign,
  Star,
} from "lucide-react";

export default function CoursesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch courses data
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses/tutor"],
  });

  // Filter courses based on search and status
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Course statistics
  const totalCourses = courses?.length || 0;
  const publishedCourses = courses?.filter(c => c.status === "published")?.length || 0;
  const draftCourses = courses?.filter(c => c.status === "draft")?.length || 0;
  const archivedCourses = courses?.filter(c => c.status === "archived")?.length || 0;

  // Stats cards data
  const statsCards = [
    {
      title: "Total Courses",
      value: totalCourses,
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Published Courses",
      value: publishedCourses,
      icon: <Eye className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Draft Courses",
      value: draftCourses,
      icon: <FileEdit className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Students Enrolled",
      value: "259", // This would come from API in a real app
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  // Sample featured courses (would come from API in real app)
  const featuredCourses = courses?.filter(c => c.status === "published")?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <DashboardLayout title="Courses">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading courses...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Courses Management">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">Manage your educational courses</p>
          </div>
          <Link href="/dashboard/tutor/courses/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for Different Course Views */}
        <Tabs defaultValue="all-courses" className="w-full">
          <TabsList>
            <TabsTrigger value="all-courses">All Courses</TabsTrigger>
            <TabsTrigger value="featured">Featured Courses</TabsTrigger>
          </TabsList>

          {/* All Courses Tab */}
          <TabsContent value="all-courses" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("archived")}>
                    Archived
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Courses Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Course Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>
                            <Badge variant={
                              course.status === "published" ? "default" : 
                              course.status === "draft" ? "secondary" : 
                              "outline"
                            }>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {course.isFree ? (
                              <span className="text-emerald-600 font-medium">Free</span>
                            ) : (
                              <span>${course.price}</span>
                            )}
                          </TableCell>
                          <TableCell>{course.students || "0"}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                              <span>{course.rating || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => navigate(`/dashboard/tutor/courses/${course.id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigate(`/dashboard/tutor/courses/${course.id}/edit`)}
                                >
                                  <FileEdit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No courses found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Courses Tab */}
          <TabsContent value="featured" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.length > 0 ? (
                featuredCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    {course.coverImage && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={course.coverImage} 
                          alt={course.title} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{course.students || 0} students</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{course.rating || "N/A"}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        {course.isFree ? (
                          <span className="text-emerald-600 font-medium">Free</span>
                        ) : (
                          <span className="font-medium">${course.price}</span>
                        )}
                        <Badge variant={
                          course.status === "published" ? "default" : 
                          course.status === "draft" ? "secondary" : 
                          "outline"
                        }>
                          {course.status}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => navigate(`/dashboard/tutor/courses/${course.id}`)}>
                        View Course
                      </Button>
                      <Button variant="ghost" onClick={() => navigate(`/dashboard/tutor/courses/${course.id}/edit`)}>
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Featured Courses</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    You don't have any published courses yet.
                  </p>
                  <Link href="/dashboard/tutor/courses/create">
                    <Button className="mt-4">Create a Course</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}