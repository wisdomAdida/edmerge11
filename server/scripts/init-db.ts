import { storage } from "../storage";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import {
  courses,
  enrollments,
  mentorships,
  subscriptionPlans,
  users
} from "@shared/schema";
import { eq, inArray, not } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function initDatabase() {
  console.log("Initializing database with sample data...");
  
  try {
    // Connect to the database
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const client = postgres(connectionString);
    const db = drizzle(client);
    
    // Clear existing data (for testing purposes)
    // In production, you would likely remove this
    console.log("Clearing existing data...");
    try {
      // Delete in order to respect foreign key constraints
      await db.delete(enrollments);
      await db.delete(mentorships);
      await db.delete(courses);
      
      // Handle subscription keys
      const existingKeys = await storage.getAllSubscriptionKeys();
      if (existingKeys.length > 0) {
        console.log("Subscription keys exist. Will preserve existing subscription plans.");
      } else {
        await db.delete(subscriptionPlans);
      }
      
      // Special handling for users with existing subscription keys
      const usersWithKeys = await storage.getUsersWithSubscriptionKeys();
      if (usersWithKeys.length > 0) {
        console.log(`Preserving ${usersWithKeys.length} users with active subscription keys`);
        // Only delete users without subscription keys
        const userIdsToPreserve = usersWithKeys.map((user: any) => user.id);
        if (userIdsToPreserve.length > 0) {
          await db.delete(users).where(
            not(inArray(users.id, userIdsToPreserve))
          );
        } else {
          await db.delete(users);
        }
      } else {
        await db.delete(users);
      }
    } catch (error) {
      console.warn("Warning during clearing data:", error);
      console.log("Continuing with data initialization...");
    }
    
    // Create subscription plans
    console.log("Creating subscription plans...");
    const subscriptionPlansData = [
      {
        name: "Basic",
        description: "Access to basic features for students",
        price: 3.00,
        currency: "USD",
        durationMonths: 3,
        features: ["Basic course access", "Limited AI tutor", "Standard support"]
      },
      {
        name: "Premium",
        description: "Full access to all features including live classes",
        price: 10.00,
        currency: "USD",
        durationMonths: 3,
        features: ["All courses access", "Advanced AI tutor", "Live classes", "Priority support", "Mentorship access"]
      }
    ];
    
    for (const plan of subscriptionPlansData) {
      await storage.createSubscriptionPlan(plan);
    }
    
    // Create users with different roles
    console.log("Creating users...");
    
    // Admin user
    const adminUser = await storage.createUser({
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "admin@edmerge.com",
      password: await hashPassword("admin123"),
      role: "admin" as const,
      bio: "Platform administrator",
      subscriptionType: "premium" as const,
      subscriptionStatus: "active" as const,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    });
    
    // Student users for different levels
    const students = [
      {
        firstName: "Primary",
        lastName: "Student",
        username: "primary_student",
        email: "primary@example.com",
        password: await hashPassword("password123"),
        role: "student" as const,
        studentLevel: "primary" as const,
        bio: "Elementary school student",
        subscriptionType: "basic" as const,
        subscriptionStatus: "active" as const,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        firstName: "Secondary",
        lastName: "Student",
        username: "secondary_student",
        email: "secondary@example.com",
        password: await hashPassword("password123"),
        role: "student" as const,
        studentLevel: "secondary" as const,
        bio: "High school student",
        subscriptionType: "premium" as const,
        subscriptionStatus: "active" as const,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        firstName: "Tertiary",
        lastName: "Student",
        username: "tertiary_student",
        email: "tertiary@example.com",
        password: await hashPassword("password123"),
        role: "student" as const,
        studentLevel: "tertiary" as const,
        bio: "University student",
        subscriptionType: "basic" as const,
        subscriptionStatus: "active" as const,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        firstName: "Individual",
        lastName: "Learner",
        username: "individual_learner",
        email: "individual@example.com",
        password: await hashPassword("password123"),
        role: "student" as const,
        studentLevel: "individual" as const,
        bio: "Self-paced learner",
        subscriptionType: "premium" as const,
        subscriptionStatus: "active" as const,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    ];
    
    const createdStudents = [];
    for (const student of students) {
      const createdStudent = await storage.createUser(student);
      createdStudents.push(createdStudent);
    }
    
    // Tutors
    const tutors = [
      {
        firstName: "Math",
        lastName: "Tutor",
        username: "math_tutor",
        email: "math@example.com",
        password: await hashPassword("password123"),
        role: "tutor" as const,
        bio: "Experienced mathematics instructor with 10+ years experience",
        profileImage: "https://i.pravatar.cc/150?img=1"
      },
      {
        firstName: "Science",
        lastName: "Tutor",
        username: "science_tutor",
        email: "science@example.com",
        password: await hashPassword("password123"),
        role: "tutor" as const,
        bio: "PhD in Physics with extensive teaching experience",
        profileImage: "https://i.pravatar.cc/150?img=2"
      },
      {
        firstName: "Language",
        lastName: "Tutor",
        username: "language_tutor",
        email: "language@example.com",
        password: await hashPassword("password123"),
        role: "tutor" as const,
        bio: "Multilingual instructor specializing in English and Spanish",
        profileImage: "https://i.pravatar.cc/150?img=3"
      }
    ];
    
    const createdTutors = [];
    for (const tutor of tutors) {
      const createdTutor = await storage.createUser(tutor);
      createdTutors.push(createdTutor);
    }
    
    // Mentors
    const mentors = [
      {
        firstName: "Career",
        lastName: "Mentor",
        username: "career_mentor",
        email: "career@example.com",
        password: await hashPassword("password123"),
        role: "mentor" as const,
        bio: "Career counselor with expertise in tech industry job placement",
        profileImage: "https://i.pravatar.cc/150?img=4"
      },
      {
        firstName: "Academic",
        lastName: "Mentor",
        username: "academic_mentor",
        email: "academic@example.com",
        password: await hashPassword("password123"),
        role: "mentor" as const,
        bio: "Helping students navigate academic choices and research opportunities",
        profileImage: "https://i.pravatar.cc/150?img=5"
      }
    ];
    
    const createdMentors = [];
    for (const mentor of mentors) {
      const createdMentor = await storage.createUser(mentor);
      createdMentors.push(createdMentor);
    }
    
    // Researchers
    const researchers = [
      {
        firstName: "Educational",
        lastName: "Researcher",
        username: "edu_researcher",
        email: "edu_research@example.com",
        password: await hashPassword("password123"),
        role: "researcher" as const,
        bio: "Researching effective teaching methods and educational technologies",
        profileImage: "https://i.pravatar.cc/150?img=7"
      },
      {
        firstName: "STEM",
        lastName: "Researcher",
        username: "stem_researcher",
        email: "stem_research@example.com",
        password: await hashPassword("password123"),
        role: "researcher" as const,
        bio: "Research focused on improving STEM education outcomes",
        profileImage: "https://i.pravatar.cc/150?img=8"
      }
    ];
    
    const createdResearchers = [];
    for (const researcher of researchers) {
      const createdResearcher = await storage.createUser(researcher);
      createdResearchers.push(createdResearcher);
    }
    
    // Create courses
    console.log("Creating courses...");
    
    const courseData = [
      {
        tutorId: createdTutors[0].id, // Math tutor
        title: "Elementary Mathematics",
        description: "Foundation in basic mathematics concepts for primary school students",
        coverImage: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?q=80&w=2670&auto=format&fit=crop",
        price: 0,
        isFree: true,
        status: "published" as const,
        category: "mathematics",
        level: "primary" as const,
      },
      {
        tutorId: createdTutors[0].id, // Math tutor
        title: "Algebra Fundamentals",
        description: "Introduction to algebraic concepts and problem-solving techniques",
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop",
        price: 25,
        isFree: false,
        status: "published" as const,
        category: "mathematics",
        level: "secondary" as const,
      },
      {
        tutorId: createdTutors[0].id, // Math tutor
        title: "Advanced Calculus",
        description: "University-level calculus covering advanced topics and applications",
        coverImage: "https://images.unsplash.com/photo-1611348586840-ea9872d33411?q=80&w=2574&auto=format&fit=crop",
        price: 50,
        isFree: false,
        status: "published" as const,
        category: "mathematics",
        level: "tertiary" as const,
      },
      {
        tutorId: createdTutors[1].id, // Science tutor
        title: "Introduction to Biology",
        description: "Explore the basics of biology, cells, and living organisms",
        coverImage: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2670&auto=format&fit=crop",
        price: 0,
        isFree: true,
        status: "published" as const,
        category: "science",
        level: "primary" as const,
      },
      {
        tutorId: createdTutors[1].id, // Science tutor
        title: "Chemistry Fundamentals",
        description: "Learn about atoms, molecules, and chemical reactions",
        coverImage: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=2670&auto=format&fit=crop",
        price: 30,
        isFree: false,
        status: "published" as const,
        category: "science",
        level: "secondary" as const,
      },
      {
        tutorId: createdTutors[1].id, // Science tutor
        title: "Quantum Physics",
        description: "Advanced course on quantum mechanics and modern physics theories",
        coverImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=2574&auto=format&fit=crop",
        price: 60,
        isFree: false,
        status: "published" as const,
        category: "science",
        level: "tertiary" as const,
      },
      {
        tutorId: createdTutors[2].id, // Language tutor
        title: "English Grammar Basics",
        description: "Master the fundamentals of English grammar and writing",
        coverImage: "https://images.unsplash.com/photo-1512344449841-026fa152f834?q=80&w=2574&auto=format&fit=crop",
        price: 0,
        isFree: true,
        status: "published" as const,
        category: "language",
        level: "primary" as const,
      },
      {
        tutorId: createdTutors[2].id, // Language tutor
        title: "Advanced English Literature",
        description: "Analyze and appreciate classic and contemporary English literature",
        coverImage: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=2670&auto=format&fit=crop",
        price: 35,
        isFree: false,
        status: "published" as const,
        category: "language",
        level: "secondary" as const,
      },
      {
        tutorId: createdTutors[2].id, // Language tutor
        title: "Spanish for Beginners",
        description: "Learn the basics of Spanish language for everyday conversation",
        coverImage: "https://images.unsplash.com/photo-1551818176-60579e574b91?q=80&w=2574&auto=format&fit=crop",
        price: 40,
        isFree: false,
        status: "published" as const,
        category: "language",
        level: "individual" as const,
      }
    ];
    
    const createdCourses = [];
    for (const course of courseData) {
      const createdCourse = await storage.createCourse(course);
      createdCourses.push(createdCourse);
    }
    
    // Create enrollments for students
    console.log("Creating enrollments...");
    
    // Primary student enrollments
    await storage.createEnrollment({
      userId: createdStudents[0].id, // Primary student
      courseId: createdCourses[0].id, // Elementary Mathematics
      progress: 75,
      isCompleted: false
    });
    
    await storage.createEnrollment({
      userId: createdStudents[0].id, // Primary student
      courseId: createdCourses[3].id, // Introduction to Biology
      progress: 45,
      isCompleted: false
    });
    
    await storage.createEnrollment({
      userId: createdStudents[0].id, // Primary student
      courseId: createdCourses[6].id, // English Grammar Basics
      progress: 90,
      isCompleted: false
    });
    
    // Secondary student enrollments
    await storage.createEnrollment({
      userId: createdStudents[1].id, // Secondary student
      courseId: createdCourses[1].id, // Algebra Fundamentals
      progress: 60,
      isCompleted: false
    });
    
    await storage.createEnrollment({
      userId: createdStudents[1].id, // Secondary student
      courseId: createdCourses[4].id, // Chemistry Fundamentals
      progress: 30,
      isCompleted: false
    });
    
    await storage.createEnrollment({
      userId: createdStudents[1].id, // Secondary student
      courseId: createdCourses[7].id, // Advanced English Literature
      progress: 15,
      isCompleted: false
    });
    
    // Tertiary student enrollments
    await storage.createEnrollment({
      userId: createdStudents[2].id, // Tertiary student
      courseId: createdCourses[2].id, // Advanced Calculus
      progress: 55,
      isCompleted: false
    });
    
    await storage.createEnrollment({
      userId: createdStudents[2].id, // Tertiary student
      courseId: createdCourses[5].id, // Quantum Physics
      progress: 25,
      isCompleted: false
    });
    
    // Individual learner enrollments
    await storage.createEnrollment({
      userId: createdStudents[3].id, // Individual learner
      courseId: createdCourses[8].id, // Spanish for Beginners
      progress: 70,
      isCompleted: false
    });
    
    await storage.createEnrollment({
      userId: createdStudents[3].id, // Individual learner
      courseId: createdCourses[0].id, // Elementary Mathematics
      progress: 100,
      isCompleted: true
    });
    
    // Create mentorships
    console.log("Creating mentorships...");
    
    await storage.createMentorship({
      mentorId: createdMentors[0].id, // Career mentor
      studentId: createdStudents[3].id, // Individual learner
      status: "active" as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    await storage.createMentorship({
      mentorId: createdMentors[1].id, // Academic mentor
      studentId: createdStudents[2].id, // Tertiary student
      status: "active" as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
    });
    
    console.log("Database initialization complete!");
    
    // Close the database connection
    await client.end();
    
    // Return success
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error };
  }
}

// Execute the initialization
initDatabase().then((result) => {
  console.log(result.success ? "Database initialization successful!" : "Database initialization failed!");
  if (!result.success) {
    console.error(result.error);
  }
  process.exit(result.success ? 0 : 1);
});