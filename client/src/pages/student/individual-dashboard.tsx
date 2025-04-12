import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CourseList } from "@/components/dashboard/CourseList";
import { AITutorSection } from "@/components/dashboard/AITutorSection";
import { ScheduleSection } from "@/components/dashboard/ScheduleSection";
import { RecommendedCourses } from "@/components/dashboard/RecommendedCourses";
import { useQuery } from "@tanstack/react-query";

export default function IndividualDashboard() {
  const [showAITutor, setShowAITutor] = useState(false);

  // Fetch enrolled courses
  const { data: enrolledCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  // Stats for the stats overview component
  const stats = [
    {
      label: "Courses",
      value: enrolledCourses?.length || 0,
      change: {
        value: "Personalized",
        positive: true,
        icon: "ri-user-settings-line",
      },
    },
    {
      label: "Skills Gained",
      value: "12",
      change: {
        value: "+3 this month",
        positive: true,
        icon: "ri-arrow-up-line",
      },
    },
    {
      label: "Learning Hours",
      value: "34",
      change: {
        value: "This month",
        positive: true,
        icon: "ri-time-line",
      },
    },
    {
      label: "Certificates",
      value: "4",
      change: {
        value: "In progress: 2",
        positive: true,
        icon: "ri-award-line",
      },
    },
  ];

  // Courses data
  const courses = [
    {
      id: 1,
      title: "Digital Marketing Mastery",
      description: "Learn social media, SEO, and content marketing strategies",
      coverImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80",
      progress: 70,
      category: "Marketing",
      level: "individual",
      tutor: {
        id: 10,
        name: "Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    },
    {
      id: 2,
      title: "UX/UI Design Principles",
      description: "Master user experience and interface design fundamentals",
      coverImage:
        "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      progress: 45,
      category: "Design",
      level: "individual",
      tutor: {
        id: 11,
        name: "Michael Chen",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    },
    {
      id: 3,
      title: "Project Management",
      description:
        "Learn agile, scrum, and traditional project management approaches",
      coverImage:
        "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1776&q=80",
      progress: 60,
      category: "Business",
      level: "individual",
      tutor: {
        id: 12,
        name: "Amanda Rodriguez",
        avatar:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    },
  ];

  // Schedule data
  const scheduleItems = [
    {
      time: "10:00 AM",
      title: "Marketing Strategy Session",
      details: "Sarah Johnson - Online",
      type: "class",
    },
    {
      time: "1:30 PM",
      title: "UX Design Workshop",
      details: "Michael Chen - Collaborative",
      type: "meeting",
    },
    {
      time: "4:00 PM",
      title: "Project Management Quiz",
      details: "30 minutes - Online",
      type: "quiz",
    },
  ];

  // Recommended courses
  const recommendedCourses = [
    {
      id: 101,
      title: "Financial Planning",
      description: "Learn personal and business finance fundamentals",
      coverImage:
        "https://images.unsplash.com/photo-1579170053380-58828eeb2c97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 4.6,
      isPremium: false,
    },
    {
      id: 102,
      title: "Public Speaking",
      description: "Develop confident presentation and communication skills",
      coverImage:
        "https://images.unsplash.com/photo-1475721027785-f74ec9c7180a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 4.8,
      isPremium: false,
    },
    {
      id: 103,
      title: "Data Analysis with Python",
      description: "Learn to analyze and visualize data with Python",
      coverImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 4.9,
      isPremium: true,
    },
    {
      id: 104,
      title: "Leadership Essentials",
      description: "Develop key leadership and team management skills",
      coverImage:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 4.7,
      isPremium: true,
    },
  ];

  // AI tutor suggested questions
  const suggestedQuestions = [
    "How can I improve my digital marketing strategy?",
    "What are the principles of good UX design?",
    "Help me with project management methodologies",
  ];

  const handleAskAI = () => {
    setShowAITutor(true);
    window.scrollTo({
      top: document.getElementById("ai-tutor-section")?.offsetTop || 0,
      behavior: "smooth",
    });
  };

  return (
    <DashboardLayout title="Individual Learning Dashboard">
      {/* Welcome Section */}
      <WelcomeSection onAskAI={handleAskAI} />

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Current Courses */}
      <CourseList
        title="Your Learning Path"
        viewAllLink="/courses"
        courses={courses}
      />

      {/* Learning Activities */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        id="ai-tutor-section"
      >
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
