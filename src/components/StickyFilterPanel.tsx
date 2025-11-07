import React, { useState, useEffect } from 'react';
import { FilterType, filterOptions } from '../data/nuclearData';

interface StickyFilterPanelProps {
  activeFilters: FilterType[];
  onFiltersChange: (filters: FilterType[]) => void;
  targetSectionIds?: string[]; // IDs of the sections to watch for scroll
}

const StickyFilterPanel: React.FC<StickyFilterPanelProps> = ({ 
  activeFilters, 
  onFiltersChange,
  targetSectionIds = ['waffle-chart-section', 'visualization-section']
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const targetSections = targetSectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    
    if (targetSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Show sticky filter when ANY of the target sections is in view
        const anyInView = entries.some(entry => entry.isIntersecting);
        setIsVisible(anyInView);
      },
      {
        // Trigger when the top of the section crosses the top of the viewport (plus nav height)
        rootMargin: '-75px 0px 0px 0px',
        threshold: 0,
      }
    );

    targetSections.forEach(section => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [targetSectionIds]);

  const handleFilterToggle = (filter: FilterType) => {
    if (filter === 'all') {
      onFiltersChange(['all']);
      return;
    }

    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter && f !== 'all')
      : [...activeFilters.filter(f => f !== 'all'), filter];

    if (newFilters.length === 0) {
      onFiltersChange(['all']);
    } else {
      onFiltersChange(newFilters);
    }
  };

  const categoryFilters = filterOptions.filter(option => 
    ['fuel-production', 'fuel-weaponization'].includes(option.value)
  );

  const statusFilters = filterOptions.filter(option => 
    ['operational', 'unknown', 'construction', 'likely-destroyed', 'destroyed'].includes(option.value)
  );

  return (
    <div 
      id="sticky-filter-panel"
      className={`fixed top-[75px] left-0 w-full z-[999] transition-all duration-300 ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: '#00558c' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-white text-sm font-semibold whitespace-nowrap">
            Filters:
          </span>
          
          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/80 text-xs font-medium">Categories:</span>
            {categoryFilters.map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterToggle(option.value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                  ${activeFilters.includes(option.value)
                    ? 'border-white text-white bg-white/20'
                    : 'border-white/40 text-white/80 hover:border-white hover:bg-white/10'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/80 text-xs font-medium">Status:</span>
            {statusFilters.map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterToggle(option.value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5
                  ${activeFilters.includes(option.value)
                    ? 'border-white text-white bg-white/20'
                    : 'border-white/40 text-white/80 hover:border-white hover:bg-white/10'
                  }
                `}
              >
                <div 
                  className="w-2 h-2 rounded-full border border-white/40"
                  style={{ backgroundColor: option.color }}
                />
                {option.label}
              </button>
            ))}
          </div>

          {/* Clear All */}
          {!activeFilters.includes('all') && (
            <button
              onClick={() => onFiltersChange(['all'])}
              className="ml-auto px-3 py-1 rounded-full text-xs font-medium text-white border border-white/40 hover:bg-white/10 transition-all whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyFilterPanel;
