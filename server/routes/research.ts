import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { 
  researchProjects, 
  researchWorkspaces, 
  researchDocuments, 
  researchCollaborators 
} from '@shared/schema';

// Helper function to check if the user is authenticated
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Helper to check if user is a researcher or admin
function requireResearcher(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const user = req.user;
  if (user.role !== 'researcher' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Only researchers can access this resource.' });
  }
  
  next();
}

// Helper function to check if the user owns the project
async function checkResearchProjectOwnership(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const projectId = parseInt(req.params.id);
  if (isNaN(projectId)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  
  const project = await storage.getResearchProject(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const user = req.user;
  if (project.researcherId !== user.id && user.role !== 'admin') {
    // Check if the user is a collaborator with appropriate permissions
    const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, projectId);
    if (!collaborator || collaborator.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to access this project' });
    }
  }
  
  req.project = project;
  next();
}

// Research Project schemas
const createResearchProjectSchema = createInsertSchema(researchProjects, {
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
})
.omit({ id: true, createdAt: true, updatedAt: true, researcherId: true, publishedAt: true })
.extend({
  tags: z.array(z.string()).optional(),
});

const updateResearchProjectSchema = createResearchProjectSchema.partial();

// Research Workspace schemas
const createResearchWorkspaceSchema = createInsertSchema(researchWorkspaces, {
  name: z.string().min(1, "Name is required"),
})
.omit({ id: true, createdAt: true, updatedAt: true, researchProjectId: true })
.extend({
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateResearchWorkspaceSchema = createResearchWorkspaceSchema.partial();

// Research Document schemas
const createResearchDocumentSchema = createInsertSchema(researchDocuments, {
  title: z.string().min(1, "Title is required"),
  workspaceId: z.number().positive("Workspace ID is required"),
})
.omit({ id: true, createdAt: true, updatedAt: true, createdById: true, lastEditedById: true })
.extend({
  content: z.string().optional(),
  type: z.string().optional(),
  documentUrl: z.string().optional(),
});

const updateResearchDocumentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  type: z.string().optional(),
  documentUrl: z.string().optional(),
});

export function setupResearchRoutes(app: Express) {
  // Researcher statistics
  app.get('/api/researchers/stats', requireResearcher, async (req, res) => {
    try {
      const researcherId = req.user.id;
      
      // Get projects
      const projects = await storage.getResearchProjectsByResearcher(researcherId);
      
      // Get project purchases
      const purchases = await storage.getResearchProjectPurchases(researcherId);
      
      // Count collaborators
      const collaboratorCounts = await storage.getResearchCollaboratorCountsByResearcher(researcherId);
      
      // Calculate statistics
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalPurchases = purchases.length;
      const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
      const collaborators = collaboratorCounts;
      
      res.json({
        totalProjects,
        activeProjects,
        completedProjects,
        totalPurchases,
        totalRevenue,
        collaborators
      });
    } catch (error) {
      console.error('Error fetching researcher stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });
  
  // Research Projects Routes
  
  // Create a new research project
  app.post('/api/research-projects', requireResearcher, async (req, res) => {
    try {
      const validatedData = createResearchProjectSchema.parse(req.body);
      
      const project = await storage.createResearchProject({
        ...validatedData,
        researcherId: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error('Error creating research project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });
  
  // Get all research projects for the current researcher
  app.get('/api/research-projects/researcher', requireResearcher, async (req, res) => {
    try {
      const projects = await storage.getResearchProjectsByResearcher(req.user.id);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching research projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });
  
  // Get a specific research project
  app.get('/api/research-projects/:id', requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getResearchProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Check if the user has access to the project
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      const isPublic = project.isPublic;
      
      if (!isOwner && !isAdmin && !isPublic) {
        // Check if the user is a collaborator
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, projectId);
        if (!collaborator) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error fetching research project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });
  
  // Update a research project
  app.patch('/api/research-projects/:id', requireAuth, checkResearchProjectOwnership, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const validatedData = updateResearchProjectSchema.parse(req.body);
      
      const updatedProject = await storage.updateResearchProject(projectId, {
        ...validatedData,
        updatedAt: new Date(),
      });
      
      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error('Error updating research project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  });
  
  // Delete a research project
  app.delete('/api/research-projects/:id', requireAuth, checkResearchProjectOwnership, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // First delete all workspaces, documents, and collaborators
      const workspaces = await storage.getResearchWorkspaces(projectId);
      for (const workspace of workspaces) {
        const documents = await storage.getResearchDocuments(workspace.id);
        for (const document of documents) {
          await storage.deleteResearchDocument(document.id);
        }
        await storage.deleteResearchWorkspace(workspace.id);
      }
      
      const collaborators = await storage.getResearchCollaborators(projectId);
      for (const collaborator of collaborators) {
        await storage.deleteResearchCollaborator(collaborator.id);
      }
      
      const deleted = await storage.deleteResearchProject(projectId);
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting research project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });
  
  // Research Workspace Routes
  
  // Create a new workspace
  app.post('/api/research-workspaces', requireAuth, async (req, res) => {
    try {
      const validatedData = createResearchWorkspaceSchema.parse(req.body);
      const projectId = req.body.researchProjectId;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }
      
      // Check if the user has permission to create a workspace for this project
      const project = await storage.getResearchProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      if (project.researcherId !== user.id && user.role !== 'admin') {
        // Check if the user is a collaborator with appropriate permissions
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, projectId);
        if (!collaborator || (collaborator.role !== 'admin' && collaborator.role !== 'editor')) {
          return res.status(403).json({ error: 'You do not have permission to create workspaces for this project' });
        }
      }
      
      const workspace = await storage.createResearchWorkspace({
        ...validatedData,
        researchProjectId: projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
      
      res.status(201).json(workspace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error('Error creating research workspace:', error);
      res.status(500).json({ error: 'Failed to create workspace' });
    }
  });
  
  // Get workspaces for a project
  app.get('/api/research-workspaces', requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.query.projectId as string);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      // Check if the user has permission to access this project
      const project = await storage.getResearchProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin && !project.isPublic) {
        // Check if the user is a collaborator
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, projectId);
        if (!collaborator) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      
      const workspaces = await storage.getResearchWorkspaces(projectId);
      res.json(workspaces);
    } catch (error) {
      console.error('Error fetching research workspaces:', error);
      res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
  });
  
  // Get a specific workspace
  app.get('/api/research-workspaces/:id', requireAuth, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      if (isNaN(workspaceId)) {
        return res.status(400).json({ error: 'Invalid workspace ID' });
      }
      
      const workspace = await storage.getResearchWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      // Check if the user has permission to access this workspace
      const project = await storage.getResearchProject(workspace.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin && !project.isPublic) {
        // Check if the user is a collaborator
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!collaborator) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      
      res.json(workspace);
    } catch (error) {
      console.error('Error fetching research workspace:', error);
      res.status(500).json({ error: 'Failed to fetch workspace' });
    }
  });
  
  // Update a workspace
  app.patch('/api/research-workspaces/:id', requireAuth, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      if (isNaN(workspaceId)) {
        return res.status(400).json({ error: 'Invalid workspace ID' });
      }
      
      const validatedData = updateResearchWorkspaceSchema.parse(req.body);
      
      const workspace = await storage.getResearchWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      // Check if the user has permission to update this workspace
      const project = await storage.getResearchProject(workspace.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Check if the user is a collaborator with appropriate permissions
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!collaborator || (collaborator.role !== 'admin' && collaborator.role !== 'editor')) {
          return res.status(403).json({ error: 'You do not have permission to update this workspace' });
        }
      }
      
      const updatedWorkspace = await storage.updateResearchWorkspace(workspaceId, {
        ...validatedData,
        updatedAt: new Date(),
      });
      
      res.json(updatedWorkspace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error('Error updating research workspace:', error);
      res.status(500).json({ error: 'Failed to update workspace' });
    }
  });
  
  // Delete a workspace
  app.delete('/api/research-workspaces/:id', requireAuth, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      if (isNaN(workspaceId)) {
        return res.status(400).json({ error: 'Invalid workspace ID' });
      }
      
      const workspace = await storage.getResearchWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      // Check if the user has permission to delete this workspace
      const project = await storage.getResearchProject(workspace.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Check if the user is a collaborator with appropriate permissions
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!collaborator || collaborator.role !== 'admin') {
          return res.status(403).json({ error: 'You do not have permission to delete this workspace' });
        }
      }
      
      // Delete all documents in the workspace
      const documents = await storage.getResearchDocuments(workspaceId);
      for (const document of documents) {
        await storage.deleteResearchDocument(document.id);
      }
      
      await storage.deleteResearchWorkspace(workspaceId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting research workspace:', error);
      res.status(500).json({ error: 'Failed to delete workspace' });
    }
  });
  
  // Research Document Routes
  
  // Create a new document
  app.post('/api/research-documents', requireAuth, async (req, res) => {
    try {
      const validatedData = createResearchDocumentSchema.parse(req.body);
      const workspaceId = validatedData.workspaceId;
      
      const workspace = await storage.getResearchWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      // Check if the user has permission to create a document in this workspace
      const project = await storage.getResearchProject(workspace.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Check if the user is a collaborator with appropriate permissions
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!collaborator || (collaborator.role !== 'admin' && collaborator.role !== 'editor')) {
          return res.status(403).json({ error: 'You do not have permission to create documents in this workspace' });
        }
      }
      
      const document = await storage.createResearchDocument({
        ...validatedData,
        createdById: user.id,
        lastEditedById: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error('Error creating research document:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  });
  
  // Get documents for a workspace
  app.get('/api/research-documents', requireAuth, async (req, res) => {
    try {
      const workspaceId = parseInt(req.query.workspaceId as string);
      if (isNaN(workspaceId)) {
        return res.status(400).json({ error: 'Invalid workspace ID' });
      }
      
      const workspace = await storage.getResearchWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      // Check if the user has permission to access documents in this workspace
      const project = await storage.getResearchProject(workspace.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin && !project.isPublic) {
        // Check if the user is a collaborator
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!collaborator) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      
      const documents = await storage.getResearchDocuments(workspaceId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching research documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });
  
  // Get a specific document
  app.get('/api/research-documents/:id', requireAuth, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: 'Invalid document ID' });
      }
      
      const document = await storage.getResearchDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      // Check if the user has permission to access this document
      const workspace = await storage.getResearchWorkspace(document.workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      const project = await storage.getResearchProject(workspace.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin && !project.isPublic) {
        // Check if the user is a collaborator
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!collaborator) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      
      res.json(document);
    } catch (error) {
      console.error('Error fetching research document:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  });
  
  // Update a document
  app.patch('/api/research-documents/:id', requireAuth, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: 'Invalid document ID' });
      }
      
      const validatedData = updateResearchDocumentSchema.parse(req.body);
      
      const document = await storage.getResearchDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      // Check if the user has permission to update this document
      const workspace = await storage.getResearchWorkspace(document.workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      const project = await storage.getResearchProject(workspace.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Check if the user is a collaborator with appropriate permissions
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!collaborator || (collaborator.role !== 'admin' && collaborator.role !== 'editor')) {
          return res.status(403).json({ error: 'You do not have permission to update this document' });
        }
      }
      
      const updatedDocument = await storage.updateResearchDocument(documentId, {
        ...validatedData,
        lastEditedById: user.id,
        updatedAt: new Date(),
      });
      
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error('Error updating research document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  });
  
  // Delete a document
  app.delete('/api/research-documents/:id', requireAuth, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: 'Invalid document ID' });
      }
      
      const document = await storage.getResearchDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      // Check if the user has permission to delete this document
      const workspace = await storage.getResearchWorkspace(document.workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      const project = await storage.getResearchProject(workspace.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Check if the user is a collaborator with appropriate permissions
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!collaborator || (collaborator.role !== 'admin' && collaborator.role !== 'editor')) {
          return res.status(403).json({ error: 'You do not have permission to delete this document' });
        }
      }
      
      await storage.deleteResearchDocument(documentId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting research document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });
  
  // Research Collaborator Routes
  
  // Get collaborators for a project
  app.get('/api/research-collaborators', requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.query.projectId as string);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      // Check if the user has permission to view collaborators for this project
      const project = await storage.getResearchProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin && !project.isPublic) {
        // Check if the user is a collaborator
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, projectId);
        if (!collaborator) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      
      const collaborators = await storage.getResearchCollaboratorsWithUsers(projectId);
      res.json(collaborators);
    } catch (error) {
      console.error('Error fetching research collaborators:', error);
      res.status(500).json({ error: 'Failed to fetch collaborators' });
    }
  });
  
  // Invite a collaborator
  app.post('/api/research-collaborators/invite', requireAuth, async (req, res) => {
    try {
      const { email, role, projectId } = req.body;
      
      if (!email || !role || !projectId) {
        return res.status(400).json({ error: 'Email, role, and project ID are required' });
      }
      
      // Check if the user has permission to invite collaborators to this project
      const project = await storage.getResearchProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Check if the user is a collaborator with appropriate permissions
        const collaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, projectId);
        if (!collaborator || collaborator.role !== 'admin') {
          return res.status(403).json({ error: 'You do not have permission to invite collaborators to this project' });
        }
      }
      
      // Find the user by email
      const targetUser = await storage.getUserByEmail(email);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if the user is already a collaborator
      const existingCollaborator = await storage.getResearchCollaboratorByUserAndProject(targetUser.id, projectId);
      if (existingCollaborator) {
        return res.status(400).json({ error: 'User is already a collaborator on this project' });
      }
      
      // Create the collaborator
      const newCollaborator = await storage.createResearchCollaborator({
        userId: targetUser.id,
        researchProjectId: projectId,
        role,
        status: 'pending',
        joinedAt: new Date(),
        invitedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // TODO: Send an email notification to the user
      
      res.status(201).json(newCollaborator);
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      res.status(500).json({ error: 'Failed to invite collaborator' });
    }
  });
  
  // Update a collaborator's role
  app.patch('/api/research-collaborators/:id', requireAuth, async (req, res) => {
    try {
      const collaboratorId = parseInt(req.params.id);
      if (isNaN(collaboratorId)) {
        return res.status(400).json({ error: 'Invalid collaborator ID' });
      }
      
      const { role, status } = req.body;
      if (!role && !status) {
        return res.status(400).json({ error: 'Role or status is required' });
      }
      
      const collaborator = await storage.getResearchCollaborator(collaboratorId);
      if (!collaborator) {
        return res.status(404).json({ error: 'Collaborator not found' });
      }
      
      // Check if the user has permission to update this collaborator
      const project = await storage.getResearchProject(collaborator.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Check if the user is a collaborator with appropriate permissions
        const userCollaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!userCollaborator || userCollaborator.role !== 'admin') {
          return res.status(403).json({ error: 'You do not have permission to update this collaborator' });
        }
      }
      
      const updatedCollaborator = await storage.updateResearchCollaborator(collaboratorId, {
        role,
        status,
        updatedAt: new Date(),
      });
      
      res.json(updatedCollaborator);
    } catch (error) {
      console.error('Error updating collaborator:', error);
      res.status(500).json({ error: 'Failed to update collaborator' });
    }
  });
  
  // Remove a collaborator
  app.delete('/api/research-collaborators/:id', requireAuth, async (req, res) => {
    try {
      const collaboratorId = parseInt(req.params.id);
      if (isNaN(collaboratorId)) {
        return res.status(400).json({ error: 'Invalid collaborator ID' });
      }
      
      const collaborator = await storage.getResearchCollaborator(collaboratorId);
      if (!collaborator) {
        return res.status(404).json({ error: 'Collaborator not found' });
      }
      
      // Check if the user has permission to remove this collaborator
      const project = await storage.getResearchProject(collaborator.researchProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const user = req.user;
      const isOwner = project.researcherId === user.id;
      const isAdmin = user.role === 'admin';
      const isSelf = collaborator.userId === user.id;
      
      if (!isOwner && !isAdmin && !isSelf) {
        // Check if the user is a collaborator with appropriate permissions
        const userCollaborator = await storage.getResearchCollaboratorByUserAndProject(user.id, project.id);
        if (!userCollaborator || userCollaborator.role !== 'admin') {
          return res.status(403).json({ error: 'You do not have permission to remove this collaborator' });
        }
      }
      
      await storage.deleteResearchCollaborator(collaboratorId);
      res.status(204).end();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      res.status(500).json({ error: 'Failed to remove collaborator' });
    }
  });
}

// Add the missing typed to Request interface
declare global {
  namespace Express {
    interface Request {
      project?: any;
    }
  }
}