import { pgTable, text, serial, integer, boolean, real, timestamp, pgEnum, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const userRoleEnum = pgEnum('user_role', ['student', 'tutor', 'mentor', 'researcher', 'admin']);

// Student level enum
export const studentLevelEnum = pgEnum('student_level', ['primary', 'secondary', 'tertiary', 'individual']);

// Course status enum
export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// Subscription status enum
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'expired', 'cancelled']);

// Subscription type enum
export const subscriptionTypeEnum = pgEnum('subscription_type', ['none', 'basic', 'premium']);

// Live class status enum
export const liveClassStatusEnum = pgEnum('live_class_status', ['scheduled', 'live', 'ended', 'cancelled']);

// Chat message type enum
export const chatMessageTypeEnum = pgEnum('chat_message_type', ['text', 'image', 'file', 'system']);

// Course content type enum
export const courseContentTypeEnum = pgEnum('course_content_type', ['video', 'document', 'pdf', 'quiz', 'assignment', 'link']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  studentLevel: studentLevelEnum("student_level"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  subscriptionType: subscriptionTypeEnum("subscription_type").default("none"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("inactive"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  flutterwaveCustomerId: varchar("flutterwave_customer_id", { length: 100 }),
  flutterwaveSubscriptionId: varchar("flutterwave_subscription_id", { length: 100 }),
  libraryAccessId: varchar("library_access_id", { length: 50 }),
  cvGenerationsCount: integer("cv_generations_count").default(0),
  notificationSettings: text("notification_settings"),
  preferenceSettings: text("preference_settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  price: real("price").default(0),
  isFree: boolean("is_free").default(true),
  status: courseStatusEnum("status").default("draft"),
  category: text("category").notNull(),
  level: studentLevelEnum("level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  progress: real("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  amount: real("amount").notNull(),
  transactionId: text("transaction_id").notNull(),
  status: paymentStatusEnum("status").default("pending"),
  adminCommission: real("admin_commission").notNull(),
  tutorAmount: real("tutor_amount").notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
});

// CV Payments table for one-time CV generation payments
export const cvPayments = pgTable("cv_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  transactionId: text("transaction_id").notNull(),
  currency: varchar("currency", { length: 10 }).default("NGN"),
  status: paymentStatusEnum("status").default("pending"),
  cvId: integer("cv_id").references(() => userCvs.id), // Optional link to the generated CV
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Withdrawals table
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  transactionId: text("transaction_id"),
  status: paymentStatusEnum("status").default("pending"),
  accountDetails: text("account_details"),
  withdrawalDate: timestamp("withdrawal_date").defaultNow(),
});

// Mentorship table
export const mentorships = pgTable("mentorships", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  status: text("status").default("pending"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mentor sessions table for scheduled mentoring sessions
export const mentorSessions = pgTable("mentor_sessions", {
  id: serial("id").primaryKey(),
  mentorshipId: integer("mentorship_id").notNull().references(() => mentorships.id),
  scheduledDate: text("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").default("scheduled"),
  notes: text("notes"),
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Research Project status enum
export const researchProjectStatusEnum = pgEnum('research_project_status', ['draft', 'active', 'completed', 'on_hold']);

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  durationMonths: integer("duration_months").notNull(),
  features: text("features").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  transactionId: varchar("transaction_id", { length: 100 }),
  amount: real("amount").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription keys status enum
export const subscriptionKeyStatusEnum = pgEnum('subscription_key_status', ['active', 'used', 'revoked', 'expired']);

// Subscription Keys table
export const subscriptionKeys = pgTable("subscription_keys", {
  id: serial("id").primaryKey(),
  keyValue: varchar("key_value", { length: 64 }).notNull().unique(),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  userId: integer("user_id").references(() => users.id), // The user who redeemed the key (null if not redeemed)
  createdById: integer("created_by_id").notNull().references(() => users.id), // Admin who created the key
  status: subscriptionKeyStatusEnum("status").default("active").notNull(),
  description: text("description"),
  validUntil: timestamp("valid_until"), // Optional expiration date
  redeemedAt: timestamp("redeemed_at"), // When the key was used
  createdAt: timestamp("created_at").defaultNow(),
});

// Research Projects table
export const researchProjects = pgTable("research_projects", {
  id: serial("id").primaryKey(),
  researcherId: integer("researcher_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("draft"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  fundingSource: text("funding_source"),
  budget: real("budget"),
  price: real("price").default(0), // Price for students to purchase this research
  isFree: boolean("is_free").default(false), // Whether this research is free for students
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  collaborators: integer("collaborators").default(0),
  isPublic: boolean("is_public").default(true),
  allowCollaborators: boolean("allow_collaborators").default(true),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Research collaborators table
export const researchCollaborators = pgTable("research_collaborators", {
  id: serial("id").primaryKey(),
  researchProjectId: integer("research_project_id").notNull().references(() => researchProjects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").default("contributor"),
  status: text("status").default("invited"), // invited, active, declined, removed
  joinedAt: timestamp("joined_at"),
  invitedAt: timestamp("invited_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Research workspace table
export const researchWorkspaces = pgTable("research_workspaces", {
  id: serial("id").primaryKey(),
  researchProjectId: integer("research_project_id").notNull().references(() => researchProjects.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Research workspace documents
export const researchDocuments = pgTable("research_documents", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => researchWorkspaces.id),
  title: text("title").notNull(),
  content: text("content"),
  documentUrl: text("document_url"),
  type: text("type").default("text"), // text, pdf, spreadsheet, etc.
  createdById: integer("created_by_id").notNull().references(() => users.id),
  lastEditedById: integer("last_edited_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Research purchase table - for students to buy research projects
export const researchPurchases = pgTable("research_purchases", {
  id: serial("id").primaryKey(),
  researchProjectId: integer("research_project_id").notNull().references(() => researchProjects.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  transactionId: text("transaction_id").notNull(),
  status: paymentStatusEnum("status").default("pending"),
  researcherAmount: real("researcher_amount").notNull(), // 70% of the amount
  adminCommission: real("admin_commission").notNull(), // 30% of the amount
  purchasedAt: timestamp("purchased_at").defaultNow(),
  accessExpiresAt: timestamp("access_expires_at"), // When access expires (if applicable)
});

// Live Classes table
export const liveClasses = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: liveClassStatusEnum("status").default("scheduled"),
  scheduledStartTime: timestamp("scheduled_start_time").notNull(),
  scheduledEndTime: timestamp("scheduled_end_time").notNull(),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  streamUrl: text("stream_url"),
  roomId: text("room_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CV Template Type enum
export const cvTemplateTypeEnum = pgEnum('cv_template_type', ['classic', 'modern', 'creative', 'professional', 'academic', 'minimalist']);

// Scholarship status enum
export const scholarshipStatusEnum = pgEnum('scholarship_status', ['active', 'inactive', 'expired', 'coming_soon']);

// Scholarships table
export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  organization: text("organization").notNull(),
  amount: real("amount"),
  currency: varchar("currency", { length: 10 }).default("NGN"),
  url: text("url").notNull(),
  applicationStartDate: timestamp("application_start_date"),
  applicationDeadline: timestamp("application_deadline"),
  eligibilityCriteria: text("eligibility_criteria").array(),
  category: text("category").default("general"),
  countries: text("countries").array(),
  educationLevels: text("education_levels").array(), // ['primary', 'secondary', 'tertiary', 'all']
  status: scholarshipStatusEnum("status").default("active"),
  imageUrl: text("image_url"),
  createdById: integer("created_by_id").notNull().references(() => users.id), // Admin who created the scholarship
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CV Templates table
export const cvTemplates = pgTable("cv_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  type: cvTemplateTypeEnum("type").default("classic"),
  structure: jsonb("structure").notNull(), // JSON structure of the template
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User CVs table
export const userCvs = pgTable("user_cvs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  templateId: integer("template_id").notNull().references(() => cvTemplates.id),
  name: text("name").notNull(),
  content: jsonb("content").notNull(), // JSON content of the CV
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roomId: text("room_id").notNull(), // Can be a live class ID, mentorship ID, etc.
  message: text("message").notNull(),
  type: chatMessageTypeEnum("type").default("text"),
  fileUrl: text("file_url"), // Optional URL for file/image messages
  createdAt: timestamp("created_at").defaultNow(),
});

// Course sections table
export const courseSections = pgTable("course_sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course materials table 
export const courseMaterials = pgTable("course_materials", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  sectionId: integer("section_id").references(() => courseSections.id),
  title: text("title").notNull(),
  description: text("description"),
  type: courseContentTypeEnum("type").notNull(),
  url: text("url").notNull(),
  fileSize: integer("file_size"),
  duration: integer("duration"),
  order: integer("order").notNull(),
  isRequired: boolean("is_required").default(false),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  paymentDate: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  withdrawalDate: true,
});

export const insertMentorshipSchema = createInsertSchema(mentorships).omit({
  id: true,
  createdAt: true,
});

export const insertMentorSessionSchema = createInsertSchema(mentorSessions).omit({
  id: true,
  createdAt: true,
});

export const insertResearchProjectSchema = createInsertSchema(researchProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

// Insert schemas for subscription plans and subscriptions
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertLiveClassSchema = createInsertSchema(liveClasses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  actualStartTime: true,
  actualEndTime: true,
});

export const insertCvTemplateSchema = createInsertSchema(cvTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserCvSchema = createInsertSchema(userCvs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionKeySchema = createInsertSchema(subscriptionKeys).omit({
  id: true,
  createdAt: true,
  redeemedAt: true,
});

export const insertCourseSectionSchema = createInsertSchema(courseSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseMaterialSchema = createInsertSchema(courseMaterials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertCvPaymentSchema = createInsertSchema(cvPayments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Insert schemas for research collaborations and workspace
export const insertResearchCollaboratorSchema = createInsertSchema(researchCollaborators).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  joinedAt: true,
});

export const insertResearchWorkspaceSchema = createInsertSchema(researchWorkspaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResearchDocumentSchema = createInsertSchema(researchDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResearchPurchaseSchema = createInsertSchema(researchPurchases).omit({
  id: true,
  purchasedAt: true,
});

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Mentorship = typeof mentorships.$inferSelect;
export type InsertMentorship = z.infer<typeof insertMentorshipSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type ResearchProject = typeof researchProjects.$inferSelect;
export type InsertResearchProject = z.infer<typeof insertResearchProjectSchema>;
export type LiveClass = typeof liveClasses.$inferSelect;
export type InsertLiveClass = z.infer<typeof insertLiveClassSchema>;
export type CvTemplate = typeof cvTemplates.$inferSelect;
export type InsertCvTemplate = z.infer<typeof insertCvTemplateSchema>;
export type UserCv = typeof userCvs.$inferSelect;
export type InsertUserCv = z.infer<typeof insertUserCvSchema>;
export type SubscriptionKey = typeof subscriptionKeys.$inferSelect;
export type InsertSubscriptionKey = z.infer<typeof insertSubscriptionKeySchema>;
export type CourseSection = typeof courseSections.$inferSelect;
export type InsertCourseSection = z.infer<typeof insertCourseSectionSchema>;
export type CourseMaterial = typeof courseMaterials.$inferSelect;
export type InsertCourseMaterial = z.infer<typeof insertCourseMaterialSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type CvPayment = typeof cvPayments.$inferSelect;
export type InsertCvPayment = z.infer<typeof insertCvPaymentSchema>;
export type MentorSession = typeof mentorSessions.$inferSelect;
export type InsertMentorSession = z.infer<typeof insertMentorSessionSchema>;

// New research related types
export type ResearchCollaborator = typeof researchCollaborators.$inferSelect;
export type InsertResearchCollaborator = z.infer<typeof insertResearchCollaboratorSchema>;
export type ResearchWorkspace = typeof researchWorkspaces.$inferSelect;
export type InsertResearchWorkspace = z.infer<typeof insertResearchWorkspaceSchema>;
export type ResearchDocument = typeof researchDocuments.$inferSelect;
export type InsertResearchDocument = z.infer<typeof insertResearchDocumentSchema>;
export type ResearchPurchase = typeof researchPurchases.$inferSelect;
export type InsertResearchPurchase = z.infer<typeof insertResearchPurchaseSchema>;

export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;

// Subscription usage model
export const subscriptionUsages = pgTable("subscription_usages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id),
  usageType: text("usage_type").notNull(), // "course_enrollment", "live_class", "mentor_session", etc.
  usageDate: timestamp("usage_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionUsageSchema = createInsertSchema(subscriptionUsages).omit({
  id: true,
  createdAt: true,
});

export type SubscriptionUsage = typeof subscriptionUsages.$inferSelect;
export type InsertSubscriptionUsage = z.infer<typeof insertSubscriptionUsageSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Subscription key login schema
export const subscriptionKeyLoginSchema = z.object({
  keyValue: z.string().min(16, { message: "Valid subscription key required" })
});

export type LoginData = z.infer<typeof loginSchema>;
export type SubscriptionKeyLoginData = z.infer<typeof subscriptionKeyLoginSchema>;
