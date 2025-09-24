import React from 'react';
import { FilterType, nuclearData, statusColors, Stage, Component, SubItem } from '../data/nuclearData';
import StatusBarChart from './StatusBarChart';

interface StackViewProps {
  activeFilters: FilterType[];
  highlightedItems: string[];
  onItemClick: (itemId: string) => void;
  expandedItems: string[];
  onToggleExpand: (itemId: string) => void;
}

const StackView: React.FC<StackViewProps> = ({ 
  activeFilters, 
  highlightedItems, 
 
  expandedItems: _expandedItems,
  onToggleExpand: _onToggleExpand
}) => {
  // Note: We use the hard-coded nuclear data structure for the stack view
  // and calculate status counts directly from SVG color analysis

  // Calculate status counts with specified values
  const getStatusCounts = () => {
    const statusColors = {
      'destroyed': '#FFC7C2',
      'unknown': '#DCDCDC',
      'operational': '#9FE2AA',
      'likely-destroyed': '#FFE0C2',
      'construction': '#DCCCFF'
    };

    const statusDisplayNames = {
      'destroyed': 'Destroyed',
      'unknown': 'Unknown',
      'operational': 'Operational',
      'likely-destroyed': 'Likely Destroyed',
      'construction': 'Under Construction'
    };

    // Return the specific counts requested
    const statusCounts = [
      { status: 'destroyed', count: 25 },
      { status: 'unknown', count: 11 },
      { status: 'operational', count: 5 },
      { status: 'likely-destroyed', count: 3 },
      { status: 'construction', count: 1 }
    ];

    return statusCounts.map(({ status, count }) => ({
      status,
      count,
      color: statusColors[status as keyof typeof statusColors],
      displayName: statusDisplayNames[status as keyof typeof statusDisplayNames]
    }));
  };

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
      <div key={subItem.id} className="group py-2 px-3 hover:bg-slate-50 rounded-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-white shadow-sm" 
              style={{ backgroundColor: statusColors[subItem.status] }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                {subItem.name}
              </h4>
              {subItem.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {subItem.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <span className="text-xs text-slate-400 font-light tracking-wide capitalize">
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
      <div key={component.id} className="mb-6">
        {/* Component Header */}
        <div 
          className={`relative overflow-hidden rounded-t-xl border-2 ${
            component.type === 'fuel-production' 
              ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300' 
              : 'bg-gradient-to-r from-red-100 to-red-50 border-red-300'
          } ${isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className={`text-lg font-semibold tracking-wide ${
                  component.type === 'fuel-production' ? 'text-blue-800' : 'text-red-800'
                }`}>
                  {component.name}
                </h3>
                <div className={`h-1 flex-1 max-w-16 rounded-full ${
                  component.type === 'fuel-production' 
                    ? 'bg-blue-400' 
                    : 'bg-red-400'
                }`} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 font-mono tracking-wider">
                  {visibleSubItems.length} location{visibleSubItems.length !== 1 ? 's' : ''}
                </span>
                {/* Minimalist Status Pills */}
                {visibleSubItems.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {Object.entries(
                      visibleSubItems.reduce((acc, item) => {
                        acc[item.status] = (acc[item.status] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([status, count]) => (
                      <div key={status} className="flex items-center gap-1 px-2 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-white/80">
                        <div 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                        />
                        <span className="text-xs text-slate-600 font-medium">{count}</span>
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
          <div className={`border-x-2 border-b-2 rounded-b-xl bg-white shadow-sm ${
            component.type === 'fuel-production' 
              ? 'border-blue-300' 
              : 'border-red-300'
          }`}>
            <div className="px-4 py-3 space-y-1">
              {visibleSubItems.map(subItem => renderSubItem(subItem))}
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Post-Strike Assessment: Israeli and U.S. Strikes Caused Major Bottlenecks in Iran’s Nuclear Weapons Supply Chain
          </h1>
          <p className="text-gray-600">
            Hierarchical view of nuclear fuel production and weaponization stages
          </p>
        </div>

        {/* Status Bar Chart */}
        <div className="mb-6">
          <StatusBarChart 
            statusCounts={getStatusCounts()} 
            totalCount={getStatusCounts().reduce((sum, item) => sum + item.count, 0)}
          />
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items match the current filters</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filter selection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Fuel Production Column */}
            <div className="space-y-8">
              <div className="sticky top-0 py-4 z-10 bg-gradient-to-r from-blue-50 to-blue-100 backdrop-blur-sm border-b-4 border-blue-500 rounded-lg">
                <h2 className="text-2xl font-bold text-blue-800 tracking-wide px-4">
                  Fuel Production
                </h2>
                <div className="w-16 h-1 bg-blue-500 mt-2 mx-4 rounded-full"></div>
              </div>
              <div className="space-y-6">
                {filteredData
                  .filter(stage => stage.type === 'fuel-production')
                  .map(stage => renderStage(stage))}
              </div>
            </div>

            {/* Fuel Weaponization Column */}
            <div className="space-y-8">
              <div className="sticky top-0 py-4 z-10 bg-gradient-to-r from-red-50 to-red-100 backdrop-blur-sm border-b-4 border-red-500 rounded-lg">
                <h2 className="text-2xl font-bold text-red-800 tracking-wide px-4">
                  Fuel Weaponization
                </h2>
                <div className="w-16 h-1 bg-red-500 mt-2 mx-4 rounded-full"></div>
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