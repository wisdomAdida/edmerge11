interface Tutor {
  id: number;
  name: string;
  avatar: string;
}

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  progress: number;
  category: string;
  level: string;
  tutor: Tutor;
  onClick?: () => void;
}

export const CourseCard = ({
  id,
  title,
  description,
  coverImage,
  progress,
  category,
  level,
  tutor,
  onClick
}: CourseCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 card-hover">
      <div className="h-40 overflow-hidden relative">
        <img 
          src={coverImage}
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-medium text-primary-500">
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        
        {/* Progress Section */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
              <img 
                src={tutor.avatar || `https://ui-avatars.com/api/?name=${tutor.name.replace(' ', '+')}`} 
                alt={tutor.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm text-gray-600">{tutor.name}</span>
          </div>
          <button 
            onClick={onClick}
            className="bg-primary-50 text-primary-500 rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-primary-100 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
