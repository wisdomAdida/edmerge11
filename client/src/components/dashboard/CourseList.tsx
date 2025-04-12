import { CourseCard } from "./CourseCard";
import { Link } from "wouter";

interface Course {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  progress: number;
  category: string;
  level: string;
  tutor: {
    id: number;
    name: string;
    avatar: string;
  };
}

interface CourseListProps {
  title: string;
  viewAllLink: string;
  courses: Course[];
  onViewAllClick?: () => void;
}

export const CourseList = ({ title, viewAllLink, courses, onViewAllClick }: CourseListProps) => {
  // Handle empty courses state
  const hasCourses = courses && courses.length > 0;
  
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {onViewAllClick ? (
          <button 
            onClick={onViewAllClick}
            className="text-primary-500 text-sm font-medium flex items-center hover:underline"
          >
            <span>All courses</span>
            <i className="ri-arrow-right-line ml-1"></i>
          </button>
        ) : (
          <Link 
            href={viewAllLink} 
            className="text-primary-500 text-sm font-medium flex items-center"
          >
            <span>All courses</span>
            <i className="ri-arrow-right-line ml-1"></i>
          </Link>
        )}
      </div>
      
      {hasCourses ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              coverImage={course.coverImage}
              progress={course.progress}
              category={course.category}
              level={course.level}
              tutor={course.tutor}
              onClick={() => window.location.href = `/dashboard/student/courses/${course.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No courses enrolled yet</h3>
          <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
          <Link 
            href="/dashboard/student/courses" 
            className="inline-block bg-primary-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-600 transition-all"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
};
