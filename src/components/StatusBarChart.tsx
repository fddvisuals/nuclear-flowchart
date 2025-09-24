import React from 'react';
import { BarChart3 } from 'lucide-react';

interface StatusCount {
  status: string;
  count: number;
  color: string;
  displayName: string;
}

interface StatusBarChartProps {
  statusCounts: StatusCount[];
  totalCount: number;
}

const StatusBarChart: React.FC<StatusBarChartProps> = ({ statusCounts, totalCount }) => {
  const maxCount = Math.max(...statusCounts.map(s => s.count));

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Status </h3>
      </div>
      
      <div className="space-y-3">
        {statusCounts.map(({ status, count, color, displayName }) => {
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-gray-700">{displayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{count}</span>
                  <span className="text-xs text-gray-400">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${barWidth}%`,
                    backgroundColor: color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-gray-600">Total Facilities</span>
          <span className="text-gray-900">{totalCount}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBarChart;