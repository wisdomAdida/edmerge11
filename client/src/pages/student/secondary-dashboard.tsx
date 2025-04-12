import { useState, useEffect } from "react";
import { Link } from "wouter";
import { SecondaryDashboardLayout } from "@/components/layout/SecondaryDashboardLayout";
import { ArrowRight, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";

// Type definitions
interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  updatedAt: string;
  course?: {
    id: number;
    tutorId: number;
    title: string;
    description: string;
    coverImage?: string;
    category: string;
    level: string;
    hasAssignments?: boolean;
    tutorName?: string;
    tutorAvatar?: string;
  };
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
  courseName?: string;
  tutorName?: string;
}

interface Topic {
  id: number;
  title: string;
}

interface ScheduleItem {
  time: string;
  title: string;
  details: string;
  type: "class" | "quiz" | "experiment" | "meeting" | "other";
}

interface Course {
  id: number;
  tutorId: number;
  title: string;
  description: string;
  coverImage?: string;
  price: number;
  isFree: boolean;
  rating?: number;
  status: string;
  category: string;
  level: string;
}

export default function SecondaryDashboard() {
  const { user } = useAuth();
  const [showAITutor, setShowAITutor] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");

  // Fetch enrolled courses data with proper error handling
  const { 
    data: enrollments = [], 
    isLoading: isLoadingEnrollments,
    error: enrollmentsError
  } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const response = await axios.get("/api/enrollments");
      return response.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch live classes with proper error handling
  const { 
    data: liveClasses = [], 
    isLoading: isLoadingLiveClasses,
    error: liveClassesError
  } = useQuery({
    queryKey: ["liveClasses"],
    queryFn: async () => {
      const response = await axios.get("/api/live-classes");
      return response.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent topics with proper error handling
  const { 
    data: recentTopics = [], 
    isLoading: isLoadingTopics,
    error: topicsError
  } = useQuery({
    queryKey: ["recentTopics"],
    queryFn: async () => {
      const response = await axios.get("/api/student/recent-topics");
      return response.data;
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch recommended courses with proper error handling
  const { 
    data: recommendedCourses = [], 
    isLoading: isLoadingRecommended,
    error: recommendedError
  } = useQuery({
    queryKey: ["recommendedCourses"],
    queryFn: async () => {
      const response = await axios.get("/api/courses/recommended");
      return response.data;
    },
    retry: 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Generate stats based on real data
  const stats = [
    {
      label: "Active Courses",
      value: enrollments.length || 0,
      change: {
        value: enrollments.length > 0 ? "In progress" : "Enroll now",
        positive: true,
        icon: "ri-book-open-line"
      }
    },
    {
      label: "Live Classes",
      value: liveClasses.length || 0,
      change: {
        value: liveClasses.length > 0 ? "Upcoming" : "None scheduled",
        positive: liveClasses.length > 0,
        icon: "ri-live-line"
      }
    },
    {
      label: "Assignments",
      value: enrollments.filter(e => e.course?.hasAssignments).length || 0,
      change: {
        value: "Due soon",
        positive: true,
        icon: "ri-calendar-event-line"
      }
    },
    {
      label: "Progress",
      value: enrollments.length > 0 
        ? `${Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length)}%` 
        : "0%",
      change: {
        value: "Overall",
        positive: true,
        icon: "ri-line-chart-line"
      }
    }
  ];

  // Format enrolled courses data for CourseList component
  const mappedCourses = enrollments.map(enrollment => ({
    id: enrollment.course?.id || 0,
    title: enrollment.course?.title || "Untitled Course",
    description: enrollment.course?.description || "",
    coverImage: enrollment.course?.coverImage || "/images/course-placeholder.jpg",
    progress: enrollment.progress,
    isCompleted: enrollment.isCompleted,
    category: enrollment.course?.category || "General",
    level: enrollment.course?.level || "secondary",
    tutor: {
      id: enrollment.course?.tutorId || 0,
      name: enrollment.course?.tutorName || "Unknown Tutor",
      avatar: enrollment.course?.tutorAvatar || "/images/default-avatar.jpg"
    }
  }));

  // Create schedule items from live classes
  const scheduleItems: ScheduleItem[] = liveClasses.map(liveClass => ({
    time: new Date(liveClass.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    title: liveClass.title,
    details: `${liveClass.courseName || "Course"} - ${liveClass.tutorName || "Tutor"}`,
    type: "class"
  }));

  // Add assignments and other events to schedule if needed
  if (scheduleItems.length === 0) {
    scheduleItems.push({
      time: "No scheduled events",
      title: "Your calendar is clear",
      details: "Check back later for updates",
      type: "other"
    });
  }

  // AI tutor suggested questions based on recent topics
  const suggestedQuestions = recentTopics.length > 0
    ? recentTopics.map(topic => `Help me understand ${topic.title}`)
    : [
        "How do I solve quadratic equations?",
        "What's the difference between ionic and covalent bonds?",
        "Help me analyze Shakespeare's sonnets"
      ];

  // Map recommended courses to the expected format
  const mappedRecommendedCourses = recommendedCourses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    coverImage: course.coverImage || "/images/course-placeholder.jpg",
    rating: course.rating || 4.5,
    isFree: course.isFree,
    price: course.price,
    category: course.category,
    level: course.level
  }));

  const handleAskAI = () => {
    setShowAITutor(true);
    const aiTutorSection = document.getElementById('ai-tutor-section');
    if (aiTutorSection) {
      aiTutorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAIQuestionSubmit = (e) => {
    e.preventDefault();
    if (aiQuestion.trim()) {
      window.location.href = `/dashboard/student/ai-tutor?q=${encodeURIComponent(aiQuestion)}`;
    }
  };

  // Handle errors from API calls
  useEffect(() => {
    const errors = [enrollmentsError, liveClassesError, topicsError, recommendedError].filter(Boolean);
    if (errors.length > 0) {
      console.error("API Errors:", errors);
      // You could add toast notifications here
    }
  }, [enrollmentsError, liveClassesError, topicsError, recommendedError]);

  const isLoading = isLoadingEnrollments || isLoadingLiveClasses || isLoadingTopics || isLoadingRecommended;

  if (isLoading) {
    return (
      <SecondaryDashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </SecondaryDashboardLayout>
    );
  }

  return (
    <SecondaryDashboardLayout>
      {/* Welcome Section - More academic and focused */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {user?.firstName || user?.username || "Student"}
            </h1>
            <p className="text-white/90 mt-2 max-w-2xl">
              Ready to continue your academic journey? You have {stats[0]?.value || '0'} courses in progress and 
              upcoming assignments this week.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button 
              onClick={handleAskAI}
              className="bg-white text-blue-700 hover:bg-blue-50 transition-colors px-4 py-2 rounded-md font-medium shadow-md flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Academic Assistant
            </button>
            <Link
              href="/dashboard/student/calendar"
              className="bg-blue-700 text-white hover:bg-blue-800 transition-colors px-4 py-2 rounded-md font-medium shadow-md flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Study Planner
            </Link>
          </div>
        </div>
      </div>

      {/* Academic Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <i className={`${stat.change.icon} text-blue-600`}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className={stat.change.positive ? 'text-green-600' : 'text-red-600'}>
                {stat.change.positive ? '+' : '-'} {stat.change.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Current Courses - Academic style */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Current Studies</h2>
          <Link
            href="/dashboard/student/courses"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            View All Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mappedCourses.length > 0 ? (
            mappedCourses.map(course => (
              <Link
                key={course.id}
                href={`/dashboard/student/courses/${course.id}`}
                className="block"
              >
                <div 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${course.coverImage})` }}
                  >
                    <div className="w-full h-full flex items-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <div>
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-sm">
                          {course.level}
                        </span>
                        <h3 className="text-white font-semibold text-lg mt-2">{course.title}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">{course.category}</span>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                        {course.isCompleted ? 'Completed' : `${course.progress || 0}% Complete`}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Next session: Today</span>
                      <button className="text-blue-600 hover:underline font-medium">
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 bg-gray-50 rounded-lg p-10 text-center">
              <p className="text-gray-600 mb-2">You haven't enrolled in any courses yet.</p>
              <Link
                href="/dashboard/student/courses"
                className="text-blue-600 hover:underline font-medium"
              >
                Browse Available Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Learning Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" id="ai-tutor-section">
        {/* Academic Assistant - 2 columns */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Academic Assistant</h3>
            <Link
              href="/dashboard/student/ai-tutor"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Open Full Assistant
            </Link>
          </div>

          <p className="text-gray-600 mb-4">
            Get answers to academic questions or assistance with your studies:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {suggestedQuestions.slice(0, 4).map((question, index) => (
              <Link
                key={index}
                href={`/dashboard/student/ai-tutor?q=${encodeURIComponent(question)}`}
                className="text-left p-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors block"
              >
                <p className="font-medium">{question}</p>
              </Link>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <form className="flex gap-2" onSubmit={handleAIQuestionSubmit}>
              <input 
                type="text" 
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Ask any academic question..."
              />
              <button 
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Ask
              </button>
            </form>
          </div>
        </div>

        {/* Academic Calendar & Deadlines */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">Upcoming Deadlines</h3>

          <div className="space-y-4">
            {scheduleItems.map((item, index) => (
              <div key={index} className="border-l-2 border-blue-600 pl-4 py-1">
                <p className="font-medium">{item.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-500">{item.time}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.type === 'quiz' ? 'bg-orange-100 text-orange-800' : 
                    item.type === 'class' ? 'bg-blue-100 text-blue-800' :
                    item.type === 'experiment' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.type === 'class' ? 'Lecture' : 
                     item.type === 'quiz' ? 'Assessment' : 
                     item.type === 'experiment' ? 'Lab Work' : 
                     item.type === 'meeting' ? 'Meeting' : 'Task'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Courses - More focused on academic advancement */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Recommended for Your Academic Path</h2>
            <p className="text-gray-600">Based on your interests and current studies</p>
          </div>
          <Link 
            href="/dashboard/student/courses/browse"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            Explore All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mappedRecommendedCourses.length > 0 ? (
            mappedRecommendedCourses.slice(0, 4).map(course => (
              <Link
                key={course.id}
                href={`/dashboard/student/courses/${course.id}`}
                className="block"
              >
                <div 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
                >
                  <div 
                    className="h-40 bg-cover bg-center"
                    style={{ backgroundImage: `url(${course.coverImage})` }}
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <div>
                      <span className="inline-block px-2 py-1 mb-2 text-xs bg-gray-100 text-gray-800 rounded">
                        {course.category}
                      </span>
                      <h3 className="font-medium line-clamp-2 mb-2">{course.title}</h3>
                    </div>
                    <div className="mt-auto pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{course.level}</span>
                        {course.isFree ? (
                          <span className="text-sm font-medium text-green-600">Free</span>
                        ) : (
                          <span className="text-sm font-medium">${course.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No recommendations available at the moment.</p>
              <Link
                href="/dashboard/student/courses/browse"
                className="text-blue-600 hover:underline font-medium mt-2 inline-block"
              >
                Browse All Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Research Agent Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Research Assistance</h2>
          <Link 
            href="/dashboard/student/research"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            View All Research <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <p className="text-gray-600 mb-4">
            Get help with your research projects and academic papers:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {["How does photosynthesis work?", 
              "What are the economic impacts of climate change?", 
              "Explain the history of artificial intelligence"].map((query, index) => (
              <Link
                key={index}
                href={`/dashboard/student/research?query=${encodeURIComponent(query)}`}
                className="text-left p-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors block"
              >
                <p className="font-medium">{query}</p>
              </Link>
            ))}
          </div>
          <Link 
            href="/dashboard/student/research"
            className="w-full block text-center bg-blue-50 text-blue-700 p-3 rounded-md hover:bg-blue-100 transition-colors font-medium"
          >
            Start New Research
          </Link>
        </div>
      </div>

      {/* Scholarships Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Scholarship Opportunities</h2>
          <Link 
            href="/dashboard/student/scholarships"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            View All Scholarships <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Applications Open</span>
                  <span className="text-sm font-medium text-gray-600">$1000-$5000</span>
                </div>
                <h3 className="font-medium text-lg mb-1">Merit Scholarship {item}</h3>
                <p className="text-sm text-gray-600 mb-3">For students with excellent academic achievement in mathematics and sciences.</p>
                <div className="text-xs text-gray-500 mb-3">Deadline: June 15, 2025</div>
                <Link 
                  href={`/dashboard/student/scholarships/${item}`}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SecondaryDashboardLayout>
  );
}