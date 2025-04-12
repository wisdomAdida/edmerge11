import { Link } from "wouter";

interface RecommendedCourse {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  rating: number;
  isPremium: boolean;
}

interface RecommendedCoursesProps {
  courses: RecommendedCourse[];
  onViewAllClick?: () => void;
}

export const RecommendedCourses = ({ courses, onViewAllClick }: RecommendedCoursesProps) => {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
        {onViewAllClick ? (
          <button 
            onClick={onViewAllClick}
            className="text-primary-500 text-sm font-medium flex items-center hover:underline"
          >
            <span>Browse all</span>
            <i className="ri-arrow-right-line ml-1"></i>
          </button>
        ) : (
          <Link href="/dashboard/student/courses" className="text-primary-500 text-sm font-medium flex items-center">
            <span>Browse all</span>
            <i className="ri-arrow-right-line ml-1"></i>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.length > 0 ? courses.map((course) => (
          <div 
            key={course.id} 
            className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 card-hover"
          >
            <div className="h-32 overflow-hidden">
              <img 
                src={course.coverImage} 
                alt={course.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/640x360?text=EdMerge";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-bold text-gray-800 mb-1">{course.title}</h3>
              <p className="text-gray-600 text-xs mb-2 line-clamp-2">{course.description}</p>
              
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <i className="ri-star-fill text-amber-400 text-xs mr-1"></i>
                  <span className="text-xs text-gray-600">{course.rating}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${course.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {course.isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
              
              <Link href={`/dashboard/student/courses/${course.id}`}>
                <button className="w-full text-sm text-primary-500 border border-primary-500 rounded-lg py-1.5 hover:bg-primary-50 transition-colors">
                  View Course
                </button>
              </Link>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">
              We're working on personalized recommendations based on your interests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
