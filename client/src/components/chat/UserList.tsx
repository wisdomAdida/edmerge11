import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Users, 
  User2, 
  Loader2, 
  RefreshCw, 
  GraduationCap,
  Briefcase,
  BookOpen,
  CircleAlert,
  Circle,
  Filter
} from 'lucide-react';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string | null;
  role: string;
  studentLevel: string | null;
  isOnline: boolean;
};

interface UserListProps {
  onUserSelect: (userId: number, username: string) => void;
}

export function UserList({ onUserSelect }: UserListProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState<string>('all');
  const [level, setLevel] = useState<string>('all');
  
  // Fetch users
  const fetchUsers = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', '/api/messaging/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Filter out current user
      const filteredData = data.filter((u: User) => u.id !== user?.id);
      setUsers(filteredData);
      setFilteredUsers(filteredData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [user]);
  
  // Filter users based on search, role, and level
  useEffect(() => {
    if (!users.length) return;
    
    let filtered = [...users];
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user => 
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
      );
    }
    
    // Filter by role
    if (role !== 'all') {
      filtered = filtered.filter(user => user.role === role);
    }
    
    // Filter by level (only for students)
    if (level !== 'all' && (role === 'all' || role === 'student')) {
      filtered = filtered.filter(user => user.studentLevel === level);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchQuery, role, level]);
  
  // Group users by role for the tabs view
  const studentUsers = filteredUsers.filter(user => user.role === 'student');
  const tutorUsers = filteredUsers.filter(user => user.role === 'tutor');
  const mentorUsers = filteredUsers.filter(user => user.role === 'mentor');
  const researcherUsers = filteredUsers.filter(user => user.role === 'researcher');
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center text-xl">
          <Users className="mr-2 h-5 w-5" />
          Platform Users
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="p-3">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="tutor">Tutors</SelectItem>
                    <SelectItem value="mentor">Mentors</SelectItem>
                    <SelectItem value="researcher">Researchers</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              {(role === 'all' || role === 'student') && (
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="tertiary">Tertiary</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        
        <Separator className="mb-0" />
        
        {loading ? (
          <div className="flex items-center justify-center py-8 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 flex-1">
            <CircleAlert className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={fetchUsers}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <div className="border-b px-3">
              <TabsList className="h-10">
                <TabsTrigger value="all" className="relative">
                  All
                  <Badge className="ml-1.5 text-[10px] h-4">{filteredUsers.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="students" className="relative">
                  Students
                  <Badge className="ml-1.5 text-[10px] h-4">{studentUsers.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="tutors" className="relative">
                  Tutors
                  <Badge className="ml-1.5 text-[10px] h-4">{tutorUsers.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="mentors" className="relative">
                  Mentors
                  <Badge className="ml-1.5 text-[10px] h-4">{mentorUsers.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="researchers" className="relative">
                  Researchers
                  <Badge className="ml-1.5 text-[10px] h-4">{researcherUsers.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="flex-1 m-0">
              {filteredUsers.length > 0 ? (
                <UserListItems users={filteredUsers} onUserSelect={onUserSelect} />
              ) : (
                <div className="text-center py-8 flex-1">
                  <p>No users found.</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="students" className="flex-1 m-0">
              {studentUsers.length > 0 ? (
                <UserListItems users={studentUsers} onUserSelect={onUserSelect} />
              ) : (
                <div className="text-center py-8">
                  <p>No students found.</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tutors" className="flex-1 m-0">
              {tutorUsers.length > 0 ? (
                <UserListItems users={tutorUsers} onUserSelect={onUserSelect} />
              ) : (
                <div className="text-center py-8">
                  <p>No tutors found.</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="mentors" className="flex-1 m-0">
              {mentorUsers.length > 0 ? (
                <UserListItems users={mentorUsers} onUserSelect={onUserSelect} />
              ) : (
                <div className="text-center py-8">
                  <p>No mentors found.</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="researchers" className="flex-1 m-0">
              {researcherUsers.length > 0 ? (
                <UserListItems users={researcherUsers} onUserSelect={onUserSelect} />
              ) : (
                <div className="text-center py-8">
                  <p>No researchers found.</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function UserListItems({ users, onUserSelect }: { users: User[], onUserSelect: (userId: number, username: string) => void }) {
  return (
    <ScrollArea className="h-[calc(100vh-250px)] max-h-[600px]">
      <ul className="py-2 px-1 space-y-1">
        {users.map((user) => (
          <li key={user.id}>
            <Button
              variant="ghost"
              className="w-full justify-start p-2 hover:bg-muted"
              onClick={() => onUserSelect(user.id, user.username)}
            >
              <div className="flex items-center w-full">
                <div className="relative">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage 
                      src={user.profileImage || ''} 
                      alt={`${user.firstName} ${user.lastName}`} 
                    />
                    <AvatarFallback>
                      <User2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                  )}
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">
                      {`${user.firstName} ${user.lastName}`}
                    </span>
                  </div>
                  
                  <div className="flex text-xs text-muted-foreground items-center gap-1">
                    <span className="capitalize">{user.role}</span>
                    
                    {user.role === 'student' && user.studentLevel && (
                      <>
                        <span className="mx-0.5">•</span>
                        <span className="capitalize">{getLevelText(user.studentLevel)}</span>
                      </>
                    )}
                    
                    {user.isOnline ? (
                      <>
                        <span className="mx-0.5">•</span>
                        <span className="flex items-center">
                          <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500 mr-1" />
                          Online
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                
                <div className="ml-2 flex-shrink-0">
                  {getRoleIcon(user.role)}
                </div>
              </div>
            </Button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'student':
      return <GraduationCap className="h-4 w-4 text-blue-500" />;
    case 'tutor':
      return <FaChalkboardTeacher className="h-4 w-4 text-green-500" />;
    case 'mentor':
      return <Briefcase className="h-4 w-4 text-purple-500" />;
    case 'researcher':
      return <BookOpen className="h-4 w-4 text-amber-500" />;
    default:
      return <User2 className="h-4 w-4 text-gray-500" />;
  }
}

function getLevelText(level: string): string {
  switch (level) {
    case 'primary':
      return 'Primary';
    case 'secondary':
      return 'Secondary';
    case 'tertiary':
      return 'Tertiary';
    case 'individual':
      return 'Individual';
    default:
      return level;
  }
}