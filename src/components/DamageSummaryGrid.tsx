import React, { useMemo, useState, useCallback } from 'react';
import { Crosshair } from 'lucide-react';
import { FacilityData } from '../utils/csvLoader';
import { buildSystemSummary, SystemSummaryResult } from '../utils/systemSummary';
import { IMPACT_CONFIGS } from '../data/impactConfigs';
import { FilterType } from '../data/nuclearData';

interface DamageSummaryGridProps {
  facilityData: FacilityData[];
  activeImpactId?: string | null;
  onImpactSelect?: (impactId: string | null) => void;
  systemSummary?: SystemSummaryResult;
  showImpactSection?: boolean;
  showSystemGrid?: boolean;
  showCapabilitiesSection?: boolean;
  externalFilters?: FilterType[];
}

const DamageSummaryGrid: React.FC<DamageSummaryGridProps> = ({
  facilityData,
  activeImpactId,
  onImpactSelect,
  systemSummary,
  showImpactSection = true,
  showSystemGrid = true,
  externalFilters,
}) => {
  const [internalImpactId, setInternalImpactId] = useState<string | null>(null);

  const { groupedSystems, impactSummaries, impactSummaryMap } = useMemo(() => {
    if (systemSummary) {
      return systemSummary;
    }

    return buildSystemSummary(facilityData, IMPACT_CONFIGS);
  }, [facilityData, systemSummary]);

  // Filter systems based on external filters
  const filteredGroupedSystems = useMemo(() => {
    if (!externalFilters || externalFilters.length === 0 || externalFilters.includes('all')) {
      return groupedSystems;
    }

    // Check for category filters
    const hasFuelProduction = externalFilters.includes('fuel-production');
    const hasFuelWeaponization = externalFilters.includes('fuel-weaponization');

    // Check for status filters
    const statusFilters = externalFilters.filter(f =>
      ['operational', 'unknown', 'construction', 'likely-destroyed', 'destroyed'].includes(f)
    );

    return groupedSystems
      .map(system => {
        // Filter by category
        let shouldIncludeSystem = true;
        if (hasFuelProduction || hasFuelWeaponization) {
          const mainCategory = system.mainCategory?.toLowerCase() ?? '';
          shouldIncludeSystem =
            (hasFuelProduction && mainCategory.includes('fuel production')) ||
            (hasFuelWeaponization && mainCategory.includes('weaponization'));
        }

        if (!shouldIncludeSystem) {
          return null;
        }

        // Filter locations by status
        if (statusFilters.length > 0) {
          const filteredLocations = system.locations.filter(location => {
            const statusKey = location.statusMeta?.key?.toLowerCase() ?? '';
            return statusFilters.some(filter => statusKey.includes(filter.toLowerCase()));
          });

          if (filteredLocations.length === 0) {
            return null;
          }

          return {
            ...system,
            locations: filteredLocations,
          };
        }

        return system;
      })
      .filter((system): system is NonNullable<typeof system> => system !== null);
  }, [groupedSystems, externalFilters]);

  const summariesWithIcons = useMemo(
    () =>
      impactSummaries.map((summary) => {
        const config = IMPACT_CONFIGS.find((item) => item.id === summary.id);
        return {
          ...summary,
          Icon: config?.Icon,
        };
      }),
    [impactSummaries]
  );

  const groupedSummaries = useMemo(() => {
    const groups: Record<string, typeof summariesWithIcons> = {
      'Centrifuge Infrastructure': [],
      'Uranium Fuel Production': [],
      'Plutonium Pathway': [],
      'Weaponization Capabilities': [],
    };

    summariesWithIcons.forEach((summary) => {
      const category = summary.category;
      if (groups[category]) {
        groups[category].push(summary);
      }
    });

    return groups;
  }, [summariesWithIcons]);

  const resolvedImpactId = (showImpactSection || showSystemGrid) ? activeImpactId ?? internalImpactId : null;
  const activeImpact = resolvedImpactId ? impactSummaryMap[resolvedImpactId] ?? null : null;

  const handleImpactSelect = useCallback(
    (impactId: string | null) => {
      if (onImpactSelect) {
        onImpactSelect(impactId);
      } else {
        setInternalImpactId(impactId);
      }
    },
    [onImpactSelect]
  );

  if (!facilityData || facilityData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
          Loading facility data...
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {showImpactSection && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Strikes Disrupt Key Nodes Across the Program
                </h2>
                <p className="text-xs text-gray-600 max-w-2xl mt-0.5">
                  Minimum confirmed impacts drawn from the joint Israeli-U.S. operation assessment. Select a card to spotlight linked systems in the matrix below.
                </p>
              </div>
            </div>

            {activeImpact && (
              <button
                type="button"
                onClick={() => handleImpactSelect(null)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
              >
                Clear focus
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {['Centrifuge Infrastructure', 'Uranium Fuel Production', 'Plutonium Pathway', 'Weaponization Capabilities'].map((category, index) => {
              const summaries = groupedSummaries[category];
              if (!summaries || summaries.length === 0) return null;

              return (
                <div key={category} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {summaries.map((summary) => {
                      const { id, label, descriptor, primaryValue, primaryLabel, annotation, statusBreakdown, hasData, systemIds, Icon } = summary;
                      const isFilterable = hasData && systemIds.length > 0;
                      const isActive = isFilterable && resolvedImpactId === id;
                      const isDimmed = Boolean(resolvedImpactId && resolvedImpactId !== id && activeImpact);

                      const cardClasses = [
                        'flex flex-col gap-2.5 bg-white border rounded-xl p-4 text-left transition-all duration-200',
                        isActive ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-slate-200 shadow-sm hover:shadow-md',
                        isDimmed ? 'opacity-50' : 'opacity-100',
                        isFilterable ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50' : 'cursor-default',
                      ].join(' ');

                      return (
                        <button
                          key={id}
                          type="button"
                          className={cardClasses}
                          onClick={() => {
                            if (!isFilterable) return;
                            handleImpactSelect(resolvedImpactId === id ? null : id);
                          }}
                          disabled={!isFilterable}
                          aria-pressed={isFilterable ? isActive : undefined}
                        >
                          <div className="flex items-start gap-2.5 w-full">
                            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-blue-700 shrink-0">
                              {Icon ? <Icon className="w-4 h-4" aria-hidden="true" /> : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 truncate">
                                {descriptor}
                              </p>
                              <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                                {label}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-slate-900">{primaryValue}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 truncate">
                              {primaryLabel}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            {annotation}
                          </p>

                          {statusBreakdown.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-[11px] font-medium pt-1">
                              {statusBreakdown.map(({ key, label: statusLabel, color, count }) => (
                                <span
                                  key={`${id}-${key}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md shadow-sm text-gray-900"
                                  style={{ backgroundColor: color }}
                                >
                                  <span>{statusLabel}</span>
                                  <span className="font-semibold">{count}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {!isFilterable && (
                            <p className="text-[10px] text-slate-400 italic">
                              {id === 'uranium-metal' || id === 'administrative-centers'
                                ? 'Capability assessment'
                                : 'Awaiting facility-level confirmation'}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showSystemGrid && (
        <>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">System-Level Damage Summary</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              The boxes below contain information on the damage sustained by various aspects of Iran's nuclear program, divided into the steps of the weapon-building process. A blockage in any of these systems would delay the creation of a bomb. Hover over the icons in the boxes to view the status of individual locations.
            </p>
          </div>

          <div className="space-y-8 sm:space-y-10">
            {[
              { name: 'Centrifuge Infrastructure' },
              { name: 'Uranium Fuel Production' },
              { name: 'Plutonium Pathway' },
              { name: 'Nuclear Energy Production' },
              { name: 'Weaponization' },
              { name: 'Other' },
            ].map(({ name: category }) => {
              const systems = filteredGroupedSystems.filter(s => s.displayCategory === category);
              if (systems.length === 0) return null;

              return (
                <div key={category}>
                  <div className="border-b border-gray-200 pb-3 mb-3 sm:mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h4 className="text-base sm:text-lg font-bold text-gray-800">
                        {category}
                      </h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {systems.map((system) => {
                      const totalLocations = system.locations.length;
                      const isFocusActive = Boolean(activeImpact);
                      const isHighlighted = !isFocusActive || activeImpact?.systemIds.includes(system.id);
                      const cardClasses = [
                        'bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col transition-all border border-gray-400',
                        isFocusActive && isHighlighted
                          ? 'shadow-[0_18px_34px_rgba(15,23,42,0.28)]'
                          : 'shadow-sm hover:shadow-md',
                        isHighlighted ? 'opacity-100' : 'opacity-40',
                      ].join(' ');

                      return (
                        <div
                          key={system.id}
                          className={cardClasses}
                          style={{
                            boxShadow: isFocusActive && isHighlighted
                              ? '0 18px 34px rgba(10, 18, 32, 0.35)'
                              : '0 10px 24px rgba(15, 23, 42, 0.08)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wide font-semibold text-gray-500 truncate">
                                {system.mainCategory}
                              </p>
                              <h3 className="text-[11px] sm:text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                                {system.name}
                              </h3>
                            </div>
                            <span className="px-1 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-semibold rounded-full bg-gray-100 text-gray-700 whitespace-nowrap flex-shrink-0">
                              {totalLocations}
                            </span>
                          </div>

                          <div className="grid grid-cols-6 sm:grid-cols-12 gap-0.5 sm:gap-1 content-start">
                            {[...system.locations]
                              .sort((a, b) => {
                                // Sort by status in the order: destroyed, likely-destroyed, construction, unknown, operational
                                const statusOrder = ['destroyed', 'likely-destroyed', 'construction', 'unknown', 'operational'];
                                const indexA = statusOrder.indexOf(a.statusMeta.key);
                                const indexB = statusOrder.indexOf(b.statusMeta.key);
                                return indexA - indexB;
                              })
                              .map((location) => {
                                const tooltipLabel = `${location.locationName}${location.detailName ? ` • ${location.detailName}` : ''} • ${location.statusText}`;

                                return (
                                  <div key={location.id} className="relative group">
                                    <img
                                      src={`${import.meta.env.BASE_URL}images/${location.statusMeta.key}.svg`}
                                      alt={tooltipLabel}
                                      tabIndex={0}
                                      className="w-3.5 h-3.5 sm:w-5 sm:h-5 cursor-help transition-all hover:scale-125 hover:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 focus-visible:z-10"
                                    />
                                    <span className="pointer-events-none absolute left-1/2 top-full hidden h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border border-slate-700 border-t-0 border-l-0 bg-slate-900 shadow-lg group-hover:block group-focus-within:block" />
                                    <div className="pointer-events-none absolute left-1/2 top-full z-30 hidden w-48 sm:w-64 -translate-x-1/2 translate-y-2 rounded-md border border-slate-700 bg-slate-900 px-2.5 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-100 shadow-xl group-hover:flex group-focus-within:flex flex-col gap-1 sm:gap-1.5">
                                      <span className="text-[11px] sm:text-sm font-semibold text-white leading-tight">
                                        {location.locationName}
                                      </span>
                                      <div className="mt-1 sm:mt-1.5 flex items-center justify-between gap-2 sm:gap-3 text-[9px] sm:text-xs">
                                        <span className="text-slate-400">Status</span>
                                        <span className="inline-flex items-center gap-1 sm:gap-1.5 font-semibold text-white">
                                          <span
                                            className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full border border-white/20"
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
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

export default DamageSummaryGrid;
