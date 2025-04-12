import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function TutorStudentsPage() {
  // Placeholder data until we connect to real API
  const students = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.j@example.com",
      enrolledCourses: 3,
      lastActive: "2025-03-28",
      progress: 75,
      level: "secondary"
    },
    {
      id: 2,
      name: "Sarah Miller",
      email: "sarah.m@example.com",
      enrolledCourses: 2,
      lastActive: "2025-03-27",
      progress: 92,
      level: "tertiary"
    },
    {
      id: 3,
      name: "John Smith",
      email: "john.s@example.com",
      enrolledCourses: 1,
      lastActive: "2025-03-25",
      progress: 45,
      level: "primary"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@example.com",
      enrolledCourses: 2,
      lastActive: "2025-03-28",
      progress: 60,
      level: "secondary"
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael.b@example.com",
      enrolledCourses: 1,
      lastActive: "2025-03-26",
      progress: 30,
      level: "individual"
    }
  ];
  
  const levelColors: Record<string, string> = {
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-purple-100 text-purple-800",
    tertiary: "bg-green-100 text-green-800",
    individual: "bg-amber-100 text-amber-800"
  };
  
  return (
    <PageContainer title="My Students" description="Manage and view all students enrolled in your courses">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">{students.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">67%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">Average Progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">New This Week</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  Manage your enrolled students and their progress
                </CardDescription>
              </div>
              <div className="flex w-full md:w-auto gap-2">
                <div className="relative w-full md:w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="w-full pl-8"
                  />
                </div>
                <Button variant="outline" className="hidden md:flex">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="hidden md:table-cell">Enrolled Courses</TableHead>
                  <TableHead className="hidden md:table-cell">Last Active</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}`} />
                          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={levelColors[student.level]}>
                        {student.level.charAt(0).toUpperCase() + student.level.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{student.enrolledCourses}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(student.lastActive).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Message</DropdownMenuItem>
                          <DropdownMenuItem>Export Progress</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}