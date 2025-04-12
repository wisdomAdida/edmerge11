import { storage } from "../storage";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createCoursesForPrimary() {
  console.log("Creating courses for the primary level...");
  
  try {
    // Connect to the database
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const client = postgres(connectionString);
    
    // Using user with ID 1 as the tutor (assuming it's admin)
    let tutorId = 1;
    
    // Check if tutor exists
    const tutor = await storage.getUser(tutorId);
    if (tutor) {
      console.log(`Using existing user (ID: ${tutorId}) for new courses`);
    } else {
      // Create a new tutor
      const newTutor = await storage.createUser({
        firstName: "Course",
        lastName: "Instructor",
        username: "primary_instructor",
        email: "instructor@example.com",
        password: await hashPassword("instructor123"),
        role: "tutor" as const,
        bio: "Primary school subject matter expert"
      });
      tutorId = newTutor.id;
      console.log(`Created new tutor (ID: ${tutorId}) for courses`);
    }

    // Create primary school courses
    const primaryCourses = [
      {
        tutorId,
        title: "Basic Mathematics",
        description: "Learn foundational math concepts including counting, addition, subtraction, and simple geometry.",
        coverImage: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=2670&auto=format&fit=crop",
        price: 0,
        isFree: true,
        status: "published" as const,
        category: "mathematics",
        level: "primary" as const,
      },
      {
        tutorId,
        title: "Reading & Literacy",
        description: "Develop essential reading skills with fun, interactive lessons for primary school students.",
        coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2622&auto=format&fit=crop",
        price: 0,
        isFree: true,
        status: "published" as const,
        category: "language",
        level: "primary" as const,
      },
      {
        tutorId,
        title: "Science Discovery",
        description: "Explore the natural world through simple experiments and engaging activities.",
        coverImage: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2558&auto=format&fit=crop",
        price: 0,
        isFree: true,
        status: "published" as const,
        category: "science",
        level: "primary" as const,
      }
    ];
    
    // Create the courses
    for (const course of primaryCourses) {
      try {
        const createdCourse = await storage.createCourse(course);
        console.log(`Created course: ${createdCourse.title} (ID: ${createdCourse.id})`);
      } catch (error) {
        console.error(`Failed to create course "${course.title}":`, error);
      }
    }
    
    // Use the currently logged in user (ID 4) directly 
    const primaryStudentId = 4; // This is the user ID from the log
    
    // Check if this student exists
    const primaryStudent = await storage.getUser(primaryStudentId);
    if (primaryStudent) {
      console.log(`Found primary student (ID: ${primaryStudentId})`);
      
      // Get the courses we just created
      const courses = await storage.getCoursesByLevel("primary");
      
      for (const course of courses) {
        // Check if enrollment already exists
        const existingEnrollment = await storage.getEnrollmentByUserAndCourse(
          primaryStudentId, 
          course.id
        );
        
        if (!existingEnrollment) {
          // Create enrollment
          const enrollment = await storage.createEnrollment({
            userId: primaryStudentId,
            courseId: course.id,
            progress: 0,
            isCompleted: false
          });
          console.log(`Created enrollment for student ${primaryStudentId} in course ${course.id}`);
        } else {
          console.log(`Enrollment already exists for student ${primaryStudentId} in course ${course.id}`);
        }
      }
    }
    
    console.log("Primary courses creation completed!");
    await client.end(); // Close the database connection
    
  } catch (error) {
    console.error("Error creating courses:", error);
  }
}

// Run the function
createCoursesForPrimary().then(() => {
  console.log("Script execution finished");
}).catch((error) => {
  console.error("Script execution failed:", error);
});