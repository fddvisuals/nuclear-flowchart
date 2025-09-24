import React from 'react';
import { FilterType, filterOptions } from '../data/nuclearData';

interface FilterPanelProps {
  activeFilters: FilterType[];
  onFiltersChange: (filters: FilterType[]) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ activeFilters, onFiltersChange }) => {
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

  const clearAllFilters = () => {
    onFiltersChange(['all']);
  };

  const generalFilters = filterOptions.filter(option => 
    option.value === 'all'
  );

  const categoryFilters = filterOptions.filter(option => 
    ['fuel-production', 'fuel-weaponization'].includes(option.value)
  );

  const typeFilters = filterOptions.filter(option => 
    ['components', 'sub-items', 'standalone'].includes(option.value)
  );

  const statusFilters = filterOptions.filter(option => 
    ['operational', 'unknown', 'construction', 'likely-destroyed', 'destroyed'].includes(option.value)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      {/* General Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {generalFilters.map(option => (
            <button
              key={option.value}
              onClick={() => handleFilterToggle(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all whitespace-nowrap min-h-[2.25rem] flex items-center justify-center
                ${activeFilters.includes(option.value)
                  ? 'border-current text-white bg-gray-600'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Main Categories</h4>
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map(option => (
            <button
              key={option.value}
              onClick={() => handleFilterToggle(option.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium border-2 transition-all whitespace-nowrap min-h-[2.25rem] flex items-center justify-center
                ${activeFilters.includes(option.value)
                  ? 'border-current text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }
              `}
              style={{
                backgroundColor: activeFilters.includes(option.value) ? option.color : 'white',
                borderColor: activeFilters.includes(option.value) ? option.color : '#d1d5db'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filters - Hidden */}
      {false && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Item Types</h4>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterToggle(option.value)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium border-2 transition-all
                  ${activeFilters.includes(option.value)
                    ? 'border-current text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }
                `}
                style={{
                  backgroundColor: activeFilters.includes(option.value) ? option.color : 'white',
                  borderColor: activeFilters.includes(option.value) ? option.color : '#d1d5db'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
        <div className="grid grid-cols-1 gap-2">
          {statusFilters.map(option => (
            <button
              key={option.value}
              onClick={() => handleFilterToggle(option.value)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-3 whitespace-nowrap min-h-[2.5rem]
                ${activeFilters.includes(option.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div 
                className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: option.color }}
              />
              <span className="capitalize text-left">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilters.length > 0 && !activeFilters.includes('all') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Active filters: {activeFilters.length}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {activeFilters.map(filter => {
              const option = filterOptions.find(opt => opt.value === filter);
              return (
                <span
                  key={filter}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                >
                  {option?.label || filter}
                  <button
                    onClick={() => handleFilterToggle(filter)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;