import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { WebSocket, WebSocketServer } from "ws";
import { MentorSession, InsertMentorSession } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { validateRequest } from "../middleware/validateRequest";
import { transactionManager } from "../database/transaction";

const mentorRouter = Router();
const wss = new WebSocketServer({ noServer: true });
const clients = new Map<string, WebSocket>();

// Simple console logging function to replace logger
const log = {
  error: (message: string, details?: any) => {
    console.error(`ERROR: ${message}`, details || '');
  },
  info: (message: string, details?: any) => {
    console.info(`INFO: ${message}`, details || '');
  }
};

// Zod schemas for validation
const createSessionSchema = z.object({
  mentorshipId: z.number().positive(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(15).max(120),
  notes: z.string().optional(),
  meetingUrl: z.string().url().optional()
});

const updateSessionSchema = z.object({
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration: z.number().min(15).max(120).optional(),
  notes: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  status: z.enum(["scheduled", "completed", "canceled"]).optional()
});

const withdrawalSchema = z.object({
  amount: z.number().positive(),
  accountDetails: z.object({
    accountName: z.string(),
    accountNumber: z.string(),
    bankName: z.string(),
    routingNumber: z.string().optional(),
    paymentMethod: z.enum(["bank", "paypal", "stripe"])
  })
});

// Middleware to check if user is a mentor
function requireMentorRole(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  if (req.user && req.user.role !== "mentor") {
    return res.status(403).json({ message: "Access denied. Mentor role required." });
  }
  next();
}

// Helper function to send real-time notification
function sendNotification(userId: number, type: string, data: any) {
  const userIdStr = userId.toString();
  if (clients.has(userIdStr)) {
    const client = clients.get(userIdStr);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      }));
    }
  }
}

// Setup WebSocket connection
mentorRouter.ws = function setupWebSocketHandlers(server: any) {
  server.on('upgrade', (request: any, socket: any, head: any) => {
    // Extract user token from URL or headers for authentication
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    // Authenticate the WebSocket connection
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Verify token and get userId
    try {
      // This would typically use your authentication service
      const userId = verifyToken(token);

      wss.handleUpgrade(request, socket, head, (ws) => {
        const clientId = userId.toString();
        clients.set(clientId, ws);

        ws.on('close', () => {
          clients.delete(clientId);
        });

        ws.on('message', (message) => {
          // Handle any messages from client if needed
          try {
            const parsedMessage = JSON.parse(message.toString());
            // Handle different message types
            if (parsedMessage.type === 'ping') {
              ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            }
          } catch (error) {
            log.error('Invalid WebSocket message format', error);
          }
        });

        // Send initial connection confirmation
        ws.send(JSON.stringify({ 
          type: 'connected', 
          message: 'Connected to mentor service',
          timestamp: new Date().toISOString()
        }));
      });
    } catch (error) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });
};

// Utility function to verify token (simplified - use your actual auth service)
function verifyToken(token: string): number {
  // This is a placeholder - implement your actual token verification
  // Return the userId associated with the token
  return parseInt(token.split('-')[0]);
}

// Get mentor's mentorships with student information
mentorRouter.get("/mentorships/mentor", requireMentorRole, async (req, res, next) => {
  try {
    const mentorId = req.user!.id;
    const mentorships = await storage.getMentorshipsByMentor(mentorId);

    // Get student information for each mentorship with pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedMentorships = mentorships.slice(startIndex, endIndex);

    const mentorshipsWithStudents = await Promise.all(
      paginatedMentorships.map(async (mentorship) => {
        try {
          const student = await storage.getUser(mentorship.studentId);
          if (!student) {
            return {
              ...mentorship,
              student: {
                id: mentorship.studentId,
                firstName: "Unknown",
                lastName: "Student",
                email: "",
                profileImage: null,
                studentLevel: null,
                bio: null
              }
            };
          }

          return {
            ...mentorship,
            student: {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
              profileImage: student.profileImage,
              studentLevel: student.studentLevel,
              bio: student.bio
            }
          };
        } catch (error) {
          log.error('Error fetching student data for mentorship', { 
            mentorshipId: mentorship.id, 
            studentId: mentorship.studentId,
            error
          });

          // Return mentorship with placeholder student data to prevent entire request failure
          return {
            ...mentorship,
            student: {
              id: mentorship.studentId,
              firstName: "Unknown",
              lastName: "Student",
              email: "",
              profileImage: null,
              studentLevel: null,
              bio: null
            }
          };
        }
      })
    );

    res.json({
      mentorships: mentorshipsWithStudents,
      totalCount: mentorships.length,
      page,
      limit,
      totalPages: Math.ceil(mentorships.length / limit)
    });
  } catch (error) {
    log.error('Error fetching mentorships', { error, userId: req.user!.id });
    next(error);
  }
});

// Get mentor's sessions with filtering and pagination
mentorRouter.get("/mentor/sessions", requireMentorRole, async (req, res, next) => {
  try {
    const mentorId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const filters = {
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };

    const { sessions, total } = await storage.getMentorSessionsWithFilters(
      mentorId, 
      filters, 
      page, 
      limit
    );

    // Get student information for each session
    const sessionsWithStudentInfo = await Promise.all(
      sessions.map(async (session) => {
        try {
          // Get mentorship to find student
          const mentorship = await storage.getMentorship(session.mentorshipId);
          if (!mentorship) {
            return {
              ...session,
              studentName: "Unknown Student",
              studentId: 0
            };
          }

          const student = await storage.getUser(mentorship.studentId);
          const studentName = student 
            ? `${student.firstName} ${student.lastName}`
            : "Unknown Student";

          return {
            ...session,
            studentName,
            studentId: mentorship.studentId
          };
        } catch (error) {
          log.error('Error fetching student data for session', { 
            sessionId: session.id,
            mentorshipId: session.mentorshipId,
            error
          });

          return {
            ...session,
            studentName: "Unknown Student",
            studentId: 0
          };
        }
      })
    );

    res.json({
      sessions: sessionsWithStudentInfo,
      totalCount: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    log.error('Error fetching mentor sessions', { error, userId: req.user!.id });
    next(error);
  }
});

// Create a mentor session with validation
mentorRouter.post(
  "/mentor/sessions", 
  requireMentorRole, 
  validateRequest, 
  async (req, res, next) => {
    const trx = await transactionManager.start();

    try {
      const mentorId = req.user!.id;
      const { mentorshipId, scheduledDate, scheduledTime, duration, notes, meetingUrl } = req.body;

      // Validate that mentorship belongs to this mentor
      const mentorship = await storage.getMentorship(mentorshipId, trx);
      if (!mentorship || mentorship.mentorId !== mentorId) {
        await trx.rollback();
        return res.status(403).json({ message: "You don't have permission to create sessions for this mentorship" });
      }

      // Check for scheduling conflicts
      const conflictingSessions = await storage.checkMentorSessionConflicts(
        mentorId,
        scheduledDate,
        scheduledTime,
        duration,
        trx
      );

      if (conflictingSessions.length > 0) {
        await trx.rollback();
        return res.status(409).json({ 
          message: "Scheduling conflict detected", 
          conflicts: conflictingSessions 
        });
      }

      const session = await storage.createMentorSession({
        mentorshipId,
        scheduledDate,
        scheduledTime,
        duration,
        notes,
        meetingUrl,
        status: "scheduled"
      }, trx);

      // Send notification to student about new session
      sendNotification(mentorship.studentId, 'session_created', {
        sessionId: session.id,
        mentorName: req.user!.firstName + ' ' + req.user!.lastName,
        scheduledDate,
        scheduledTime
      });

      await trx.commit();

      res.status(201).json(session);
    } catch (error) {
      await trx.rollback();
      log.error('Error creating mentor session', { error, userId: req.user!.id });
      next(error);
    }
  }
);

// Update a mentor session with validation
mentorRouter.patch(
  "/mentor/sessions/:id", 
  requireMentorRole, 
  validateRequest(updateSessionSchema), 
  async (req, res, next) => {
    const trx = await transactionManager.start();

    try {
      const mentorId = req.user!.id;
      const sessionId = parseInt(req.params.id);

      // Validate that session exists
      const session = await storage.getMentorSession(sessionId, trx);
      if (!session) {
        await trx.rollback();
        return res.status(404).json({ message: "Session not found" });
      }

      // Validate that session belongs to this mentor
      const mentorship = await storage.getMentorship(session.mentorshipId, trx);
      if (!mentorship || mentorship.mentorId !== mentorId) {
        await trx.rollback();
        return res.status(403).json({ message: "You don't have permission to update this session" });
      }

      // Check for scheduling conflicts if date/time is being updated
      if (req.body.scheduledDate || req.body.scheduledTime) {
        const scheduledDate = req.body.scheduledDate || session.scheduledDate;
        const scheduledTime = req.body.scheduledTime || session.scheduledTime;
        const duration = req.body.duration || session.duration;

        const conflictingSessions = await storage.checkMentorSessionConflicts(
          mentorId,
          scheduledDate,
          scheduledTime,
          duration,
          trx,
          sessionId // Exclude current session from conflict check
        );

        if (conflictingSessions.length > 0) {
          await trx.rollback();
          return res.status(409).json({ 
            message: "Scheduling conflict detected", 
            conflicts: conflictingSessions 
          });
        }
      }

      const updatedSession = await storage.updateMentorSession(sessionId, req.body, trx);

      // Send notification to student about updated session
      sendNotification(mentorship.studentId, 'session_updated', {
        sessionId: updatedSession.id,
        mentorName: req.user!.firstName + ' ' + req.user!.lastName,
        scheduledDate: updatedSession.scheduledDate,
        scheduledTime: updatedSession.scheduledTime,
        status: updatedSession.status
      });

      await trx.commit();

      res.json(updatedSession);
    } catch (error) {
      await trx.rollback();
      log.error('Error updating mentor session', { error, userId: req.user!.id, sessionId: req.params.id });
      next(error);
    }
  }
);

// Cancel a session with notification
mentorRouter.post("/mentor/sessions/:id/cancel", requireMentorRole, async (req, res, next) => {
  const trx = await transactionManager.start();

  try {
    const mentorId = req.user!.id;
    const sessionId = parseInt(req.params.id);
    const { cancellationReason } = req.body;

    // Validate that session exists
    const session = await storage.getMentorSession(sessionId, trx);
    if (!session) {
      await trx.rollback();
      return res.status(404).json({ message: "Session not found" });
    }

    // Validate that session belongs to this mentor
    const mentorship = await storage.getMentorship(session.mentorshipId, trx);
    if (!mentorship || mentorship.mentorId !== mentorId) {
      await trx.rollback();
      return res.status(403).json({ message: "You don't have permission to cancel this session" });
    }

    // Check if session can be canceled (not in the past, not already canceled)
    const currentDate = new Date();
    const sessionDate = new Date(`${session.scheduledDate}T${session.scheduledTime}`);

    if (sessionDate < currentDate) {
      await trx.rollback();
      return res.status(400).json({ message: "Cannot cancel a session that has already passed" });
    }

    if (session.status === "canceled") {
      await trx.rollback();
      return res.status(400).json({ message: "Session is already canceled" });
    }

    // Update session status to canceled
    const updatedSession = await storage.updateMentorSession(
      sessionId, 
      { 
        status: "canceled",
        notes: cancellationReason ? 
          (session.notes ? `${session.notes}\n\nCancellation Reason: ${cancellationReason}` : `Cancellation Reason: ${cancellationReason}`) 
          : session.notes
      },
      trx
    );

    // Send notification to student about canceled session
    sendNotification(mentorship.studentId, 'session_canceled', {
      sessionId: updatedSession.id,
      mentorName: req.user!.firstName + ' ' + req.user!.lastName,
      scheduledDate: updatedSession.scheduledDate,
      scheduledTime: updatedSession.scheduledTime,
      cancellationReason
    });

    await trx.commit();

    res.json(updatedSession);
  } catch (error) {
    await trx.rollback();
    log.error('Error canceling session', { error, userId: req.user!.id, sessionId: req.params.id });
    next(error);
  }
});

// Get mentor's earnings summary with date range filtering
mentorRouter.get("/mentor/earnings", requireMentorRole, async (req, res, next) => {
  try {
    const mentorId = req.user!.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Get mentor's total earnings with optional date range
    const totalEarnings = await storage.getMentorEarnings(mentorId, startDate, endDate);

    // Get pending withdrawals
    const pendingWithdrawals = await storage.getPendingWithdrawalAmount(mentorId);

    // Get completed withdrawals with optional date range
    const completedWithdrawals = await storage.getCompletedWithdrawalAmount(mentorId, startDate, endDate);

    // Get total sessions count with optional date range
    const { sessions, total } = await storage.getMentorSessionsWithFilters(
      mentorId,
      { 
        status: "completed",
        startDate,
        endDate
      },
      1,
      0 // No limit for counting
    );

    // Calculate available balance
    const availableBalance = totalEarnings - completedWithdrawals - pendingWithdrawals;

    // Get monthly breakdown if requested
    let monthlyBreakdown = null;
    if (req.query.includeMonthly === 'true') {
      monthlyBreakdown = await storage.getMentorMonthlyEarnings(mentorId, startDate, endDate);
    }

    res.json({
      totalEarnings,
      availableBalance,
      pendingWithdrawals,
      completedWithdrawals,
      totalSessions: total,
      dateRange: {
        startDate: startDate || 'all-time',
        endDate: endDate || 'present'
      },
      monthlyBreakdown
    });
  } catch (error) {
    log.error('Error fetching mentor earnings', { error, userId: req.user!.id });
    next(error);
  }
});

// Create a withdrawal request with validation
mentorRouter.post(
  "/mentor/withdrawals", 
  requireMentorRole,
  validateRequest(withdrawalSchema),
  async (req, res, next) => {
    const trx = await transactionManager.start();

    try {
      const mentorId = req.user!.id;
      const { amount, accountDetails } = req.body;

      // Check if mentor has enough funds
      const availableBalance = await storage.getMentorAvailableBalance(mentorId, trx);
      if (amount > availableBalance) {
        await trx.rollback();
        return res.status(400).json({ 
          message: "Insufficient funds for withdrawal",
          availableBalance,
          requestedAmount: amount
        });
      }

      // Check withdrawal limits
      const withdrawalLimits = await storage.getMentorWithdrawalLimits(mentorId);
      if (amount < withdrawalLimits.minimum) {
        await trx.rollback();
        return res.status(400).json({ 
          message: `Withdrawal amount below minimum of ${withdrawalLimits.minimum}`,
          minimum: withdrawalLimits.minimum
        });
      }

      if (amount > withdrawalLimits.maximum) {
        await trx.rollback();
        return res.status(400).json({ 
          message: `Withdrawal amount exceeds maximum of ${withdrawalLimits.maximum}`,
          maximum: withdrawalLimits.maximum
        });
      }

      // Create a unique transaction ID
      const transactionId = `${mentorId}-${uuidv4()}`;

      // Create withdrawal request with account details
      const withdrawal = await storage.createWithdrawal({
        tutorId: mentorId,
        amount,
        status: "pending",
        transactionId,
        accountDetails: JSON.stringify(accountDetails),
        requestDate: new Date().toISOString().split('T')[0],
        estimatedCompletionDate: getEstimatedCompletionDate()
      }, trx);

      await trx.commit();

      // Send notification to admin about new withdrawal request
      sendNotification(0, 'withdrawal_requested', { // 0 is placeholder for admin notification
        withdrawalId: withdrawal.id,
        mentorId,
        amount,
        transactionId
      });

      res.status(201).json({
        ...withdrawal,
        estimatedCompletionDate: withdrawal.estimatedCompletionDate
      });
    } catch (error) {
      await trx.rollback();
      log.error('Error creating withdrawal request', { error, userId: req.user!.id });
      next(error);
    }
  }
);

// Get withdrawal history
mentorRouter.get("/mentor/withdrawals", requireMentorRole, async (req, res, next) => {
  try {
    const mentorId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const { withdrawals, total } = await storage.getMentorWithdrawals(
      mentorId,
      status,
      page,
      limit
    );

    res.json({
      withdrawals,
      totalCount: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    log.error('Error fetching withdrawal history', { error, userId: req.user!.id });
    next(error);
  }
});

// Get mentor's unread messages count with real-time updates
mentorRouter.get("/mentor/messages/unread", requireMentorRole, async (req, res, next) => {
  try {
    const mentorId = req.user!.id;

    // Get all mentorships for this mentor
    const mentorships = await storage.getMentorshipsByMentor(mentorId);
    const mentorshipIds = mentorships.map(m => m.id.toString());

    // Find rooms that contain both the mentor ID and mentorship IDs
    const unreadMessages = await storage.getUnreadMessagesByRooms(mentorId, mentorshipIds);

    // Group messages by student for better detail
    const messagesByStudent = new Map<number, number>();

    for (const message of unreadMessages) {
      const mentorship = mentorships.find(m => m.id.toString() === message.roomId.split('-')[1]);
      if (mentorship) {
        const studentId = mentorship.studentId;
        messagesByStudent.set(
          studentId, 
          (messagesByStudent.get(studentId) || 0) + 1
        );
      }
    }

    // Convert to array for response
    const messageDetails = Array.from(messagesByStudent.entries()).map(([studentId, count]) => ({
      studentId,
      unreadCount: count
    }));

    res.json({
      totalUnread: unreadMessages.length,
      studentCount: messagesByStudent.size,
      messageDetails
    });
  } catch (error) {
    log.error('Error fetching unread messages', { error, userId: req.user!.id });
    next(error);
  }
});

// Mark messages as read
mentorRouter.post("/mentor/messages/mark-read", requireMentorRole, async (req, res, next) => {
  try {
    const mentorId = req.user!.id;
    const { messageIds, studentId, mentorshipId } = req.body;

    // If specific message IDs are provided, mark them as read
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      await storage.markMessagesAsRead(messageIds, mentorId);
    }
    // If studentId is provided, mark all messages from that student as read
    else if (studentId) {
      const mentorships = await storage.getMentorshipsByMentorAndStudent(mentorId, studentId);
      const mentorshipIds = mentorships.map(m => m.id.toString());
      await storage.markAllMessagesAsRead(mentorId, mentorshipIds);
    }
    // If mentorshipId is provided, mark all messages from that mentorship as read
    else if (mentorshipId) {
      await storage.markAllMessagesAsRead(mentorId, [mentorshipId.toString()]);
    }
    else {
      return res.status(400).json({ message: "Please provide messageIds, studentId, or mentorshipId" });
    }

    res.json({ success: true });
  } catch (error) {
    log.error('Error marking messages as read', { error, userId: req.user!.id });
    next(error);
  }
});

// Utility function to calculate estimated completion date (3-5 business days from now)
function getEstimatedCompletionDate(): string {
  const date = new Date();
  const businessDays = Math.floor(Math.random() * 3) + 3; // Random between 3-5 business days

  let daysAdded = 0;
  while (daysAdded < businessDays) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      daysAdded++;
    }
  }

  return date.toISOString().split('T')[0];
}

export default mentorRouter;