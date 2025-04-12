import { Express } from "express";
import { storage } from "../storage";
import { eq } from "drizzle-orm";
import { users, researchProjects, researchDocuments, researchWorkspaces } from "@shared/schema";

/**
 * Register routes for research agent functionality
 * This includes student-researcher communication and collaboration
 */
export function registerResearchAgentRoutes(app: Express) {
  // Get all available researchers
  app.get("/api/research-agent/researchers", async (req, res) => {
    try {
      const researchers = await storage.getAllResearchers();
      res.json(researchers);
    } catch (error) {
      console.error("Error fetching researchers:", error);
      res.status(500).json({ error: "Failed to fetch researchers" });
    }
  });

  // Get available research projects
  app.get("/api/research-agent/projects", async (req, res) => {
    try {
      // Get projects that are published and available
      const projects = await storage.getPublishedResearchProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching research projects:", error);
      res.status(500).json({ error: "Failed to fetch research projects" });
    }
  });

  // Get a specific research project with researcher details
  app.get("/api/research-agent/projects/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const project = await storage.getResearchProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Research project not found" });
      }

      // Get researcher information
      const researcher = await storage.getUser(project.researcherId);
      
      // Get project documents
      const workspaces = await storage.getResearchWorkspacesByProject(projectId);
      
      let documents = [];
      if (workspaces && workspaces.length > 0) {
        // Get documents from all workspaces
        for (const workspace of workspaces) {
          const workspaceDocs = await storage.getResearchDocumentsByWorkspace(workspace.id);
          documents.push(...workspaceDocs);
        }
      }

      res.json({
        project,
        researcher: researcher ? {
          id: researcher.id,
          firstName: researcher.firstName,
          lastName: researcher.lastName,
          profileImage: researcher.profileImage
        } : null,
        documents
      });
    } catch (error) {
      console.error("Error fetching research project details:", error);
      res.status(500).json({ error: "Failed to fetch research project details" });
    }
  });

  // Send message to researcher (from student)
  app.post("/api/research-agent/message", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { researcherId, projectId, message } = req.body;
      
      if (!researcherId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if researcher exists
      const researcher = await storage.getUser(researcherId);
      if (!researcher || researcher.role !== "researcher") {
        return res.status(404).json({ error: "Researcher not found" });
      }

      // Save message to database (using chat messages table)
      const roomId = `research_${researcherId}_${req.user.id}${projectId ? `_project_${projectId}` : ''}`;
      
      const chatMessage = await storage.createChatMessage({
        userId: req.user.id,
        roomId,
        message,
        type: "text"
      });

      // Return success
      res.status(201).json({ 
        success: true,
        message: chatMessage,
        roomId
      });
    } catch (error) {
      console.error("Error sending message to researcher:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Get conversation history between student and researcher
  app.get("/api/research-agent/conversation/:researcherId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const researcherId = parseInt(req.params.researcherId);
      const { projectId } = req.query;
      
      if (isNaN(researcherId)) {
        return res.status(400).json({ error: "Invalid researcher ID" });
      }

      // Check if researcher exists
      const researcher = await storage.getUser(researcherId);
      if (!researcher || researcher.role !== "researcher") {
        return res.status(404).json({ error: "Researcher not found" });
      }

      // Format room ID the same way as when saving messages
      const roomId = `research_${researcherId}_${req.user.id}${projectId ? `_project_${projectId}` : ''}`;
      
      // Get messages from this chat room
      const messages = await storage.getChatMessagesByRoom(roomId);

      // Format and return messages
      const formattedMessages = await Promise.all(
        messages.map(async (msg) => {
          const sender = await storage.getUser(msg.userId);
          return {
            id: msg.id,
            content: msg.message,
            timestamp: msg.createdAt,
            role: sender?.id === req.user.id ? 'user' : 'researcher',
            fileUrl: msg.fileUrl
          };
        })
      );

      res.json(formattedMessages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Purchase access to a research project
  app.post("/api/research-agent/purchase", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { projectId, transactionId, amount } = req.body;
      
      if (!projectId || !transactionId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const project = await storage.getResearchProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ error: "Research project not found" });
      }

      // Calculate the admin commission (30%)
      const adminCommission = Math.round(amount * 0.3 * 100) / 100;
      const researcherAmount = Math.round((amount - adminCommission) * 100) / 100;

      // Record the purchase
      const purchase = await storage.createResearchProjectPurchase({
        studentId: req.user.id,
        researchProjectId: parseInt(projectId),
        transactionId,
        amount,
        adminCommission,
        researcherAmount,
        status: "completed",
        purchasedAt: new Date(),
        // Set access to expire after 3 months
        accessExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      });

      res.status(201).json({ 
        success: true,
        purchase
      });
    } catch (error) {
      console.error("Error purchasing research project:", error);
      res.status(500).json({ error: "Failed to complete purchase" });
    }
  });

  // Check if student has purchased access to a research project
  app.get("/api/research-agent/access/:projectId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      // Look for a completed purchase that hasn't expired
      const purchase = await storage.getResearchProjectPurchase(req.user.id, projectId);
      
      // Check if purchase exists and is valid
      const hasAccess = purchase && 
                        purchase.status === "completed" && 
                        purchase.accessExpiresAt && 
                        new Date(purchase.accessExpiresAt) > new Date();

      res.json({ 
        hasAccess,
        purchase: hasAccess ? purchase : null,
        accessExpires: purchase?.accessExpiresAt || null
      });
    } catch (error) {
      console.error("Error checking project access:", error);
      res.status(500).json({ error: "Failed to check project access" });
    }
  });

  // Add a student as a collaborator to a research project
  app.post("/api/research-agent/collaborate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: "Missing project ID" });
      }

      const project = await storage.getResearchProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ error: "Research project not found" });
      }

      // Check if project allows collaborators
      if (!project.allowCollaborators) {
        return res.status(403).json({ error: "This project does not allow collaborators" });
      }

      // Check if already a collaborator
      const existing = await storage.getResearchCollaboratorByUserAndProject(req.user.id, parseInt(projectId));
      if (existing) {
        return res.status(409).json({ error: "Already a collaborator on this project" });
      }

      // Add as collaborator
      const collaborator = await storage.createResearchCollaborator({
        userId: req.user.id,
        researchProjectId: parseInt(projectId),
        role: "student",
        status: "active",
        joinedAt: new Date()
      });

      res.status(201).json({ 
        success: true,
        collaborator
      });
    } catch (error) {
      console.error("Error adding collaborator:", error);
      res.status(500).json({ error: "Failed to add collaborator" });
    }
  });
}