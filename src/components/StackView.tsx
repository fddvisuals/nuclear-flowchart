import React, { useMemo, useCallback } from 'react';
import { FilterType } from '../data/nuclearData';
import { FacilityData } from '../utils/csvLoader';
import {
  buildSystemGroups,
  getStatusMeta,
  SystemGroup,
} from '../utils/systemSummary';

interface StackViewProps {
  activeFilters: FilterType[];
  highlightedItems: string[];
  onItemClick: (itemId: string) => void;
  facilityData: FacilityData[];
  focusedSystemIds?: string[];
}

const StackView: React.FC<StackViewProps> = ({
  activeFilters,
  highlightedItems,
  onItemClick,
  facilityData,
  focusedSystemIds,
}) => {
  const shouldShowFacility = useCallback(
    (facility: FacilityData): boolean => {
      if (activeFilters.includes('all')) {
        return true;
      }

      const mainCategory = facility['Main-Category'] ?? '';
      const statusKey = getStatusMeta(facility.Sub_Item_Status).key;

      const categoryMatches =
        (activeFilters.includes('fuel-production') && mainCategory === 'Fuel Production') ||
        (activeFilters.includes('fuel-weaponization') && mainCategory === 'Weaponization');

      const statusFilters = activeFilters.filter((filter): filter is FilterType =>
        ['operational', 'destroyed', 'unknown', 'construction', 'likely-destroyed'].includes(filter)
      );

      const statusMatches =
        statusFilters.length === 0 || statusFilters.includes(statusKey as FilterType);

      const hasCategoryFilters =
        activeFilters.includes('fuel-production') ||
        activeFilters.includes('fuel-weaponization');

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
    },
    [activeFilters]
  );

  const filteredFacilities = useMemo(() => {
    if (!facilityData || facilityData.length === 0) {
      return [];
    }

    if (activeFilters.includes('all')) {
      return facilityData;
    }

    return facilityData.filter(shouldShowFacility);
  }, [facilityData, activeFilters, shouldShowFacility]);

  const groupedSystems = useMemo<SystemGroup[]>(() => {
    if (!filteredFacilities || filteredFacilities.length === 0) {
      return [];
    }

    return buildSystemGroups(filteredFacilities);
  }, [filteredFacilities]);

  if (!facilityData || facilityData.length === 0) {
    return (
      <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading facility data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (groupedSystems.length === 0) {
    return (
      <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No facilities match the current filters</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filter selection</p>
          </div>
        </div>
      </div>
    );
  }

  const hasFocus = Boolean(focusedSystemIds && focusedSystemIds.length > 0);

  const displaySystems = useMemo(() => {
    if (!hasFocus || !focusedSystemIds || focusedSystemIds.length === 0) {
      return groupedSystems;
    }

    const focusSet = new Set(focusedSystemIds);
    return groupedSystems.filter((system) => focusSet.has(system.id));
  }, [groupedSystems, focusedSystemIds, hasFocus]);

  if (displaySystems.length === 0) {
    return (
      <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No systems match the current strike selection</p>
            <p className="text-gray-400 text-sm mt-2">Clear the strike focus to return to the full matrix.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">System-Level Damage Summary</h3>
            <p className="text-sm text-gray-600 mt-1">
              Color-coded cells show current status at each location. Hover to inspect details; click a cell to toggle related highlights in the flowchart.
            </p>
          </div>
          <div className="text-xs text-gray-500">
            {hasFocus
              ? `${displaySystems.length} of ${groupedSystems.length} systems`
              : `${groupedSystems.length} systems`}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displaySystems.map((system) => {
            const totalLocations = system.locations.length;
            const isHighlightedGroup = system.locations.some((location) =>
              highlightedItems.includes(location.facilityId)
            );

            const cardClasses = [
              'bg-white rounded-2xl border p-4 flex flex-col transition-all',
              isHighlightedGroup
                ? 'border-blue-500 shadow-lg ring-1 ring-blue-200'
                : 'border-gray-200 shadow-sm hover:shadow-md',
            ].join(' ');

            return (
              <div key={system.id} className={cardClasses}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500">
                      {system.mainCategory}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                      {system.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-700 whitespace-nowrap flex-shrink-0">
                    {totalLocations}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-1 content-start">
                  {system.locations.map((location) => {
                    const tooltipLabel = `${location.locationName}${location.detailName ? ` • ${location.detailName}` : ''
                      } • ${location.statusText}`;
                    const isHighlighted = highlightedItems.includes(location.facilityId);

                    const chipClasses = [
                      'relative w-4 h-4 rounded-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500',
                      isHighlighted
                        ? 'ring-2 ring-offset-1 ring-blue-500 scale-110 z-10'
                        : 'hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 hover:z-10',
                    ].join(' ');

                    return (
                      <div key={location.id} className="relative group">
                        <button
                          type="button"
                          onClick={() => onItemClick(location.facilityId)}
                          aria-label={tooltipLabel}
                          className={chipClasses}
                          style={{ backgroundColor: location.statusMeta.color }}
                        />
                        <span className="pointer-events-none absolute left-1/2 top-full hidden h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border border-slate-700 border-t-0 border-l-0 bg-slate-900 shadow-lg group-hover:block group-focus-within:block" />
                        <div className="pointer-events-none absolute left-1/2 top-full z-30 hidden w-64 -translate-x-1/2 translate-y-2 rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-xl group-hover:flex group-focus-within:flex flex-col gap-1.5">
                          <span className="text-sm font-semibold text-white leading-tight">
                            {location.locationName}
                          </span>
                          <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
                            <span className="text-slate-400">Status</span>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-white/20"
                                style={{ backgroundColor: location.statusMeta.color }}
                              />
                              {location.statusText}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StackView;
