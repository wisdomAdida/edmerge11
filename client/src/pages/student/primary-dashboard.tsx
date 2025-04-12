import { useEffect, useState } from "react";
import { PrimaryDashboardLayout } from "@/components/layout/PrimaryDashboardLayout";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CourseList } from "@/components/dashboard/CourseList";
import { AITutorSection } from "@/components/dashboard/AITutorSection";
import { ScheduleSection } from "@/components/dashboard/ScheduleSection";
import { StudyToolsCard } from "@/components/dashboard/StudyToolsCard";
import { RecommendedCourses } from "@/components/dashboard/RecommendedCourses";
import { ScholarshipSection } from "@/components/dashboard/ScholarshipSection";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useLocation, Link } from "wouter";

// Schedule item type from the ScheduleSection component
interface ScheduleItem {
  time: string;
  title: string;
  details: string;
  type: "class" | "quiz" | "experiment" | "meeting" | "other";
}

// Type definitions
interface Course {
  id: number;
  tutorId: number;
  title: string;
  description: string;
  coverImage?: string;
  price: number;
  isFree: boolean;
  status: string;
  category: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  updatedAt: string;
  course?: Course;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
}

interface LiveClass {
  id: number;
  tutorId: number;
  courseId: number;
  title: string;
  description: string;
  status: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  streamUrl?: string;
  roomId?: string;
}

export default function PrimaryDashboard() {
  const { user } = useAuth();
  const [showAITutor, setShowAITutor] = useState(false);
  const [, navigate] = useLocation();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Set page loaded after initial render to trigger animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch enrolled courses with data
  const { data: enrollmentsData = [], isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  // Fetch recommended courses
  const { data: recommendedCoursesData = [], isLoading: isLoadingRecommended } = useQuery<Course[]>({
    queryKey: ["/api/courses/recommended"],
    enabled: user !== null, // Only fetch if user is logged in
  });

  // Fetch recent topics (for AI tutor section)
  const { data: recentTopics = [], isLoading: isLoadingTopics } = useQuery<{id: number, title: string}[]>({
    queryKey: ["/api/student/recent-topics"],
    enabled: user !== null,
  });

  // Fetch live classes for the schedule
  const { data: liveClassesData = [], isLoading: isLoadingLiveClasses } = useQuery<LiveClass[]>({
    queryKey: ["/api/live-classes"],
    enabled: user !== null,
  });

  // Compute completion rate based on real data
  const calculateCompletionRate = () => {
    if (enrollmentsData.length === 0) return 0;
    
    const completedCourses = enrollmentsData.filter(e => e.isCompleted).length;
    return Math.round((completedCourses / enrollmentsData.length) * 100);
  };

  // Format enrolled courses for the CourseList component
  const formattedCourses = enrollmentsData.map(enrollment => {
    return {
      id: enrollment.courseId,
      title: enrollment.course?.title || "Loading...",
      description: enrollment.course?.description || "Course content loading...",
      coverImage: enrollment.course?.coverImage || "https://via.placeholder.com/640x360?text=EdMerge",
      progress: enrollment.progress,
      category: enrollment.course?.category || "General",
      level: enrollment.course?.level || "primary",
      tutor: {
        id: enrollment.course?.tutorId || 0,
        name: "Loading tutor information...",
        avatar: "https://ui-avatars.com/api/?name=Tutor"
      }
    };
  });

  // Format recommended courses for display
  // Interface for recommended course format
  interface RecommendedCourse {
    id: number;
    title: string;
    description: string;
    coverImage: string;
    rating: number;
    isPremium: boolean;
    category: string;
    level: string;
  }
  
  // Format recommended courses for display
  const formattedRecommended: RecommendedCourse[] = recommendedCoursesData.map(course => {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      coverImage: course.coverImage || "https://via.placeholder.com/640x360?text=EdMerge",
      rating: 4.5, // Default rating if not available
      isPremium: !course.isFree,
      category: course.category || "General",
      level: course.level || "All Levels"
    };
  });

  // Create suggested questions from recent topics
  const suggestedQuestions = recentTopics.length > 0 
    ? recentTopics.slice(0, 3).map(item => `Help me understand ${item.title}`)
    : [
        "How do I solve multiplication problems?",
        "What is photosynthesis?",
        "Help with my reading homework"
      ];

  // Format live classes for schedule display
  const scheduleItems: ScheduleItem[] = liveClassesData
    .filter(liveClass => liveClass.status === "scheduled")
    .slice(0, 3)
    .map(liveClass => {
      const startTime = new Date(liveClass.scheduledStartTime);
      const endTime = new Date(liveClass.scheduledEndTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // duration in minutes
      
      return {
        time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: liveClass.title,
        details: `${liveClass.description.substring(0, 20)}... - ${duration} mins`,
        type: "class" as const
      };
    });

  // Add default schedule items if none are available
  if (scheduleItems.length === 0) {
    scheduleItems.push(
      {
        time: "No scheduled classes",
        title: "Check back later",
        details: "No upcoming live classes scheduled",
        type: "other" as const
      }
    );
  }

  // Stats based on real data
  const stats = [
    {
      label: "Enrolled Courses",
      value: enrollmentsData.length.toString(),
      change: {
        value: "Active Learning",
        positive: true,
        icon: "ri-book-open-line"
      }
    },
    {
      label: "Completion Rate",
      value: `${calculateCompletionRate()}%`,
      change: {
        value: "Keep learning!",
        positive: true,
        icon: "ri-arrow-up-line"
      }
    },
    {
      label: "Live Classes",
      value: liveClassesData.filter(lc => lc.status === "scheduled").length.toString(),
      change: {
        value: "Upcoming",
        positive: true,
        icon: "ri-live-line"
      }
    },
    {
      label: "Learning Points",
      value: (user?.id ? user.id * 100 + 450 : 0).toString(), // Simple calculation for points
      change: {
        value: "Keep earning!",
        positive: true,
        icon: "ri-award-line"
      }
    }
  ];

  const handleAskAI = () => {
    setShowAITutor(true);
    window.scrollTo({
      top: document.getElementById('ai-tutor-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  const isLoading = isLoadingEnrollments || isLoadingRecommended || isLoadingTopics || isLoadingLiveClasses;
  
  if (isLoading && !isPageLoaded) {
    return (
      <PrimaryDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <div className="text-center">
            <p className="font-medium text-primary">Loading your fun learning dashboard!</p>
            <p className="text-sm text-muted-foreground mt-1">Getting everything ready for you...</p>
          </div>
        </div>
      </PrimaryDashboardLayout>
    );
  }

  return (
    <PrimaryDashboardLayout>
      {/* Welcome Banner - Child-friendly with bright colors */}
      <div 
        className={`bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-xl p-6 mb-6 shadow-lg
          transition-all duration-500 ${isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Hello, {user?.firstName || "Student"}! 👋
            </h1>
            <p className="text-white/90 mt-2">
              Welcome to your learning adventure! What would you like to explore today?
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={handleAskAI}
              className="bg-white text-purple-600 hover:bg-purple-100 transition-colors px-4 py-2 rounded-full font-medium shadow-md flex items-center"
            >
              <span className="mr-2">Ask AI Helper</span>
              <span className="text-xl">🧠</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview with animated cards */}
      <div 
        className={`mb-8 transition-all duration-500 delay-100
          ${isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span> Your Learning Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-4 border-l-4 hover:scale-105 transition-all duration-300"
              style={{ 
                borderLeftColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'][index % 4],
                transitionDelay: `${(index + 1) * 100}ms`,
                opacity: isPageLoaded ? 1 : 0,
                transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">
                  <i className={`${stat.change.icon} text-lg`} style={{ color: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'][index % 4] }}></i>
                </div>
              </div>
              <p className="text-xs mt-2 text-gray-500">
                {stat.change.positive ? '↗' : '↘'} {stat.change.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current Courses - with fun badges */}
      <div 
        className={`mb-8 transition-all duration-500 delay-150
          ${isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-2">📚</span> Continue Learning
          </h2>
          <Link
            href="/dashboard/student/courses"
            className="text-primary hover:underline text-sm font-medium"
          >
            View All Courses
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {formattedCourses.map((course, index) => (
            <Link
              key={course.id}
              href={`/dashboard/student/courses/${course.id}`}
              className="block"
            >
              <div 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
                style={{ 
                  transitionDelay: `${200 + (index * 100)}ms`,
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'
                }}
              >
                <div 
                  className="h-36 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${course.coverImage || '/images/course-placeholder.jpg'})` }}
                >
                  <div className="p-3 flex justify-end">
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <span>{course.category}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-1000" 
                        style={{ 
                          width: isPageLoaded ? `${course.progress || 0}%` : '0%',
                          transitionDelay: `${400 + (index * 150)}ms`
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>{course.progress || 0}% complete</span>
                      <span>⭐ Keep going!</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {formattedCourses.length === 0 && (
            <div 
              className="col-span-3 bg-gray-50 rounded-lg p-8 text-center transition-all duration-300"
              style={{ 
                transitionDelay: '200ms',
                opacity: isPageLoaded ? 1 : 0,
                transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
              <Link 
                href="/dashboard/student/courses"
                className="mt-2 text-primary hover:underline inline-block"
              >
                Explore Courses
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Learning Activities with colorful cards */}
      <div 
        className={`grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 transition-all duration-500 delay-200
          ${isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
        id="ai-tutor-section"
      >
        {/* AI Tutor Section styled for kids */}
        <div 
          className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-5 shadow-md transition-all duration-500"
          style={{ 
            transitionDelay: '300ms',
            opacity: isPageLoaded ? 1 : 0,
            transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <span className="text-xl mr-2">🤖</span> Ask AI Tutor
          </h3>
          <p className="text-sm text-gray-600 mb-4">Ask me anything and I'll help you learn!</p>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <Link
                key={index}
                href={`/dashboard/student/ai-tutor?q=${encodeURIComponent(question)}`}
                className="w-full text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm block"
              >
                {question}
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard/student/ai-tutor"
            className="mt-4 text-primary hover:underline text-sm font-medium inline-block"
          >
            Chat with AI Tutor
          </Link>
        </div>
        
        {/* Schedule Card - Fun design */}
        <div 
          className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-5 shadow-md transition-all duration-500"
          style={{ 
            transitionDelay: '400ms',
            opacity: isPageLoaded ? 1 : 0,
            transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <span className="text-xl mr-2">📅</span> Today's Schedule
          </h3>
          <div className="space-y-3">
            {scheduleItems.length > 0 ? (
              scheduleItems.map((item, index) => (
                <div key={index} className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <div className="mr-3 p-2 rounded-full bg-orange-100">
                    {item.type === 'class' && <span className="text-lg">👨‍🏫</span>}
                    {item.type === 'quiz' && <span className="text-lg">📝</span>}
                    {item.type === 'experiment' && <span className="text-lg">🧪</span>}
                    {item.type === 'meeting' && <span className="text-lg">👥</span>}
                    {item.type === 'other' && <span className="text-lg">📌</span>}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                    <p className="text-xs mt-1">{item.details}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No scheduled activities for today</p>
                <p className="text-xs mt-1">Enjoy your free time!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Study Tools - Playful design */}
        <div 
          className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-5 shadow-md transition-all duration-500"
          style={{ 
            transitionDelay: '500ms',
            opacity: isPageLoaded ? 1 : 0,
            transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <span className="text-xl mr-2">🧰</span> Learning Tools
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2">📝</span>
              <span className="text-sm font-medium">Notes</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2">🎮</span>
              <span className="text-sm font-medium">Games</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2">🧩</span>
              <span className="text-sm font-medium">Puzzles</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2">🎨</span>
              <span className="text-sm font-medium">Art Studio</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Recommended Courses */}
      <div 
        className={`mb-8 transition-all duration-500 delay-300
          ${isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-2">✨</span> Recommended for You
          </h2>
          <Link 
            href="/dashboard/student/courses"
            className="text-primary hover:underline text-sm font-medium inline-block"
          >
            Explore More
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {formattedRecommended.slice(0, 4).map((course, index) => (
            <Link 
              key={course.id}
              href={`/dashboard/student/courses/${course.id}`}
              className="block"
            >
              <div 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
                style={{ 
                  transitionDelay: `${600 + (index * 100)}ms`,
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'
                }}
              >
                <div 
                  className="h-32 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${course.coverImage || '/images/course-placeholder.jpg'})` }}
                />
                <div className="p-3">
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>{course.category}</span>
                    <span className="mx-1">•</span>
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Scholarships Section */}
      <div 
        className={`mb-8 transition-all duration-500 delay-400
          ${isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
      >
        <ScholarshipSection 
          studentLevel="primary" 
          maxItems={3}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none"
        />
      </div>
    </PrimaryDashboardLayout>
  );
}