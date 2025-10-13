import React, { useMemo } from 'react';
import { FilterType, statusColors } from '../data/nuclearData';
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

  const shouldShowItem = (itemType: 'fuel-production' | 'fuel-weaponization', status?: string) => {
    if (activeFilters.includes('all')) return true;
    
    let shouldShow = false;
    
    // Check category filters (fuel-production, fuel-weaponization)
    if (activeFilters.includes(itemType)) {
      shouldShow = true;
    }
    
    // Check component type filters
    if (activeFilters.includes('components') || activeFilters.includes('sub-items') || activeFilters.includes('standalone')) {
      shouldShow = true;
    }
    
    // Check status filters
    const statusFilters = activeFilters.filter(f => 
      ['operational', 'destroyed', 'unknown', 'construction', 'likely-destroyed'].includes(f)
    );
    
    if (statusFilters.length > 0) {
      // If status filters are active, only show items that match the status
      if (status && statusFilters.includes(status as FilterType)) {
        shouldShow = true;
      } else if (status) {
        // Item has status but doesn't match any selected status filter
        shouldShow = false;
      }
      // For items without status (parent components), we'll check if they have matching children
    }
    
    return shouldShow;
  };

  // Smart component filtering - only show components that have matching sub-items
  const shouldShowComponent = (component: Component) => {
    if (activeFilters.includes('all')) return true;
    
    // Check if the component type matches category filters
    if (activeFilters.includes(component.type)) return true;
    
    // Check status filters - only show component if it has sub-items matching the status
    const statusFilters = activeFilters.filter(f => 
      ['operational', 'destroyed', 'unknown', 'construction', 'likely-destroyed'].includes(f)
    );
    
    if (statusFilters.length > 0) {
      // Component should only be shown if it has at least one sub-item matching the status filters
      const hasMatchingSubItems = component.subItems.some(subItem => 
        statusFilters.includes(subItem.status as FilterType)
      );
      return hasMatchingSubItems;
    }
    
    // Check component type filters
    if (activeFilters.includes('components') || activeFilters.includes('sub-items') || activeFilters.includes('standalone')) {
      return true;
    }
    
    return false;
  };

  // Smart stage filtering - only show stages that have matching components
  const shouldShowStage = (stage: Stage) => {
    if (activeFilters.includes('all')) return true;
    
    // Stage should only be shown if it has at least one component that should be shown
    return stage.components.some(component => shouldShowComponent(component));
  };

  

  const renderSubItem = (subItem: SubItem) => {
    return (
      <div key={subItem.id} className="group relative py-3 px-4 hover:bg-gradient-to-r hover:from-white hover:to-slate-50/50 rounded-lg transition-all duration-300 border border-transparent hover:border-slate-200/50 hover:shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="relative mt-1">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-md border border-slate-200/30" 
                style={{ backgroundColor: statusColors[subItem.status] }}
              />
              <div 
                className="absolute inset-0 w-3 h-3 rounded-full animate-pulse opacity-30" 
                style={{ backgroundColor: statusColors[subItem.status] }}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors leading-tight">
                {subItem.name}
              </h4>
              {subItem.description && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 group-hover:text-slate-700 transition-colors">
                  {subItem.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all duration-200 ${
              subItem.status === 'operational' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : subItem.status === 'destroyed'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : subItem.status === 'likely-destroyed'
                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                : subItem.status === 'construction'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {subItem.status.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderComponent = (component: Component) => {
    if (!shouldShowComponent(component)) return null;

    const isHighlighted = highlightedItems.includes(component.id);
    const visibleSubItems = component.subItems.filter(subItem => 
      shouldShowItem(component.type, subItem.status)
    );

    // If we have status filters active and no visible sub-items, don't show the component
    const statusFilters = activeFilters.filter(f => 
      ['operational', 'destroyed', 'unknown', 'construction', 'likely-destroyed'].includes(f)
    );
    if (statusFilters.length > 0 && visibleSubItems.length === 0) {
      return null;
    }

    return (
      <div key={component.id} className="mb-8 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
        {/* Component Header */}
        <div 
          className={`relative overflow-hidden rounded-t-2xl border-2 shadow-sm ${
            component.type === 'fuel-production' 
              ? 'bg-gradient-to-br from-blue-50 via-blue-25 to-cyan-50 border-blue-200/60' 
              : 'bg-gradient-to-br from-red-50 via-rose-25 to-orange-50 border-red-200/60'
          } ${isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-2 shadow-lg' : ''}`}
        >
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-white/40"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 rounded-full bg-white/20"></div>
          </div>
          
          <div className="relative px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full shadow-sm ${
                    component.type === 'fuel-production' 
                      ? 'bg-gradient-to-b from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-b from-red-500 to-red-600'
                  }`} />
                  <h3 className={`text-lg font-bold tracking-tight ${
                    component.type === 'fuel-production' ? 'text-blue-900' : 'text-red-900'
                  }`}>
                    {component.name}
                  </h3>
                </div>
                <div className={`hidden sm:block h-px flex-1 max-w-24 ${
                  component.type === 'fuel-production' 
                    ? 'bg-gradient-to-r from-blue-300 to-transparent' 
                    : 'bg-gradient-to-r from-red-300 to-transparent'
                }`} />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    component.type === 'fuel-production' ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    {visibleSubItems.length}
                  </div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Location{visibleSubItems.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Enhanced Status Pills */}
                {visibleSubItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 max-w-48">
                    {Object.entries(
                      visibleSubItems.reduce((acc, item) => {
                        acc[item.status] = (acc[item.status] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([status, count]) => (
                      <div key={status} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                        <div 
                          className="w-2 h-2 rounded-full ring-1 ring-white/60" 
                          style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                        />
                        <span className="text-xs text-slate-700 font-semibold">{count}</span>
                        <span className="text-xs text-slate-500 capitalize hidden sm:inline">
                          {status.replace('-', ' ').split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All Sub-items Always Visible */}
        {visibleSubItems.length > 0 && (
          <div className={`border-x-2 border-b-2 rounded-b-2xl bg-gradient-to-b from-white to-slate-50/30 shadow-md ${
            component.type === 'fuel-production' 
              ? 'border-blue-200/60' 
              : 'border-red-200/60'
          }`}>
            <div className="px-5 py-4">
              <div className="space-y-2">
                {visibleSubItems.map(subItem => renderSubItem(subItem))}
              </div>
              
              {/* Sub-items summary footer */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">
                    {visibleSubItems.length} facilities tracked
                  </span>
                  <div className="flex items-center gap-3">
                    {Object.entries(
                      visibleSubItems.reduce((acc, item) => {
                        acc[item.status] = (acc[item.status] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([status, count]) => (
                      <span key={status} className="capitalize">
                        {count} {status.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStage = (stage: Stage) => {
    const visibleComponents = stage.components.filter(component => shouldShowComponent(component));
    if (visibleComponents.length === 0) return null;



    return (
      <div key={stage.id} className="mb-8">
        {/* Stage Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {visibleComponents.length} component{visibleComponents.length !== 1 ? 's' : ''} • {
                visibleComponents.reduce((total, comp) => 
                  total + comp.subItems.filter(sub => shouldShowItem(comp.type, sub.status)).length, 0
                )
              } locations
            </p>
          </div>
        </div>

        {/* All Components Always Visible */}
        <div className="space-y-4">
          {visibleComponents.map(component => renderComponent(component))}
        </div>
      </div>
    );
  };

  const filteredData = nuclearData.filter(stage => shouldShowStage(stage));

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items match the current filters</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filter selection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Fuel Production Column */}
            <div className="space-y-8">
              <div className="sticky top-0 py-6 z-20 bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 backdrop-blur-md border-2 border-blue-200/50 rounded-2xl shadow-lg">
                <div className="px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-900 tracking-tight">
                        Fuel Production
                      </h2>
                      <p className="text-sm text-blue-700/70 mt-1 font-medium">
                        Nuclear material processing facilities
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-transparent"></div>

                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {filteredData
                  .filter(stage => stage.type === 'fuel-production')
                  .map(stage => renderStage(stage))}
              </div>
            </div>

            {/* Fuel Weaponization Column */}
            <div className="space-y-8">
              <div className="sticky top-0 py-6 z-20 bg-gradient-to-br from-red-100 via-red-50 to-orange-50 backdrop-blur-md border-2 border-red-200/50 rounded-2xl shadow-lg">
                <div className="px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-12 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-sm"></div>
                    <div>
                      <h2 className="text-3xl font-bold text-red-900 tracking-tight">
                        Fuel Weaponization
                      </h2>
                      <p className="text-sm text-red-700/70 mt-1 font-medium">
                        Weapons development infrastructure
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-red-300 to-transparent"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {filteredData
                  .filter(stage => stage.type === 'fuel-weaponization')
                  .map(stage => renderStage(stage))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="mt-8 p-6 bg-white rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredData.length}
              </div>
              <div className="text-sm text-gray-600">Stages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredData.reduce((total, stage) => 
                  total + stage.components.filter(comp => shouldShowComponent(comp)).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredData.reduce((total, stage) => 
                  total + stage.components.reduce((compTotal, comp) => {
                    if (!shouldShowComponent(comp)) return compTotal;
                    return compTotal + comp.subItems.filter(sub => shouldShowItem(comp.type, sub.status)).length;
                  }, 0), 0
                )}
              </div>
              <div className="text-sm text-gray-600">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredData.reduce((total, stage) => 
                  total + stage.components.reduce((compTotal, comp) => 
                    compTotal + comp.subItems.filter(sub => 
                      shouldShowItem(comp.type, sub.status) && sub.description?.includes('killed')
                    ).length, 0
                  ), 0
                )}
              </div>
              <div className="text-sm text-gray-600">Casualties</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackView;