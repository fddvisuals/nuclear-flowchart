import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { FacilityData } from '../utils/csvLoader';
import { FilterType } from '../data/nuclearData';

interface StatusChartsSectionProps {
  facilityData: FacilityData[];
  externalFilters?: FilterType[];
}

type StatusKey = 'destroyed' | 'likely-destroyed' | 'construction' | 'operational' | 'unknown';

interface StatusDefinition {
  key: StatusKey;
  label: string;
  color: string;
  accent: string;
  description: string;
}

interface WaffleTile {
  id: string;
  statusKey: StatusKey;
  label: string;
  location: string;
  mainCategory: string;
  subCategory: string;
  rawStatus: string;
}

function lightenHex(hex: string, ratio: number): string {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) {
    return hex;
  }

  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);

  const mix = (channel: number) => Math.round(channel + (255 - channel) * ratio);

  return `#${[mix(r), mix(g), mix(b)]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

const STATUS_DEFINITIONS: StatusDefinition[] = [
  {
    key: 'destroyed',
    label: 'Destroyed',
    color: '#f77d70',
    accent: lightenHex('#f77d70', 0.18),
    description: 'Facilities assessed as destroyed.',
  },
  {
    key: 'likely-destroyed',
    label: 'Likely Destroyed',
    color: '#faba73',
    accent: lightenHex('#faba73', 0.2),
    description: 'Sites with high-confidence strike assessments.',
  },
  {
    key: 'construction',
    label: 'Under Construction',
    color: '#c7afff',
    accent: lightenHex('#c7afff', 0.22),
    description: 'Projects in-progress or undergoing expansion.',
  },
  {
    key: 'operational',
    label: 'Operational',
    color: '#5fcf7f',
    accent: lightenHex('#5fcf7f', 0.16),
    description: 'Facilities currently active or producing output.',
  },
  {
    key: 'unknown',
    label: 'Unknown',
    color: '#84b6f4',
    accent: lightenHex('#84b6f4', 0.24),
    description: 'Status undetermined or data unavailable.',
  },
];

const STATUS_ORDER = STATUS_DEFINITIONS.map((definition) => definition.key);

const STATUS_LOOKUP = STATUS_DEFINITIONS.reduce<Record<StatusKey, StatusDefinition>>((acc, definition) => {
  acc[definition.key] = definition;
  return acc;
}, {} as Record<StatusKey, StatusDefinition>);

function resolveStatusKey(facility: FacilityData): StatusKey {
  const status = (facility.Sub_Item_Status || facility.status || '').toLowerCase();

  if (status.includes('likely') && status.includes('destroyed')) {
    return 'likely-destroyed';
  }

  if (status.includes('destroyed')) {
    return 'destroyed';
  }

  if (status.includes('construction') || status.includes('under construction')) {
    return 'construction';
  }

  if (status.includes('operational') && !status.includes('non-operational')) {
    return 'operational';
  }

  return 'unknown';
}

const StatusChartsSection: React.FC<StatusChartsSectionProps> = ({ facilityData, externalFilters }) => {
  const [activeStatuses, setActiveStatuses] = useState<StatusKey[]>(() => STATUS_ORDER.slice());

  // Sync with external filters when they change
  useEffect(() => {
    if (!externalFilters || externalFilters.length === 0 || externalFilters.includes('all')) {
      setActiveStatuses(STATUS_ORDER.slice());
      return;
    }

    // Handle status filters
    const statusFiltersInExternal = externalFilters.filter(f =>
      STATUS_ORDER.includes(f as StatusKey)
    ) as StatusKey[];

    if (statusFiltersInExternal.length > 0) {
      setActiveStatuses(statusFiltersInExternal);
    }
  }, [externalFilters]);

  // Create chart model for a specific category
  const createChartModel = (categoryType: 'fuel-production' | 'fuel-weaponization') => {
    if (!facilityData || facilityData.length === 0) {
      return {
        tiles: [] as WaffleTile[],
        statusSummary: STATUS_DEFINITIONS.map((definition) => ({
          ...definition,
          count: 0,
          percentage: 0,
        })),
        totalCount: 0,
      };
    }

    const filteredFacilities = facilityData.filter((facility) => {
      const mainCategory = facility['Main-Category']?.toLowerCase() ?? '';

      if (categoryType === 'fuel-production') {
        return mainCategory.includes('fuel production');
      } else {
        return mainCategory.includes('weaponization');
      }
    });

    const counts: Record<StatusKey, number> = {
      destroyed: 0,
      'likely-destroyed': 0,
      construction: 0,
      operational: 0,
      unknown: 0,
    };

    const tiles: WaffleTile[] = filteredFacilities.map((facility, index) => {
      const statusKey = resolveStatusKey(facility);
      counts[statusKey] += 1;

      return {
        id: facility.Item_Id || `facility-${index}`,
        statusKey,
        label: facility.Sub_Item?.trim() || 'Unnamed',
        location: facility.Locations?.trim() || 'Unknown location',
        mainCategory: facility['Main-Category'] || 'Unknown category',
        subCategory: facility['Sub-Category'] || 'Unspecified stream',
        rawStatus: facility.Sub_Item_Status || facility.status || 'Unknown status',
      };
    });

    tiles.sort(
      (a, b) => STATUS_ORDER.indexOf(a.statusKey) - STATUS_ORDER.indexOf(b.statusKey)
    );

    const totalCount = tiles.length;
    const statusSummary = STATUS_DEFINITIONS.map((definition) => {
      const count = counts[definition.key];
      return {
        ...definition,
        count,
        percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
      };
    });

    return {
      tiles,
      statusSummary,
      totalCount,
    };
  };

  const fuelProductionChart = useMemo(() => createChartModel('fuel-production'), [facilityData]);
  const weaponizationChart = useMemo(() => createChartModel('fuel-weaponization'), [facilityData]);

  const getGridColumns = (totalCount: number) => {
    if (totalCount > 120) return 12;
    if (totalCount > 80) return 10;
    if (totalCount > 60) return 9;
    if (totalCount > 40) return 8;
    if (totalCount > 25) return 6;
    return 5;
  };

  const baseTileSize = 26;
  const tileGap = 4;

  const activeStatusSet = useMemo(() => new Set(activeStatuses), [activeStatuses]);

  const renderWaffleChart = (chartData: ReturnType<typeof createChartModel>, title: string, subtitle: string) => {
    const { tiles, totalCount } = chartData;
    const gridColumns = getGridColumns(totalCount);

    const waffleGridStyle: React.CSSProperties = {
      gridTemplateColumns: `repeat(${gridColumns}, ${baseTileSize}px)`,
      gridAutoRows: `${baseTileSize}px`,
      gap: `${tileGap}px`,
    };

    return (
      <div className="flex-1 min-w-[400px]">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wide text-gray-500 block">Total Sites</span>
            <span className="text-3xl font-bold text-gray-900">{totalCount}</span>
          </div>
        </div>

        <div className="relative overflow-visible rounded-xl border border-gray-100 bg-gray-50 p-8 flex justify-center">
          <div className="relative">
            <div className="grid" style={waffleGridStyle}>
              {tiles.map((tile, index) => {
                const definition = STATUS_LOOKUP[tile.statusKey];
                const isFocused = activeStatusSet.has(tile.statusKey);
                const opacity = isFocused ? 1 : 0.25;

                return (
                  <div
                    key={tile.id || `tile-${index}`}
                    className="group relative rounded-sm transition-all duration-200 cursor-pointer hover:scale-110 hover:z-10 hover:shadow-lg"
                    style={{
                      backgroundColor: definition.color,
                      opacity,
                    }}
                    title={`${tile.location}\nCategory: ${tile.mainCategory}\nStatus: ${definition.label}`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                      <div className="w-72 rounded-lg border-2 border-slate-600 bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-3.5 shadow-2xl flex flex-col gap-2">
                        <span className="text-base font-bold text-white leading-tight border-b border-slate-600 pb-2">
                          {tile.location}
                        </span>
                        <div className="flex flex-col gap-1.5 text-xs">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-slate-400 font-medium">Category:</span>
                            <span className="text-slate-100 text-right flex-1">{tile.mainCategory}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-slate-400 font-medium">System:</span>
                            <span className="text-slate-100 text-right flex-1">{tile.subCategory}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 mt-1 pt-2 border-t border-slate-700">
                            <span className="text-slate-400 font-medium">Status:</span>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-white/30 shadow-sm"
                                style={{ backgroundColor: definition.color }}
                              />
                              {definition.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {tiles.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No facilities match the current filters.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!facilityData || facilityData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
          Loading facility data...
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="w-6 h-6 text-gray-700" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Facility Status Overview</h2>
            <p className="text-sm text-gray-600">
              Isometric chart showing individual facilities by category. Each square represents one facility. Use the filters above to explore different statuses.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {renderWaffleChart(
            fuelProductionChart,
            'Fuel Production',
            'Facilities involved in uranium enrichment and fuel cycle'
          )}

          {renderWaffleChart(
            weaponizationChart,
            'Weaponization',
            'Facilities involved in weapons development and assembly'
          )}
        </div>
      </div>
    </section>
  );
};

export default StatusChartsSection;
