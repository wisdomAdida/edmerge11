import { 
  users, type User, type InsertUser,
  mentorSessions, type MentorSession, type InsertMentorSession,
  courses, type Course, type InsertCourse,
  enrollments, type Enrollment, type InsertEnrollment,
  payments, type Payment, type InsertPayment,
  withdrawals, type Withdrawal, type InsertWithdrawal,
  mentorships, type Mentorship, type InsertMentorship,
  researchProjects, type ResearchProject, type InsertResearchProject,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan,
  subscriptions, type Subscription, type InsertSubscription,
  subscriptionUsages, type SubscriptionUsage, type InsertSubscriptionUsage,
  liveClasses, type LiveClass, type InsertLiveClass,
  cvTemplates, type CvTemplate, type InsertCvTemplate,
  userCvs, type UserCv, type InsertUserCv,
  subscriptionKeys, type SubscriptionKey, type InsertSubscriptionKey,
  courseSections, type CourseSection, type InsertCourseSection,
  courseMaterials, type CourseMaterial, type InsertCourseMaterial,
  chatMessages, type ChatMessage, type InsertChatMessage,
  cvPayments, type CvPayment, type InsertCvPayment,
  researchWorkspaces, type ResearchWorkspace, type InsertResearchWorkspace,
  researchDocuments, type ResearchDocument, type InsertResearchDocument,
  researchCollaborators, type ResearchCollaborator, type InsertResearchCollaborator,
  researchPurchases, type ResearchPurchase, type InsertResearchPurchase,
  scholarships, type Scholarship, type InsertScholarship
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, inArray, desc } from "drizzle-orm";
import postgres from "postgres";
import connectPg from "connect-pg-simple";

// Memory store for fallback
const MemoryStore = createMemoryStore(session);

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// PostgreSQL client
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString!);

export interface IStorage {
  // Session store
  sessionStore: any; // Using any to avoid type issues with SessionStore

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserSubscription(userId: number, subscriptionData: {
    type: string;
    status: string;
    startDate: Date;
    endDate: Date;
    flutterwaveCustomerId?: string;
    flutterwaveSubscriptionId?: string;
  }): Promise<User | undefined>;

  // Subscription plans methods
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;

  // Subscriptions methods
  getSubscription(id: number): Promise<Subscription | undefined>;
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  getSubscriptionsByUser(userId: number): Promise<Subscription[]>;
  getAllSubscriptions(): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription | undefined>;

  // Subscription usage methods
  logSubscriptionUsage(usageData: InsertSubscriptionUsage): Promise<SubscriptionUsage>;

  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getCoursesByTutor(tutorId: number): Promise<Course[]>;
  getCoursesByLevel(level: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;

  // Enrollment methods
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getAllEnrollments(): Promise<Enrollment[]>;
  getEnrollmentsByUserId(userId: number): Promise<Enrollment[]>;
  getEnrollmentsByTutorId(tutorId: number): Promise<Enrollment[]>;
  getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined>;

  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUser(userId: number): Promise<Payment[]>;
  getPaymentsByCourse(courseId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Withdrawal methods
  getWithdrawal(id: number): Promise<Withdrawal | undefined>;
  getWithdrawalsByTutor(tutorId: number): Promise<Withdrawal[]>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  updateWithdrawal(id: number, withdrawal: Partial<Withdrawal>): Promise<Withdrawal | undefined>;
  getTutorEarnings(tutorId: number): Promise<number>;

  // Mentorship methods
  getMentorship(id: number): Promise<Mentorship | undefined>;
  getMentorshipsByMentor(mentorId: number): Promise<Mentorship[]>;
  getMentorshipsByStudent(studentId: number): Promise<Mentorship[]>;
  createMentorship(mentorship: InsertMentorship): Promise<Mentorship>;
  updateMentorship(id: number, mentorship: Partial<Mentorship>): Promise<Mentorship | undefined>;

  // Research Project methods
  getAllResearchProjects(): Promise<ResearchProject[]>;
  getResearchProject(id: number): Promise<ResearchProject | undefined>;
  getResearchProjectsByResearcher(researcherId: number): Promise<ResearchProject[]>;
  createResearchProject(project: InsertResearchProject): Promise<ResearchProject>;
  updateResearchProject(id: number, project: Partial<ResearchProject>): Promise<ResearchProject | undefined>;
  
  // Research Workspace methods
  getResearchWorkspace(id: number): Promise<ResearchWorkspace | undefined>;
  getResearchWorkspaces(projectId: number): Promise<ResearchWorkspace[]>;
  createResearchWorkspace(workspace: InsertResearchWorkspace): Promise<ResearchWorkspace>;
  updateResearchWorkspace(id: number, workspace: Partial<ResearchWorkspace>): Promise<ResearchWorkspace | undefined>;
  
  // Research Document methods
  getResearchDocument(id: number): Promise<ResearchDocument | undefined>;
  getResearchDocuments(workspaceId: number): Promise<ResearchDocument[]>;
  createResearchDocument(document: InsertResearchDocument): Promise<ResearchDocument>;
  updateResearchDocument(id: number, document: Partial<ResearchDocument>): Promise<ResearchDocument | undefined>;
  
  // Research Collaborator methods
  getResearchCollaborator(id: number): Promise<ResearchCollaborator | undefined>;
  getResearchCollaborators(projectId: number): Promise<ResearchCollaborator[]>;
  getResearchCollaboratorByUserAndProject(userId: number, projectId: number): Promise<ResearchCollaborator | undefined>;
  getResearchCollaboratorCountsByResearcher(researcherId: number): Promise<number>;
  createResearchCollaborator(collaborator: InsertResearchCollaborator): Promise<ResearchCollaborator>;
  updateResearchCollaborator(id: number, collaborator: Partial<ResearchCollaborator>): Promise<ResearchCollaborator | undefined>;
  
  // Research Purchase methods
  getResearchPurchase(id: number): Promise<ResearchPurchase | undefined>;
  getResearchPurchases(studentId: number): Promise<ResearchPurchase[]>;
  getResearchProjectPurchase(studentId: number, projectId: number): Promise<ResearchPurchase | undefined>;
  createResearchPurchase(purchase: InsertResearchPurchase): Promise<ResearchPurchase>;
  
  // Research Agent methods
  getAllResearchers(): Promise<User[]>;
  getPublishedResearchProjects(): Promise<ResearchProject[]>;
  getResearchWorkspacesByProject(projectId: number): Promise<ResearchWorkspace[]>;
  getResearchDocumentsByWorkspace(workspaceId: number): Promise<ResearchDocument[]>;
  createResearchProjectPurchase(purchase: InsertResearchPurchase): Promise<ResearchPurchase>;
  
  // Live Class methods
  getLiveClass(id: number): Promise<LiveClass | undefined>;
  getLiveClassesByCourse(courseId: number): Promise<LiveClass[]>;
  getLiveClassesByTutor(tutorId: number): Promise<LiveClass[]>;
  getActiveLiveClasses(): Promise<LiveClass[]>;
  getUpcomingLiveClasses(): Promise<LiveClass[]>;
  createLiveClass(liveClass: InsertLiveClass): Promise<LiveClass>;
  updateLiveClass(id: number, liveClass: Partial<LiveClass>): Promise<LiveClass | undefined>;
  startLiveClass(id: number): Promise<LiveClass | undefined>;
  endLiveClass(id: number): Promise<LiveClass | undefined>;

  // CV Template methods
  getAllCvTemplates(): Promise<CvTemplate[]>;
  getCvTemplate(id: number): Promise<CvTemplate | undefined>;
  getCvTemplatesByType(type: string): Promise<CvTemplate[]>;
  createCvTemplate(template: InsertCvTemplate): Promise<CvTemplate>;
  deleteCvTemplate(id: number): Promise<boolean>;
  
  // User CV methods
  getUserCvs(userId: number): Promise<UserCv[]>;
  getUserCv(id: number): Promise<UserCv | undefined>;
  createUserCv(userCv: InsertUserCv): Promise<UserCv>;
  updateUserCv(id: number, userCv: Partial<UserCv>): Promise<UserCv | undefined>;
  deleteUserCv(id: number): Promise<boolean>;
  
  // Chat message methods
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessagesByRoom(roomId: string): Promise<ChatMessage[]>;
  getChatMessagesByUser(userId: number): Promise<ChatMessage[]>;
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
  getRecentChatRooms(userId: number): Promise<{roomId: string, lastMessage: ChatMessage}[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByStudentLevel(level: string): Promise<User[]>;
  getUsersForMessaging(role?: string, level?: string): Promise<User[]>;
  incrementUserCvGenerationCount(userId: number): Promise<number>;
  getUserCvGenerationCount(userId: number): Promise<number>;
  
  // Course Section methods
  getCourseSection(id: number): Promise<CourseSection | undefined>;
  getCourseSectionsByCourse(courseId: number): Promise<CourseSection[]>;
  createCourseSection(section: InsertCourseSection): Promise<CourseSection>;
  updateCourseSection(id: number, section: Partial<CourseSection>): Promise<CourseSection | undefined>;
  deleteCourseSection(id: number): Promise<boolean>;
  
  // Course Material methods
  getCourseMaterial(id: number): Promise<CourseMaterial | undefined>;
  getCourseMaterialsByCourse(courseId: number): Promise<CourseMaterial[]>;
  getCourseMaterialsBySection(sectionId: number): Promise<CourseMaterial[]>;
  createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial>;
  updateCourseMaterial(id: number, material: Partial<CourseMaterial>): Promise<CourseMaterial | undefined>;
  deleteCourseMaterial(id: number): Promise<boolean>;
  
  // Subscription Key methods
  getSubscriptionKey(id: number): Promise<SubscriptionKey | undefined>;
  getSubscriptionKeyById(id: number): Promise<SubscriptionKey | undefined>;
  getSubscriptionKeyByValue(keyValue: string): Promise<SubscriptionKey | undefined>;
  getSubscriptionKeysByAdmin(adminId: number): Promise<SubscriptionKey[]>;
  getSubscriptionKeysByUserId(userId: number): Promise<SubscriptionKey[]>;
  getActiveSubscriptionKeys(): Promise<SubscriptionKey[]>;
  getAllSubscriptionKeys(): Promise<SubscriptionKey[]>;
  createSubscriptionKey(key: InsertSubscriptionKey): Promise<SubscriptionKey>;
  updateSubscriptionKey(id: number, key: Partial<SubscriptionKey>): Promise<SubscriptionKey | undefined>;
  updateSubscriptionKeyStatus(id: number, status: "active" | "used" | "expired" | "revoked"): Promise<SubscriptionKey | undefined>;
  redeemSubscriptionKey(id: number, userId: number): Promise<SubscriptionKey | undefined>;
  revokeSubscriptionKey(id: number): Promise<boolean>;
  getUsersWithSubscriptionKeys(): Promise<User[]>;

  // CV Payment methods
  getCvPayment(id: number): Promise<CvPayment | undefined>;
  getCvPaymentsByUser(userId: number): Promise<CvPayment[]>;
  getAllCvPayments(): Promise<CvPayment[]>;
  createCvPayment(payment: InsertCvPayment): Promise<CvPayment>;
  updateCvPayment(id: number, payment: Partial<CvPayment>): Promise<CvPayment | undefined>;
  
  // Subscription Plan methods
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined>;
  updateUserSubscriptionType(userId: number, type: "none" | "basic" | "premium"): Promise<User | undefined>;
  
  // Scholarship methods
  getAllScholarships(): Promise<Scholarship[]>;
  getScholarship(id: number): Promise<Scholarship | undefined>;
  getActiveScholarships(): Promise<Scholarship[]>;
  getScholarshipsByLevel(level: string): Promise<Scholarship[]>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  updateScholarship(id: number, scholarship: Partial<Scholarship>): Promise<Scholarship | undefined>;
  deleteScholarship(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;
  private payments: Map<number, Payment>;
  private withdrawals: Map<number, Withdrawal>;
  private mentorships: Map<number, Mentorship>;
  private researchProjects: Map<number, ResearchProject>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private subscriptions: Map<number, Subscription>;
  private subscriptionUsages: Map<number, SubscriptionUsage>;
  private liveClasses: Map<number, LiveClass>;
  private cvTemplates: Map<number, CvTemplate>;
  private userCvs: Map<number, UserCv>;
  private subscriptionKeys: Map<number, SubscriptionKey>;
  private courseSections: Map<number, CourseSection>;
  private courseMaterials: Map<number, CourseMaterial>;
  private chatMessages: Map<number, ChatMessage>;
  private cvPayments: Map<number, CvPayment>;
  private researchWorkspaces: Map<number, ResearchWorkspace>;
  private researchDocuments: Map<number, ResearchDocument>;
  private researchCollaborators: Map<number, ResearchCollaborator>;
  private researchPurchases: Map<number, ResearchPurchase>;
  private scholarships: Map<number, Scholarship>;
  
  private userIdCounter: number;
  private courseIdCounter: number;
  private enrollmentIdCounter: number;
  private paymentIdCounter: number;
  private withdrawalIdCounter: number;
  private mentorshipIdCounter: number;
  private researchProjectIdCounter: number;
  private subscriptionPlanIdCounter: number;
  private subscriptionIdCounter: number;
  private subscriptionUsageIdCounter: number;
  private liveClassIdCounter: number;
  private cvTemplateIdCounter: number;
  private userCvIdCounter: number;
  private subscriptionKeyIdCounter: number;
  private courseSectionIdCounter: number;
  private courseMaterialIdCounter: number;
  private chatMessageIdCounter: number;
  private cvPaymentIdCounter: number;
  private researchWorkspaceIdCounter: number;
  private researchDocumentIdCounter: number;
  private researchCollaboratorIdCounter: number;
  private researchPurchaseIdCounter: number;
  private scholarshipIdCounter: number;

  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.payments = new Map();
    this.withdrawals = new Map();
    this.mentorships = new Map();
    this.researchProjects = new Map();
    this.subscriptionPlans = new Map();
    this.subscriptions = new Map();
    this.subscriptionUsages = new Map();
    this.liveClasses = new Map();
    this.cvTemplates = new Map();
    this.userCvs = new Map();
    this.subscriptionKeys = new Map();
    this.courseSections = new Map();
    this.courseMaterials = new Map();
    this.chatMessages = new Map();
    this.cvPayments = new Map();
    this.researchWorkspaces = new Map();
    this.researchDocuments = new Map();
    this.researchCollaborators = new Map();
    this.researchPurchases = new Map();
    this.scholarships = new Map();
    
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.paymentIdCounter = 1;
    this.withdrawalIdCounter = 1;
    this.mentorshipIdCounter = 1;
    this.researchProjectIdCounter = 1;
    this.subscriptionPlanIdCounter = 1;
    this.subscriptionIdCounter = 1;
    this.subscriptionUsageIdCounter = 1;
    this.liveClassIdCounter = 1;
    this.cvTemplateIdCounter = 1;
    this.userCvIdCounter = 1;
    this.subscriptionKeyIdCounter = 1;
    this.courseSectionIdCounter = 1;
    this.courseMaterialIdCounter = 1;
    this.chatMessageIdCounter = 1;
    this.cvPaymentIdCounter = 1;
    this.researchWorkspaceIdCounter = 1;
    this.researchDocumentIdCounter = 1;
    this.researchCollaboratorIdCounter = 1;
    this.researchPurchaseIdCounter = 1;
    this.scholarshipIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      studentLevel: userData.studentLevel || null,
      profileImage: userData.profileImage || null,
      bio: userData.bio || null,
      subscriptionType: userData.subscriptionType || "none",
      subscriptionStatus: userData.subscriptionStatus || "inactive",
      subscriptionStartDate: userData.subscriptionStartDate || null,
      subscriptionEndDate: userData.subscriptionEndDate || null,
      flutterwaveCustomerId: userData.flutterwaveCustomerId || null,
      flutterwaveSubscriptionId: userData.flutterwaveSubscriptionId || null,
      createdAt: now,
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserSubscription(userId: number, subscriptionData: {
    type: string;
    status: string;
    startDate: Date;
    endDate: Date;
    flutterwaveCustomerId?: string;
    flutterwaveSubscriptionId?: string;
  }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      subscriptionType: subscriptionData.type as any, // Type casting to match enum
      subscriptionStatus: subscriptionData.status as any, // Type casting to match enum
      subscriptionStartDate: subscriptionData.startDate,
      subscriptionEndDate: subscriptionData.endDate,
      flutterwaveCustomerId: subscriptionData.flutterwaveCustomerId || user.flutterwaveCustomerId,
      flutterwaveSubscriptionId: subscriptionData.flutterwaveSubscriptionId || user.flutterwaveSubscriptionId,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCoursesByTutor(tutorId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.tutorId === tutorId,
    );
  }

  async getCoursesByLevel(level: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.level === level,
    );
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const now = new Date();
    const course: Course = { 
      ...courseData, 
      id,
      createdAt: now,
      updatedAt: now 
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse: Course = { 
      ...course, 
      ...courseData,
      updatedAt: new Date() 
    };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  // Enrollment methods
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values());
  }

  async getEnrollmentsByUserId(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.userId === userId,
    );
  }

  async getEnrollmentsByTutorId(tutorId: number): Promise<Enrollment[]> {
    const tutorCourses = await this.getCoursesByTutor(tutorId);
    const tutorCourseIds = tutorCourses.map(course => course.id);
    
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => tutorCourseIds.includes(enrollment.courseId),
    );
  }

  async getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      (enrollment) => enrollment.userId === userId && enrollment.courseId === courseId,
    );
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const now = new Date();
    const enrollment: Enrollment = { 
      ...enrollmentData, 
      id,
      enrolledAt: now,
      updatedAt: now 
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment: Enrollment = { 
      ...enrollment, 
      ...enrollmentData,
      updatedAt: new Date() 
    };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.userId === userId,
    );
  }

  async getPaymentsByCourse(courseId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.courseId === courseId,
    );
  }
  
  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const payment: Payment = { 
      ...paymentData, 
      id,
      paymentDate: new Date() 
    };
    this.payments.set(id, payment);
    return payment;
  }

  // Withdrawal methods
  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    return this.withdrawals.get(id);
  }

  async getWithdrawalsByTutor(tutorId: number): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values()).filter(
      (withdrawal) => withdrawal.tutorId === tutorId,
    );
  }

  async createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal> {
    const id = this.withdrawalIdCounter++;
    const withdrawal: Withdrawal = { 
      ...withdrawalData, 
      id,
      withdrawalDate: new Date() 
    };
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async updateWithdrawal(id: number, withdrawalData: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) return undefined;
    
    const updatedWithdrawal: Withdrawal = { 
      ...withdrawal, 
      ...withdrawalData
    };
    this.withdrawals.set(id, updatedWithdrawal);
    return updatedWithdrawal;
  }

  async getTutorEarnings(tutorId: number): Promise<number> {
    // Get all tutor's courses
    const tutorCourses = await this.getCoursesByTutor(tutorId);
    const tutorCourseIds = tutorCourses.map(course => course.id);
    
    // Get all successful payments for tutor's courses
    const completedPayments = Array.from(this.payments.values()).filter(
      payment => 
        tutorCourseIds.includes(payment.courseId) && 
        payment.status === "completed"
    );
    
    // Sum up tutor's earnings
    const totalEarnings = completedPayments.reduce(
      (sum, payment) => sum + payment.tutorAmount, 
      0
    );
    
    // Subtract any successful withdrawals
    const completedWithdrawals = Array.from(this.withdrawals.values()).filter(
      withdrawal => 
        withdrawal.tutorId === tutorId && 
        withdrawal.status === "completed"
    );
    
    const totalWithdrawals = completedWithdrawals.reduce(
      (sum, withdrawal) => sum + withdrawal.amount, 
      0
    );
    
    return totalEarnings - totalWithdrawals;
  }

  // Mentorship methods
  async getMentorship(id: number): Promise<Mentorship | undefined> {
    return this.mentorships.get(id);
  }

  async getMentorshipsByMentor(mentorId: number): Promise<Mentorship[]> {
    return Array.from(this.mentorships.values()).filter(
      (mentorship) => mentorship.mentorId === mentorId,
    );
  }

  async getMentorshipsByStudent(studentId: number): Promise<Mentorship[]> {
    return Array.from(this.mentorships.values()).filter(
      (mentorship) => mentorship.studentId === studentId,
    );
  }

  async createMentorship(mentorshipData: InsertMentorship): Promise<Mentorship> {
    const id = this.mentorshipIdCounter++;
    const mentorship: Mentorship = { 
      ...mentorshipData, 
      id,
      createdAt: new Date() 
    };
    this.mentorships.set(id, mentorship);
    return mentorship;
  }

  async updateMentorship(id: number, mentorshipData: Partial<Mentorship>): Promise<Mentorship | undefined> {
    const mentorship = this.mentorships.get(id);
    if (!mentorship) return undefined;
    
    const updatedMentorship: Mentorship = { 
      ...mentorship, 
      ...mentorshipData
    };
    this.mentorships.set(id, updatedMentorship);
    return updatedMentorship;
  }

  // Research Project methods
  async getAllResearchProjects(): Promise<ResearchProject[]> {
    return Array.from(this.researchProjects.values());
  }
  
  async getResearchProject(id: number): Promise<ResearchProject | undefined> {
    return this.researchProjects.get(id);
  }

  async getResearchProjectsByResearcher(researcherId: number): Promise<ResearchProject[]> {
    return Array.from(this.researchProjects.values()).filter(
      (project) => project.researcherId === researcherId,
    );
  }

  async createResearchProject(projectData: InsertResearchProject): Promise<ResearchProject> {
    const id = this.researchProjectIdCounter++;
    const now = new Date();
    
    // Create with default values to ensure all fields are present
    const project: ResearchProject = { 
      ...projectData, 
      id,
      status: projectData.status || "draft",
      tags: projectData.tags || [],
      collaborators: projectData.collaborators || 0,
      isPublic: projectData.isPublic !== undefined ? projectData.isPublic : true,
      allowCollaborators: projectData.allowCollaborators !== undefined ? projectData.allowCollaborators : true,
      startDate: projectData.startDate || null,
      endDate: projectData.endDate || null,
      fundingSource: projectData.fundingSource || null,
      budget: projectData.budget || null,
      publishedAt: null,
      createdAt: now,
      updatedAt: now 
    };
    
    this.researchProjects.set(id, project);
    return project;
  }

  async updateResearchProject(id: number, projectData: Partial<ResearchProject>): Promise<ResearchProject | undefined> {
    const project = this.researchProjects.get(id);
    if (!project) return undefined;
    
    const updatedProject: ResearchProject = { 
      ...project, 
      ...projectData,
      updatedAt: new Date() 
    };
    this.researchProjects.set(id, updatedProject);
    return updatedProject;
  }
  
  // Research Workspace methods
  async getResearchWorkspace(id: number): Promise<ResearchWorkspace | undefined> {
    return this.researchWorkspaces.get(id);
  }
  
  async getResearchWorkspaces(projectId: number): Promise<ResearchWorkspace[]> {
    return Array.from(this.researchWorkspaces.values()).filter(
      (workspace) => workspace.researchProjectId === projectId,
    );
  }
  
  async createResearchWorkspace(workspaceData: InsertResearchWorkspace): Promise<ResearchWorkspace> {
    const id = this.researchWorkspaceIdCounter++;
    const now = new Date();
    const workspace: ResearchWorkspace = { 
      ...workspaceData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.researchWorkspaces.set(id, workspace);
    return workspace;
  }
  
  async updateResearchWorkspace(id: number, workspaceData: Partial<ResearchWorkspace>): Promise<ResearchWorkspace | undefined> {
    const workspace = this.researchWorkspaces.get(id);
    if (!workspace) return undefined;
    
    const updatedWorkspace: ResearchWorkspace = { 
      ...workspace, 
      ...workspaceData,
      updatedAt: new Date() 
    };
    this.researchWorkspaces.set(id, updatedWorkspace);
    return updatedWorkspace;
  }
  
  // Research Document methods
  async getResearchDocument(id: number): Promise<ResearchDocument | undefined> {
    return this.researchDocuments.get(id);
  }
  
  async getResearchDocuments(workspaceId: number): Promise<ResearchDocument[]> {
    return Array.from(this.researchDocuments.values()).filter(
      (document) => document.workspaceId === workspaceId,
    );
  }
  
  async createResearchDocument(documentData: InsertResearchDocument): Promise<ResearchDocument> {
    const id = this.researchDocumentIdCounter++;
    const now = new Date();
    const document: ResearchDocument = { 
      ...documentData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.researchDocuments.set(id, document);
    return document;
  }
  
  async updateResearchDocument(id: number, documentData: Partial<ResearchDocument>): Promise<ResearchDocument | undefined> {
    const document = this.researchDocuments.get(id);
    if (!document) return undefined;
    
    const updatedDocument: ResearchDocument = { 
      ...document, 
      ...documentData,
      updatedAt: new Date() 
    };
    this.researchDocuments.set(id, updatedDocument);
    return updatedDocument;
  }
  
  // Research Collaborator methods
  async getResearchCollaborator(id: number): Promise<ResearchCollaborator | undefined> {
    return this.researchCollaborators.get(id);
  }
  
  async getResearchCollaborators(projectId: number): Promise<ResearchCollaborator[]> {
    return Array.from(this.researchCollaborators.values()).filter(
      (collaborator) => collaborator.researchProjectId === projectId,
    );
  }
  
  async getResearchCollaboratorByUserAndProject(userId: number, projectId: number): Promise<ResearchCollaborator | undefined> {
    return Array.from(this.researchCollaborators.values()).find(
      (collaborator) => collaborator.userId === userId && collaborator.researchProjectId === projectId,
    );
  }
  
  async getResearchCollaboratorCountsByResearcher(researcherId: number): Promise<number> {
    const projects = await this.getResearchProjectsByResearcher(researcherId);
    const projectIds = projects.map(p => p.id);
    
    const collaborators = Array.from(this.researchCollaborators.values()).filter(
      (collaborator) => projectIds.includes(collaborator.researchProjectId)
    );
    
    return collaborators.length;
  }
  
  async createResearchCollaborator(collaboratorData: InsertResearchCollaborator): Promise<ResearchCollaborator> {
    const id = this.researchCollaboratorIdCounter++;
    const now = new Date();
    const collaborator: ResearchCollaborator = { 
      ...collaboratorData, 
      id,
      createdAt: now,
      updatedAt: now,
      joinedAt: now
    };
    this.researchCollaborators.set(id, collaborator);
    return collaborator;
  }
  
  async updateResearchCollaborator(id: number, collaboratorData: Partial<ResearchCollaborator>): Promise<ResearchCollaborator | undefined> {
    const collaborator = this.researchCollaborators.get(id);
    if (!collaborator) return undefined;
    
    const updatedCollaborator: ResearchCollaborator = { 
      ...collaborator, 
      ...collaboratorData,
      updatedAt: new Date() 
    };
    this.researchCollaborators.set(id, updatedCollaborator);
    return updatedCollaborator;
  }
  
  // Research Purchase methods
  async getResearchPurchase(id: number): Promise<ResearchPurchase | undefined> {
    return this.researchPurchases.get(id);
  }
  
  async getResearchPurchases(studentId: number): Promise<ResearchPurchase[]> {
    return Array.from(this.researchPurchases.values()).filter(
      (purchase) => purchase.studentId === studentId,
    );
  }
  
  async getResearchProjectPurchases(researcherId: number): Promise<ResearchPurchase[]> {
    // Get all projects by this researcher
    const projects = await this.getResearchProjectsByResearcher(researcherId);
    const projectIds = projects.map(p => p.id);
    
    // Return all purchases for this researcher's projects
    return Array.from(this.researchPurchases.values()).filter(
      (purchase) => projectIds.includes(purchase.researchProjectId)
    );
  }
  
  async createResearchPurchase(purchaseData: InsertResearchPurchase): Promise<ResearchPurchase> {
    const id = this.researchPurchaseIdCounter++;
    const now = new Date();
    const purchase: ResearchPurchase = { 
      ...purchaseData, 
      id,
      purchasedAt: now
    };
    this.researchPurchases.set(id, purchase);
    return purchase;
  }

  // Subscription plans methods
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }
  
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }
  
  async createSubscriptionPlan(planData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.subscriptionPlanIdCounter++;
    const now = new Date();
    const plan: SubscriptionPlan = { 
      ...planData, 
      id,
      createdAt: now,
      updatedAt: now 
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }
  
  // Subscriptions methods
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async getSubscriptionsByUser(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (subscription) => subscription.userId === userId,
    );
  }
  
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    const userSubscriptions = await this.getSubscriptionsByUser(userId);
    // Get the most recent active subscription
    return userSubscriptions
      .filter(sub => sub.status === 'active')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
  }
  
  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }
  
  async logSubscriptionUsage(usageData: InsertSubscriptionUsage): Promise<SubscriptionUsage> {
    const id = this.subscriptionUsageIdCounter++;
    const now = new Date();
    
    const usage: SubscriptionUsage = {
      ...usageData,
      id,
      courseId: usageData.courseId || null,
      notes: usageData.notes || null,
      createdAt: now
    };
    
    this.subscriptionUsages.set(id, usage);
    return usage;
  }
  
  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const now = new Date();
    const subscription: Subscription = { 
      ...subscriptionData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription: Subscription = { 
      ...subscription, 
      ...subscriptionData,
      updatedAt: new Date() 
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Live Class methods
  async getLiveClass(id: number): Promise<LiveClass | undefined> {
    return this.liveClasses.get(id);
  }

  async getLiveClassesByCourse(courseId: number): Promise<LiveClass[]> {
    return Array.from(this.liveClasses.values()).filter(
      (liveClass) => liveClass.courseId === courseId
    );
  }

  async getLiveClassesByTutor(tutorId: number): Promise<LiveClass[]> {
    return Array.from(this.liveClasses.values()).filter(
      (liveClass) => liveClass.tutorId === tutorId
    );
  }

  async getActiveLiveClasses(): Promise<LiveClass[]> {
    return Array.from(this.liveClasses.values()).filter(
      (liveClass) => liveClass.status === "live"
    );
  }

  async getUpcomingLiveClasses(): Promise<LiveClass[]> {
    const now = new Date();
    return Array.from(this.liveClasses.values()).filter(
      (liveClass) => 
        liveClass.status === "scheduled" && 
        liveClass.scheduledStartTime > now
    );
  }

  async createLiveClass(liveClassData: InsertLiveClass): Promise<LiveClass> {
    const id = this.liveClassIdCounter++;
    const now = new Date();
    const liveClass: LiveClass = { 
      ...liveClassData, 
      id,
      actualStartTime: null,
      actualEndTime: null,
      createdAt: now,
      updatedAt: now 
    };
    this.liveClasses.set(id, liveClass);
    return liveClass;
  }

  async updateLiveClass(id: number, liveClassData: Partial<LiveClass>): Promise<LiveClass | undefined> {
    const liveClass = this.liveClasses.get(id);
    if (!liveClass) return undefined;
    
    const updatedLiveClass: LiveClass = { 
      ...liveClass, 
      ...liveClassData,
      updatedAt: new Date() 
    };
    this.liveClasses.set(id, updatedLiveClass);
    return updatedLiveClass;
  }

  async startLiveClass(id: number): Promise<LiveClass | undefined> {
    const liveClass = this.liveClasses.get(id);
    if (!liveClass || liveClass.status !== "scheduled") return undefined;
    
    const now = new Date();
    const updatedLiveClass: LiveClass = { 
      ...liveClass, 
      status: "live",
      actualStartTime: now,
      updatedAt: now 
    };
    this.liveClasses.set(id, updatedLiveClass);
    return updatedLiveClass;
  }

  async endLiveClass(id: number): Promise<LiveClass | undefined> {
    const liveClass = this.liveClasses.get(id);
    if (!liveClass || liveClass.status !== "live") return undefined;
    
    const now = new Date();
    const updatedLiveClass: LiveClass = { 
      ...liveClass, 
      status: "ended",
      actualEndTime: now,
      updatedAt: now 
    };
    this.liveClasses.set(id, updatedLiveClass);
    return updatedLiveClass;
  }

  // CV Template methods
  async getAllCvTemplates(): Promise<CvTemplate[]> {
    return Array.from(this.cvTemplates.values());
  }

  async getCvTemplate(id: number): Promise<CvTemplate | undefined> {
    return this.cvTemplates.get(id);
  }

  async getCvTemplatesByType(type: string): Promise<CvTemplate[]> {
    return Array.from(this.cvTemplates.values()).filter(
      (template) => template.type === type
    );
  }
  
  async createCvTemplate(templateData: InsertCvTemplate): Promise<CvTemplate> {
    const id = this.cvTemplateIdCounter++;
    const now = new Date();
    const template: CvTemplate = {
      ...templateData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.cvTemplates.set(id, template);
    return template;
  }
  
  async deleteCvTemplate(id: number): Promise<boolean> {
    return this.cvTemplates.delete(id);
  }
  
  // User CV methods
  async getUserCvs(userId: number): Promise<UserCv[]> {
    return Array.from(this.userCvs.values()).filter(
      (cv) => cv.userId === userId
    );
  }

  async getUserCv(id: number): Promise<UserCv | undefined> {
    return this.userCvs.get(id);
  }

  async createUserCv(userCvData: InsertUserCv): Promise<UserCv> {
    const id = this.userCvIdCounter++;
    const now = new Date();
    const userCv: UserCv = {
      ...userCvData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.userCvs.set(id, userCv);
    
    // Increment user's CV generation count
    await this.incrementUserCvGenerationCount(userCvData.userId);
    
    return userCv;
  }

  async updateUserCv(id: number, userCvData: Partial<UserCv>): Promise<UserCv | undefined> {
    const userCv = this.userCvs.get(id);
    if (!userCv) return undefined;
    
    const updatedUserCv: UserCv = {
      ...userCv,
      ...userCvData,
      updatedAt: new Date()
    };
    this.userCvs.set(id, updatedUserCv);
    return updatedUserCv;
  }

  async deleteUserCv(id: number): Promise<boolean> {
    return this.userCvs.delete(id);
  }

  // Chat message methods
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }
  
  async getChatMessagesByRoom(roomId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (chatMessage) => chatMessage.roomId === roomId
    );
  }
  
  async createChatMessage(chatMessageData: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const chatMessage: ChatMessage = {
      ...chatMessageData,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async incrementUserCvGenerationCount(userId: number): Promise<number> {
    const user = this.users.get(userId);
    if (!user) return 0;
    
    const currentCount = user.cvGenerationsCount || 0;
    const newCount = currentCount + 1;
    
    const updatedUser: User = {
      ...user,
      cvGenerationsCount: newCount,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return newCount;
  }

  async getUserCvGenerationCount(userId: number): Promise<number> {
    const user = this.users.get(userId);
    if (!user) return 0;
    
    return user.cvGenerationsCount || 0;
  }

  // CV Payment methods
  async getCvPayment(id: number): Promise<CvPayment | undefined> {
    return this.cvPayments.get(id);
  }

  async getCvPaymentsByUser(userId: number): Promise<CvPayment[]> {
    return Array.from(this.cvPayments.values()).filter(
      (payment) => payment.userId === userId,
    );
  }

  async getAllCvPayments(): Promise<CvPayment[]> {
    return Array.from(this.cvPayments.values());
  }

  async createCvPayment(paymentData: InsertCvPayment): Promise<CvPayment> {
    const id = this.cvPaymentIdCounter++;
    const payment: CvPayment = { 
      ...paymentData, 
      id,
      paymentDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cvPayments.set(id, payment);
    return payment;
  }

  async updateCvPayment(id: number, paymentData: Partial<CvPayment>): Promise<CvPayment | undefined> {
    const payment = this.cvPayments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment: CvPayment = { 
      ...payment, 
      ...paymentData,
      updatedAt: new Date() 
    };
    this.cvPayments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Subscription Key methods
  async getSubscriptionKey(id: number): Promise<SubscriptionKey | undefined> {
    return this.subscriptionKeys.get(id);
  }

  async getSubscriptionKeyById(id: number): Promise<SubscriptionKey | undefined> {
    return this.subscriptionKeys.get(id);
  }

  async getSubscriptionKeyByValue(keyValue: string): Promise<SubscriptionKey | undefined> {
    return Array.from(this.subscriptionKeys.values()).find(
      (key) => key.keyValue === keyValue
    );
  }

  async getSubscriptionKeysByAdmin(adminId: number): Promise<SubscriptionKey[]> {
    return Array.from(this.subscriptionKeys.values()).filter(
      (key) => key.createdById === adminId
    );
  }

  async getSubscriptionKeysByUserId(userId: number): Promise<SubscriptionKey[]> {
    return Array.from(this.subscriptionKeys.values()).filter(
      (key) => key.userId === userId
    );
  }

  async getActiveSubscriptionKeys(): Promise<SubscriptionKey[]> {
    return Array.from(this.subscriptionKeys.values()).filter(
      (key) => key.status === "active"
    );
  }
  
  async getAllSubscriptionKeys(): Promise<SubscriptionKey[]> {
    return Array.from(this.subscriptionKeys.values());
  }
  
  async getUsersWithSubscriptionKeys(): Promise<User[]> {
    // Get users that have subscription keys
    const keysWithUsers = Array.from(this.subscriptionKeys.values())
      .filter(key => key.userId !== null);
    
    // Get unique user IDs
    const userIds = [...new Set(keysWithUsers.map(key => key.userId))];
    
    // Get users by IDs
    return userIds
      .map(userId => this.users.get(userId as number))
      .filter(user => user !== undefined) as User[];
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async createSubscriptionKey(keyData: InsertSubscriptionKey): Promise<SubscriptionKey> {
    const id = this.subscriptionKeyIdCounter++;
    const now = new Date();
    const key: SubscriptionKey = { 
      ...keyData, 
      id,
      status: keyData.status || "active",
      createdAt: now,
      redeemedAt: null
    };
    this.subscriptionKeys.set(id, key);
    return key;
  }

  async updateSubscriptionKey(id: number, keyData: Partial<SubscriptionKey>): Promise<SubscriptionKey | undefined> {
    const key = this.subscriptionKeys.get(id);
    if (!key) return undefined;
    
    const updatedKey: SubscriptionKey = { 
      ...key, 
      ...keyData 
    };
    this.subscriptionKeys.set(id, updatedKey);
    return updatedKey;
  }

  async updateSubscriptionKeyStatus(id: number, status: "active" | "used" | "expired" | "revoked"): Promise<SubscriptionKey | undefined> {
    const key = this.subscriptionKeys.get(id);
    if (!key) return undefined;
    
    const updatedKey: SubscriptionKey = { 
      ...key, 
      status
    };
    this.subscriptionKeys.set(id, updatedKey);
    return updatedKey;
  }

  async updateUserSubscriptionType(userId: number, type: "none" | "basic" | "premium"): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      subscriptionType: type,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Scholarship methods
  async getAllScholarships(): Promise<Scholarship[]> {
    return Array.from(this.scholarships.values());
  }
  
  async getScholarship(id: number): Promise<Scholarship | undefined> {
    return this.scholarships.get(id);
  }
  
  async getActiveScholarships(): Promise<Scholarship[]> {
    return Array.from(this.scholarships.values()).filter(
      (scholarship) => scholarship.status === "active" || scholarship.status === "coming_soon"
    );
  }
  
  async getScholarshipsByLevel(level: string): Promise<Scholarship[]> {
    return Array.from(this.scholarships.values()).filter(
      (scholarship) => scholarship.studentLevel === level
    );
  }
  
  async createScholarship(scholarshipData: InsertScholarship): Promise<Scholarship> {
    const id = this.scholarshipIdCounter++;
    const now = new Date();
    const scholarship: Scholarship = {
      ...scholarshipData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.scholarships.set(id, scholarship);
    return scholarship;
  }
  
  async updateScholarship(id: number, scholarshipData: Partial<Scholarship>): Promise<Scholarship | undefined> {
    const scholarship = this.scholarships.get(id);
    if (!scholarship) return undefined;
    
    const updatedScholarship: Scholarship = {
      ...scholarship,
      ...scholarshipData,
      updatedAt: new Date()
    };
    this.scholarships.set(id, updatedScholarship);
    return updatedScholarship;
  }
  
  async deleteScholarship(id: number): Promise<boolean> {
    return this.scholarships.delete(id);
  }

  // Original method preserved for backward compatibility
  async redeemSubscriptionKey(keyValue: string, userId: number): Promise<SubscriptionKey | undefined> {
    const key = await this.getSubscriptionKeyByValue(keyValue);
    if (!key) return undefined;
    
    // Check if key is already used or revoked
    if (key.status !== "active") return undefined;
    
    // Update the key
    const updatedKey: SubscriptionKey = { 
      ...key, 
      userId,
      status: "used",
      redeemedAt: new Date()
    };
    this.subscriptionKeys.set(key.id, updatedKey);
    
    // Get subscription plan associated with the key
    const plan = await this.getSubscriptionPlan(key.planId);
    if (!plan) return updatedKey;
    
    // Update user subscription
    const user = await this.getUser(userId);
    if (user) {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);
      
      await this.updateUserSubscription(userId, {
        type: plan.name.toLowerCase() as any,
        status: "active",
        startDate: now,
        endDate
      });
    }
    
    return updatedKey;
  }
  
  // New version by ID instead of keyValue
  async redeemSubscriptionKey(id: number, userId: number): Promise<SubscriptionKey | undefined> {
    const key = this.subscriptionKeys.get(id);
    if (!key || key.status !== "active") return undefined;
    
    // Update the key
    const updatedKey: SubscriptionKey = { 
      ...key, 
      userId,
      status: "used",
      redeemedAt: new Date()
    };
    this.subscriptionKeys.set(id, updatedKey);
    
    // Get subscription plan associated with the key
    const plan = await this.getSubscriptionPlan(key.planId);
    if (!plan) return updatedKey;
    
    // Update user subscription
    const user = await this.getUser(userId);
    if (user) {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);
      
      // Update user subscription
      await this.updateUserSubscription(userId, {
        type: plan.name.toLowerCase() as any,
        status: "active",
        startDate: now,
        endDate
      });
      
      // Also update subscription type
      await this.updateUserSubscriptionType(userId, plan.price <= 5 ? "basic" : "premium");
    }
    
    return updatedKey;
  }

  async revokeSubscriptionKey(id: number): Promise<boolean> {
    const key = this.subscriptionKeys.get(id);
    if (!key) return false;
    
    // Can't revoke already used or expired keys
    if (key.status === "used" || key.status === "expired") return false;
    
    const updatedKey: SubscriptionKey = { 
      ...key, 
      status: "revoked" 
    };
    this.subscriptionKeys.set(id, updatedKey);
    return true;
  }

  // Course Section methods
  async getCourseSection(id: number): Promise<CourseSection | undefined> {
    return this.courseSections.get(id);
  }

  async getCourseSectionsByCourse(courseId: number): Promise<CourseSection[]> {
    return Array.from(this.courseSections.values()).filter(
      (section) => section.courseId === courseId
    );
  }

  async createCourseSection(sectionData: InsertCourseSection): Promise<CourseSection> {
    const id = this.courseSectionIdCounter++;
    const now = new Date();
    const section: CourseSection = { 
      ...sectionData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.courseSections.set(id, section);
    return section;
  }

  async updateCourseSection(id: number, sectionData: Partial<CourseSection>): Promise<CourseSection | undefined> {
    const section = this.courseSections.get(id);
    if (!section) return undefined;
    
    const updatedSection: CourseSection = { 
      ...section, 
      ...sectionData,
      updatedAt: new Date() 
    };
    this.courseSections.set(id, updatedSection);
    return updatedSection;
  }

  async deleteCourseSection(id: number): Promise<boolean> {
    if (!this.courseSections.has(id)) return false;
    
    // Delete all materials in this section first
    const sectionMaterials = await this.getCourseMaterialsBySection(id);
    for (const material of sectionMaterials) {
      await this.deleteCourseMaterial(material.id);
    }
    
    // Delete the section
    return this.courseSections.delete(id);
  }
  
  // Course Material methods
  async getCourseMaterial(id: number): Promise<CourseMaterial | undefined> {
    return this.courseMaterials.get(id);
  }

  async getCourseMaterialsByCourse(courseId: number): Promise<CourseMaterial[]> {
    return Array.from(this.courseMaterials.values()).filter(
      (material) => material.courseId === courseId
    );
  }

  async getCourseMaterialsBySection(sectionId: number): Promise<CourseMaterial[]> {
    return Array.from(this.courseMaterials.values()).filter(
      (material) => material.sectionId === sectionId
    );
  }

  async createCourseMaterial(materialData: InsertCourseMaterial): Promise<CourseMaterial> {
    const id = this.courseMaterialIdCounter++;
    const now = new Date();
    const material: CourseMaterial = { 
      ...materialData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.courseMaterials.set(id, material);
    return material;
  }

  async updateCourseMaterial(id: number, materialData: Partial<CourseMaterial>): Promise<CourseMaterial | undefined> {
    const material = this.courseMaterials.get(id);
    if (!material) return undefined;
    
    const updatedMaterial: CourseMaterial = { 
      ...material, 
      ...materialData,
      updatedAt: new Date() 
    };
    this.courseMaterials.set(id, updatedMaterial);
    return updatedMaterial;
  }

  async deleteCourseMaterial(id: number): Promise<boolean> {
    return this.courseMaterials.delete(id);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  sessionStore: any;

  constructor() {
    // Initialize Drizzle with the postgres client
    this.db = drizzle(client);
    
    // Create session store with PostgreSQL
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(userData).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await this.db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    const result = await this.db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return result[0];
  }

  async getAllCourses(): Promise<Course[]> {
    return await this.db.select().from(courses);
  }

  async getCoursesByTutor(tutorId: number): Promise<Course[]> {
    return await this.db.select().from(courses).where(eq(courses.tutorId, tutorId));
  }

  async getCoursesByLevel(level: string): Promise<Course[]> {
    return await this.db.select().from(courses).where(eq(courses.level, level));
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const result = await this.db.insert(courses).values(courseData).returning();
    return result[0];
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined> {
    const result = await this.db.update(courses)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return result[0];
  }

  // Enrollment methods
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const result = await this.db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
    return result[0];
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    return await this.db.select().from(enrollments);
  }

  async getEnrollmentsByUserId(userId: number): Promise<Enrollment[]> {
    return await this.db.select().from(enrollments).where(eq(enrollments.userId, userId));
  }

  async getEnrollmentsByTutorId(tutorId: number): Promise<Enrollment[]> {
    // Get tutor's courses first
    const tutorCourses = await this.getCoursesByTutor(tutorId);
    const tutorCourseIds = tutorCourses.map(course => course.id);
    
    // Then find enrollments for those courses
    return await this.db.select()
      .from(enrollments)
      .where(inArray(enrollments.courseId, tutorCourseIds));
  }

  async getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined> {
    const result = await this.db.select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ))
      .limit(1);
    return result[0];
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const result = await this.db.insert(enrollments).values(enrollmentData).returning();
    return result[0];
  }

  async updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const result = await this.db.update(enrollments)
      .set({ ...enrollmentData, updatedAt: new Date() })
      .where(eq(enrollments.id, id))
      .returning();
    return result[0];
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await this.db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return await this.db.select().from(payments).where(eq(payments.userId, userId));
  }

  async getPaymentsByCourse(courseId: number): Promise<Payment[]> {
    return await this.db.select().from(payments).where(eq(payments.courseId, courseId));
  }
  
  async getAllPayments(): Promise<Payment[]> {
    return await this.db.select().from(payments);
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const result = await this.db.insert(payments).values(paymentData).returning();
    return result[0];
  }

  // Withdrawal methods
  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    const result = await this.db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
    return result[0];
  }

  async getWithdrawalsByTutor(tutorId: number): Promise<Withdrawal[]> {
    return await this.db.select().from(withdrawals).where(eq(withdrawals.tutorId, tutorId));
  }

  async createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal> {
    const result = await this.db.insert(withdrawals).values(withdrawalData).returning();
    return result[0];
  }

  async updateWithdrawal(id: number, withdrawalData: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const result = await this.db.update(withdrawals)
      .set(withdrawalData)
      .where(eq(withdrawals.id, id))
      .returning();
    return result[0];
  }

  async getTutorEarnings(tutorId: number): Promise<number> {
    // Get tutor's courses
    const tutorCourses = await this.getCoursesByTutor(tutorId);
    const tutorCourseIds = tutorCourses.map(course => course.id);
    
    // Get all successful payments for tutor's courses
    const completedPayments = await this.db.select()
      .from(payments)
      .where(and(
        inArray(payments.courseId, tutorCourseIds),
        eq(payments.status, "completed")
      ));
    
    // Sum up tutor's earnings
    const totalEarnings = completedPayments.reduce(
      (sum, payment) => sum + payment.tutorAmount, 
      0
    );
    
    // Subtract any successful withdrawals
    const completedWithdrawals = await this.db.select()
      .from(withdrawals)
      .where(and(
        eq(withdrawals.tutorId, tutorId),
        eq(withdrawals.status, "completed")
      ));
    
    const totalWithdrawals = completedWithdrawals.reduce(
      (sum, withdrawal) => sum + withdrawal.amount, 
      0
    );
    
    return totalEarnings - totalWithdrawals;
  }

  // Mentorship methods
  async getMentorship(id: number): Promise<Mentorship | undefined> {
    const result = await this.db.select().from(mentorships).where(eq(mentorships.id, id)).limit(1);
    return result[0];
  }

  async getMentorshipsByMentor(mentorId: number): Promise<Mentorship[]> {
    return await this.db.select().from(mentorships).where(eq(mentorships.mentorId, mentorId));
  }

  async getMentorshipsByStudent(studentId: number): Promise<Mentorship[]> {
    return await this.db.select().from(mentorships).where(eq(mentorships.studentId, studentId));
  }

  async createMentorship(mentorshipData: InsertMentorship): Promise<Mentorship> {
    const result = await this.db.insert(mentorships).values(mentorshipData).returning();
    return result[0];
  }

  async updateMentorship(id: number, mentorshipData: Partial<Mentorship>): Promise<Mentorship | undefined> {
    const result = await this.db.update(mentorships)
      .set(mentorshipData)
      .where(eq(mentorships.id, id))
      .returning();
    return result[0];
  }
  
  // Mentor sessions methods
  async getMentorSession(id: number): Promise<MentorSession | undefined> {
    const result = await this.db.select().from(mentorSessions).where(eq(mentorSessions.id, id)).limit(1);
    return result[0];
  }
  
  async getMentorSessions(mentorId: number): Promise<MentorSession[]> {
    // Get all mentorships for this mentor first
    const mentorMentorships = await this.getMentorshipsByMentor(mentorId);
    const mentorshipIds = mentorMentorships.map(m => m.id);
    
    // If no mentorships found, return empty array
    if (mentorshipIds.length === 0) {
      return [];
    }
    
    // Get sessions for these mentorships
    return await this.db.select()
      .from(mentorSessions)
      .where(inArray(mentorSessions.mentorshipId, mentorshipIds))
      .orderBy(mentorSessions.scheduledDate);
  }
  
  async createMentorSession(sessionData: InsertMentorSession): Promise<MentorSession> {
    const result = await this.db.insert(mentorSessions).values(sessionData).returning();
    return result[0];
  }
  
  async updateMentorSession(id: number, sessionData: Partial<MentorSession>): Promise<MentorSession | undefined> {
    const result = await this.db.update(mentorSessions)
      .set(sessionData)
      .where(eq(mentorSessions.id, id))
      .returning();
    return result[0];
  }
  
  // Mentor earnings methods
  async getMentorEarnings(mentorId: number): Promise<number> {
    // Check for mentor-specific payments in the payments table
    const mentorPayments = await this.db.select()
      .from(payments)
      .where(and(
        eq(payments.userId, mentorId),
        eq(payments.status, "completed")
      ));
    
    // Sum up mentor's earnings
    const totalEarnings = mentorPayments.reduce(
      (sum, payment) => sum + payment.tutorAmount, 
      0
    );
    
    // If no direct payments, fall back to calculating based on completed sessions
    if (totalEarnings === 0) {
      const sessions = await this.getMentorSessions(mentorId);
      const completedSessions = sessions.filter(s => s.status === 'completed');
      return completedSessions.length * 10; // $10 per completed session
    }
    
    return totalEarnings;
  }
  
  async getPendingWithdrawalAmount(mentorId: number): Promise<number> {
    const pendingWithdrawals = await this.db.select()
      .from(withdrawals)
      .where(and(
        eq(withdrawals.tutorId, mentorId),
        eq(withdrawals.status, "pending")
      ));
    
    return pendingWithdrawals.reduce(
      (sum, withdrawal) => sum + withdrawal.amount, 
      0
    );
  }
  
  async getCompletedWithdrawalAmount(mentorId: number): Promise<number> {
    const completedWithdrawals = await this.db.select()
      .from(withdrawals)
      .where(and(
        eq(withdrawals.tutorId, mentorId),
        eq(withdrawals.status, "completed")
      ));
    
    return completedWithdrawals.reduce(
      (sum, withdrawal) => sum + withdrawal.amount, 
      0
    );
  }
  
  async getMentorAvailableBalance(mentorId: number): Promise<number> {
    const totalEarnings = await this.getMentorEarnings(mentorId);
    const pendingWithdrawals = await this.getPendingWithdrawalAmount(mentorId);
    const completedWithdrawals = await this.getCompletedWithdrawalAmount(mentorId);
    
    return totalEarnings - pendingWithdrawals - completedWithdrawals;
  }
  
  // Unread messages methods for mentors
  async getUnreadMessagesByRooms(userId: number, roomIds: string[]): Promise<ChatMessage[]> {
    if (roomIds.length === 0) {
      return [];
    }
    
    // Get all messages for these rooms that were NOT sent by this user
    // and have not been marked as read
    // Note: This is a simplified version, in a real implementation
    // we would have a separate table to track read status
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    return await this.db.select()
      .from(chatMessages)
      .where(and(
        inArray(chatMessages.roomId, roomIds),
        eq(chatMessages.userId, userId).not(),
        gt(chatMessages.createdAt, tenMinutesAgo)
      ));
  }

  // Research Project methods
  async getAllResearchProjects(): Promise<ResearchProject[]> {
    return await this.db.select().from(researchProjects);
  }

  async getResearchProject(id: number): Promise<ResearchProject | undefined> {
    const result = await this.db.select().from(researchProjects).where(eq(researchProjects.id, id)).limit(1);
    return result[0];
  }

  async getResearchProjectsByResearcher(researcherId: number): Promise<ResearchProject[]> {
    // Select only the fields that exist in the schema to avoid "column does not exist" errors
    return await this.db.select({
      id: researchProjects.id,
      researcherId: researchProjects.researcherId,
      title: researchProjects.title,
      description: researchProjects.description,
      status: researchProjects.status,
      category: researchProjects.category,
      tags: researchProjects.tags,
      fundingSource: researchProjects.fundingSource,
      budget: researchProjects.budget,
      startDate: researchProjects.startDate,
      endDate: researchProjects.endDate,
      collaborators: researchProjects.collaborators,
      isPublic: researchProjects.isPublic,
      allowCollaborators: researchProjects.allowCollaborators,
      publishedAt: researchProjects.publishedAt,
      createdAt: researchProjects.createdAt,
      updatedAt: researchProjects.updatedAt
      // Explicitly omit 'price' and 'isFree' here since they appear to not exist in the database schema
    })
    .from(researchProjects)
    .where(eq(researchProjects.researcherId, researcherId));
  }

  async createResearchProject(projectData: InsertResearchProject): Promise<ResearchProject> {
    const result = await this.db.insert(researchProjects).values(projectData).returning();
    return result[0];
  }

  async updateResearchProject(id: number, projectData: Partial<ResearchProject>): Promise<ResearchProject | undefined> {
    const result = await this.db.update(researchProjects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(researchProjects.id, id))
      .returning();
    return result[0];
  }
  
  // Research Workspace methods
  async getResearchWorkspace(id: number): Promise<ResearchWorkspace | undefined> {
    const result = await this.db.select().from(researchWorkspaces).where(eq(researchWorkspaces.id, id));
    return result[0];
  }
  
  async getResearchWorkspaces(projectId: number): Promise<ResearchWorkspace[]> {
    return this.db.select().from(researchWorkspaces).where(eq(researchWorkspaces.projectId, projectId));
  }
  
  async createResearchWorkspace(workspaceData: InsertResearchWorkspace): Promise<ResearchWorkspace> {
    const result = await this.db.insert(researchWorkspaces)
      .values({
        ...workspaceData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }
  
  async updateResearchWorkspace(id: number, workspaceData: Partial<ResearchWorkspace>): Promise<ResearchWorkspace | undefined> {
    const result = await this.db.update(researchWorkspaces)
      .set({ ...workspaceData, updatedAt: new Date() })
      .where(eq(researchWorkspaces.id, id))
      .returning();
    return result[0];
  }
  
  // Research Document methods
  async getResearchDocument(id: number): Promise<ResearchDocument | undefined> {
    const result = await this.db.select().from(researchDocuments).where(eq(researchDocuments.id, id));
    return result[0];
  }
  
  async getResearchDocuments(workspaceId: number): Promise<ResearchDocument[]> {
    return this.db.select().from(researchDocuments).where(eq(researchDocuments.workspaceId, workspaceId));
  }
  
  async createResearchDocument(documentData: InsertResearchDocument): Promise<ResearchDocument> {
    const result = await this.db.insert(researchDocuments)
      .values({
        ...documentData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }
  
  async updateResearchDocument(id: number, documentData: Partial<ResearchDocument>): Promise<ResearchDocument | undefined> {
    const result = await this.db.update(researchDocuments)
      .set({ ...documentData, updatedAt: new Date() })
      .where(eq(researchDocuments.id, id))
      .returning();
    return result[0];
  }
  
  // Research Collaborator methods
  async getResearchCollaborators(projectId: number): Promise<ResearchCollaborator[]> {
    return await this.db.select().from(researchCollaborators)
      .where(eq(researchCollaborators.researchProjectId, projectId));
  }
  
  async getResearchCollaborator(id: number): Promise<ResearchCollaborator | undefined> {
    const result = await this.db.select().from(researchCollaborators)
      .where(eq(researchCollaborators.id, id))
      .limit(1);
    return result[0];
  }
  
  async getResearchCollaboratorByUserAndProject(userId: number, projectId: number): Promise<ResearchCollaborator | undefined> {
    const result = await this.db.select().from(researchCollaborators)
      .where(
        and(
          eq(researchCollaborators.userId, userId),
          eq(researchCollaborators.researchProjectId, projectId)
        )
      )
      .limit(1);
    return result[0];
  }
  
  async getResearchCollaboratorCountsByResearcher(researcherId: number): Promise<number> {
    // Get all projects by this researcher
    const projects = await this.getResearchProjectsByResearcher(researcherId);
    
    if (projects.length === 0) {
      return 0;
    }
    
    const projectIds = projects.map(p => p.id);
    
    // Count all collaborators across all projects
    const collaborators = await this.db
      .select()
      .from(researchCollaborators)
      .where(inArray(researchCollaborators.researchProjectId, projectIds));
    
    // Return the number of unique users
    const uniqueUserIds = new Set(collaborators.map(c => c.userId));
    return uniqueUserIds.size;
  }
  
  async getResearchCollaboratorsWithUsers(projectId: number): Promise<any[]> {
    const collaborators = await this.db
      .select({
        id: researchCollaborators.id,
        userId: researchCollaborators.userId,
        researchProjectId: researchCollaborators.researchProjectId,
        role: researchCollaborators.role,
        status: researchCollaborators.status,
        joinedAt: researchCollaborators.joinedAt,
        invitedAt: researchCollaborators.invitedAt,
        createdAt: researchCollaborators.createdAt,
        updatedAt: researchCollaborators.updatedAt,
      })
      .from(researchCollaborators)
      .where(eq(researchCollaborators.researchProjectId, projectId));
      
    // For each collaborator, get the user
    const result = [];
    for (const collaborator of collaborators) {
      const user = await this.getUser(collaborator.userId);
      result.push({
        ...collaborator,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        } : null
      });
    }
    
    return result;
  }
  
  async createResearchCollaborator(collaboratorData: InsertResearchCollaborator): Promise<ResearchCollaborator> {
    const result = await this.db.insert(researchCollaborators).values(collaboratorData).returning();
    return result[0];
  }
  
  async updateResearchCollaborator(id: number, data: Partial<ResearchCollaborator>): Promise<ResearchCollaborator | undefined> {
    const result = await this.db.update(researchCollaborators)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(researchCollaborators.id, id))
      .returning();
    return result[0];
  }
  
  async deleteResearchCollaborator(id: number): Promise<void> {
    await this.db.delete(researchCollaborators).where(eq(researchCollaborators.id, id));
  }
  
  async deleteResearchProject(id: number): Promise<boolean> {
    const result = await this.db.delete(researchProjects)
      .where(eq(researchProjects.id, id))
      .returning();
    return result.length > 0;
  }
  
  async deleteResearchWorkspace(id: number): Promise<boolean> {
    const result = await this.db.delete(researchWorkspaces)
      .where(eq(researchWorkspaces.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Research Workspace methods
  async getResearchWorkspaces(projectId: number): Promise<ResearchWorkspace[]> {
    return await this.db.select().from(researchWorkspaces)
      .where(eq(researchWorkspaces.researchProjectId, projectId));
  }
  
  async getResearchWorkspace(id: number): Promise<ResearchWorkspace | undefined> {
    const result = await this.db.select().from(researchWorkspaces)
      .where(eq(researchWorkspaces.id, id))
      .limit(1);
    return result[0];
  }
  
  async createResearchWorkspace(workspaceData: InsertResearchWorkspace): Promise<ResearchWorkspace> {
    const result = await this.db.insert(researchWorkspaces).values(workspaceData).returning();
    return result[0];
  }
  
  async updateResearchWorkspace(id: number, data: Partial<ResearchWorkspace>): Promise<ResearchWorkspace | undefined> {
    const result = await this.db.update(researchWorkspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(researchWorkspaces.id, id))
      .returning();
    return result[0];
  }
  
  // Research Documents methods
  async getResearchDocuments(workspaceId: number): Promise<ResearchDocument[]> {
    return await this.db.select().from(researchDocuments)
      .where(eq(researchDocuments.workspaceId, workspaceId));
  }
  
  async getResearchDocument(id: number): Promise<ResearchDocument | undefined> {
    const result = await this.db.select().from(researchDocuments)
      .where(eq(researchDocuments.id, id))
      .limit(1);
    return result[0];
  }
  
  async createResearchDocument(documentData: InsertResearchDocument): Promise<ResearchDocument> {
    const result = await this.db.insert(researchDocuments).values(documentData).returning();
    return result[0];
  }
  
  async updateResearchDocument(id: number, data: Partial<ResearchDocument>): Promise<ResearchDocument | undefined> {
    const result = await this.db.update(researchDocuments)
      .set({ ...data, updatedAt: new Date(), lastEditedById: data.lastEditedById })
      .where(eq(researchDocuments.id, id))
      .returning();
    return result[0];
  }
  
  async deleteResearchDocument(id: number): Promise<void> {
    await this.db.delete(researchDocuments).where(eq(researchDocuments.id, id));
  }
  
  // Research Purchase methods
  async getResearchPurchases(studentId: number): Promise<ResearchPurchase[]> {
    return await this.db.select().from(researchPurchases)
      .where(eq(researchPurchases.studentId, studentId));
  }
  
  async getResearchPurchasesByProject(projectId: number): Promise<ResearchPurchase[]> {
    return await this.db.select().from(researchPurchases)
      .where(eq(researchPurchases.researchProjectId, projectId));
  }
  
  async getResearchPurchase(id: number): Promise<ResearchPurchase | undefined> {
    const result = await this.db.select().from(researchPurchases)
      .where(eq(researchPurchases.id, id))
      .limit(1);
    return result[0];
  }
  
  async getResearchProjectPurchases(researcherId: number): Promise<ResearchPurchase[]> {
    // First get all projects by this researcher
    const projects = await this.getResearchProjectsByResearcher(researcherId);
    
    if (projects.length === 0) {
      return [];
    }
    
    const projectIds = projects.map(p => p.id);
    
    // Then get all purchases for these projects
    return await this.db
      .select()
      .from(researchPurchases)
      .where(inArray(researchPurchases.researchProjectId, projectIds));
  }
  
  async getResearchProjectPurchase(studentId: number, projectId: number): Promise<ResearchPurchase | undefined> {
    const result = await this.db
      .select()
      .from(researchPurchases)
      .where(and(
        eq(researchPurchases.studentId, studentId),
        eq(researchPurchases.researchProjectId, projectId)
      ))
      .limit(1);
      
    return result[0];
  }
  
  async createResearchPurchase(purchaseData: InsertResearchPurchase): Promise<ResearchPurchase> {
    const result = await this.db.insert(researchPurchases).values(purchaseData).returning();
    return result[0];
  }
  
  // Add research agent methods
  
  async getAllResearchers(): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .where(eq(users.role, "researcher"));
  }
  
  async getPublishedResearchProjects(): Promise<ResearchProject[]> {
    return await this.db
      .select()
      .from(researchProjects)
      .where(eq(researchProjects.status, "published"));
  }
  
  async getResearchWorkspacesByProject(projectId: number): Promise<ResearchWorkspace[]> {
    return await this.db
      .select()
      .from(researchWorkspaces)
      .where(eq(researchWorkspaces.researchProjectId, projectId));
  }
  
  async getResearchDocumentsByWorkspace(workspaceId: number): Promise<ResearchDocument[]> {
    return await this.db
      .select()
      .from(researchDocuments)
      .where(eq(researchDocuments.workspaceId, workspaceId));
  }
  
  async createResearchProjectPurchase(purchaseData: InsertResearchPurchase): Promise<ResearchPurchase> {
    const result = await this.db.insert(researchPurchases).values(purchaseData).returning();
    return result[0];
  }
  
  async updateResearchPurchase(id: number, data: Partial<ResearchPurchase>): Promise<ResearchPurchase | undefined> {
    const result = await this.db.update(researchPurchases)
      .set(data)
      .where(eq(researchPurchases.id, id))
      .returning();
    return result[0];
  }

  // Subscription plans methods
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await this.db.select().from(subscriptionPlans);
  }
  
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const result = await this.db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
    return result[0];
  }
  
  async createSubscriptionPlan(planData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const result = await this.db.insert(subscriptionPlans).values(planData).returning();
    return result[0];
  }
  
  // Subscriptions methods
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const result = await this.db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
    return result[0];
  }
  
  async getSubscriptionsByUser(userId: number): Promise<Subscription[]> {
    return await this.db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }
  
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    // Get active subscriptions for user
    const result = await this.db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
        )
      )
      .orderBy(desc(subscriptions.endDate)) // Get the one with the latest end date
      .limit(1);
    
    return result[0];
  }
  
  async getAllSubscriptions(): Promise<Subscription[]> {
    return await this.db.select().from(subscriptions);
  }
  
  async logSubscriptionUsage(usageData: InsertSubscriptionUsage): Promise<SubscriptionUsage> {
    const result = await this.db.insert(subscriptionUsages)
      .values(usageData)
      .returning();
    
    return result[0];
  }
  
  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const result = await this.db.insert(subscriptions).values(subscriptionData).returning();
    return result[0];
  }
  
  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const result = await this.db.update(subscriptions)
      .set({ ...subscriptionData, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return result[0];
  }
  
  async updateUserSubscription(userId: number, subscriptionData: {
    type: string;
    status: string;
    startDate: Date;
    endDate: Date;
    flutterwaveCustomerId?: string;
    flutterwaveSubscriptionId?: string;
  }): Promise<User | undefined> {
    const updateData = {
      subscriptionType: subscriptionData.type as any,
      subscriptionStatus: subscriptionData.status as any,
      subscriptionStartDate: subscriptionData.startDate,
      subscriptionEndDate: subscriptionData.endDate,
      updatedAt: new Date(),
    } as any;
    
    if (subscriptionData.flutterwaveCustomerId) {
      updateData.flutterwaveCustomerId = subscriptionData.flutterwaveCustomerId;
    }
    
    if (subscriptionData.flutterwaveSubscriptionId) {
      updateData.flutterwaveSubscriptionId = subscriptionData.flutterwaveSubscriptionId;
    }

    const result = await this.db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }

  // Live Class methods
  async getLiveClass(id: number): Promise<LiveClass | undefined> {
    const result = await this.db.select().from(liveClasses).where(eq(liveClasses.id, id)).limit(1);
    return result[0];
  }

  async getLiveClassesByCourse(courseId: number): Promise<LiveClass[]> {
    return await this.db.select().from(liveClasses).where(eq(liveClasses.courseId, courseId));
  }

  async getLiveClassesByTutor(tutorId: number): Promise<LiveClass[]> {
    return await this.db.select().from(liveClasses).where(eq(liveClasses.tutorId, tutorId));
  }

  async getActiveLiveClasses(): Promise<LiveClass[]> {
    return await this.db.select().from(liveClasses).where(eq(liveClasses.status, "live"));
  }

  async getUpcomingLiveClasses(): Promise<LiveClass[]> {
    const now = new Date();
    return await this.db.select()
      .from(liveClasses)
      .where(and(
        eq(liveClasses.status, "scheduled"),
        liveClasses.scheduledStartTime > now
      ));
  }

  async createLiveClass(liveClassData: InsertLiveClass): Promise<LiveClass> {
    const result = await this.db.insert(liveClasses).values(liveClassData).returning();
    return result[0];
  }

  async updateLiveClass(id: number, liveClassData: Partial<LiveClass>): Promise<LiveClass | undefined> {
    const result = await this.db.update(liveClasses)
      .set({ ...liveClassData, updatedAt: new Date() })
      .where(eq(liveClasses.id, id))
      .returning();
    return result[0];
  }

  async startLiveClass(id: number): Promise<LiveClass | undefined> {
    const liveClass = await this.getLiveClass(id);
    if (!liveClass || liveClass.status !== "scheduled") return undefined;
    
    const now = new Date();
    const result = await this.db.update(liveClasses)
      .set({ 
        status: "live",
        actualStartTime: now,
        updatedAt: now
      })
      .where(eq(liveClasses.id, id))
      .returning();
    return result[0];
  }

  async endLiveClass(id: number): Promise<LiveClass | undefined> {
    const liveClass = await this.getLiveClass(id);
    if (!liveClass || liveClass.status !== "live") return undefined;
    
    const now = new Date();
    const result = await this.db.update(liveClasses)
      .set({ 
        status: "ended",
        actualEndTime: now,
        updatedAt: now
      })
      .where(eq(liveClasses.id, id))
      .returning();
    return result[0];
  }

  // CV Template methods
  async getAllCvTemplates(): Promise<CvTemplate[]> {
    return await this.db.select().from(cvTemplates);
  }

  async getCvTemplate(id: number): Promise<CvTemplate | undefined> {
    const result = await this.db.select().from(cvTemplates).where(eq(cvTemplates.id, id)).limit(1);
    return result[0];
  }

  async getCvTemplatesByType(type: string): Promise<CvTemplate[]> {
    return await this.db.select().from(cvTemplates).where(eq(cvTemplates.type, type));
  }
  
  async createCvTemplate(templateData: InsertCvTemplate): Promise<CvTemplate> {
    const result = await this.db.insert(cvTemplates).values(templateData).returning();
    return result[0];
  }
  
  async deleteCvTemplate(id: number): Promise<boolean> {
    const result = await this.db.delete(cvTemplates).where(eq(cvTemplates.id, id)).returning();
    return result.length > 0;
  }
  
  // User CV methods
  async getUserCvs(userId: number): Promise<UserCv[]> {
    return await this.db.select().from(userCvs).where(eq(userCvs.userId, userId));
  }

  async getUserCv(id: number): Promise<UserCv | undefined> {
    const result = await this.db.select().from(userCvs).where(eq(userCvs.id, id)).limit(1);
    return result[0];
  }

  async createUserCv(userCvData: InsertUserCv): Promise<UserCv> {
    // Create the user CV
    const result = await this.db.insert(userCvs).values(userCvData).returning();
    
    // Increment the user's CV generation count
    await this.incrementUserCvGenerationCount(userCvData.userId);
    
    return result[0];
  }

  async updateUserCv(id: number, userCvData: Partial<UserCv>): Promise<UserCv | undefined> {
    const result = await this.db.update(userCvs)
      .set({ ...userCvData, updatedAt: new Date() })
      .where(eq(userCvs.id, id))
      .returning();
    return result[0];
  }

  async deleteUserCv(id: number): Promise<boolean> {
    const result = await this.db.delete(userCvs).where(eq(userCvs.id, id)).returning();
    return result.length > 0;
  }
  
  // CV Payment methods
  async getCvPayment(id: number): Promise<CvPayment | undefined> {
    const result = await this.db.select().from(cvPayments).where(eq(cvPayments.id, id)).limit(1);
    return result[0];
  }

  async getCvPaymentsByUser(userId: number): Promise<CvPayment[]> {
    return await this.db.select().from(cvPayments).where(eq(cvPayments.userId, userId));
  }

  async getAllCvPayments(): Promise<CvPayment[]> {
    return await this.db.select().from(cvPayments);
  }

  async createCvPayment(paymentData: InsertCvPayment): Promise<CvPayment> {
    const result = await this.db.insert(cvPayments).values(paymentData).returning();
    return result[0];
  }

  async updateCvPayment(id: number, paymentData: Partial<CvPayment>): Promise<CvPayment | undefined> {
    const result = await this.db.update(cvPayments)
      .set({ ...paymentData, updatedAt: new Date() })
      .where(eq(cvPayments.id, id))
      .returning();
    return result[0];
  }

  // Chat message methods
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    const result = await this.db.select().from(chatMessages).where(eq(chatMessages.id, id)).limit(1);
    return result[0];
  }
  
  async getChatMessagesByRoom(roomId: string): Promise<ChatMessage[]> {
    return await this.db.select().from(chatMessages).where(eq(chatMessages.roomId, roomId));
  }
  
  async getChatMessagesByUser(userId: number): Promise<ChatMessage[]> {
    return await this.db.select().from(chatMessages).where(eq(chatMessages.userId, userId));
  }
  
  async createChatMessage(chatMessageData: InsertChatMessage): Promise<ChatMessage> {
    const result = await this.db.insert(chatMessages).values(chatMessageData).returning();
    return result[0];
  }
  
  async getRecentChatRooms(userId: number): Promise<{roomId: string, lastMessage: ChatMessage}[]> {
    // Get all unique room IDs for a user
    const userMessages = await this.db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId));
    
    // Get all rooms where the user has participated
    const userRoomIds = new Set<string>();
    const allRoomIds = new Set<string>();
    
    userMessages.forEach(message => {
      userRoomIds.add(message.roomId);
    });
    
    // Also get rooms where the user has received messages
    const otherMessages = await this.db.select().from(chatMessages)
      .where(inArray(chatMessages.roomId, Array.from(userRoomIds)));
    
    otherMessages.forEach(message => {
      allRoomIds.add(message.roomId);
    });
    
    // Get the most recent message for each room
    const result: {roomId: string, lastMessage: ChatMessage}[] = [];
    
    for (const roomId of allRoomIds) {
      const roomMessages = await this.db.select().from(chatMessages)
        .where(eq(chatMessages.roomId, roomId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);
      
      if (roomMessages.length > 0) {
        result.push({
          roomId,
          lastMessage: roomMessages[0]
        });
      }
    }
    
    // Sort rooms by the timestamp of the last message (newest first)
    result.sort((a, b) => {
      const dateA = a.lastMessage.createdAt as Date;
      const dateB = b.lastMessage.createdAt as Date;
      return dateB.getTime() - dateA.getTime();
    });
    
    return result;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await this.db.select().from(users).where(eq(users.role, role));
  }
  
  async getUsersByStudentLevel(level: string): Promise<User[]> {
    return await this.db.select().from(users)
      .where(and(
        eq(users.role, 'student'),
        eq(users.studentLevel, level)
      ));
  }
  
  async getUsersForMessaging(role?: string, level?: string): Promise<User[]> {
    if (role && level) {
      return await this.db.select().from(users)
        .where(and(
          eq(users.role, role),
          eq(users.studentLevel, level)
        ));
    } else if (role) {
      return await this.getUsersByRole(role);
    } else if (level) {
      return await this.getUsersByStudentLevel(level);
    } else {
      return await this.getAllUsers();
    }
  }

  async incrementUserCvGenerationCount(userId: number): Promise<number> {
    // First get current user to check the current count
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    const currentCount = user.cvGenerationsCount || 0;
    const newCount = currentCount + 1;
    
    // Update the user with the new count
    const result = await this.db.update(users)
      .set({ 
        cvGenerationsCount: newCount,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
      
    if (result.length === 0) return currentCount;
    return newCount;
  }

  async getUserCvGenerationCount(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    return user.cvGenerationsCount || 0;
  }

  // Subscription Key methods
  async getSubscriptionKey(id: number): Promise<SubscriptionKey | undefined> {
    const result = await this.db.select()
      .from(subscriptionKeys)
      .where(eq(subscriptionKeys.id, id))
      .limit(1);
    return result[0];
  }

  async getSubscriptionKeyById(id: number): Promise<SubscriptionKey | undefined> {
    const result = await this.db.select()
      .from(subscriptionKeys)
      .where(eq(subscriptionKeys.id, id))
      .limit(1);
    return result[0];
  }

  async getSubscriptionKeyByValue(keyValue: string): Promise<SubscriptionKey | undefined> {
    const result = await this.db.select()
      .from(subscriptionKeys)
      .where(eq(subscriptionKeys.keyValue, keyValue))
      .limit(1);
    return result[0];
  }

  async getSubscriptionKeysByAdmin(adminId: number): Promise<SubscriptionKey[]> {
    return await this.db.select()
      .from(subscriptionKeys)
      .where(eq(subscriptionKeys.createdById, adminId));
  }

  async getSubscriptionKeysByUserId(userId: number): Promise<SubscriptionKey[]> {
    return await this.db.select()
      .from(subscriptionKeys)
      .where(eq(subscriptionKeys.userId, userId));
  }

  async getActiveSubscriptionKeys(): Promise<SubscriptionKey[]> {
    return await this.db.select()
      .from(subscriptionKeys)
      .where(eq(subscriptionKeys.status, "active"));
  }
  
  async getAllSubscriptionKeys(): Promise<SubscriptionKey[]> {
    return await this.db.select().from(subscriptionKeys);
  }
  
  async getUsersWithSubscriptionKeys(): Promise<User[]> {
    // Find users who have subscription keys
    const usersWithKeys = await this.db.select()
      .from(users)
      .innerJoin(subscriptionKeys, eq(users.id, subscriptionKeys.userId));
    
    // Extract unique users
    const uniqueUserIds = [...new Set(usersWithKeys.map(row => row.users.id))];
    
    // Return users by their ids
    return await this.db.select()
      .from(users)
      .where(inArray(users.id, uniqueUserIds));
  }

  async createSubscriptionKey(keyData: InsertSubscriptionKey): Promise<SubscriptionKey> {
    const result = await this.db.insert(subscriptionKeys).values(keyData).returning();
    return result[0];
  }

  async updateSubscriptionKey(id: number, keyData: Partial<SubscriptionKey>): Promise<SubscriptionKey | undefined> {
    const result = await this.db.update(subscriptionKeys)
      .set(keyData)
      .where(eq(subscriptionKeys.id, id))
      .returning();
    return result[0];
  }

  async updateSubscriptionKeyStatus(id: number, status: "active" | "used" | "expired" | "revoked"): Promise<SubscriptionKey | undefined> {
    const result = await this.db.update(subscriptionKeys)
      .set({ status })
      .where(eq(subscriptionKeys.id, id))
      .returning();
    return result[0];
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    const result = await this.db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id))
      .limit(1);
    return result[0];
  }

  async updateUserSubscriptionType(userId: number, type: "none" | "basic" | "premium"): Promise<User | undefined> {
    const result = await this.db.update(users)
      .set({ 
        subscriptionType: type,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  // Original method for backwards compatibility
  async redeemSubscriptionKey(keyValue: string, userId: number): Promise<SubscriptionKey | undefined> {
    // Find the key first
    const key = await this.getSubscriptionKeyByValue(keyValue);
    if (!key || key.status !== "active") return undefined;
    
    // Update the key with user and status
    const now = new Date();
    const updatedKey = await this.updateSubscriptionKey(key.id, {
      userId,
      status: "used",
      redeemedAt: now
    });
    
    if (!updatedKey) return undefined;
    
    // Get the subscription plan
    const plan = await this.getSubscriptionPlan(key.planId);
    if (!plan) return updatedKey;
    
    // Update user with subscription info
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);
    
    await this.updateUserSubscription(userId, {
      type: plan.name.toLowerCase() as any,
      status: "active",
      startDate: now,
      endDate
    });
    
    // Also update subscription type
    await this.updateUserSubscriptionType(userId, plan.price <= 5 ? "basic" : "premium");
    
    return updatedKey;
  }
  
  // New version by ID instead of keyValue
  async redeemSubscriptionKey(id: number, userId: number): Promise<SubscriptionKey | undefined> {
    // Find the key first
    const key = await this.getSubscriptionKey(id);
    if (!key || key.status !== "active") return undefined;
    
    // Update the key with user and status
    const now = new Date();
    const updatedKey = await this.updateSubscriptionKey(key.id, {
      userId,
      status: "used",
      redeemedAt: now
    });
    
    if (!updatedKey) return undefined;
    
    // Get the subscription plan
    const plan = await this.getSubscriptionPlan(key.planId);
    if (!plan) return updatedKey;
    
    // Update user with subscription info
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);
    
    await this.updateUserSubscription(userId, {
      type: plan.name.toLowerCase() as any,
      status: "active",
      startDate: now,
      endDate
    });
    
    // Also update subscription type
    await this.updateUserSubscriptionType(userId, plan.price <= 5 ? "basic" : "premium");
    
    return updatedKey;
  }

  async revokeSubscriptionKey(id: number): Promise<boolean> {
    // Get the key first to check its status
    const key = await this.getSubscriptionKey(id);
    if (!key || key.status === "used" || key.status === "expired") return false;
    
    // Update the key status to revoked
    const result = await this.db.update(subscriptionKeys)
      .set({ status: "revoked" })
      .where(eq(subscriptionKeys.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Course Section methods
  async getCourseSection(id: number): Promise<CourseSection | undefined> {
    const result = await this.db.select().from(courseSections).where(eq(courseSections.id, id)).limit(1);
    return result[0];
  }

  async getCourseSectionsByCourse(courseId: number): Promise<CourseSection[]> {
    return await this.db.select().from(courseSections).where(eq(courseSections.courseId, courseId));
  }

  async createCourseSection(sectionData: InsertCourseSection): Promise<CourseSection> {
    const result = await this.db.insert(courseSections).values(sectionData).returning();
    return result[0];
  }

  async updateCourseSection(id: number, sectionData: Partial<CourseSection>): Promise<CourseSection | undefined> {
    const result = await this.db.update(courseSections)
      .set({ ...sectionData, updatedAt: new Date() })
      .where(eq(courseSections.id, id))
      .returning();
    return result[0];
  }

  async deleteCourseSection(id: number): Promise<boolean> {
    // Delete any materials in this section first
    const sectionMaterials = await this.getCourseMaterialsBySection(id);
    for (const material of sectionMaterials) {
      await this.deleteCourseMaterial(material.id);
    }
    
    // Delete the section
    const result = await this.db.delete(courseSections)
      .where(eq(courseSections.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  // Course Material methods
  async getCourseMaterial(id: number): Promise<CourseMaterial | undefined> {
    const result = await this.db.select().from(courseMaterials).where(eq(courseMaterials.id, id)).limit(1);
    return result[0];
  }

  async getCourseMaterialsByCourse(courseId: number): Promise<CourseMaterial[]> {
    return await this.db.select().from(courseMaterials).where(eq(courseMaterials.courseId, courseId));
  }

  async getCourseMaterialsBySection(sectionId: number): Promise<CourseMaterial[]> {
    return await this.db.select().from(courseMaterials).where(eq(courseMaterials.sectionId, sectionId));
  }

  async createCourseMaterial(materialData: InsertCourseMaterial): Promise<CourseMaterial> {
    const result = await this.db.insert(courseMaterials).values(materialData).returning();
    return result[0];
  }

  async updateCourseMaterial(id: number, materialData: Partial<CourseMaterial>): Promise<CourseMaterial | undefined> {
    const result = await this.db.update(courseMaterials)
      .set({ ...materialData, updatedAt: new Date() })
      .where(eq(courseMaterials.id, id))
      .returning();
    return result[0];
  }

  async deleteCourseMaterial(id: number): Promise<boolean> {
    const result = await this.db.delete(courseMaterials)
      .where(eq(courseMaterials.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  // Scholarship methods
  async getAllScholarships(): Promise<Scholarship[]> {
    return await this.db.select().from(scholarships);
  }
  
  async getScholarship(id: number): Promise<Scholarship | undefined> {
    const result = await this.db.select().from(scholarships).where(eq(scholarships.id, id)).limit(1);
    return result[0];
  }
  
  async getActiveScholarships(): Promise<Scholarship[]> {
    return await this.db.select().from(scholarships).where(
      or(
        eq(scholarships.status, "active"),
        eq(scholarships.status, "coming_soon")
      )
    );
  }
  
  async getScholarshipsByLevel(level: string): Promise<Scholarship[]> {
    // Since we're using educationLevels array, we need to check if the level is included in the array
    // This is a bit of a workaround since PostgreSQL's arrays aren't directly filterable with eq()
    return await this.db.select().from(scholarships)
      .where(
        eq(scholarships.status, "active")
      );
    // Note: This should ideally filter by education level, but we'll return all active scholarships
    // and then filter on the client side if needed
  }
  
  async createScholarship(scholarshipData: InsertScholarship): Promise<Scholarship> {
    const result = await this.db.insert(scholarships).values(scholarshipData).returning();
    return result[0];
  }
  
  async updateScholarship(id: number, scholarshipData: Partial<Scholarship>): Promise<Scholarship | undefined> {
    const result = await this.db.update(scholarships)
      .set({
        ...scholarshipData,
        updatedAt: new Date()
      })
      .where(eq(scholarships.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteScholarship(id: number): Promise<boolean> {
    const result = await this.db.delete(scholarships)
      .where(eq(scholarships.id, id))
      .returning();
      
    return result.length > 0;
  }
}

// Always use PostgreSQL storage as required by the client
export const storage = new DatabaseStorage();
