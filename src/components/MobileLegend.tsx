import React from 'react';
import { filterOptions } from '../data/nuclearData';

interface MobileLegendProps {
  isVisible: boolean;
}

const MobileLegend: React.FC<MobileLegendProps> = ({ isVisible }) => {
  const statusFilters = filterOptions.filter(option => 
    ['operational', 'unknown', 'construction', 'likely-destroyed', 'destroyed'].includes(option.value)
  );

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed top-[60px] left-0 right-0 z-[997] bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="px-3 py-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center items-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Key:</span>
          {statusFilters.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-1"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/${option.value}.svg`}
                alt={option.label}
                className="w-4 h-4"
              />
              <span className="text-[11px] text-gray-700 font-medium">
                {option.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileLegend;
