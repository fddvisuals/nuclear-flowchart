import React, { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { FacilityData } from '../utils/csvLoader';

interface StatusChartsSectionProps {
  facilityData: FacilityData[];
}

type CategoryFilter = 'all' | 'fuel-production' | 'fuel-weaponization';

const StatusChartsSection: React.FC<StatusChartsSectionProps> = ({ facilityData }) => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Calculate status counts based on the selected category filter
  const statusData = useMemo(() => {
    // Return empty data if no facilities loaded yet
    if (!facilityData || facilityData.length === 0) {
      return {
        statusCounts: [],
        totalCount: 0,
      };
    }

    console.log('=== StatusChartsSection Filtering ===');
    console.log('Total facility data:', facilityData.length);
    console.log('Category filter:', categoryFilter);
    console.log('Sample facility:', facilityData[0]);
    console.log('Sample Main-Category:', facilityData[0]?.['Main-Category']);
    
    // Filter facilities based on category
    const filteredFacilities = facilityData.filter(facility => {
      const mainCategory = facility['Main-Category'];
      
      if (categoryFilter === 'all') {
        console.log('Accepting all:', mainCategory);
        return true;
      }
      if (categoryFilter === 'fuel-production') {
        const match = mainCategory === 'Fuel Production';
        console.log(`Checking fuel-production: "${mainCategory}" === "Fuel Production"?`, match);
        return match;
      }
      if (categoryFilter === 'fuel-weaponization') {
        const match = mainCategory === 'Fuel Weaponization';
        console.log(`Checking fuel-weaponization: "${mainCategory}" === "Fuel Weaponization"?`, match);
        return match;
      }
      return true;
    });

    console.log('Filtered facilities count:', filteredFacilities.length);
    console.log('Expected: FP=36, FW=18, All=54');

    // Count by status
    const statusCounts = {
      operational: 0,
      destroyed: 0,
      unknown: 0,
      'likely-destroyed': 0,
      construction: 0,
    };

    filteredFacilities.forEach(facility => {
      const status = facility.Sub_Item_Status?.toLowerCase() || facility.status?.toLowerCase() || 'unknown';
      console.log('Facility status:', status);
      
      // Check for "likely destroyed" first (most specific)
      if (status.includes('likely') && status.includes('destroyed')) {
        statusCounts['likely-destroyed']++;
      }
      // Check for "destroyed" (but not "likely destroyed")
      else if (status.includes('destroyed') && !status.includes('likely')) {
        statusCounts.destroyed++;
      }
      // Check for construction
      else if (status.includes('construction') || status.includes('under construction')) {
        statusCounts.construction++;
      }
      // Check for operational (but NOT "non-operational")
      else if (status.includes('operational') && !status.includes('non-operational')) {
        statusCounts.operational++;
      }
      // Everything else is unknown (including "unknown/non-operational")
      else {
        statusCounts.unknown++;
      }
    });

    console.log('Status counts:', statusCounts);

    const totalCount = filteredFacilities.length;

    return {
      statusCounts: [
        { status: 'destroyed', count: statusCounts.destroyed, color: '#FFC7C2', displayName: 'Destroyed' },
        { status: 'unknown', count: statusCounts.unknown, color: '#BCD8F0', displayName: 'Unknown' },
        { status: 'operational', count: statusCounts.operational, color: '#9FE2AA', displayName: 'Operational' },
        { status: 'likely-destroyed', count: statusCounts['likely-destroyed'], color: '#FFE0C2', displayName: 'Likely Destroyed' },
        { status: 'construction', count: statusCounts.construction, color: '#DCCCFF', displayName: 'Under Construction' },
      ].filter(item => item.count > 0), // Only show statuses that have facilities
      totalCount,
    };
  }, [facilityData, categoryFilter]);

  const maxCount = Math.max(...statusData.statusCounts.map(s => s.count), 1);

  // Show loading state if no data (after all hooks are called)
  if (!facilityData || facilityData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <div className="text-center text-gray-500">Loading facility data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Facility Status Overview</h2>
          </div>
          
          {/* Category Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('fuel-production')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'fuel-production'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Fuel Production
            </button>
            <button
              onClick={() => setCategoryFilter('fuel-weaponization')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'fuel-weaponization'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Fuel Weaponization
            </button>
          </div>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-white rounded-xl border shadow-sm p-8">
          <div className="space-y-4">
            {statusData.statusCounts.map(({ status, count, color, displayName }) => {
              const percentage = statusData.totalCount > 0 ? (count / statusData.totalCount) * 100 : 0;
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-gray-800 text-base">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 font-semibold text-lg">{count}</span>
                      <span className="text-sm text-gray-500 min-w-[60px] text-right">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500 ease-out"
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
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-lg">Total Facilities</span>
              <span className="text-gray-900 font-bold text-2xl">{statusData.totalCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusChartsSection;
