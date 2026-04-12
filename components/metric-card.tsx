import { ReactNode } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export default function MetricCard({
  title,
  value,
  icon,
  trend = 'neutral',
  trendValue = 0,
  color = 'blue',
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  const trendColorClasses = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
        {trend !== 'neutral' && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${trendColorClasses[trend]}`}>
            {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {trendValue}%
          </div>
        )}
      </div>
    </div>
  );
}
