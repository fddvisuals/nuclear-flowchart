import React, { useMemo } from 'react';
import { FacilityData } from '../utils/csvLoader';

interface DamageSummaryGridProps {
  facilityData: FacilityData[];
}

type NormalizedStatusKey =
  | 'destroyed'
  | 'likely-destroyed'
  | 'construction'
  | 'operational'
  | 'unknown'
  | 'other';

interface StatusMeta {
  key: NormalizedStatusKey;
  label: string;
  color: string;
}

const STATUS_META: Record<NormalizedStatusKey, StatusMeta> = {
  destroyed: {
    key: 'destroyed',
    label: 'Destroyed',
    color: '#FECACA',
  },
  'likely-destroyed': {
    key: 'likely-destroyed',
    label: 'Likely Destroyed',
    color: '#FED7AA',
  },
  construction: {
    key: 'construction',
    label: 'Under Construction',
    color: '#DDD6FE',
  },
  operational: {
    key: 'operational',
    label: 'Operational',
    color: '#BBF7D0',
  },
  unknown: {
    key: 'unknown',
    label: 'Unknown / Non-operational',
    color: '#E0E7FF',
  },
  other: {
    key: 'other',
    label: 'Status Unknown',
    color: '#E5E7EB',
  },
};

const getStatusMeta = (rawStatus: string | undefined): StatusMeta => {
  const status = (rawStatus || '').toLowerCase();

  if (!status) {
    return STATUS_META.unknown;
  }

  if (status.includes('likely') && status.includes('destroyed')) {
    return STATUS_META['likely-destroyed'];
  }

  if (status.includes('destroyed')) {
    return STATUS_META.destroyed;
  }

  if (status.includes('construction')) {
    return STATUS_META.construction;
  }

  if (status.includes('operational') && !status.includes('non-operational')) {
    return STATUS_META.operational;
  }

  if (status.includes('unknown') || status.includes('non-operational')) {
    return STATUS_META.unknown;
  }

  return {
    ...STATUS_META.other,
    label: rawStatus?.trim() || STATUS_META.other.label,
  };
};

const DamageSummaryGrid: React.FC<DamageSummaryGridProps> = ({ facilityData }) => {
  const groupedSystems = useMemo(() => {
    if (!facilityData || facilityData.length === 0) {
      return [];
    }

    const groups = new Map<string, {
      id: string;
      name: string;
      mainCategory: string;
      locations: Array<{
        id: string;
        locationName: string;
        detailName?: string;
        statusText: string;
        statusMeta: StatusMeta;
      }>;
    }>();

    facilityData.forEach((facility) => {
      const subCategory = facility['Sub-Category']?.trim() || 'Unnamed System';
      const mainCategory = facility['Main-Category']?.trim() || 'Unknown Category';
      const systemKey = `${mainCategory}::${subCategory}`;

      if (!groups.has(systemKey)) {
        groups.set(systemKey, {
          id: systemKey,
          name: subCategory,
          mainCategory,
          locations: [],
        });
      }

      const system = groups.get(systemKey)!;
      const statusMeta = getStatusMeta(facility.Sub_Item_Status);

      system.locations.push({
        id: facility.Item_Id || `${system.locations.length}`,
        locationName: facility.Locations?.trim() || facility.Sub_Item?.trim() || 'Unnamed Location',
        detailName:
          facility.Sub_Item && facility.Sub_Item !== facility.Locations
            ? facility.Sub_Item.trim()
            : undefined,
        statusText: facility.Sub_Item_Status?.trim() || 'Unknown',
        statusMeta,
      });
    });

    return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [facilityData]);

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
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Damage Summary by System</h2>
          <p className="text-gray-600 mt-2">
            Each 250 × 250 card summarizes a system and color-coded location status blocks.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {groupedSystems.length} systems
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {groupedSystems.map((system) => {
          const statusCounts = system.locations.reduce<Record<NormalizedStatusKey, number>>((acc, location) => {
            acc[location.statusMeta.key] = (acc[location.statusMeta.key] || 0) + 1;
            return acc;
          }, {
            destroyed: 0,
            'likely-destroyed': 0,
            construction: 0,
            operational: 0,
            unknown: 0,
            other: 0,
          });

          const totalLocations = system.locations.length;

          return (
            <div
              key={system.id}
              className="bg-white w-[250px] h-[250px] rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                    {system.mainCategory}
                  </p>
                  <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                    {system.name}
                  </h3>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                  {totalLocations} {totalLocations === 1 ? 'location' : 'locations'}
                </span>
              </div>

              <div className="mt-3 flex-1 overflow-hidden">
                <div className="grid grid-cols-4 gap-2 h-full overflow-y-auto pr-1">
                  {system.locations.map((location) => (
                    <div
                      key={location.id}
                      className="relative flex items-center justify-center rounded-lg text-[10px] font-semibold text-gray-800 shadow-sm"
                      style={{ backgroundColor: location.statusMeta.color, minHeight: '38px' }}
                      title={`${location.locationName}${location.detailName ? ` • ${location.detailName}` : ''} • ${location.statusText}`}
                    >
                      <span className="px-1 text-center leading-tight">
                        {location.locationName.length > 14
                          ? `${location.locationName.slice(0, 12)}…`
                          : location.locationName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 space-y-1 text-[11px] text-gray-600">
                {Object.entries(statusCounts)
                  .filter(([, count]) => count > 0)
                  .map(([key, count]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ backgroundColor: STATUS_META[key as NormalizedStatusKey].color }}
                      />
                      <span>
                        {STATUS_META[key as NormalizedStatusKey].label}: {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DamageSummaryGrid;
