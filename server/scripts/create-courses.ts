import { storage } from "../storage";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

async function createCourses() {
  console.log("Creating courses for the primary level...");
  
  try {
    // Connect to the database
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const client = postgres(connectionString);
    const db = drizzle(client);
    
    // First, find a tutor ID to use or create a fixed one
    // Let's just use a fixed tutor ID for simplicity
    let tutorId = 1; // Assuming ID 1 exists, otherwise we'll create one
    
    // Check if tutor exists
    const tutor = await storage.getUser(tutorId);
    if (tutor) {
      console.log(`Using existing user (ID: ${tutorId}) for new courses`);
    } else {
      // Create a new tutor if none exists
      const newTutor = await storage.createUser({
        firstName: "Course",
        lastName: "Instructor",
        username: "primary_instructor",
        email: "instructor@example.com",
        password: "hashed_password", // In a real app, this would be properly hashed
        role: "tutor",
        bio: "Primary school subject matter expert",
        profileImage: "https://i.pravatar.cc/150?img=10"
      });
      tutorId = newTutor.id;
      console.log(`Created new tutor (ID: ${tutorId}) for the courses`);
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
      },
      {
        tutorId,
        title: "Introduction to Coding",
        description: "Learn to think like a programmer with block-based coding challenges designed for young learners.",
        coverImage: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=2631&auto=format&fit=crop",
        price: 5,
        isFree: false,
        status: "published" as const,
        category: "technology",
        level: "primary" as const,
      },
      {
        tutorId,
        title: "Social Studies for Kids",
        description: "Learn about communities, geography, and history in a fun, accessible way.",
        coverImage: "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?q=80&w=2691&auto=format&fit=crop",
        price: 0,
        isFree: true,
        status: "published" as const,
        category: "socialStudies",
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
    
    console.log("Primary courses creation completed!");
    await client.end(); // Close the database connection
    
  } catch (error) {
    console.error("Error creating courses:", error);
  }
}

// Run the function
createCourses().then(() => {
  console.log("Script execution finished");
}).catch(console.error);