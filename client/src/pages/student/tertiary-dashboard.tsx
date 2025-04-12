import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CourseList } from "@/components/dashboard/CourseList";
import { AITutorSection } from "@/components/dashboard/AITutorSection";
import { ScheduleSection } from "@/components/dashboard/ScheduleSection";
import { RecommendedCourses } from "@/components/dashboard/RecommendedCourses";
import { useQuery } from "@tanstack/react-query";

export default function TertiaryDashboard() {
  const [showAITutor, setShowAITutor] = useState(false);

  // Fetch enrolled courses
  const { data: enrolledCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  // Stats for the stats overview component
  const stats = [
    {
      label: "Enrolled Courses",
      value: enrolledCourses?.length || 0,
      change: {
        value: "3 this semester",
        positive: true,
        icon: "ri-arrow-up-line"
      }
    },
    {
      label: "GPA",
      value: "3.7",
      change: {
        value: "+0.2 points",
        positive: true,
        icon: "ri-arrow-up-line"
      }
    },
    {
      label: "Credits",
      value: "42",
      change: {
        value: "18 to graduate",
        positive: true,
        icon: "ri-graduation-cap-line"
      }
    },
    {
      label: "Research Papers",
      value: "2",
      change: {
        value: "In progress",
        positive: true,
        icon: "ri-file-paper-2-line"
      }
    }
  ];

  // Courses data
  const courses = [
    {
      id: 1,
      title: "Advanced Calculus",
      description: "Dive deep into multivariable calculus and its applications",
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      progress: 65,
      category: "Mathematics",
      level: "tertiary",
      tutor: {
        id: 7,
        name: "Prof. Anderson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      }
    },
    {
      id: 2,
      title: "Modern Literature",
      description: "Examine contemporary literary movements and critical theory",
      coverImage: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      progress: 40,
      category: "Humanities",
      level: "tertiary",
      tutor: {
        id: 8,
        name: "Dr. Thompson",
        avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      }
    },
    {
      id: 3,
      title: "Quantum Physics",
      description: "Understand the principles of quantum mechanics and its implications",
      coverImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80",
      progress: 55,
      category: "Physics",
      level: "tertiary",
      tutor: {
        id: 9,
        name: "Prof. Nakamura",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      }
    }
  ];

  // Schedule data
  const scheduleItems = [
    {
      time: "9:00 AM",
      title: "Advanced Calculus Lecture",
      details: "Prof. Anderson - Hall 302",
      type: "class"
    },
    {
      time: "11:30 AM",
      title: "Research Group Meeting",
      details: "Dr. Thompson - Science Building",
      type: "meeting"
    },
    {
      time: "2:00 PM",
      title: "Quantum Physics Lab",
      details: "Prof. Nakamura - Lab 101",
      type: "experiment"
    },
    {
      time: "4:30 PM",
      title: "Term Paper Deadline",
      details: "Modern Literature - Submit Online",
      type: "quiz"
    }
  ];

  // Recommended courses
  const recommendedCourses = [
    {
      id: 101,
      title: "Data Science Fundamentals",
      description: "Learn statistical analysis and machine learning basics",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 4.9,
      isPremium: true
    },
    {
      id: 102,
      title: "Advanced Economics",
      description: "Explore macroeconomic theories and fiscal policy",
      coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 4.7,
      isPremium: false
    },
    {
      id: 103,
      title: "Artificial Intelligence",
      description: "Understand AI algorithms and neural networks",
      coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1965&q=80",
      rating: 4.8,
      isPremium: true
    },
    {
      id: 104,
      title: "Biochemistry",
      description: "Study the chemical processes within living organisms",
      coverImage: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1780&q=80",
      rating: 4.6,
      isPremium: false
    }
  ];

  // AI tutor suggested questions
  const suggestedQuestions = [
    "Explain the Riemann hypothesis",
    "Help me understand quantum entanglement",
    "How do I structure my research paper?"
  ];

  const handleAskAI = () => {
    setShowAITutor(true);
    window.scrollTo({
      top: document.getElementById('ai-tutor-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  return (
    <DashboardLayout title="Tertiary Student Dashboard">
      {/* Welcome Section */}
      <WelcomeSection onAskAI={handleAskAI} />
      
      {/* Stats Overview */}
      <StatsOverview stats={stats} />
      
      {/* Current Courses */}
      <CourseList 
        title="Current Semester Courses" 
        viewAllLink="/courses" 
        courses={courses} 
      />
      
      {/* Learning Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" id="ai-tutor-section">
        {/* AI Tutor Section */}
        <AITutorSection suggestedQuestions={suggestedQuestions} />
        
        {/* Schedule & Reminders */}
        <ScheduleSection scheduleItems={scheduleItems} />
      </div>
      
      {/* Recommended Courses */}
      <RecommendedCourses courses={recommendedCourses} />
    </DashboardLayout>
  );
}
