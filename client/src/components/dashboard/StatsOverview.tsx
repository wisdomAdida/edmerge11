interface Stat {
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
    icon: string;
  };
}

interface StatsOverviewProps {
  stats: Stat[];
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          {stat.change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs ${stat.change.positive ? 'text-secondary-500' : 'text-red-500'} flex items-center`}>
                <i className={`${stat.change.icon} mr-1`}></i> {stat.change.value}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
