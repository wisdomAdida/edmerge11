import type { Express } from "express";
import { Client } from 'pg';
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { setupAuth } from "./auth";
import axios from "node-fetch";
import { subscriptionKeysRouter } from "./routes/subscription-keys";
import mentorRouter from "./routes/mentor";
import scholarshipRouter from "./routes/scholarship";
import { registerResearchAgentRoutes } from "./routes/research-agent";
import { 
  insertCourseSchema, 
  insertEnrollmentSchema, 
  insertPaymentSchema, 
  insertWithdrawalSchema, 
  insertMentorshipSchema,
  insertResearchProjectSchema,
  insertSubscriptionPlanSchema,
  insertSubscriptionSchema,
  insertLiveClassSchema,
  insertCvTemplateSchema,
  insertUserCvSchema,
  insertSubscriptionKeySchema,
  insertChatMessageSchema,
  insertCourseSectionSchema,
  insertCourseMaterialSchema,
  insertResearchCollaboratorSchema,
  insertResearchWorkspaceSchema,
  insertResearchDocumentSchema,
  insertResearchPurchaseSchema,
  ChatMessage
} from "@shared/schema";
import { setupResearchRoutes } from "./routes/research";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup subscription key routes
  app.use("/api/subscription-keys", subscriptionKeysRouter);
  
  // Setup mentor routes
  app.use("/api", mentorRouter);
  
  // Setup scholarship routes
  app.use("/api/scholarships", scholarshipRouter);
  
  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Function to save chat messages to the database
  async function saveChatMessage(data: any) {
    try {
      if (!data.userId || !data.message || !data.roomId) {
        console.error('Invalid chat message data:', data);
        return;
      }
      
      await storage.createChatMessage({
        userId: data.userId,
        roomId: data.roomId,
        message: data.message,
        type: data.messageType || 'text',
        fileUrl: data.fileUrl || null
      });
      
      console.log('Chat message saved to database');
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
      
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        } else if (data.type === 'chat_message') {
          // Broadcast chat messages to all connected clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'chat_message',
                userId: data.userId,
                username: data.username,
                message: data.message,
                timestamp: new Date().toISOString(),
                roomId: data.roomId
              }));
            }
          });
          
          // Save chat message to database
          saveChatMessage(data);
        } else if (data.type === 'join_room') {
          // Handle join room event
          ws.send(JSON.stringify({
            type: 'room_joined',
            roomId: data.roomId,
            timestamp: new Date().toISOString()
          }));
          
          // Notify others that someone joined
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'user_joined',
                userId: data.userId,
                username: data.username,
                roomId: data.roomId,
                timestamp: new Date().toISOString()
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // AI Tutor API routes
  
  // Get recent topics for AI tutor
  app.get('/api/student/recent-topics', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
    
    try {
      // In a production app, these would be fetched from a database
      // based on the user's browsing/learning history
      const recentTopics = [
        { id: 1, title: "Mathematics", subtopic: "Algebra", lastAccessed: new Date().toISOString() },
        { id: 2, title: "Science", subtopic: "Biology", lastAccessed: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, title: "History", subtopic: "World War II", lastAccessed: new Date(Date.now() - 172800000).toISOString() },
        { id: 4, title: "Language", subtopic: "Grammar", lastAccessed: new Date(Date.now() - 259200000).toISOString() },
        { id: 5, title: "Computer Science", subtopic: "Algorithms", lastAccessed: new Date(Date.now() - 345600000).toISOString() }
      ];
      
      res.json(recentTopics);
    } catch (error) {
      next(error);
    }
  });
  
  // Get saved AI sessions
  app.get('/api/student/ai-sessions', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
    
    try {
      // In a production app, these would be fetched from a database
      // where they'd be stored for each user
      const sessions = [
        { 
          id: 'session-1', 
          title: "Mathematics Help", 
          lastAccessed: new Date(Date.now() - 86400000).toISOString(),
          subject: "Mathematics",
          messages: [
            {
              id: 'msg-1-1',
              role: 'assistant',
              content: 'Welcome to your Mathematics session. How can I help you today?',
              timestamp: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        },
        { 
          id: 'session-2', 
          title: "Science Concepts", 
          lastAccessed: new Date(Date.now() - 172800000).toISOString(),
          subject: "Science",
          messages: [
            {
              id: 'msg-2-1',
              role: 'assistant',
              content: 'Welcome to your Science session. What scientific concepts are you exploring today?',
              timestamp: new Date(Date.now() - 172800000).toISOString()
            }
          ]
        },
      ];
      
      res.json(sessions);
    } catch (error) {
      next(error);
    }
  });
  
  // Save an AI session
  app.post('/api/student/ai-sessions', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
    
    try {
      const session = req.body;
      
      // In a production app, this would be saved to a database
      // and would include user identification
      
      // For now, we'll just return the session with a success message
      res.status(201).json({
        ...session,
        saved: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // Courses API
  app.get("/api/courses", async (req, res, next) => {
    try {
      const allCourses = await storage.getAllCourses();
      
      // Filter out courses that are in draft or archived status
      const availableCourses = allCourses.filter(course => 
        course.status !== "draft" && course.status !== "archived"
      );
      
      res.json(availableCourses);
    } catch (error) {
      next(error);
    }
  });
  
  // Recommended Courses API
  app.get("/api/courses/recommended", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get all courses
      const allCourses = await storage.getAllCourses();
      
      // In a real implementation, this would use an algorithm based on the user's
      // interests, previous courses, and behavior to recommend courses
      
      // Get existing enrollments to avoid recommending courses the user is already enrolled in
      const userEnrollments = await storage.getEnrollmentsByUserId(req.user.id);
      const enrolledCourseIds = userEnrollments.map(enrollment => enrollment.courseId);
      
      // Get courses the user is not enrolled in
      const unenrolledCourses = allCourses.filter(course => 
        !enrolledCourseIds.includes(course.id)
      );
      
      // Filter courses to those that are not in draft status
      const availableCourses = unenrolledCourses.filter(course => 
        course.status !== "draft" && course.status !== "archived"
      );
      
      // Sort by newest first and limit to 10 recommended courses
      const recommendedCourses = availableCourses
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 10);
      
      res.json(recommendedCourses);
    } catch (error) {
      next(error);
    }
  });
  
  // Tutor Courses API
  app.get("/api/courses/tutor", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can access their courses" });
    }
    
    try {
      const courses = await storage.getCoursesByTutor(req.user.id);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });
  
  // Get statistics for courses (enrollment counts and ratings)
  app.get("/api/courses/stats", async (req, res, next) => {
    try {
      // Get all enrollments
      const enrollments = await storage.getAllEnrollments();
      
      // Count enrollments per course
      const courseStats: Record<number, { count: number, rating: string }> = {};
      
      // Group enrollments by course
      enrollments.forEach(enrollment => {
        if (!courseStats[enrollment.courseId]) {
          courseStats[enrollment.courseId] = { 
            count: 0,
            rating: (4 + Math.random()).toFixed(1) // Generate a rating between 4.0-5.0 until we implement real ratings
          };
        }
        courseStats[enrollment.courseId].count += 1;
      });
      
      res.json(courseStats);
    } catch (error) {
      next(error);
    }
  });
  
  // Get statistics for a specific course
  app.get("/api/courses/stats/:id", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Get enrollments for this course
      const enrollments = await storage.getAllEnrollments();
      const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
      
      // Calculate statistics
      const enrollmentCount = courseEnrollments.length;
      const averageRating = (4 + Math.random()).toFixed(1); // Generate a rating between 4.0-5.0
      const reviewCount = Math.floor(enrollmentCount * 0.7); // Assume 70% of students leave reviews
      
      // Calculate average completion percentage
      const completedCount = courseEnrollments.filter(e => e.isCompleted).length;
      const averageProgress = courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / 
        (courseEnrollments.length || 1);
      
      // Estimate course duration based on content
      const averageDuration = "8 weeks"; // This would be stored in the course data in a real implementation
      
      res.json({
        enrollmentCount,
        averageRating,
        reviewCount,
        completedCount,
        averageProgress,
        averageDuration
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/:id", async (req, res, next) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/courses/:id/enrollments", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Get all enrollments for this course
      const enrollments = await storage.getAllEnrollments();
      const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
      
      // Get user details for each enrollment
      const enrollmentDetails = await Promise.all(
        courseEnrollments.map(async (enrollment) => {
          const user = await storage.getUser(enrollment.userId);
          return {
            ...enrollment,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImage: user.profileImage
            } : null
          };
        })
      );
      
      res.json(enrollmentDetails);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only tutors and admins can create courses" });
    }

    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        tutorId: req.user.id
      });
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.format() });
      }
      next(error);
    }
  });

  app.put("/api/courses/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.tutorId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to update this course" });
      }
      
      const updatedCourse = await storage.updateCourse(courseId, req.body);
      res.json(updatedCourse);
    } catch (error) {
      next(error);
    }
  });

  // Course Sections API
  app.get("/api/courses/:courseId/sections", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const sections = await storage.getCourseSectionsByCourse(courseId);
      // Sort sections by order
      sections.sort((a, b) => a.order - b.order);
      
      res.json(sections);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses/:courseId/sections", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.tutorId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to add sections to this course" });
      }
      
      // Get existing sections to determine the next order number
      const existingSections = await storage.getCourseSectionsByCourse(courseId);
      const nextOrder = existingSections.length > 0
        ? Math.max(...existingSections.map(s => s.order)) + 1
        : 1;
      
      const sectionData = insertCourseSectionSchema.parse({
        ...req.body,
        courseId,
        order: req.body.order || nextOrder
      });
      
      const section = await storage.createCourseSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid section data", errors: error.format() });
      }
      next(error);
    }
  });

  app.put("/api/courses/sections/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sectionId = parseInt(req.params.id);
      const section = await storage.getCourseSection(sectionId);
      
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      // Verify permission (user must be the course tutor or admin)
      const course = await storage.getCourse(section.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.tutorId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to update this section" });
      }
      
      const updatedSection = await storage.updateCourseSection(sectionId, req.body);
      res.json(updatedSection);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/courses/sections/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sectionId = parseInt(req.params.id);
      const section = await storage.getCourseSection(sectionId);
      
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      // Verify permission (user must be the course tutor or admin)
      const course = await storage.getCourse(section.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.tutorId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to delete this section" });
      }
      
      // This will also delete all materials in this section
      const deleted = await storage.deleteCourseSection(sectionId);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Section not found or already deleted" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Course Materials API
  app.get("/api/courses/:courseId/materials", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const materials = await storage.getCourseMaterialsByCourse(courseId);
      // Sort materials by order
      materials.sort((a, b) => a.order - b.order);
      
      res.json(materials);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/sections/:sectionId/materials", async (req, res, next) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      const section = await storage.getCourseSection(sectionId);
      
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      const materials = await storage.getCourseMaterialsBySection(sectionId);
      // Sort materials by order
      materials.sort((a, b) => a.order - b.order);
      
      res.json(materials);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses/sections/:sectionId/materials", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sectionId = parseInt(req.params.sectionId);
      const section = await storage.getCourseSection(sectionId);
      
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      // Verify permission (user must be the course tutor or admin)
      const course = await storage.getCourse(section.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.tutorId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to add materials to this section" });
      }
      
      // Get existing materials to determine the next order number
      const existingMaterials = await storage.getCourseMaterialsBySection(sectionId);
      const nextOrder = existingMaterials.length > 0
        ? Math.max(...existingMaterials.map(m => m.order)) + 1
        : 1;
      
      const materialData = insertCourseMaterialSchema.parse({
        ...req.body,
        courseId: section.courseId,
        sectionId,
        order: req.body.order || nextOrder
      });
      
      const material = await storage.createCourseMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid material data", errors: error.format() });
      }
      next(error);
    }
  });

  app.put("/api/courses/materials/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const materialId = parseInt(req.params.id);
      const material = await storage.getCourseMaterial(materialId);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      // Verify permission (user must be the course tutor or admin)
      const course = await storage.getCourse(material.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.tutorId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to update this material" });
      }
      
      const updatedMaterial = await storage.updateCourseMaterial(materialId, req.body);
      res.json(updatedMaterial);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/courses/materials/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const materialId = parseInt(req.params.id);
      const material = await storage.getCourseMaterial(materialId);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      // Verify permission (user must be the course tutor or admin)
      const course = await storage.getCourse(material.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.tutorId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to delete this material" });
      }
      
      const deleted = await storage.deleteCourseMaterial(materialId);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Material not found or already deleted" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Enrollments API
  app.get("/api/enrollments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let enrollments;
      if (req.user.role === "student") {
        enrollments = await storage.getEnrollmentsByUserId(req.user.id);
        
        // Enrich enrollments with course data
        const courseIds = enrollments.map(enrollment => enrollment.courseId);
        const courses = await Promise.all(
          courseIds.map(courseId => storage.getCourse(courseId))
        );
        
        // Map courses to enrollments
        enrollments = enrollments.map(enrollment => {
          const course = courses.find(c => c && c.id === enrollment.courseId);
          return {
            ...enrollment,
            course: course || undefined
          };
        });
      } else if (req.user.role === "tutor") {
        enrollments = await storage.getEnrollmentsByTutorId(req.user.id);
      } else if (req.user.role === "admin") {
        enrollments = await storage.getAllEnrollments();
      } else {
        return res.status(403).json({ message: "Unauthorized access to enrollments" });
      }
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  });
  
  // Get enrollment for a specific course by courseId
  app.get("/api/enrollments/course/:courseId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const enrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, courseId);
      
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      // Get course details too
      const course = await storage.getCourse(courseId);
      
      res.json({
        ...enrollment,
        course
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Alternative path to match the client request
  app.get("/api/enrollments/course", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const courseId = parseInt(req.query.courseId as string);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const enrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, courseId);
      
      // If no enrollment found, return null instead of 404 error to indicate not enrolled
      if (!enrollment) {
        return res.json(null);
      }
      
      // Get course details too
      const course = await storage.getCourse(courseId);
      
      res.json({
        ...enrollment,
        course
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get enrollments stats for a specific course
  app.get("/api/courses/:courseId/enrollments/stats", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      // Verify the course exists and the user has permission to view stats
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Only tutor who owns the course or admin can view these stats
      if (req.user.role !== "admin" && course.tutorId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to view enrollment stats for this course" });
      }
      
      // Get enrollments for this course
      const enrollments = await storage.getAllEnrollments();
      const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
      
      // Get payments for this course
      const payments = await storage.getPaymentsByCourse(courseId);
      const completedPayments = payments.filter(p => p.status === "completed");
      
      // Calculate earnings
      const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
      const tutorEarnings = completedPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
      
      // Calculate statistics
      const count = courseEnrollments.length;
      const completedCount = courseEnrollments.filter(e => e.isCompleted).length;
      const averageProgress = courseEnrollments.length > 0 
        ? courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / courseEnrollments.length 
        : 0;
      
      res.json({
        count,
        completedCount,
        averageProgress,
        earnings: totalEarnings,
        tutorEarnings,
        courseTitle: course.title,
        recentEnrollments: courseEnrollments
          .sort((a, b) => {
            const dateA = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
            const dateB = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5) // Most recent 5 enrollments
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Tutor Analytics API
  app.get("/api/tutor/analytics", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Forbidden: Only tutors can access this endpoint" });
    }
    
    const timeRange = req.query.timeRange || "year";
    
    try {
      // Get all courses for this tutor
      const tutorCourses = await storage.getCoursesByTutor(req.user.id);
      const courseIds = tutorCourses.map(course => course.id);
      
      if (courseIds.length === 0) {
        return res.json({
          totalStudents: 0,
          completionRate: 0,
          averageRating: 0,
          totalRevenue: 0,
          studentGrowth: 0,
          completionGrowth: 0,
          ratingGrowth: 0,
          revenueGrowth: 0,
          enrollmentByMonth: [],
          revenueByMonth: [],
          completionStats: {
            completed: 0,
            inProgress: 0,
            notStarted: 0
          }
        });
      }
      
      // Get time-based limits
      const now = new Date();
      let timeLimit;
      
      switch(timeRange) {
        case "week":
          timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          timeLimit = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case "year":
        default:
          timeLimit = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
      }
      
      // Fetch all enrollments and payments
      const enrollments = await storage.getAllEnrollments();
      const payments = await storage.getAllPayments();
      
      // Filter to only this tutor's courses
      const allEnrollments = enrollments.filter(e => courseIds.includes(e.courseId));
      const allPayments = payments.filter(p => courseIds.includes(p.courseId));
      
      // Filter by time range
      const recentEnrollments = allEnrollments.filter(e => 
        new Date(e.enrolledAt) >= timeLimit
      );
      
      const recentPayments = allPayments.filter(p => 
        p.status === "completed" && new Date(p.paymentDate) >= timeLimit
      );
      
      // Calculate student metrics
      const totalStudents = new Set(allEnrollments.map(e => e.userId)).size;
      const completedCourses = allEnrollments.filter(e => e.isCompleted).length;
      const inProgressCourses = allEnrollments.filter(e => !e.isCompleted && (e.progress || 0) > 0).length;
      const notStartedCourses = allEnrollments.filter(e => !e.isCompleted && (!e.progress || e.progress === 0)).length;
      
      const completionRate = allEnrollments.length > 0 
        ? (completedCourses / allEnrollments.length) * 100 
        : 0;
      
      // Calculate revenue metrics
      const totalRevenue = recentPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
      
      // Calculate growth metrics (compared to previous period)
      const prevTimeLimit = new Date(timeLimit.getTime() - (now.getTime() - timeLimit.getTime()));
      
      const prevPeriodEnrollments = allEnrollments.filter(e => 
        new Date(e.enrolledAt) >= prevTimeLimit && new Date(e.enrolledAt) < timeLimit
      );
      
      const prevPeriodPayments = allPayments.filter(p => 
        p.status === "completed" && 
        new Date(p.paymentDate) >= prevTimeLimit && 
        new Date(p.paymentDate) < timeLimit
      );
      
      const prevPeriodStudents = new Set(prevPeriodEnrollments.map(e => e.userId)).size;
      const prevPeriodRevenue = prevPeriodPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
      const prevPeriodCompletionRate = prevPeriodEnrollments.length > 0 
        ? (prevPeriodEnrollments.filter(e => e.isCompleted).length / prevPeriodEnrollments.length) * 100
        : 0;
      
      // Calculate growth percentages
      const studentGrowth = prevPeriodStudents > 0
        ? ((totalStudents - prevPeriodStudents) / prevPeriodStudents) * 100
        : 0;
        
      const revenueGrowth = prevPeriodRevenue > 0
        ? ((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100
        : 0;
        
      const completionGrowth = prevPeriodCompletionRate > 0
        ? ((completionRate - prevPeriodCompletionRate) / prevPeriodCompletionRate) * 100
        : 0;
      
      // Generate monthly data for charts
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const enrollmentByMonth = [];
      const revenueByMonth = [];
      
      // For year view, show all months; for month, show days; for week show days
      if (timeRange === "year") {
        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(now.getFullYear(), i, 1);
          const nextMonth = new Date(now.getFullYear(), i + 1, 1);
          
          const monthEnrollments = allEnrollments.filter(e => {
            const date = new Date(e.enrolledAt);
            return date >= monthDate && date < nextMonth;
          });
          
          const monthPayments = allPayments.filter(p => {
            const date = new Date(p.paymentDate);
            return p.status === "completed" && date >= monthDate && date < nextMonth;
          });
          
          const monthlyStudents = monthEnrollments.length;
          const monthlyRevenue = monthPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
          
          enrollmentByMonth.push({
            month: months[i],
            students: monthlyStudents
          });
          
          revenueByMonth.push({
            month: months[i],
            revenue: monthlyRevenue
          });
        }
      } else if (timeRange === "month") {
        // For month view, show last 30 days grouped by week
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (i + 1) * 7);
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() - i * 7);
          
          const weekEnrollments = allEnrollments.filter(e => {
            const date = new Date(e.enrolledAt);
            return date >= weekStart && date < weekEnd;
          });
          
          const weekPayments = allPayments.filter(p => {
            const date = new Date(p.paymentDate);
            return p.status === "completed" && date >= weekStart && date < weekEnd;
          });
          
          const weeklyStudents = weekEnrollments.length;
          const weeklyRevenue = weekPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
          
          enrollmentByMonth.push({
            month: `Week ${4-i}`,
            students: weeklyStudents
          });
          
          revenueByMonth.push({
            month: `Week ${4-i}`,
            revenue: weeklyRevenue
          });
        }
        // Reverse to show chronological order
        enrollmentByMonth.reverse();
        revenueByMonth.reverse();
      } else {
        // For week view, show days
        for (let i = 0; i < 7; i++) {
          const day = new Date(now);
          day.setDate(now.getDate() - (6 - i));
          const dayEnd = new Date(day);
          dayEnd.setDate(day.getDate() + 1);
          
          const dayEnrollments = allEnrollments.filter(e => {
            const date = new Date(e.enrolledAt);
            return date >= day && date < dayEnd;
          });
          
          const dayPayments = allPayments.filter(p => {
            const date = new Date(p.paymentDate);
            return p.status === "completed" && date >= day && date < dayEnd;
          });
          
          const dayStudents = dayEnrollments.length;
          const dayRevenue = dayPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
          
          enrollmentByMonth.push({
            month: day.toLocaleDateString('en-US', { weekday: 'short' }),
            students: dayStudents
          });
          
          revenueByMonth.push({
            month: day.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: dayRevenue
          });
        }
      }
      
      // Generate rating data - would be real data in production
      const averageRating = 4.5 + (Math.random() * 0.5 - 0.25);
      const ratingGrowth = 0.1 + Math.random() * 0.2;
      
      res.json({
        totalStudents,
        completionRate,
        averageRating,
        totalRevenue,
        studentGrowth,
        completionGrowth,
        ratingGrowth,
        revenueGrowth,
        enrollmentByMonth,
        revenueByMonth,
        completionStats: {
          completed: completedCourses,
          inProgress: inProgressCourses,
          notStarted: notStartedCourses
        }
      });
      
    } catch (error) {
      console.error("Error fetching tutor analytics:", error);
      next(error);
    }
  });
  
  app.get("/api/tutor/courses/analytics", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Forbidden: Only tutors can access this endpoint" });
    }
    
    try {
      // Get all courses for this tutor
      const tutorCourses = await storage.getCoursesByTutor(req.user.id);
      
      if (tutorCourses.length === 0) {
        return res.json({ courses: [] });
      }
      
      const courseAnalytics = [];
      
      // Get all enrollments
      const enrollments = await storage.getAllEnrollments();
      
      for (const course of tutorCourses) {
        const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
        
        if (courseEnrollments.length === 0) {
          // For courses with no enrollments, add with 0 students
          courseAnalytics.push({
            id: course.id,
            name: course.title,
            students: 0,
            completion: 0,
            rating: 0 // No ratings yet
          });
          continue;
        }
        
        const completedCount = courseEnrollments.filter(e => e.isCompleted).length;
        const totalProgress = courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        const averageProgress = courseEnrollments.length > 0 ? totalProgress / courseEnrollments.length : 0;
        
        // Would be replaced with real ratings when we have them
        const rating = 3.5 + Math.random() * 1.5;
        
        courseAnalytics.push({
          id: course.id,
          name: course.title,
          students: courseEnrollments.length,
          completion: Math.round(averageProgress),
          rating: parseFloat(rating.toFixed(1))
        });
      }
      
      // Sort by number of students, descending
      courseAnalytics.sort((a, b) => b.students - a.students);
      
      res.json({ courses: courseAnalytics });
      
    } catch (error) {
      console.error("Error fetching course analytics:", error);
      next(error);
    }
  });
  
  // Update enrollment progress
  app.patch("/api/enrollments/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const enrollmentId = parseInt(req.params.id);
      if (isNaN(enrollmentId)) {
        return res.status(400).json({ message: "Invalid enrollment ID" });
      }
      
      const enrollment = await storage.getEnrollment(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      // Only the enrolled student or an admin can update progress
      if (enrollment.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You do not have permission to update this enrollment" });
      }
      
      const { progress, isCompleted } = req.body;
      const updateData: { progress?: number; isCompleted?: boolean; updatedAt?: Date } = {};
      
      // Validate progress (must be between 0 and 100)
      if (progress !== undefined) {
        if (typeof progress !== 'number' || progress < 0 || progress > 100) {
          return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
        }
        updateData.progress = progress;
      }
      
      // Validate isCompleted
      if (isCompleted !== undefined) {
        if (typeof isCompleted !== 'boolean') {
          return res.status(400).json({ message: "isCompleted must be a boolean" });
        }
        updateData.isCompleted = isCompleted;
      }
      
      // Add lastAccessed field for tracking
      updateData.updatedAt = new Date();
      
      const updatedEnrollment = await storage.updateEnrollment(enrollmentId, updateData);
      res.json(updatedEnrollment);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/enrollments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can enroll in courses" });
    }
    
    try {
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if course exists
      const course = await storage.getCourse(enrollmentData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, enrollmentData.courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      // Check if the course is free or premium
      const isFree = course.isFree === true;
      
      // Check for active subscription - this grants unlimited access to premium courses
      const userSubscription = await storage.getUserSubscription(req.user.id);
      const hasActiveSubscription = userSubscription && 
                                   userSubscription.status === "active" && 
                                   new Date(userSubscription.endDate) > new Date();
      
      // Allow enrollment if course is free OR user has active subscription
      if (isFree || hasActiveSubscription) {
        // Create enrollment right away
        const enrollment = await storage.createEnrollment(enrollmentData);
        
        // If this was a premium course but user has subscription, log this for analytics
        if (!isFree && hasActiveSubscription) {
          console.log(`User ${req.user.id} enrolled in premium course ${course.id} using subscription`);
          
          // Optionally track this in a separate table for subscription usage analytics
          try {
            await storage.logSubscriptionUsage({
              userId: req.user.id,
              courseId: course.id,
              subscriptionId: userSubscription.id,
              usageType: "course_enrollment",
              usageDate: new Date()
            });
          } catch (logError) {
            console.error("Failed to log subscription usage:", logError);
            // Continue with enrollment even if logging fails
          }
        }
        
        return res.status(201).json(enrollment);
      }
      
      // If we get here, it's a premium course without subscription - payment required
      if (!isFree && course.price && course.price > 0) {
        // Premium course - return payment info but don't enroll yet
        return res.status(402).json({
          message: "Payment required",
          courseId: course.id,
          amount: course.price,
          title: course.title,
          tutorId: course.tutorId
        });
      }
      
      // For free courses, create enrollment right away (fallback case)
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.format() });
      }
      next(error);
    }
  });

  // Payments API
  app.post("/api/payments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can make payments" });
    }
    
    try {
      const { courseId, amount, transactionId } = req.body;
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Calculate admin commission (30%)
      const adminCommission = amount * 0.30;
      const tutorAmount = amount - adminCommission;
      
      const paymentData = insertPaymentSchema.parse({
        userId: req.user.id,
        courseId,
        amount,
        transactionId,
        status: "completed",
        adminCommission,
        tutorAmount
      });
      
      const payment = await storage.createPayment(paymentData);
      
      // Create enrollment after payment
      await storage.createEnrollment({
        userId: req.user.id,
        courseId,
        progress: 0,
        isCompleted: false
      });
      
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.format() });
      }
      next(error);
    }
  });

  // Tutor earnings API
  app.get("/api/tutor/earnings", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can access their earnings" });
    }
    
    try {
      // Get tutor's courses
      const courses = await storage.getCoursesByTutor(req.user.id);
      
      // Get all payments for tutor's courses
      const allPaymentsPromises = courses.map(course => 
        storage.getPaymentsByCourse(course.id)
      );
      
      const allPaymentsByCourse = await Promise.all(allPaymentsPromises);
      const allPayments = allPaymentsByCourse.flat();
      
      // Calculate total earnings from the completed payments
      const totalEarnings = allPayments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + p.tutorAmount, 0);
      
      // Get withdrawals
      const withdrawals = await storage.getWithdrawalsByTutor(req.user.id);
      
      // Calculate withdrawn amount
      const withdrawnAmount = withdrawals
        .filter(w => w.status === "completed")
        .reduce((sum, w) => sum + w.amount, 0);
      
      // Calculate pending amount
      const pendingAmount = withdrawals
        .filter(w => w.status === "pending")
        .reduce((sum, w) => sum + w.amount, 0);
      
      // Calculate available balance
      const currentBalance = totalEarnings - withdrawnAmount - pendingAmount;
      
      // Count enrolled students
      const enrollments = await storage.getEnrollmentsByTutorId(req.user.id);
      const coursesSold = enrollments.length;
      
      // Sort by most recent first
      allPayments.sort((a, b) => {
        const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return dateB - dateA;
      });
      
      // Calculate per-course earnings
      const courseEarnings = await Promise.all(
        courses.map(async (course) => {
          const coursePayments = allPayments.filter(p => p.courseId === course.id && p.status === "completed");
          const courseEarningsAmount = coursePayments.reduce((sum, p) => sum + p.tutorAmount, 0);
          const courseSales = coursePayments.length;
          
          return {
            courseId: course.id,
            courseTitle: course.title,
            earnings: courseEarningsAmount,
            sales: courseSales,
            coverImage: course.coverImage
          };
        })
      );
      
      // Sort courses by earnings (highest first)
      courseEarnings.sort((a, b) => b.earnings - a.earnings);
      
      res.json({
        totalEarnings,
        currentBalance,
        pendingBalance: pendingAmount,
        coursesSold,
        recentActivity: allPayments.slice(0, 5), // Most recent 5 payments
        courseEarnings: courseEarnings,
        withdrawals: withdrawals.slice(0, 5) // Most recent 5 withdrawals
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Tutor earnings by course API
  app.get("/api/tutor/earnings/course/:courseId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can access their earnings" });
    }
    
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Verify the course belongs to this tutor
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.tutorId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access earnings for this course" });
      }
      
      // Get all payments for this course
      const payments = await storage.getPaymentsByCourse(courseId);
      
      // Calculate total earnings from completed payments
      const totalEarnings = payments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + p.tutorAmount, 0);
      
      // Count sales/enrollments
      const sales = payments.filter(p => p.status === "completed").length;
      
      // Get monthly earnings breakdown for the past 6 months
      const now = new Date();
      const monthlyEarnings = [];
      
      for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthPayments = payments.filter(p => {
          const paymentDate = p.paymentDate ? new Date(p.paymentDate) : null;
          return paymentDate && 
                 paymentDate >= month && 
                 paymentDate <= monthEnd &&
                 p.status === "completed";
        });
        
        const monthEarnings = monthPayments.reduce((sum, p) => sum + p.tutorAmount, 0);
        const monthSales = monthPayments.length;
        
        monthlyEarnings.push({
          month: month.toLocaleString('default', { month: 'long', year: 'numeric' }),
          earnings: monthEarnings,
          sales: monthSales,
        });
      }
      
      res.json({
        courseId,
        courseTitle: course.title,
        totalEarnings,
        sales,
        monthlyEarnings,
        recentPayments: payments
          .filter(p => p.status === "completed")
          .sort((a, b) => {
            const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
            const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 10) // Most recent 10 payments
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Tutor payments API
  app.get("/api/tutor/payments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can access their payments" });
    }
    
    try {
      // Get tutor's courses
      const courses = await storage.getCoursesByTutor(req.user.id);
      
      // Get payments for each course
      const paymentsPromises = courses.map(course => 
        storage.getPaymentsByCourse(course.id)
      );
      
      const coursePayments = await Promise.all(paymentsPromises);
      
      // Flatten the array of payments
      const payments = coursePayments.flat();
      
      // Sort by date, newest first
      payments.sort((a, b) => {
        const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return dateB - dateA;
      });
      
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });
  
  // Tutor withdrawals API
  app.get("/api/tutor/withdrawals", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can access their withdrawals" });
    }
    
    try {
      const withdrawals = await storage.getWithdrawalsByTutor(req.user.id);
      
      // Sort by date, newest first
      withdrawals.sort((a, b) => {
        const dateA = a.withdrawalDate ? new Date(a.withdrawalDate).getTime() : 0;
        const dateB = b.withdrawalDate ? new Date(b.withdrawalDate).getTime() : 0;
        return dateB - dateA;
      });
      
      res.json(withdrawals);
    } catch (error) {
      next(error);
    }
  });

  // Flutterwave - Validate Bank Account
  app.post("/api/flutterwave/validate-account", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can validate bank accounts" });
    }
    
    try {
      const { account_number, account_bank } = req.body;
      
      // Make real API call to Flutterwave to validate the account
      const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
        body: JSON.stringify({
          account_number,
          account_bank
        })
      });
      
      const flutterwaveData = await response.json();
      
      if (flutterwaveData.status !== 'success') {
        return res.status(400).json({ 
          message: flutterwaveData.message || 'Could not validate bank account details'
        });
      }
      
      // Return the validated account details
      res.json({ 
        status: 'success',
        data: flutterwaveData.data
      });
    } catch (error) {
      console.error('Bank validation error:', error);
      res.status(500).json({ message: 'Failed to validate bank account' });
    }
  });
  
  // Flutterwave - Process Withdrawal
  app.post("/api/flutterwave/withdraw", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can make withdrawals" });
    }
    
    try {
      const { amount, bankAccount, narration, currency, reference } = req.body;
      
      // Check tutor earnings
      const tutorEarnings = await storage.getTutorEarnings(req.user.id);
      const withdrawals = await storage.getWithdrawalsByTutor(req.user.id);
      
      // Calculate withdrawn and pending amount
      const withdrawnAmount = withdrawals
        .filter(w => w.status === "completed" || w.status === "pending")
        .reduce((sum, w) => sum + w.amount, 0);
      
      // Calculate available balance
      const availableBalance = tutorEarnings - withdrawnAmount;
      
      if (amount > availableBalance) {
        return res.status(400).json({ message: "Insufficient balance for withdrawal" });
      }
      
      // Make real API call to Flutterwave to initiate transfer
      const response = await fetch('https://api.flutterwave.com/v3/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
        body: JSON.stringify({
          account_bank: bankAccount.account_bank,
          account_number: bankAccount.account_number,
          amount,
          narration,
          currency: currency || 'NGN',
          reference,
          callback_url: `${process.env.APP_URL}/api/flutterwave/webhook`,
          debit_currency: "NGN"
        })
      });
      
      const flutterwaveData = await response.json();
      
      if (flutterwaveData.status !== 'success') {
        return res.status(400).json({ 
          message: flutterwaveData.message || 'Could not process withdrawal'
        });
      }
      
      // Return the withdrawal details
      res.json(flutterwaveData);
    } catch (error) {
      console.error('Withdrawal processing error:', error);
      res.status(500).json({ message: 'Failed to process withdrawal' });
    }
  });
  
  // Withdrawal API - Record in our system
  app.post("/api/withdrawals", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can make withdrawals" });
    }
    
    try {
      const { amount, bankAccount, transactionId, status } = req.body;
      
      const withdrawalData = insertWithdrawalSchema.parse({
        tutorId: req.user.id,
        amount,
        status: status || "pending",
        transactionId: transactionId || `fw-${Date.now()}`
      });
      
      const withdrawal = await storage.createWithdrawal(withdrawalData);
      res.status(201).json(withdrawal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid withdrawal data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Flutterwave - Webhook for transfer status updates
  app.post("/api/flutterwave/webhook", async (req, res, next) => {
    try {
      const { event, data } = req.body;
      
      // Verify webhook signature for security (in production)
      // const signature = req.headers['verif-hash'];
      // if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
      //   return res.status(401).send('Unauthorized');
      // }
      
      // Handle different webhook events
      if (event === 'transfer.completed') {
        // Update withdrawal status
        const withdrawal = await storage.getWithdrawal(0); // Would need to find by transactionId
        
        if (withdrawal) {
          await storage.updateWithdrawal(withdrawal.id, {
            status: "completed"
          });
        }
      }
      
      res.sendStatus(200);
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.sendStatus(200); // Always return 200 to Flutterwave
    }
  });

  // Mentorship API
  app.post("/api/mentorships", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can request mentorship" });
    }
    
    try {
      const { mentorId } = req.body;
      
      // Check if mentor exists
      const mentor = await storage.getUser(mentorId);
      if (!mentor || mentor.role !== "mentor") {
        return res.status(404).json({ message: "Mentor not found" });
      }
      
      const mentorshipData = insertMentorshipSchema.parse({
        mentorId,
        studentId: req.user.id,
        status: "pending"
      });
      
      const mentorship = await storage.createMentorship(mentorshipData);
      res.status(201).json(mentorship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mentorship data", errors: error.format() });
      }
      next(error);
    }
  });

  // Research Projects API
  app.post("/api/research-projects", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "researcher") {
      return res.status(403).json({ message: "Only researchers can create projects" });
    }
    
    try {
      const projectData = insertResearchProjectSchema.parse({
        ...req.body,
        researcherId: req.user.id
      });
      
      const project = await storage.createResearchProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Get all research projects (with optional filters)
  app.get("/api/research-projects", async (req, res, next) => {
    try {
      const projects = await storage.getAllResearchProjects();
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });
  
  // Get research projects for a specific researcher
  app.get("/api/research-projects/researcher", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "researcher") {
      return res.status(403).json({ message: "Only researchers can access their projects" });
    }
    
    try {
      const projects = await storage.getResearchProjectsByResearcher(req.user.id);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });
  
  // Get researcher dashboard statistics
  app.get("/api/researchers/stats", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "researcher") {
      return res.status(403).json({ message: "Only researchers can access these statistics" });
    }
    
    try {
      // Get all projects for this researcher
      const allProjects = await storage.getResearchProjectsByResearcher(req.user.id);
      
      // Get collaborators across all projects
      const collaboratorIds = new Set<number>();
      let earnings = 0;
      let views = 0;
      
      // Count stats for various project statuses
      const activeProjects = allProjects.filter(p => p.status === "active" || p.status === "in_progress").length;
      const completedProjects = allProjects.filter(p => p.status === "completed" || p.status === "published").length;
      const draftProjects = allProjects.filter(p => p.status === "draft").length;
      
      // Get total sales/purchases for this researcher's projects
      const sales = await storage.getResearchProjectPurchases(req.user.id);
      if (sales && sales.length) {
        earnings = sales.reduce((sum, sale) => sum + (sale.researcherAmount || 0), 0);
      }
      
      // Calculate active collaborators
      for (const project of allProjects) {
        const projectCollaborators = await storage.getResearchCollaborators(project.id);
        projectCollaborators.forEach(c => collaboratorIds.add(c.userId));
        
        // Add views if available - set to 0 if not present
        views += 0; // Since views field doesn't exist in the schema yet
      }
      
      res.json({
        totalProjects: allProjects.length,
        activeProjects,
        completedProjects,
        draftProjects,
        collaborators: collaboratorIds.size,
        earnings,
        views,
        projects: allProjects.slice(0, 5) // Include a few recent projects
      });
    } catch (error) {
      console.error("Error fetching researcher stats:", error);
      // Provide a fallback response with empty values to prevent UI errors
      res.json({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        draftProjects: 0,
        collaborators: 0,
        earnings: 0,
        views: 0,
        projects: []
      });
    }
  });
  
  // Get researcher statistics
  app.get("/api/researcher/stats", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "researcher") {
      return res.status(403).json({ message: "Only researchers can access their statistics" });
    }
    
    try {
      const projects = await storage.getResearchProjectsByResearcher(req.user.id);
      
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const collaborators = projects.reduce((sum, p) => sum + (p.collaborators || 0), 0);
      
      res.json({
        totalProjects,
        activeProjects,
        completedProjects,
        totalCollaborators: collaborators
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get recent activities for a user
  app.get("/api/activities/recent", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // This would normally fetch from database, but for now we'll return sample activities
      // based on user role
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const mockActivities = [];
      const now = new Date();
      
      if (userRole === 'researcher') {
        mockActivities.push({
          id: 1,
          type: 'project_created',
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          title: 'New Research Project Created',
          description: 'You created a new research project "AI in Education"',
          relatedEntityId: 1,
          relatedEntityType: 'research_project'
        });
        
        mockActivities.push({
          id: 2,
          type: 'project_updated',
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          title: 'Project Updated',
          description: 'You updated the "AI in Education" project',
          relatedEntityId: 1,
          relatedEntityType: 'research_project'
        });
        
        mockActivities.push({
          id: 3,
          type: 'collaboration_invited',
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
          title: 'Collaborator Invited',
          description: 'You invited a collaborator to "AI in Education" project',
          relatedEntityId: 1,
          relatedEntityType: 'research_project'
        });
      }
      
      res.json(mockActivities);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific research project by ID
  app.get("/api/research-projects/:id", async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getResearchProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Research project not found" });
      }
      
      // Check if user has permission to view the project
      if (req.isAuthenticated()) {
        const isOwner = project.researcherId === req.user.id;
        const isAdmin = req.user.role === "admin";
        const isPublic = project.isPublic;
        
        if (!isOwner && !isAdmin && !isPublic) {
          return res.status(403).json({ message: "You don't have permission to view this project" });
        }
      } else if (!project.isPublic) {
        return res.status(403).json({ message: "This project is not public" });
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });
  
  // Research Workspace API
  
  // Get workspaces for a research project
  app.get("/api/research-projects/:id/workspaces", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getResearchProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Research project not found" });
      }
      
      // Check if user is the researcher or a collaborator
      if (project.researcherId !== req.user.id) {
        const isCollaborator = await checkUserIsCollaborator(req.user.id, projectId);
        if (!isCollaborator) {
          return res.status(403).json({ message: "You don't have access to this project's workspaces" });
        }
      }
      
      const workspaces = await storage.getResearchWorkspaces(projectId);
      res.json(workspaces);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new workspace for a research project
  app.post("/api/research-projects/:id/workspaces", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getResearchProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Research project not found" });
      }
      
      // Check if user is the researcher or a collaborator
      if (project.researcherId !== req.user.id) {
        const isCollaborator = await checkUserIsCollaborator(req.user.id, projectId);
        if (!isCollaborator) {
          return res.status(403).json({ message: "You don't have permission to create workspaces for this project" });
        }
      }
      
      const workspaceData = insertResearchWorkspaceSchema.parse({
        ...req.body,
        researchProjectId: projectId
      });
      
      const workspace = await storage.createResearchWorkspace(workspaceData);
      res.status(201).json(workspace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workspace data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Get a specific workspace
  app.get("/api/research-workspaces/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getResearchWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: "Research workspace not found" });
      }
      
      // Get the project to check permissions
      const project = await storage.getResearchProject(workspace.researchProjectId);
      
      // Check if user is the researcher or a collaborator
      if (project.researcherId !== req.user.id) {
        const isCollaborator = await checkUserIsCollaborator(req.user.id, project.id);
        if (!isCollaborator) {
          return res.status(403).json({ message: "You don't have access to this workspace" });
        }
      }
      
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  });
  
  // Document API for research workspaces
  
  // Get documents for a workspace
  app.get("/api/research-workspaces/:id/documents", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getResearchWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: "Research workspace not found" });
      }
      
      // Get the project to check permissions
      const project = await storage.getResearchProject(workspace.researchProjectId);
      
      // Check if user is the researcher or a collaborator
      if (project.researcherId !== req.user.id) {
        const isCollaborator = await checkUserIsCollaborator(req.user.id, project.id);
        if (!isCollaborator) {
          return res.status(403).json({ message: "You don't have access to this workspace's documents" });
        }
      }
      
      const documents = await storage.getResearchDocuments(workspaceId);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new document in a workspace
  app.post("/api/research-workspaces/:id/documents", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getResearchWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: "Research workspace not found" });
      }
      
      // Get the project to check permissions
      const project = await storage.getResearchProject(workspace.researchProjectId);
      
      // Check if user is the researcher or a collaborator
      if (project.researcherId !== req.user.id) {
        const isCollaborator = await checkUserIsCollaborator(req.user.id, project.id);
        if (!isCollaborator) {
          return res.status(403).json({ message: "You don't have permission to create documents in this workspace" });
        }
      }
      
      const documentData = insertResearchDocumentSchema.parse({
        ...req.body,
        workspaceId,
        createdById: req.user.id,
        lastEditedById: req.user.id
      });
      
      const document = await storage.createResearchDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Update a document
  app.put("/api/research-documents/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getResearchDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Research document not found" });
      }
      
      // Get the workspace and project to check permissions
      const workspace = await storage.getResearchWorkspace(document.workspaceId);
      const project = await storage.getResearchProject(workspace.researchProjectId);
      
      // Check if user is the researcher or a collaborator
      if (project.researcherId !== req.user.id) {
        const isCollaborator = await checkUserIsCollaborator(req.user.id, project.id);
        if (!isCollaborator) {
          return res.status(403).json({ message: "You don't have permission to update this document" });
        }
      }
      
      const updatedDocument = await storage.updateResearchDocument(documentId, {
        ...req.body,
        lastEditedById: req.user.id
      });
      
      res.json(updatedDocument);
    } catch (error) {
      next(error);
    }
  });
  
  // Research Collaborators API
  
  // Get collaborators for a research project
  app.get("/api/research-projects/:id/collaborators", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getResearchProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Research project not found" });
      }
      
      // Public projects' collaborators can be viewed by anyone
      // For private projects, only the owner and collaborators can view
      if (!project.isPublic && project.researcherId !== req.user.id) {
        const isCollaborator = await checkUserIsCollaborator(req.user.id, projectId);
        if (!isCollaborator) {
          return res.status(403).json({ message: "You don't have permission to view collaborators for this project" });
        }
      }
      
      const collaborators = await storage.getResearchCollaborators(projectId);
      
      // Get user details for each collaborator
      const collaboratorDetails = await Promise.all(
        collaborators.map(async (collab) => {
          const user = await storage.getUser(collab.userId);
          return {
            ...collab,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              profileImage: user.profileImage,
              bio: user.bio
            } : null
          };
        })
      );
      
      res.json(collaboratorDetails);
    } catch (error) {
      next(error);
    }
  });
  
  // Invite a collaborator to a research project
  app.post("/api/research-projects/:id/collaborators", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getResearchProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Research project not found" });
      }
      
      // Only the project owner can invite collaborators
      if (project.researcherId !== req.user.id) {
        return res.status(403).json({ message: "Only the project owner can invite collaborators" });
      }
      
      const { userId, role } = req.body;
      
      // Check if the user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if already a collaborator
      const existingCollaborators = await storage.getResearchCollaborators(projectId);
      const alreadyCollaborator = existingCollaborators.some(c => c.userId === userId);
      
      if (alreadyCollaborator) {
        return res.status(400).json({ message: "User is already a collaborator on this project" });
      }
      
      const collaboratorData = insertResearchCollaboratorSchema.parse({
        researchProjectId: projectId,
        userId: userId,
        role: role || "contributor",
        status: "invited"
      });
      
      const collaborator = await storage.createResearchCollaborator(collaboratorData);
      
      // Update the project's collaborator count
      await storage.updateResearchProject(projectId, {
        collaborators: existingCollaborators.length + 1
      });
      
      res.status(201).json(collaborator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid collaborator data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Accept or decline a collaboration invitation
  app.put("/api/research-collaborators/:id/status", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const collaboratorId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["active", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'active' or 'declined'" });
      }
      
      const collaborator = await storage.getResearchCollaborator(collaboratorId);
      
      if (!collaborator) {
        return res.status(404).json({ message: "Collaboration invitation not found" });
      }
      
      // Only the invited user can accept/decline the invitation
      if (collaborator.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only respond to your own invitations" });
      }
      
      // Update the collaboration status
      const updatedData: any = { status };
      
      if (status === "active") {
        updatedData.joinedAt = new Date();
      }
      
      const updatedCollaborator = await storage.updateResearchCollaborator(collaboratorId, updatedData);
      res.json(updatedCollaborator);
    } catch (error) {
      next(error);
    }
  });
  
  // Research Purchase API for students
  
  // Get available research projects for purchase
  app.get("/api/student/research-projects", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }
    
    try {
      // Get all published research projects that are public
      const allProjects = await storage.getAllResearchProjects();
      const availableProjects = allProjects.filter(project => 
        project.isPublic && project.status === "completed"
      );
      
      // Get user's already purchased projects
      const userPurchases = await storage.getResearchPurchases(req.user.id);
      const purchasedProjectIds = userPurchases.map(p => p.researchProjectId);
      
      // Filter out already purchased projects
      const projectsForPurchase = availableProjects.filter(project => 
        !purchasedProjectIds.includes(project.id)
      );
      
      // Get researcher details for each project
      const projectsWithDetails = await Promise.all(
        projectsForPurchase.map(async (project) => {
          const researcher = await storage.getUser(project.researcherId);
          return {
            ...project,
            researcher: researcher ? {
              id: researcher.id,
              firstName: researcher.firstName,
              lastName: researcher.lastName,
              profileImage: researcher.profileImage,
            } : null
          };
        })
      );
      
      res.json(projectsWithDetails);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a student's purchased research projects
  app.get("/api/student/purchased-research", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }
    
    try {
      const purchases = await storage.getResearchPurchases(req.user.id);
      
      // Get project details for each purchase
      const purchasesWithDetails = await Promise.all(
        purchases.map(async (purchase) => {
          const project = await storage.getResearchProject(purchase.researchProjectId);
          const researcher = project ? await storage.getUser(project.researcherId) : null;
          
          return {
            ...purchase,
            project: project || null,
            researcher: researcher ? {
              id: researcher.id,
              firstName: researcher.firstName,
              lastName: researcher.lastName,
              profileImage: researcher.profileImage,
            } : null
          };
        })
      );
      
      res.json(purchasesWithDetails);
    } catch (error) {
      next(error);
    }
  });
  
  // Purchase a research project
  app.post("/api/student/purchase-research", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can purchase research projects" });
    }
    
    try {
      const { projectId, transactionId, amount } = req.body;
      
      if (!projectId || !transactionId || !amount) {
        return res.status(400).json({ message: "Missing required fields: projectId, transactionId, amount" });
      }
      
      // Check if the project exists and is available for purchase
      const project = await storage.getResearchProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Research project not found" });
      }
      
      if (!project.isPublic || project.status !== "completed") {
        return res.status(400).json({ message: "This research project is not available for purchase" });
      }
      
      // Check if already purchased
      const userPurchases = await storage.getResearchPurchases(req.user.id);
      const alreadyPurchased = userPurchases.some(p => p.researchProjectId === projectId);
      
      if (alreadyPurchased) {
        return res.status(400).json({ message: "You have already purchased this research project" });
      }
      
      // Calculate commission (30% for admin, 70% for researcher)
      const adminCommission = amount * 0.3;
      const researcherAmount = amount * 0.7;
      
      const purchaseData = insertResearchPurchaseSchema.parse({
        studentId: req.user.id,
        researchProjectId: projectId,
        transactionId,
        amount,
        status: "completed",
        adminCommission,
        researcherAmount,
        accessExpiresAt: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)) // 90 days access
      });
      
      const purchase = await storage.createResearchPurchase(purchaseData);
      res.status(201).json(purchase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Helper function to check if a user is a collaborator on a project
  async function checkUserIsCollaborator(userId: number, projectId: number): Promise<boolean> {
    const collaborators = await storage.getResearchCollaborators(projectId);
    return collaborators.some(c => c.userId === userId && c.status === "active");
  }
  
  // Update a research project
  app.put("/api/research-projects/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getResearchProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Research project not found" });
      }
      
      // Check if user has permission to update the project
      if (project.researcherId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to update this project" });
      }
      
      const updatedProject = await storage.updateResearchProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Delete a research project
  app.delete("/api/research-projects/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getResearchProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Research project not found" });
      }
      
      // Check if user has permission to delete the project
      if (project.researcherId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to delete this project" });
      }
      
      // Here, we would typically delete the project
      // For now, just return success as our MemStorage doesn't have delete functionality
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Admin Analytics API
  app.get("/api/admin/earnings", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      // Get all payments
      const payments = await storage.getAllPayments();
      
      // Calculate total platform earnings (commissions)
      const totalCommissions = payments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + p.adminCommission, 0);
      
      // Calculate total sales volume
      const totalSales = payments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Get monthly earnings breakdown for past 12 months
      const now = new Date();
      const monthlyEarnings = [];
      
      for (let i = 0; i < 12; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthPayments = payments.filter(p => {
          const paymentDate = p.paymentDate ? new Date(p.paymentDate) : null;
          return paymentDate && 
                 paymentDate >= month && 
                 paymentDate <= monthEnd &&
                 p.status === "completed";
        });
        
        const monthCommissions = monthPayments.reduce((sum, p) => sum + p.adminCommission, 0);
        const monthSales = monthPayments.length;
        const monthVolume = monthPayments.reduce((sum, p) => sum + p.amount, 0);
        
        monthlyEarnings.push({
          month: month.toLocaleString('default', { month: 'long', year: 'numeric' }),
          commissions: monthCommissions,
          sales: monthSales,
          volume: monthVolume
        });
      }
      
      // Get all courses and rank by revenue
      const courses = await storage.getAllCourses();
      
      // Enrich courses with payment data
      const coursesWithRevenue = await Promise.all(
        courses.map(async (course) => {
          const coursePayments = payments.filter(p => p.courseId === course.id && p.status === "completed");
          const revenue = coursePayments.reduce((sum, p) => sum + p.amount, 0);
          const commissions = coursePayments.reduce((sum, p) => sum + p.adminCommission, 0);
          const sales = coursePayments.length;
          
          // Get tutor info
          const tutor = await storage.getUser(course.tutorId);
          
          return {
            courseId: course.id,
            title: course.title,
            category: course.category,
            level: course.level,
            price: course.price,
            revenue,
            commissions,
            sales,
            tutorId: course.tutorId,
            tutorName: tutor ? `${tutor.firstName} ${tutor.lastName}` : 'Unknown'
          };
        })
      );
      
      // Sort courses by revenue (highest first)
      coursesWithRevenue.sort((a, b) => b.revenue - a.revenue);
      
      // Get top tutors by earnings
      const tutorMap = new Map();
      
      for (const payment of payments) {
        if (payment.status !== "completed") continue;
        
        const course = courses.find(c => c.id === payment.courseId);
        if (!course) continue;
        
        const tutorId = course.tutorId;
        if (!tutorMap.has(tutorId)) {
          const tutor = await storage.getUser(tutorId);
          tutorMap.set(tutorId, {
            tutorId,
            name: tutor ? `${tutor.firstName} ${tutor.lastName}` : 'Unknown',
            revenue: 0,
            commissions: 0,
            sales: 0,
            tutorAmount: 0
          });
        }
        
        const tutorData = tutorMap.get(tutorId);
        tutorData.revenue += payment.amount;
        tutorData.commissions += payment.adminCommission;
        tutorData.sales += 1;
        tutorData.tutorAmount += payment.tutorAmount;
      }
      
      const topTutors = Array.from(tutorMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      
      res.json({
        totalCommissions,
        totalSales,
        salesCount: payments.filter(p => p.status === "completed").length,
        monthlyEarnings,
        topCourses: coursesWithRevenue.slice(0, 10),
        topTutors,
        recentPayments: payments
          .filter(p => p.status === "completed")
          .sort((a, b) => {
            const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
            const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 10)
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get all payments (Admin only)
  app.get("/api/admin/payments", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const payments = await storage.getAllPayments();
      
      // Enrich payments with course and user information
      const enrichedPayments = await Promise.all(
        payments.map(async payment => {
          const user = await storage.getUser(payment.userId);
          const course = await storage.getCourse(payment.courseId);
          
          return {
            ...payment,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            courseTitle: course ? course.title : 'Unknown',
            tutorId: course ? course.tutorId : null
          };
        })
      );
      
      // Sort by date, newest first
      enrichedPayments.sort((a, b) => {
        const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return dateB - dateA;
      });
      
      res.json(enrichedPayments);
    } catch (error) {
      next(error);
    }
  });
  
  // User Management API (Admin only)
  app.get("/api/users", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/users/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Filter out sensitive fields unless admin
      const userToReturn = req.user.role === "admin" 
        ? user 
        : { ...user, password: undefined };
      
      // Add display fields for UI
      const displayUser = {
        ...userToReturn,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.profileImage || "/avatars/default.png",
        bio: user.bio || `${user.firstName} is a ${user.role} on the EdMerge platform.`
      };
      
      res.json(displayUser);
    } catch (error) {
      next(error);
    }
  });

  // Interactive Learning Features - Polls API
  app.get("/api/courses/:courseId/polls", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // In a real implementation, we would fetch polls from the database
      // using something like storage.getPollsByCourse(courseId)
      
      // For now, return mock data
      res.json([
        {
          id: 1,
          question: "What topic would you like to review in the next session?",
          options: [
            { id: 1, text: "Data Structures", votes: 12 },
            { id: 2, text: "Algorithms", votes: 8 },
            { id: 3, text: "System Design", votes: 5 }
          ],
          isActive: true,
          totalVotes: 25,
          createdBy: 1,
          courseId: courseId,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          id: 2,
          question: "How do you prefer to receive feedback on assignments?",
          options: [
            { id: 1, text: "Written comments", votes: 15 },
            { id: 2, text: "Video feedback", votes: 7 },
            { id: 3, text: "One-on-one sessions", votes: 10 }
          ],
          isActive: true,
          totalVotes: 32,
          createdBy: 1,
          courseId: courseId,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ]);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/courses/:courseId/polls", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "tutor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only tutors and admins can create polls" });
    }
    
    try {
      const courseId = parseInt(req.params.courseId);
      const { question, options } = req.body;
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Validate input
      if (!question || !question.trim()) {
        return res.status(400).json({ message: "Question is required" });
      }
      
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: "At least 2 options are required" });
      }
      
      // In a real implementation, we would save the poll to the database
      // using something like storage.createPoll({ question, options, courseId, createdBy: req.user.id })
      
      // For now, just return a mock response
      res.status(201).json({
        id: Date.now(),
        question,
        options: options.map((text, index) => ({
          id: index + 1,
          text,
          votes: 0
        })),
        isActive: true,
        totalVotes: 0,
        createdBy: req.user.id,
        courseId,
        createdAt: new Date()
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/polls/:pollId/vote", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const pollId = parseInt(req.params.pollId);
      const { optionId } = req.body;
      
      if (!optionId) {
        return res.status(400).json({ message: "Option ID is required" });
      }
      
      // In a real implementation, we would:
      // 1. Check if the poll exists
      // 2. Check if the option exists for this poll
      // 3. Check if the user has already voted (prevent duplicate votes)
      // 4. Record the vote
      
      // For now, just return a success response
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/polls/:pollId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const pollId = parseInt(req.params.pollId);
      const { isActive } = req.body;
      
      // In a real implementation, we would:
      // 1. Check if the poll exists
      // 2. Check if the user is the creator of the poll
      // 3. Update the poll
      
      // For now, just return a success response
      res.json({ 
        id: pollId,
        isActive,
        updatedAt: new Date()
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/polls/:pollId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const pollId = parseInt(req.params.pollId);
      
      // In a real implementation, we would:
      // 1. Check if the poll exists
      // 2. Check if the user is the creator of the poll or an admin
      // 3. Delete the poll
      
      // For now, just return a success response
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Study Groups API
  app.get("/api/courses/:courseId/study-groups", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // In a real implementation, we would fetch study groups from the database
      // using something like storage.getStudyGroupsByCourse(courseId)
      
      // For now, return mock data
      res.json([
        {
          id: 1,
          name: "Advanced Mathematics Study Group",
          description: "Weekly sessions for discussing advanced math problems and solutions",
          courseId: courseId,
          createdBy: {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            avatar: "",
            role: "student"
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          meetingLink: "https://meet.google.com/abc-defg-hij",
          nextMeetingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          members: [
            {
              id: 1,
              name: "John Doe",
              email: "john@example.com",
              avatar: "",
              role: "student"
            },
            {
              id: 2,
              name: "Jane Smith",
              email: "jane@example.com",
              avatar: "",
              role: "student"
            },
            {
              id: 3,
              name: "Alex Johnson",
              email: "alex@example.com",
              avatar: "",
              role: "student"
            }
          ],
          tags: ["calculus", "linear algebra", "probability"],
          isPublic: true
        },
        {
          id: 2,
          name: "Programming Practice Group",
          description: "Practice coding problems together and review each other's solutions",
          courseId: courseId,
          createdBy: {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            avatar: "",
            role: "student"
          },
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          members: [
            {
              id: 2,
              name: "Jane Smith",
              email: "jane@example.com",
              avatar: "",
              role: "student"
            },
            {
              id: 4,
              name: "Mike Wilson",
              email: "mike@example.com",
              avatar: "",
              role: "student"
            }
          ],
          tags: ["algorithms", "data structures", "problem solving"],
          isPublic: false
        }
      ]);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/courses/:courseId/study-groups", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const courseId = parseInt(req.params.courseId);
      const { name, description, isPublic, tags } = req.body;
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Validate input
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Name is required" });
      }
      
      // In a real implementation, we would save the study group to the database
      
      // For now, just return a mock response
      res.status(201).json({
        id: Date.now(),
        name,
        description,
        courseId,
        createdBy: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
          role: req.user.role
        },
        createdAt: new Date(),
        members: [
          {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            role: req.user.role
          }
        ],
        tags: tags || [],
        isPublic: !!isPublic
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/study-groups/:groupId/messages", async (req, res, next) => {
    try {
      const groupId = parseInt(req.params.groupId);
      
      // In a real implementation, we would fetch messages from the database
      
      // For now, return mock data
      if (groupId === 1) {
        res.json([
          {
            id: 1,
            content: "Hello everyone! Looking forward to our next session.",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            sender: {
              id: 1,
              name: "John Doe",
              email: "john@example.com",
              avatar: "",
              role: "student"
            },
            groupId: 1
          },
          {
            id: 2,
            content: "Has anyone started working on the calculus assignment?",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            sender: {
              id: 2,
              name: "Jane Smith",
              email: "jane@example.com",
              avatar: "",
              role: "student"
            },
            groupId: 1
          },
          {
            id: 3,
            content: "Yes, I've completed the first 3 problems. Happy to discuss them in our next meeting.",
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            sender: {
              id: 3,
              name: "Alex Johnson",
              email: "alex@example.com",
              avatar: "",
              role: "student"
            },
            groupId: 1
          }
        ]);
      } else {
        res.json([]);
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/study-groups/:groupId/messages", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupId = parseInt(req.params.groupId);
      const { content } = req.body;
      
      // Validate input
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // In a real implementation, we would save the message to the database
      
      // For now, just return a mock response
      res.status(201).json({
        id: Date.now(),
        content,
        createdAt: new Date(),
        sender: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
          role: req.user.role
        },
        groupId
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/study-groups/:groupId/join", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupId = parseInt(req.params.groupId);
      
      // In a real implementation, we would:
      // 1. Check if the group exists
      // 2. Check if the user is already a member
      // 3. Add the user to the group
      
      // For now, just return a success response
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/study-groups/:groupId/leave", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupId = parseInt(req.params.groupId);
      
      // In a real implementation, we would:
      // 1. Check if the group exists
      // 2. Check if the user is a member
      // 3. Remove the user from the group
      
      // For now, just return a success response
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Course Content for Offline Access
  app.get("/api/courses/:courseId/contents", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // In a real implementation, we would fetch course contents from the database
      
      // For now, return mock data
      res.json([
        {
          id: 1,
          title: "Introduction to Algorithms",
          type: "video",
          fileSize: 120 * 1024 * 1024, // 120 MB
          duration: 1800, // 30 minutes
          url: "/videos/intro-algorithms.mp4",
          courseId: courseId,
          createdAt: new Date(),
          thumbnailUrl: "/thumbnails/algo-intro.jpg"
        },
        {
          id: 2,
          title: "Data Structures Overview",
          type: "pdf",
          fileSize: 8 * 1024 * 1024, // 8 MB
          url: "/docs/data-structures.pdf",
          courseId: courseId,
          createdAt: new Date()
        },
        {
          id: 3,
          title: "Sorting Algorithms",
          type: "video",
          fileSize: 250 * 1024 * 1024, // 250 MB
          duration: 2700, // 45 minutes
          url: "/videos/sorting-algos.mp4",
          courseId: courseId,
          createdAt: new Date(),
          thumbnailUrl: "/thumbnails/sorting.jpg"
        },
        {
          id: 4,
          title: "Python Programming Guide",
          type: "document",
          fileSize: 4.5 * 1024 * 1024, // 4.5 MB
          url: "/docs/python-guide.docx",
          courseId: courseId,
          createdAt: new Date()
        },
        {
          id: 5,
          title: "Database Systems",
          type: "video",
          fileSize: 180 * 1024 * 1024, // 180 MB
          duration: 3600, // 60 minutes
          url: "/videos/database-systems.mp4",
          courseId: courseId,
          createdAt: new Date(),
          thumbnailUrl: "/thumbnails/database.jpg"
        },
        {
          id: 6,
          title: "Midterm Practice Quiz",
          type: "quiz",
          fileSize: 1 * 1024 * 1024, // 1 MB
          url: "/quizzes/midterm-practice.json",
          courseId: courseId,
          createdAt: new Date()
        }
      ]);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/courses/contents/enrolled", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // In a real implementation, we would:
      // 1. Get the user's enrollments
      // 2. Get the content for each enrolled course
      
      // For now, return mock data
      res.json([
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
          id: 10,
          title: "Introduction to Calculus",
          type: "video",
          fileSize: 150 * 1024 * 1024, // 150 MB
          duration: 2400, // 40 minutes
          url: "/videos/intro-calculus.mp4",
          courseId: 2,
          createdAt: new Date(),
          thumbnailUrl: "/thumbnails/calculus.jpg"
        },
        {
          id: 11,
          title: "Limits and Derivatives",
          type: "pdf",
          fileSize: 10 * 1024 * 1024, // 10 MB
          url: "/docs/limits-derivatives.pdf",
          courseId: 2,
          createdAt: new Date()
        }
      ]);
    } catch (error) {
      next(error);
    }
  });

  // Subscription Plans API
  app.get("/api/subscription-plans", async (req, res, next) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/subscription-plans", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create subscription plans" });
    }
    
    try {
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription plan data", errors: error.format() });
      }
      next(error);
    }
  });

  // User subscriptions API
  app.get("/api/subscriptions", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const subscriptions = await storage.getSubscriptionsByUser(req.user.id);
      res.json(subscriptions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/subscriptions", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { planId, transactionId, amount } = req.body;
      
      // Check if plan exists
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Calculate subscription dates (3 months)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan.durationMonths || 3));
      
      const subscriptionData = insertSubscriptionSchema.parse({
        userId: req.user.id,
        planId,
        amount: amount || plan.price,
        transactionId,
        startDate,
        endDate,
        status: "active"
      });
      
      const subscription = await storage.createSubscription(subscriptionData);
      
      // Update user's subscription status
      await storage.updateUserSubscription(req.user.id, {
        type: plan.name.toLowerCase() === "basic" ? "basic" : "premium",
        status: "active",
        startDate,
        endDate,
        flutterwaveCustomerId: req.body.customerId,
        flutterwaveSubscriptionId: transactionId
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.format() });
      }
      next(error);
    }
  });

  // Initialize subscription plans if they don't exist
  try {
    const existingPlans = await storage.getAllSubscriptionPlans();
    if (existingPlans.length === 0) {
      console.log("Initializing subscription plans...");
      
      // Basic plan
      await storage.createSubscriptionPlan({
        name: "Basic",
        price: 3,
        currency: "USD",
        durationMonths: 3,
        description: "Access to basic features of Edmerge platform",
        features: [
          "Access to all regular courses", 
          "Limited assignment submissions", 
          "Access to student community",
          "Email support"
        ]
      });
      
      // Premium plan
      await storage.createSubscriptionPlan({
        name: "Premium", 
        price: 10,
        currency: "USD",
        durationMonths: 3,
        description: "Full access to all Edmerge platform features",
        features: [
          "Access to all courses including premium content",
          "Unlimited assignment submissions",
          "Live video sessions with tutors",
          "Access to global mentorship network",
          "Priority email and chat support",
          "Access to all research projects"
        ]
      });
      
      console.log("Subscription plans initialized.");
    }
  } catch (error) {
    console.error("Error initializing subscription plans:", error);
  }
  
  // Subscription plan API routes
  app.get("/api/subscription-plans", async (req, res, next) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/subscription-plans/:id", async (req, res, next) => {
    try {
      const plan = await storage.getSubscriptionPlan(parseInt(req.params.id));
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error) {
      next(error);
    }
  });
  
  // Subscription Keys API
  app.get("/api/subscription-keys", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can access all subscription keys" });
    }
    
    try {
      const keys = await storage.getActiveSubscriptionKeys();
      res.json(keys);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/subscription-keys/admin", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can access their created subscription keys" });
    }
    
    try {
      const keys = await storage.getSubscriptionKeysByAdmin(req.user.id);
      res.json(keys);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/subscription-keys", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create subscription keys" });
    }
    
    try {
      const { planId, description, count = 1 } = req.body;
      
      // Check if the subscription plan exists
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Generate the specified number of keys
      const keys = [];
      for (let i = 0; i < count; i++) {
        // Generate a random key value (15 chars alphanumeric)
        const keyValue = Math.random().toString(36).substring(2, 7) + 
                        Math.random().toString(36).substring(2, 7) + 
                        Math.random().toString(36).substring(2, 7);
        
        const keyData = insertSubscriptionKeySchema.parse({
          planId,
          description,
          keyValue,
          status: "active",
          createdById: req.user.id,
          // Optional expiration date, 3 months from now
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });
        
        const key = await storage.createSubscriptionKey(keyData);
        keys.push(key);
      }
      
      res.status(201).json(keys);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription key data", errors: error.format() });
      }
      next(error);
    }
  });
  
  app.post("/api/subscription-keys/:id/revoke", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can revoke subscription keys" });
    }
    
    try {
      const keyId = parseInt(req.params.id);
      const success = await storage.revokeSubscriptionKey(keyId);
      
      if (!success) {
        return res.status(400).json({ 
          message: "Failed to revoke subscription key. It might be already used or not exist." 
        });
      }
      
      res.json({ 
        message: "Subscription key revoked successfully",
        success: true
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/subscription-keys/redeem", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { keyValue } = req.body;
      
      if (!keyValue) {
        return res.status(400).json({ message: "Subscription key is required" });
      }
      
      const redeemedKey = await storage.redeemSubscriptionKey(keyValue, req.user.id);
      
      if (!redeemedKey) {
        return res.status(400).json({ 
          message: "Failed to redeem subscription key. It might be invalid, already used, or expired." 
        });
      }
      
      // Get the plan details
      const plan = await storage.getSubscriptionPlan(redeemedKey.planId);
      
      // Get the updated user info
      const user = await storage.getUser(req.user.id);
      
      res.json({
        message: "Subscription key redeemed successfully",
        key: redeemedKey,
        plan,
        user
      });
    } catch (error) {
      next(error);
    }
  });
  
  // User subscription status
  app.get("/api/user/subscription", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Temporarily disable subscription requirement check
      // Return as if all users have active subscription
      return res.json({
        hasActiveSubscription: true,
        subscription: {
          id: 1,
          userId: req.user.id,
          planId: 1,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year in the future
          createdAt: new Date(),
          planName: 'Premium',
          planFeatures: ['Complete Course Access', 'AI Tutor Access', 'Live Sessions', 'Priority Support']
        }
      });
      
      /* Original subscription check (commented out)
      const subscriptions = await storage.getSubscriptionsByUser(req.user.id);
      
      // Find active subscription
      const now = new Date();
      const activeSubscription = subscriptions.find(
        sub => sub.status === 'active' && new Date(sub.endDate) > now
      );
      
      if (!activeSubscription) {
        return res.json({
          hasActiveSubscription: false,
          message: "No active subscription found",
          requiresSubscription: true
        });
      }
      
      // Get the plan details
      const plan = await storage.getSubscriptionPlan(activeSubscription.planId);
      
      res.json({
        hasActiveSubscription: true,
        subscription: {
          ...activeSubscription,
          planName: plan?.name,
          planFeatures: plan?.features
        }
      });
      */
    } catch (error) {
      next(error);
    }
  });
  
  // Verify and process Flutterwave payment for subscription
  app.post("/api/verify-subscription-payment", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { planId, transactionId, amount, tx_ref } = req.body;
      
      if (!planId || !transactionId || !amount || !tx_ref) {
        return res.status(400).json({ message: "Missing required payment information" });
      }
      
      // Verify the transaction with Flutterwave
      const verificationUrl = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
      
      try {
        // Make API request to Flutterwave to verify the transaction
        const response = await fetch(verificationUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        const verificationData = await response.json();
        
        // Check if transaction is valid and successful
        if (
          verificationData.status === "success" && 
          verificationData.data && 
          verificationData.data.status === "successful" &&
          verificationData.data.tx_ref === tx_ref
        ) {
          // Get the subscription plan
          const plan = await storage.getSubscriptionPlan(planId);
          
          if (!plan) {
            return res.status(404).json({ message: "Subscription plan not found" });
          }
          
          // Calculate subscription duration (3 months by default if not specified)
          const durationMonths = plan.durationMonths || 3;
          
          // Create start and end dates
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + durationMonths);
          
          // Create the subscription record
          const subscription = await storage.createSubscription({
            userId: req.user.id,
            planId,
            status: "active",
            amount,
            transactionId,
            startDate,
            endDate
          });
          
          // Update user's subscription type based on the plan
          const planType = plan.name.toLowerCase().includes("premium") ? "premium" : "basic";
          await storage.updateUser(req.user.id, { subscriptionType: planType });
          
          // Return success response
          return res.status(200).json({
            message: "Payment verified and subscription activated successfully",
            planId,
            subscription
          });
        } else {
          // Transaction verification failed
          return res.status(400).json({ 
            message: "Payment verification failed. Transaction was not successful."
          });
        }
      } catch (verificationError) {
        console.error("Error verifying Flutterwave payment:", verificationError);
        return res.status(500).json({ 
          message: "Failed to verify payment with Flutterwave"
        });
      }
    } catch (error) {
      console.error("Error processing subscription payment:", error);
      next(error);
    }
  });
  
  // Flutterwave payment initiation for subscriptions
  app.post("/api/subscribe", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { planId } = req.body;
      
      // Validate plan exists
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);
      
      // Create a reference ID for this transaction
      const reference = `sub_${req.user.id}_${Date.now()}`;
      
      // Create payment payload
      const payload = {
        tx_ref: reference,
        amount: plan.price,
        currency: plan.currency || "USD",
        redirect_url: `${req.protocol}://${req.get('host')}/api/subscription/verify`,
        callback_url: `${req.protocol}://${req.get('host')}/api/subscription/verify`,
        customer: {
          email: req.user.email,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        meta: {
          plan_id: plan.id,
          user_id: req.user.id,
          subscription_months: plan.durationMonths
        }
      };
      
      // Call Flutterwave API to initialize payment
      console.log("Attempting to initialize Flutterwave payment with payload:", JSON.stringify(payload));
      console.log("Using secret key:", process.env.FLUTTERWAVE_SECRET_KEY?.substring(0, 10) + "...");
      
      try {
        const response = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
          },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log("Flutterwave API response:", JSON.stringify(data));
        
        if (data.status !== 'success') {
          console.error("Flutterwave payment initialization failed:", data);
          return res.status(400).json({
            message: "Failed to initialize payment",
            error: data.message
          });
        }
      } catch (error) {
        console.error("Error calling Flutterwave API:", error);
        return res.status(500).json({
          message: "Error processing payment request",
          error: error.message
        });
      }
      
      // Store subscription in pending state
      await storage.createSubscription({
        userId: req.user.id,
        planId: plan.id,
        amount: plan.price,
        status: 'pending',
        transactionId: reference,
        startDate,
        endDate
      });
      
      let paymentLink = '';
      try {
        const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
          },
          body: JSON.stringify(payload)
        });
        
        const flutterwaveData = await flutterwaveResponse.json();
        
        if (flutterwaveData.status !== 'success') {
          console.error("Flutterwave payment initialization failed:", flutterwaveData);
          return res.status(400).json({
            message: "Failed to initialize payment",
            error: flutterwaveData.message
          });
        }
        
        // Get payment link from successful response
        paymentLink = flutterwaveData.data.link;
      } catch (err) {
        console.error("Error calling Flutterwave API:", err);
        return res.status(500).json({
          message: "Error processing payment request",
          error: err.message
        });
      }
      
      // Return payment link to client
      res.json({
        status: 'success',
        message: 'Payment initiated',
        paymentLink,
        reference
      });
    } catch (error) {
      console.error("Subscription payment error:", error);
      next(error);
    }
  });
  
  // Verify subscription payment
  app.get("/api/subscription/verify", async (req, res, next) => {
    try {
      const { transaction_id, tx_ref } = req.query;
      
      console.log("Payment verification initiated. Query params:", req.query);
      
      if (!tx_ref) {
        console.error("Payment verification failed: No reference provided");
        return res.status(400).json({ message: "Reference not provided" });
      }
      
      console.log(`Verifying transaction with reference: ${tx_ref}`);
      console.log("Using secret key:", process.env.FLUTTERWAVE_SECRET_KEY?.substring(0, 10) + "...");
      
      try {
        // Verify the transaction with Flutterwave
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
          }
        });
        
        const data = await response.json();
        console.log("Flutterwave verification response:", JSON.stringify(data));
        
        if (data.status !== 'success' || (data.data && data.data.status !== 'successful')) {
          console.error("Payment verification failed:", data);
          return res.status(400).json({
            message: "Payment verification failed",
            error: data.message
          });
        }
      } catch (error) {
        console.error("Error verifying payment with Flutterwave:", error);
        return res.status(500).json({
          message: "Error verifying payment",
          error: error.message
        });
      }
      
      // Find the subscription with this reference
      const subscriptions = await storage.getAllSubscriptions();
      const subscription = subscriptions.find(sub => sub.transactionId === tx_ref);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      // Update subscription status and user subscription status
      await storage.updateSubscription(subscription.id, {
        status: 'active'
      });
      
      // Update user subscription information - without Flutterwave customer info for now
      await storage.updateUserSubscription(subscription.userId, {
        type: subscription.planId === 1 ? 'basic' : 'premium',
        status: 'active',
        startDate: subscription.startDate,
        endDate: subscription.endDate
      });
      
      // Redirect to success page
      res.redirect(`/subscription/success?plan_id=${subscription.planId}`);
    } catch (error) {
      console.error("Subscription verification error:", error);
      // Redirect to error page
      res.redirect('/subscription/error');
    }
  });
  
  // Webhook to receive Flutterwave payment notifications
  app.post("/api/flutterwave/webhook", async (req, res) => {
    try {
      // Verify webhook signature (in production, you should validate the signature)
      const secretHash = req.headers['verif-hash'];
      
      // This is not the recommended way for production, but for demonstration purposes
      // if (secretHash !== process.env.FLUTTERWAVE_SECRET_HASH) {
      //   return res.status(401).end();
      // }
      
      const payload = req.body;
      
      // Process based on event type
      if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
        const { tx_ref, customer } = payload.data;
        
        // Find the subscription with this reference
        const subscriptions = await storage.getAllSubscriptions();
        const subscription = subscriptions.find(sub => sub.transactionId === tx_ref);
        
        if (subscription) {
          // Update subscription status
          await storage.updateSubscription(subscription.id, {
            status: 'active'
          });
          
          // Update user subscription status
          await storage.updateUserSubscription(subscription.userId, {
            type: subscription.planId === 1 ? 'basic' : 'premium',
            status: 'active',
            startDate: subscription.startDate,
            endDate: subscription.endDate
          });
          
          console.log(`Subscription ${subscription.id} activated via webhook`);
        }
      }
      
      // Always acknowledge receipt of webhook
      return res.status(200).end();
    } catch (error) {
      console.error("Webhook processing error:", error);
      return res.status(500).end();
    }
  });

  // CV Generator API
  
  // Get all CV templates
  // Function to remove duplicate CV templates
  async function removeDuplicateTemplates() {
    console.log("Checking for duplicate CV templates...");
    
    try {
      // Get existing templates
      const allTemplates = await storage.getAllCvTemplates();
      console.log(`Found ${allTemplates.length} CV templates in total`);
      
      // Create a map to identify duplicates by name
      const uniqueTemplateNames = new Set<string>();
      const templatesToKeep: number[] = [];
      const templatesToRemove: number[] = [];
      
      // Find duplicates based on name
      for (const template of allTemplates) {
        if (uniqueTemplateNames.has(template.name)) {
          // This is a duplicate, mark for removal
          templatesToRemove.push(template.id);
          console.log(`Duplicate found: "${template.name}" (ID: ${template.id})`);
        } else {
          // This is unique, keep it
          uniqueTemplateNames.add(template.name);
          templatesToKeep.push(template.id);
        }
      }
      
      // Remove the duplicates
      if (templatesToRemove.length > 0) {
        console.log(`Removing ${templatesToRemove.length} duplicate templates...`);
        
        for (const id of templatesToRemove) {
          await storage.deleteCvTemplate(id);
          console.log(`Removed template with ID: ${id}`);
        }
        
        console.log("Duplicate removal completed.");
      } else {
        console.log("No duplicates found. No templates were removed.");
      }
      
      console.log(`Remaining templates: ${templatesToKeep.length}`);
      
      return {
        totalBefore: allTemplates.length,
        duplicatesRemoved: templatesToRemove.length,
        remaining: templatesToKeep.length
      };
      
    } catch (error) {
      console.error("Error removing duplicate templates:", error);
      throw error;
    }
  }

  app.get("/api/cv/templates", async (req, res, next) => {
    try {
      const templates = await storage.getAllCvTemplates();
      res.json(templates);
    } catch (error) {
      next(error);
    }
  });
  
  // Endpoint to remove duplicate CV templates (admin only)
  app.post("/api/cv/templates/remove-duplicates", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can perform this operation" });
    }
    
    try {
      const result = await removeDuplicateTemplates();
      res.json({
        message: "Duplicate templates removed successfully",
        ...result
      });
    } catch (error) {
      console.error("Failed to remove duplicate templates:", error);
      res.status(500).json({ message: "Failed to remove duplicate templates" });
    }
  });
  
  // Temporary endpoint has been removed after use
  
  // Get CV templates by type
  app.get("/api/cv/templates/type/:type", async (req, res, next) => {
    try {
      const { type } = req.params;
      const templates = await storage.getCvTemplatesByType(type);
      res.json(templates);
    } catch (error) {
      next(error);
    }
  });
  
  // Get specific CV template
  app.get("/api/cv/templates/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getCvTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "CV template not found" });
      }
      
      res.json(template);
    } catch (error) {
      next(error);
    }
  });
  
  // Get user's CVs
  app.get("/api/user/cvs", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const cvs = await storage.getUserCvs(req.user.id);
      res.json(cvs);
    } catch (error) {
      next(error);
    }
  });
  
  // Get specific user CV
  app.get("/api/user/cvs/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const cvId = parseInt(req.params.id);
      const cv = await storage.getUserCv(cvId);
      
      if (!cv) {
        return res.status(404).json({ message: "CV not found" });
      }
      
      // Ensure user owns this CV
      if (cv.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this CV" });
      }
      
      res.json(cv);
    } catch (error) {
      next(error);
    }
  });
  
  // Get user's CV generation count
  app.get("/api/user/cv-generation-count", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const count = await storage.getUserCvGenerationCount(req.user.id);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  });
  
  // User settings update endpoint
  app.patch("/api/user/settings", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Processing settings update for user ID:", req.user.id);
      console.log("Request body:", JSON.stringify(req.body));
      
      const { firstName, lastName, email, studentLevel, bio, profileImage } = req.body;
      
      // Create update data object
      const updateData: any = {
        firstName,
        lastName,
        email,
        studentLevel,
        bio,
        profileImage,
        updatedAt: new Date()
      };
      
      // Add notifications and preferences to the user object directly
      // This allows us to store these settings without needing separate tables
      if (req.body.notifications) {
        updateData.notificationSettings = JSON.stringify(req.body.notifications);
        console.log("Notification settings saved to DB:", updateData.notificationSettings);
      }
      
      if (req.body.preferences) {
        updateData.preferenceSettings = JSON.stringify(req.body.preferences);
        console.log("Preference settings saved to DB:", updateData.preferenceSettings);
      }
      
      console.log("Updating user with data:", JSON.stringify(updateData));
      
      // Update user with real-time data from database
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      
      if (!updatedUser) {
        console.error("User not found for ID:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("User updated successfully:", updatedUser.id);
      
      // Send back success response with updated user data
      res.json({ 
        message: "Settings updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      next(error);
    }
  });
  
  // Create new CV for user
  app.post("/api/user/cvs", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Check if user has a valid subscription or is within free limit (10)
      const userCvCount = await storage.getUserCvGenerationCount(req.user.id);
      const subscriptionType = req.user.subscriptionType || 'none';
      const subscriptionStatus = req.user.subscriptionStatus || 'inactive';
      
      // If user has no subscription and has reached free limit
      if (subscriptionType === 'none' || subscriptionStatus !== 'active') {
        if (userCvCount >= 10) {
          return res.status(403).json({ 
            message: "You have reached the free CV generation limit. Please subscribe to create more CVs.",
            cvCount: userCvCount
          });
        }
      }
      
      const cvData = insertUserCvSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if template exists
      const template = await storage.getCvTemplate(cvData.templateId);
      if (!template) {
        return res.status(404).json({ message: "CV template not found" });
      }
      
      const cv = await storage.createUserCv(cvData);
      res.status(201).json(cv);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid CV data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Update user's CV
  app.put("/api/user/cvs/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const cvId = parseInt(req.params.id);
      const cv = await storage.getUserCv(cvId);
      
      if (!cv) {
        return res.status(404).json({ message: "CV not found" });
      }
      
      // Ensure user owns this CV
      if (cv.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this CV" });
      }
      
      const updatedCv = await storage.updateUserCv(cvId, req.body);
      res.json(updatedCv);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete user's CV
  app.delete("/api/user/cvs/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const cvId = parseInt(req.params.id);
      const cv = await storage.getUserCv(cvId);
      
      if (!cv) {
        return res.status(404).json({ message: "CV not found" });
      }
      
      // Ensure user owns this CV
      if (cv.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this CV" });
      }
      
      const success = await storage.deleteUserCv(cvId);
      
      if (success) {
        res.status(200).json({ message: "CV deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete CV" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // CV Payment API Endpoints
  
  // Get all CV payments (admin only)
  app.get("/api/cv-payments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can access this resource" });
    }
    
    try {
      const payments = await storage.getAllCvPayments();
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });
  
  // Get current user's CV payments
  app.get("/api/user/cv-payments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const payments = await storage.getCvPaymentsByUser(req.user.id);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });
  
  // Get specific CV payment
  app.get("/api/cv-payments/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getCvPayment(id);
      
      if (!payment) {
        return res.status(404).json({ message: "CV payment not found" });
      }
      
      // Only allow users to access their own payments or admins to access any payment
      if (payment.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to access this payment" });
      }
      
      res.json(payment);
    } catch (error) {
      next(error);
    }
  });
  
  // Create CV payment
  app.post("/api/cv-payments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { transactionId, amount, currency, cvId } = req.body;
      
      if (!transactionId || !amount) {
        return res.status(400).json({ message: "Transaction ID and amount are required" });
      }
      
      const payment = await storage.createCvPayment({
        userId: req.user.id,
        transactionId,
        amount,
        currency: currency || "NGN",
        cvId: cvId || null,
        status: "pending", // Initially pending until confirmed by webhook
        createdAt: new Date(),
        completedAt: null
      });
      
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  });
  
  // Update CV payment status (used by webhook or admin)
  app.put("/api/cv-payments/:id", async (req, res, next) => {
    // For webhook updates, we don't require authentication
    // In a production app, webhook requests should be verified with signatures
    
    try {
      const id = parseInt(req.params.id);
      const { status, completedAt } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Check if payment exists
      const existingPayment = await storage.getCvPayment(id);
      if (!existingPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Update payment
      const payment = await storage.updateCvPayment(id, {
        status,
        completedAt: completedAt || (status === "completed" ? new Date() : null)
      });
      
      res.json(payment);
    } catch (error) {
      next(error);
    }
  });
  
  // Chat API routes
  app.get('/api/chat/messages/:roomId', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const roomId = req.params.roomId;
      const messages = await storage.getChatMessagesByRoom(roomId);
      
      // Sort messages by createdAt date
      messages.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB; // Ascending order (oldest first)
      });
      
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/chat/messages', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Setup research routes
  setupResearchRoutes(app);
  
  // Setup research agent routes
  registerResearchAgentRoutes(app);
  
  // Messaging API routes for end-to-end encrypted messaging
  
  // Get users for messaging by role and/or level
  app.get("/api/messages/users", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { role, level } = req.query;
      let users: any[] = [];
      
      if (role && level) {
        users = await storage.getUsersForMessaging(role as string, level as string);
      } else if (role) {
        users = await storage.getUsersByRole(role as string);
      } else if (level) {
        users = await storage.getUsersByStudentLevel(level as string);
      } else {
        users = await storage.getAllUsers();
      }
      
      // Filter out sensitive information
      const filteredUsers = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImage: user.profileImage,
        role: user.role,
        studentLevel: user.studentLevel,
        bio: user.bio
      }));
      
      res.json(filteredUsers);
    } catch (error) {
      next(error);
    }
  });
  
  // Get chat messages for a specific room
  app.get("/api/messages/room/:roomId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { roomId } = req.params;
      const messages = await storage.getChatMessagesByRoom(roomId);
      
      // Sort messages by createdAt
      messages.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
      
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  // Get recent chat rooms for a user
  app.get("/api/messages/recent", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const rooms = await storage.getRecentChatRooms(req.user.id);
      
      // Enhance room data with user information
      const enhancedRooms = await Promise.all(rooms.map(async (room) => {
        // Extract user IDs from the room ID (format: user1-user2)
        const userIds = room.roomId.split('-').map(Number);
        
        // Get the other user in the conversation
        const otherUserId = userIds.find(id => id !== req.user.id);
        const otherUser = otherUserId ? await storage.getUser(otherUserId) : null;
        
        return {
          ...room,
          otherUser: otherUser ? {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            username: otherUser.username,
            profileImage: otherUser.profileImage,
            role: otherUser.role
          } : null
        };
      }));
      
      res.json(enhancedRooms);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new chat message via HTTP (as backup for WebSocket)
  app.post("/api/messages", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const message = await storage.createChatMessage(messageData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chat_message',
            userId: req.user.id,
            username: req.user.username,
            message: messageData.message,
            timestamp: new Date().toISOString(),
            roomId: messageData.roomId,
            messageType: messageData.type || 'text',
            fileUrl: messageData.fileUrl || null
          }));
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.format() });
      }
      next(error);
    }
  });
  
  // Return the HTTP server created earlier
  return httpServer;
}
