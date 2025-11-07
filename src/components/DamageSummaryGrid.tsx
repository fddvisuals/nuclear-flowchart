import React, { useMemo, useState, useCallback } from 'react';
import { Crosshair, Shield, Building } from 'lucide-react';
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

const CAPABILITY_IMPACTS = [
  {
    id: 'uranium-metal',
    title: 'Weapons-grade uranium metal production',
    description:
      'Manufacturing pathway eliminated, disrupting supply of weapon cores.',
    Icon: Shield,
  },
  {
    id: 'administrative-centers',
    title: 'Program administrative centers',
    description:
      'Command and coordination hubs dismantled, slowing decision cycles.',
    Icon: Building,
  },
];

const DamageSummaryGrid: React.FC<DamageSummaryGridProps> = ({
  facilityData,
  activeImpactId,
  onImpactSelect,
  systemSummary,
  showImpactSection = true,
  showSystemGrid = true,
  showCapabilitiesSection = true,
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
    <section className="max-w-7xl mx-auto px-6 py-8">
      {showImpactSection && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summariesWithIcons.map((summary) => {
              const { id, label, descriptor, primaryValue, primaryLabel, annotation, statusBreakdown, hasData, systemIds, Icon } = summary;
              const isFilterable = hasData && systemIds.length > 0;
              const isActive = isFilterable && resolvedImpactId === id;
              const isDimmed = Boolean(resolvedImpactId && resolvedImpactId !== id && activeImpact);

              const cardClasses = [
                'flex flex-col gap-2.5 bg-slate-50 border rounded-xl p-4 text-left transition-all duration-200',
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
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-700">
                      {Icon ? <Icon className="w-4 h-4" aria-hidden="true" /> : null}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                        {descriptor}
                      </p>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                        {label}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">{primaryValue}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {primaryLabel}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    {annotation}
                  </p>

                  {statusBreakdown.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-[11px] font-medium">
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
                    <p className="text-[11px] text-slate-400">
                      Awaiting facility-level confirmation.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showCapabilitiesSection && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-8">
          <div className="mt-2">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Critical Capabilities Neutralized
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {CAPABILITY_IMPACTS.map(({ id, title, description, Icon }) => (
                <div
                  key={id}
                  className="flex gap-3 bg-slate-900 text-slate-50 rounded-xl p-4 shadow-sm"
                >
                  <div className="p-1.5 rounded-lg bg-slate-800 text-blue-200">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-0.5">{title}</h4>
                    <p className="text-xs text-slate-200 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-[10px] text-gray-500">
            Quantities reflect conservative minimums cited in the assessment; where facility data exists.
          </p>
        </div>
      )}

      {showSystemGrid && (
        <>
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">System-Level Damage Summary</h3>
              <p className="text-sm text-gray-600 mt-1">
                Color-coded cells show current status at each location. Hover to inspect details; select a strategic card above to spotlight the related systems here.
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {filteredGroupedSystems.length} systems
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGroupedSystems.map((system) => {
              const totalLocations = system.locations.length;
              const isFocusActive = Boolean(activeImpact);
              const isHighlighted = !isFocusActive || activeImpact?.systemIds.includes(system.id);
              const cardClasses = [
                'bg-white rounded-2xl border p-4 flex flex-col transition-all',
                isFocusActive && isHighlighted
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 shadow-sm hover:shadow-md',
                isHighlighted ? 'opacity-100' : 'opacity-40',
              ].join(' ');

              return (
                <div
                  key={system.id}
                  className={cardClasses}
                >
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
                      const tooltipLabel = `${location.locationName}${location.detailName ? ` • ${location.detailName}` : ''} • ${location.statusText}`;

                      return (
                        <div key={location.id} className="relative group">
                          <div
                            tabIndex={0}
                            aria-label={tooltipLabel}
                            className="w-4 h-4 rounded-sm cursor-help transition-all hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 hover:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 focus-visible:z-10"
                            style={{ backgroundColor: location.statusMeta.color }}
                          />
                          <span className="pointer-events-none absolute left-1/2 top-full hidden h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border border-slate-700 border-t-0 border-l-0 bg-slate-900 shadow-lg group-hover:block group-focus-within:block" />
                          <div className="pointer-events-none absolute left-1/2 top-full z-30 hidden w-52 -translate-x-1/2 translate-y-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] text-slate-100 shadow-xl group-hover:flex group-focus-within:flex flex-col gap-1">
                            <span className="text-xs font-semibold text-white leading-tight">
                              {location.locationName}
                            </span>
                            {location.detailName && (
                              <span className="text-[10px] text-slate-300 leading-tight">
                                {location.detailName}
                              </span>
                            )}
                            <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
                              <span className="text-slate-400">Status</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-white">
                                <span
                                  className="h-2 w-2 rounded-full border border-white/20"
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
        </>
      )}
    </section>
  );
};

export default DamageSummaryGrid;
