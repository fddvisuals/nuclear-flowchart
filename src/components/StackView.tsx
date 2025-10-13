import React, { useMemo } from 'react';
import { FilterType, statusColors, StatusType } from '../data/nuclearData';
import { FacilityData } from '../utils/csvLoader';

interface StackViewProps {
  activeFilters: FilterType[];
  highlightedItems: string[];
  onItemClick: (itemId: string) => void;
  expandedItems: string[];
  onToggleExpand: (itemId: string) => void;
  facilityData: FacilityData[];
}

const StackView: React.FC<StackViewProps> = ({ 
  activeFilters, 
  highlightedItems,
  onItemClick,
  expandedItems: _expandedItems,
  onToggleExpand: _onToggleExpand,
  facilityData
}) => {
  // Group CSV data by Main-Category and Sub-Category
  const groupedData = useMemo(() => {
    const groups: {
      [mainCategory: string]: {
        [subCategory: string]: FacilityData[]
      }
    } = {};

    facilityData.forEach(facility => {
      const mainCat = facility['Main-Category'] || 'Unknown';
      const subCat = facility['Sub-Category'] || 'Unknown';

      if (!groups[mainCat]) {
        groups[mainCat] = {};
      }
      if (!groups[mainCat][subCat]) {
        groups[mainCat][subCat] = [];
      }
      groups[mainCat][subCat].push(facility);
    });

    return groups;
  }, [facilityData]);

  // Normalize status from CSV to match filter types
  const normalizeStatus = (status: string): StatusType => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('likely') && statusLower.includes('destroyed')) {
      return 'likely-destroyed';
    }
    if (statusLower.includes('destroyed') && !statusLower.includes('likely')) {
      return 'destroyed';
    }
    if (statusLower.includes('construction') || statusLower.includes('under construction')) {
      return 'construction';
    }
    if (statusLower.includes('operational') && !statusLower.includes('non-operational')) {
      return 'operational';
    }
    return 'unknown';
  };

  // Check if a facility should be shown based on active filters
  const shouldShowFacility = (facility: FacilityData): boolean => {
    if (activeFilters.includes('all')) return true;

    const mainCategory = facility['Main-Category'];
    const status = normalizeStatus(facility.Sub_Item_Status || '');

    // Check category filters
    const categoryMatches = 
      (activeFilters.includes('fuel-production') && mainCategory === 'Fuel Production') ||
      (activeFilters.includes('fuel-weaponization') && mainCategory === 'Fuel Weaponization');

    // Check status filters
    const statusFilters = activeFilters.filter(f => 
      ['operational', 'destroyed', 'unknown', 'construction', 'likely-destroyed'].includes(f)
    );

    const statusMatches = statusFilters.length === 0 || statusFilters.includes(status as FilterType);

    // If both category and status filters exist, both must match
    const hasCategoryFilters = activeFilters.includes('fuel-production') || activeFilters.includes('fuel-weaponization');
    
    if (hasCategoryFilters && statusFilters.length > 0) {
      return categoryMatches && statusMatches;
    }
    
    if (hasCategoryFilters) {
      return categoryMatches;
    }
    
    if (statusFilters.length > 0) {
      return statusMatches;
    }

    return false;
  };

  // Filter facilities based on active filters
  const filteredData = useMemo(() => {
    const filtered: {
      [mainCategory: string]: {
        [subCategory: string]: FacilityData[]
      }
    } = {};

    Object.keys(groupedData).forEach(mainCat => {
      Object.keys(groupedData[mainCat]).forEach(subCat => {
        const facilities = groupedData[mainCat][subCat].filter(shouldShowFacility);
        
        if (facilities.length > 0) {
          if (!filtered[mainCat]) {
            filtered[mainCat] = {};
          }
          filtered[mainCat][subCat] = facilities;
        }
      });
    });

    return filtered;
  }, [groupedData, activeFilters]);

  // Render individual facility item
  const renderFacility = (facility: FacilityData) => {
    const status = normalizeStatus(facility.Sub_Item_Status || '');
    const isHighlighted = highlightedItems.includes(facility.Item_Id);

    return (
      <div 
        key={facility.Item_Id}
        className={`group relative py-3 px-4 hover:bg-gradient-to-r hover:from-white hover:to-slate-50/50 rounded-lg transition-all duration-300 border border-transparent hover:border-slate-200/50 hover:shadow-sm cursor-pointer ${
          isHighlighted ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={() => onItemClick(facility.Item_Id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div 
                className="w-3 h-3 rounded-full shadow-inner flex-shrink-0"
                style={{ backgroundColor: statusColors[status] }}
              />
              <h4 className="font-medium text-slate-800 text-sm leading-tight truncate">
                {facility.Locations || facility.Sub_Item || 'Unknown Location'}
              </h4>
            </div>
            {facility.Sub_Item && facility.Sub_Item !== facility.Locations && (
              <p className="text-xs text-slate-600 ml-6 truncate">{facility.Sub_Item}</p>
            )}
          </div>
          <span className="ml-3 flex-shrink-0">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColors[status] }}
            />
          </span>
        </div>
      </div>
    );
  };

  // Render sub-category group
  const renderSubCategory = (mainCat: string, subCat: string, facilities: FacilityData[]) => {
    // Count facilities by status
    const statusCounts: Record<string, number> = {};
    facilities.forEach(facility => {
      const status = normalizeStatus(facility.Sub_Item_Status || '');
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return (
      <div key={`${mainCat}-${subCat}`} className="mb-6">
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg p-4 mb-3 border border-slate-200/50">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-base mb-2 leading-tight">
                {subCat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div 
                    key={status}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-slate-200/50"
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: statusColors[status as StatusType] }}
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      {count} {status.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <span className="ml-3 px-3 py-1 bg-white rounded-full text-sm font-semibold text-slate-700 border border-slate-200/50 flex-shrink-0">
              {facilities.length}
            </span>
          </div>
        </div>
        <div className="space-y-1 pl-2">
          {facilities.map(facility => renderFacility(facility))}
        </div>
      </div>
    );
  };

  // Render main category (Fuel Production or Fuel Weaponization)
  const renderMainCategory = (mainCat: string) => {
    const subCategories = filteredData[mainCat];
    if (!subCategories || Object.keys(subCategories).length === 0) return null;

    const totalFacilities = Object.values(subCategories).reduce(
      (sum, facilities) => sum + facilities.length, 
      0
    );

    const categoryColor = mainCat === 'Fuel Production' ? '#00558C' : '#000000';

    return (
      <div key={mainCat} className="space-y-4">
        <div 
          className="sticky top-0 z-10 py-4 px-5 rounded-xl border-2 shadow-md"
          style={{ 
            backgroundColor: categoryColor,
            borderColor: categoryColor 
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mainCat}
            </h2>
            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold shadow-sm" style={{ color: categoryColor }}>
              {totalFacilities} facilities
            </span>
          </div>
        </div>
        {Object.entries(subCategories).map(([subCat, facilities]) => 
          renderSubCategory(mainCat, subCat, facilities)
        )}
      </div>
    );
  };

  if (facilityData.length === 0) {
    return (
      <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading facility data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {Object.keys(filteredData).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No facilities match the current filters</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filter selection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Fuel Production Column */}
            <div className="space-y-8">
              {filteredData['Fuel Production'] && renderMainCategory('Fuel Production')}
            </div>
            
            {/* Fuel Weaponization Column */}
            <div className="space-y-8">
              {filteredData['Fuel Weaponization'] && renderMainCategory('Fuel Weaponization')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StackView;
