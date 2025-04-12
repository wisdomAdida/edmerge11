import { useAuth } from "@/hooks/use-auth";

interface WelcomeSectionProps {
  onAskAI?: () => void;
  username?: string;
}

export const WelcomeSection = ({ onAskAI, username }: WelcomeSectionProps) => {
  const { user } = useAuth();
  const studentName = username || user?.firstName || "Student";
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get motivational messages based on time of day
  const getMotivationalMessage = () => {
    const messages = [
      "Ready for another day of awesome learning?",
      "What will you discover today?",
      "Your learning journey continues!",
      "Make today count with new knowledge!",
      "Every lesson brings you closer to mastery."
    ];
    
    // Return a randomly selected message
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {getGreeting()}, {studentName}! 👋
          </h1>
          <p className="text-gray-600">{getMotivationalMessage()}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={onAskAI}
            className="bg-primary-500 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center hover:bg-primary-600 transition-all"
          >
            <i className="ri-ai-generate mr-1.5"></i>
            <span>Ask AI Tutor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
