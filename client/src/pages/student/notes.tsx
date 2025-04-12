import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit,
  Trash,
  BookOpen,
  Bookmark,
  FileDown,
  FileText,
  Clock,
  Tag,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Note type
type Note = {
  id: number;
  title: string;
  content: string;
  subject: string;
  courseId?: number;
  courseName?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isImportant: boolean;
};

// New note form values
type NoteFormValues = {
  title: string;
  content: string;
  subject: string;
  tags: string;
  isImportant: boolean;
  courseId?: number;
};

export default function NotesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<NoteFormValues>({
    title: "",
    content: "",
    subject: "",
    tags: "",
    isImportant: false,
  });
  
  // Fetch notes data
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/student/notes"],
    // In a real app, you would fetch from API
    queryFn: async () => {
      // This simulates API data - in a real app this would be an actual API call
      return [
        {
          id: 1,
          title: "Math Formulas",
          content: "Area of circle = πr²\nPythagorean theorem: a² + b² = c²\nQuadratic formula: x = (-b ± √(b² - 4ac)) / 2a",
          subject: "mathematics",
          courseName: "Mathematics Fundamentals",
          courseId: 1,
          createdAt: new Date(2023, 8, 15),
          updatedAt: new Date(2023, 8, 15),
          tags: ["formulas", "geometry", "algebra"],
          isImportant: true
        },
        {
          id: 2,
          title: "Photosynthesis Process",
          content: "Photosynthesis is the process by which green plants, algae, and certain bacteria convert light energy into chemical energy.\n\nThe process: 6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂",
          subject: "science",
          courseName: "Biology Basics",
          courseId: 2,
          createdAt: new Date(2023, 9, 3),
          updatedAt: new Date(2023, 9, 5),
          tags: ["biology", "plants", "chemistry"],
          isImportant: false
        },
        {
          id: 3,
          title: "Historical Events Timeline",
          content: "1776 - American Declaration of Independence\n1789 - French Revolution begins\n1914-1918 - World War I\n1939-1945 - World War II",
          subject: "history",
          courseName: "World History",
          courseId: 3,
          createdAt: new Date(2023, 7, 21),
          updatedAt: new Date(2023, 7, 21),
          tags: ["timeline", "events", "dates"],
          isImportant: true
        },
        {
          id: 4,
          title: "Grammar Rules",
          content: "1. End sentences with proper punctuation.\n2. Use subject-verb agreement.\n3. Distinguish between its/it's, their/they're/there.\n4. Use appropriate capitalization.",
          subject: "language",
          courseName: "English Grammar",
          courseId: 4,
          createdAt: new Date(2023, 10, 7),
          updatedAt: new Date(2023, 10, 12),
          tags: ["grammar", "writing", "rules"],
          isImportant: false
        }
      ];
    }
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      // In a real app, this would be an API call
      // const res = await apiRequest("POST", "/api/notes", newNote);
      // return await res.json();
      
      // For demonstration, simulate API response
      return {
        ...newNote,
        id: Math.floor(Math.random() * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ["/api/student/notes"] });
      
      // Show success toast
      toast({
        title: "Note Created",
        description: "Your note has been saved successfully.",
      });
      
      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Note",
        description: error instanceof Error ? error.message : "An error occurred while creating your note.",
        variant: "destructive",
      });
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async (updatedNote: Partial<Note> & { id: number }) => {
      // In a real app, this would be an API call
      // const res = await apiRequest("PATCH", `/api/notes/${updatedNote.id}`, updatedNote);
      // return await res.json();
      
      // For demonstration, simulate API response
      return {
        ...updatedNote,
        updatedAt: new Date()
      };
    },
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ["/api/student/notes"] });
      
      // Show success toast
      toast({
        title: "Note Updated",
        description: "Your note has been updated successfully.",
      });
      
      // Close dialog and reset
      setIsEditDialogOpen(false);
      setSelectedNote(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Note",
        description: error instanceof Error ? error.message : "An error occurred while updating your note.",
        variant: "destructive",
      });
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      // In a real app, this would be an API call
      // await apiRequest("DELETE", `/api/notes/${noteId}`);
      
      // For demonstration, just return success
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ["/api/student/notes"] });
      
      // Show success toast
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted successfully.",
      });
      
      // Close dialog and reset
      setIsDeleteDialogOpen(false);
      setSelectedNote(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Note",
        description: error instanceof Error ? error.message : "An error occurred while deleting your note.",
        variant: "destructive",
      });
    }
  });

  // Filter notes based on search and subject
  const filteredNotes = notes?.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === "all" || note.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  }) || [];

  // Get important notes
  const importantNotes = notes?.filter(note => note.isImportant) || [];
  
  // Get subjects from notes for filter
  const subjects = [...new Set(notes?.map(note => note.subject) || [])];
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Create new note
  const handleCreateNote = () => {
    const { title, content, subject, tags, isImportant, courseId } = formValues;
    
    if (!title || !content || !subject) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createNoteMutation.mutate({
      title,
      content,
      subject,
      tags: tags.split(',').map(tag => tag.trim()),
      isImportant,
      courseId,
      courseName: courseId ? `Course ${courseId}` : undefined, // In real app, get this from course data
    });
  };

  // Update existing note
  const handleUpdateNote = () => {
    if (!selectedNote) return;
    
    const { title, content, subject, tags, isImportant } = formValues;
    
    if (!title || !content || !subject) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    updateNoteMutation.mutate({
      id: selectedNote.id,
      title,
      content,
      subject,
      tags: tags.split(',').map(tag => tag.trim()),
      isImportant,
    });
  };

  // Delete note
  const handleDeleteNote = () => {
    if (!selectedNote) return;
    deleteNoteMutation.mutate(selectedNote.id);
  };

  // Prepare form for editing
  const prepareEditForm = (note: Note) => {
    setSelectedNote(note);
    setFormValues({
      title: note.title,
      content: note.content,
      subject: note.subject,
      tags: note.tags.join(', '),
      isImportant: note.isImportant,
      courseId: note.courseId,
    });
    setIsEditDialogOpen(true);
  };

  // Reset form values
  const resetForm = () => {
    setFormValues({
      title: "",
      content: "",
      subject: "",
      tags: "",
      isImportant: false,
    });
    setSelectedNote(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Notes">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading notes...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Notes">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
            <p className="text-muted-foreground mt-1">
              Create, organize, and manage your study notes
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
                <DialogDescription>
                  Add a new note to your collection. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formValues.title}
                    onChange={handleInputChange}
                    placeholder="Note title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formValues.content}
                    onChange={handleInputChange}
                    placeholder="Write your note here..."
                    className="min-h-[150px]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formValues.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., mathematics, science, language"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Tags (comma separated)
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formValues.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., homework, quiz, revision"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isImportant"
                    name="isImportant"
                    checked={formValues.isImportant}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isImportant" className="text-sm font-medium">
                    Mark as important
                  </label>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateNote}
                  disabled={createNoteMutation.isPending}
                >
                  {createNoteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Note"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Tabs for note categories */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          
          {/* All Notes Tab */}
          <TabsContent value="all" className="mt-6">
            {filteredNotes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={() => prepareEditForm(note)}
                    onDelete={() => {
                      setSelectedNote(note);
                      setIsDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No notes found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search filters or create a new note.
                </p>
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Note
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Important Notes Tab */}
          <TabsContent value="important" className="mt-6">
            {importantNotes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {importantNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={() => prepareEditForm(note)}
                    onDelete={() => {
                      setSelectedNote(note);
                      setIsDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No important notes</h3>
                <p className="mt-2 text-muted-foreground">
                  Mark notes as important to see them here.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Recent Notes Tab */}
          <TabsContent value="recent" className="mt-6">
            {notes && notes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...notes]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 6)
                  .map((note) => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onEdit={() => prepareEditForm(note)}
                      onDelete={() => {
                        setSelectedNote(note);
                        setIsDeleteDialogOpen(true);
                      }}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No recent notes</h3>
                <p className="mt-2 text-muted-foreground">
                  Your recently edited notes will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update your note details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="edit-title"
                name="title"
                value={formValues.title}
                onChange={handleInputChange}
                placeholder="Note title"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="edit-content"
                name="content"
                value={formValues.content}
                onChange={handleInputChange}
                placeholder="Write your note here..."
                className="min-h-[150px]"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-subject" className="text-sm font-medium">
                Subject
              </label>
              <Input
                id="edit-subject"
                name="subject"
                value={formValues.subject}
                onChange={handleInputChange}
                placeholder="e.g., mathematics, science, language"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-tags" className="text-sm font-medium">
                Tags (comma separated)
              </label>
              <Input
                id="edit-tags"
                name="tags"
                value={formValues.tags}
                onChange={handleInputChange}
                placeholder="e.g., homework, quiz, revision"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isImportant"
                name="isImportant"
                checked={formValues.isImportant}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="edit-isImportant" className="text-sm font-medium">
                Mark as important
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateNote}
              disabled={updateNoteMutation.isPending}
            >
              {updateNoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Note"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedNote && (
            <div className="py-4">
              <h3 className="font-medium">{selectedNote.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Subject: {selectedNote.subject}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteNote}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Note Card Component
function NoteCard({ 
  note, 
  onEdit, 
  onDelete 
}: { 
  note: Note; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };
  
  return (
    <Card className={`overflow-hidden ${note.isImportant ? 'border-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="capitalize">
            {note.subject}
          </Badge>
          {note.isImportant && (
            <Badge variant="secondary">
              <Bookmark className="h-3 w-3 mr-1 fill-current" />
              Important
            </Badge>
          )}
        </div>
        <CardTitle className="mt-2">{note.title}</CardTitle>
        {note.courseName && (
          <CardDescription>
            From: {note.courseName}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="whitespace-pre-line line-clamp-4 text-sm text-muted-foreground">
          {note.content}
        </div>
        
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground flex justify-between">
          <span>Created: {formatDate(note.createdAt)}</span>
          {note.updatedAt > note.createdAt && (
            <span>Updated: {formatDate(note.updatedAt)}</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="flex-1">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}