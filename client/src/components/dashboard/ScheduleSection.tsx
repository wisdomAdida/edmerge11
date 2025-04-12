interface ScheduleItem {
  time: string;
  title: string;
  details: string;
  type: "class" | "quiz" | "experiment" | "meeting" | "other";
}

interface ScheduleSectionProps {
  scheduleItems: ScheduleItem[];
}

export const ScheduleSection = ({ scheduleItems }: ScheduleSectionProps) => {
  const getItemBackground = (type: string) => {
    switch (type) {
      case "class":
        return "bg-primary-50";
      case "quiz":
        return "bg-accent-50";
      case "experiment":
        return "bg-secondary-50";
      case "meeting":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-5">Today's Schedule</h2>
      
      <div className="space-y-4">
        {scheduleItems.length > 0 ? (
          scheduleItems.map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="w-16 flex-shrink-0">
                <p className="text-sm font-medium text-gray-500">{item.time}</p>
              </div>
              <div className={`${getItemBackground(item.type)} rounded-lg p-3 flex-1`}>
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.details}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No scheduled events for today</p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <button className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          View Full Schedule
        </button>
      </div>
    </div>
  );
};
