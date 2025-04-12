import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Folder, 
  FolderPlus, 
  File, 
  FilePlus, 
  MoreVertical, 
  Edit, 
  Trash, 
  Loader2, 
  Link, 
  FileText,
  PenTool,
  Video,
  ImageIcon,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface ResearchWorkspaceProps {
  projectId: number | null;
}

export function ResearchWorkspaceComponent({ projectId }: ResearchWorkspaceProps) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('text');
  const [newFileContent, setNewFileContent] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDocumentId, setEditDocumentId] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  
  // Fetch workspaces
  const { 
    data: workspaces, 
    isLoading: workspacesLoading,
    refetch: refetchWorkspaces
  } = useQuery({
    queryKey: ['/api/research-workspaces', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await apiRequest('GET', `/api/research-workspaces?projectId=${projectId}`);
      return response.json();
    },
    enabled: !!projectId,
  });
  
  // Fetch documents for active workspace
  const { 
    data: documents, 
    isLoading: documentsLoading,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: ['/api/research-documents', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];
      const response = await apiRequest('GET', `/api/research-documents?workspaceId=${activeWorkspaceId}`);
      return response.json();
    },
    enabled: !!activeWorkspaceId,
  });
  
  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; researchProjectId: number }) => {
      const response = await apiRequest('POST', '/api/research-workspaces', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-workspaces', projectId] });
      setIsWorkspaceModalOpen(false);
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      toast({
        title: 'Workspace Created',
        description: 'Your new workspace has been created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create workspace: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/research-documents', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-documents', activeWorkspaceId] });
      setIsFileModalOpen(false);
      resetDocumentForm();
      toast({
        title: 'Document Created',
        description: 'Your new document has been created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create document: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PATCH', `/api/research-documents/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-documents', activeWorkspaceId] });
      setIsFileModalOpen(false);
      resetDocumentForm();
      toast({
        title: 'Document Updated',
        description: 'Your document has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update document: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/research-documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-documents', activeWorkspaceId] });
      setSelectedDocument(null);
      toast({
        title: 'Document Deleted',
        description: 'The document has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete document: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/research-workspaces/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-workspaces', projectId] });
      if (activeWorkspaceId === null && workspaces && workspaces.length > 0) {
        setActiveWorkspaceId(workspaces[0].id);
      }
      toast({
        title: 'Workspace Deleted',
        description: 'The workspace has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete workspace: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Initialize active workspace when data is loaded
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspaceId) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId]);
  
  const handleCreateWorkspace = () => {
    if (!projectId) return;
    
    if (!newWorkspaceName.trim()) {
      toast({
        title: 'Error',
        description: 'Workspace name is required',
        variant: 'destructive',
      });
      return;
    }
    
    createWorkspaceMutation.mutate({
      name: newWorkspaceName,
      description: newWorkspaceDescription,
      researchProjectId: projectId,
    });
  };
  
  const handleCreateDocument = () => {
    if (!activeWorkspaceId) return;
    
    if (!newFileName.trim()) {
      toast({
        title: 'Error',
        description: 'Document name is required',
        variant: 'destructive',
      });
      return;
    }
    
    const documentData = {
      title: newFileName,
      workspaceId: activeWorkspaceId,
      type: newFileType,
    };
    
    if (newFileType === 'text' || newFileType === 'document') {
      documentData.content = newFileContent;
    } else if (newFileType === 'link' || newFileType === 'video') {
      documentData.documentUrl = newFileUrl;
    }
    
    if (isEditMode && editDocumentId) {
      updateDocumentMutation.mutate({
        id: editDocumentId,
        data: documentData,
      });
    } else {
      createDocumentMutation.mutate(documentData);
    }
  };
  
  const handleEditDocument = (document: any) => {
    setIsEditMode(true);
    setEditDocumentId(document.id);
    setNewFileName(document.title);
    setNewFileType(document.type || 'text');
    setNewFileContent(document.content || '');
    setNewFileUrl(document.documentUrl || '');
    setIsFileModalOpen(true);
  };
  
  const handleDeleteDocument = (id: number) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      deleteDocumentMutation.mutate(id);
    }
  };
  
  const handleDeleteWorkspace = (id: number) => {
    if (window.confirm('Are you sure you want to delete this workspace and all its documents? This action cannot be undone.')) {
      if (id === activeWorkspaceId) {
        setActiveWorkspaceId(null);
      }
      deleteWorkspaceMutation.mutate(id);
    }
  };
  
  const resetDocumentForm = () => {
    setNewFileName('');
    setNewFileType('text');
    setNewFileContent('');
    setNewFileUrl('');
    setIsEditMode(false);
    setEditDocumentId(null);
  };
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <Link className="h-4 w-4 mr-2" />;
      case 'video':
        return <Video className="h-4 w-4 mr-2" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 mr-2" />;
      case 'document':
        return <FileText className="h-4 w-4 mr-2" />;
      default:
        return <File className="h-4 w-4 mr-2" />;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  if (workspacesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Workspaces sidebar */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xl">Workspaces</CardTitle>
            <Dialog open={isWorkspaceModalOpen} onOpenChange={setIsWorkspaceModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                  <DialogDescription>
                    Create a new workspace to organize your research documents and files.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="workspace-name" className="text-sm font-medium">
                      Workspace Name
                    </label>
                    <Input
                      id="workspace-name"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Enter workspace name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="workspace-description" className="text-sm font-medium">
                      Description (Optional)
                    </label>
                    <Textarea
                      id="workspace-description"
                      value={newWorkspaceDescription}
                      onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                      placeholder="Enter workspace description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsWorkspaceModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateWorkspace}
                    disabled={createWorkspaceMutation.isPending}
                  >
                    {createWorkspaceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create Workspace"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {workspaces && workspaces.length > 0 ? (
                <div className="space-y-2">
                  {workspaces.map((workspace: any) => (
                    <div
                      key={workspace.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                        activeWorkspaceId === workspace.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setActiveWorkspaceId(workspace.id)}
                    >
                      <div className="flex items-center">
                        <Folder className={`h-4 w-4 mr-2 ${
                          activeWorkspaceId === workspace.id
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`} />
                        <span className="text-sm font-medium">{workspace.name}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDeleteWorkspace(workspace.id)}>
                            <Trash className="h-4 w-4 mr-2 text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No workspaces yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Create a workspace to organize your research
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWorkspaceModalOpen(true)}
                    className="mx-auto"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create Workspace
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content area */}
      <div className="md:col-span-3">
        {activeWorkspaceId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {workspaces && workspaces.find((w: any) => w.id === activeWorkspaceId)?.name}
              </h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    refetchWorkspaces();
                    refetchDocuments();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Dialog open={isFileModalOpen} onOpenChange={(open) => {
                  setIsFileModalOpen(open);
                  if (!open) resetDocumentForm();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <FilePlus className="h-4 w-4 mr-2" />
                      New Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isEditMode ? 'Edit' : 'Create New'} Document</DialogTitle>
                      <DialogDescription>
                        {isEditMode 
                          ? 'Edit your research document or file.' 
                          : 'Add a new document, link, or file to your research workspace.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="file-name" className="text-sm font-medium">
                          Document Title
                        </label>
                        <Input
                          id="file-name"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="Enter document title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="file-type" className="text-sm font-medium">
                          Document Type
                        </label>
                        <Select
                          value={newFileType}
                          onValueChange={setNewFileType}
                        >
                          <SelectTrigger id="file-type">
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Note</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="link">Web Link</SelectItem>
                            <SelectItem value="video">Video Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(newFileType === 'text' || newFileType === 'document') && (
                        <div className="space-y-2">
                          <label htmlFor="file-content" className="text-sm font-medium">
                            Content
                          </label>
                          <Textarea
                            id="file-content"
                            value={newFileContent}
                            onChange={(e) => setNewFileContent(e.target.value)}
                            placeholder="Enter document content"
                            rows={6}
                          />
                        </div>
                      )}
                      
                      {(newFileType === 'link' || newFileType === 'video') && (
                        <div className="space-y-2">
                          <label htmlFor="file-url" className="text-sm font-medium">
                            URL
                          </label>
                          <Input
                            id="file-url"
                            value={newFileUrl}
                            onChange={(e) => setNewFileUrl(e.target.value)}
                            placeholder="Enter URL"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsFileModalOpen(false);
                        resetDocumentForm();
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateDocument}
                        disabled={createDocumentMutation.isPending || updateDocumentMutation.isPending}
                      >
                        {(createDocumentMutation.isPending || updateDocumentMutation.isPending) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? 'Updating...' : 'Creating...'}
                          </>
                        ) : isEditMode ? "Update Document" : "Create Document"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Tabs defaultValue="documents">
              <TabsList>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="viewer">Document Viewer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-4">
                    {documentsLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : documents && documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((document: any) => (
                          <Card 
                            key={document.id} 
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => setSelectedDocument(document)}
                          >
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-md flex items-center">
                                {getFileIcon(document.type || 'text')}
                                <span className="truncate">{document.title}</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-xs text-muted-foreground mb-2">
                                Created {formatDate(document.createdAt)}
                              </p>
                              {document.type === 'text' && document.content && (
                                <p className="text-sm line-clamp-3">{document.content}</p>
                              )}
                              {document.type === 'link' && document.documentUrl && (
                                <a 
                                  href={document.documentUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-sm text-blue-500 hover:underline truncate block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {document.documentUrl}
                                </a>
                              )}
                            </CardContent>
                            <CardFooter className="p-2 justify-end">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditDocument(document);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDocument(document.id);
                                  }}
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No documents in this workspace</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                          Create a document to start your research
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsFileModalOpen(true)}
                          className="mx-auto"
                        >
                          <FilePlus className="h-4 w-4 mr-2" />
                          Create Document
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="viewer">
                <Card className="min-h-[500px]">
                  {selectedDocument ? (
                    <>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            {getFileIcon(selectedDocument.type || 'text')}
                            {selectedDocument.title}
                          </CardTitle>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditDocument(selectedDocument)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteDocument(selectedDocument.id)}
                            >
                              <Trash className="h-4 w-4 mr-2 text-destructive" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Created {formatDate(selectedDocument.createdAt)}
                          {selectedDocument.updatedAt !== selectedDocument.createdAt && 
                            ` • Updated ${formatDate(selectedDocument.updatedAt)}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedDocument.type === 'text' || selectedDocument.type === 'document' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <pre className="whitespace-pre-wrap p-4 bg-muted rounded-md">
                              {selectedDocument.content || 'No content'}
                            </pre>
                          </div>
                        ) : selectedDocument.type === 'link' ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Link className="h-4 w-4" />
                              <a 
                                href={selectedDocument.documentUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-500 hover:underline"
                              >
                                {selectedDocument.documentUrl}
                              </a>
                            </div>
                            <div className="rounded-md border overflow-hidden">
                              <iframe 
                                src={selectedDocument.documentUrl} 
                                title={selectedDocument.title}
                                className="w-full h-[400px] border-0"
                                sandbox="allow-scripts allow-same-origin"
                              />
                            </div>
                          </div>
                        ) : selectedDocument.type === 'video' ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Video className="h-4 w-4" />
                              <a 
                                href={selectedDocument.documentUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-500 hover:underline"
                              >
                                {selectedDocument.documentUrl}
                              </a>
                            </div>
                            <div className="rounded-md border overflow-hidden">
                              {/* Handle YouTube URLs */}
                              {selectedDocument.documentUrl && selectedDocument.documentUrl.includes('youtube.com') ? (
                                <iframe 
                                  src={selectedDocument.documentUrl.replace('watch?v=', 'embed/')} 
                                  title={selectedDocument.title}
                                  className="w-full h-[400px] border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <div className="p-4 text-center">
                                  <a 
                                    href={selectedDocument.documentUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-blue-500 hover:underline"
                                  >
                                    Open video in new tab
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <p className="text-muted-foreground">Unsupported document type</p>
                          </div>
                        )}
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[500px]">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No document selected</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select a document from the Documents tab to view it
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center p-8">
              <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">No Workspace Selected</CardTitle>
              <CardDescription className="mb-6">
                Select a workspace from the sidebar or create a new one to get started
              </CardDescription>
              <Button onClick={() => setIsWorkspaceModalOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}