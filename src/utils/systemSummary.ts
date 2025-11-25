import type { FacilityData } from './csvLoader';

export type NormalizedStatusKey =
  | 'destroyed'
  | 'likely-destroyed'
  | 'construction'
  | 'operational'
  | 'unknown'
  | 'other';

export type DisplayCategory =
  | 'Centrifuge Infrastructure'
  | 'Uranium Fuel Production'
  | 'Plutonium Pathway'
  | 'Nuclear Energy Production'
  | 'Weaponization'
  | 'Other';

export interface StatusMeta {
  key: NormalizedStatusKey;
  label: string;
  color: string;
}

export interface SystemLocation {
  id: string;
  facilityId: string;
  locationName: string;
  detailName?: string;
  statusText: string;
  statusMeta: StatusMeta;
}

export interface SystemGroup {
  id: string;
  name: string;
  mainCategory: string;
  displayCategory: DisplayCategory;
  locations: SystemLocation[];
}

export interface ImpactConfig {
  id: string;
  label: string;
  descriptor: string;
  keywords: string[];
  fallbackMagnitude: string;
  fallbackAnnotation: string;
  category: 'Centrifuge Infrastructure' | 'Uranium Fuel Production' | 'Plutonium Pathway' | 'Weaponization Capabilities';
}

export interface ImpactSummary {
  id: string;
  label: string;
  descriptor: string;
  primaryValue: string;
  primaryLabel: string;
  annotation: string;
  statusBreakdown: Array<{
    key: NormalizedStatusKey;
    label: string;
    color: string;
    count: number;
  }>;
  hasData: boolean;
  systemIds: string[];
  category: 'Centrifuge Infrastructure' | 'Uranium Fuel Production' | 'Plutonium Pathway' | 'Weaponization Capabilities';
}

export interface SystemSummaryResult {
  groupedSystems: SystemGroup[];
  impactSummaries: ImpactSummary[];
  impactSummaryMap: Record<string, ImpactSummary>;
}

export const STATUS_META: Record<NormalizedStatusKey, StatusMeta> = {
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

export const getStatusMeta = (rawStatus: string | undefined): StatusMeta => {
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
  return {
    ...STATUS_META.other,
    label: rawStatus?.trim() || STATUS_META.other.label,
  };
};

export const getDisplayCategory = (name: string): DisplayCategory => {
  const n = name.toLowerCase().trim();

  // Centrifuge Infrastructure
  if (
    n.includes('centrifuge component') ||
    n.includes('centrifuge manufacturing') ||
    n.includes('centrifuge testing') ||
    n.includes('centrifuge stockpiles')
  ) {
    return 'Centrifuge Infrastructure';
  }

  // Uranium Fuel Production
  if (
    n.includes('uranium mining') ||
    n.includes('foreign uranium') ||
    n.includes('uranium milling') ||
    n.includes('uranium conversion') ||
    n.includes('uranium enrichment') ||
    n.includes('heu storage') ||
    n.includes('russian supply') ||
    n.includes('fuel manufacturing')
  ) {
    return 'Uranium Fuel Production';
  }

  // Nuclear Energy Production
  if (
    n.includes('research reactor') ||
    n.includes('power reactor') ||
    n.includes('small modular reactor')
  ) {
    return 'Nuclear Energy Production';
  }

  // Weaponization
  if (
    n.includes('reprocessing') ||
    n.includes('uranium metal') ||
    n.includes('weapon') ||
    n.includes('administration') ||
    n.includes('radiation') ||
    n.includes('explosives') ||
    n.includes('multi-point') ||
    n.includes('neutron initiator') ||
    n.includes('warhead')
  ) {
    return 'Weaponization';
  }

  // Plutonium Pathway
  if (
    n.includes('heavy water') ||
    n.includes('plutonium')
  ) {
    return 'Plutonium Pathway';
  }

  return 'Other';
};

export const buildSystemGroups = (facilityData: FacilityData[]): SystemGroup[] => {
  if (!facilityData || facilityData.length === 0) {
    return [];
  }

  const groups = new Map<string, SystemGroup>();

  facilityData.forEach((facility) => {
    const subCategory = facility['Sub-Category']?.trim() || 'Unnamed System';
    const mainCategory = facility['Main-Category']?.trim() || 'Unknown Category';
    const groupId = `${mainCategory}::${subCategory}`;

    if (!groups.has(groupId)) {
      groups.set(groupId, {
        id: groupId,
        name: subCategory,
        mainCategory,
        displayCategory: getDisplayCategory(subCategory),
        locations: [],
      });
    }

    const systemGroup = groups.get(groupId)!;
    const statusMeta = getStatusMeta(facility.Sub_Item_Status);

    systemGroup.locations.push({
      id: facility.Item_Id || `${systemGroup.locations.length}`,
      facilityId: facility.Item_Id || `${systemGroup.locations.length}`,
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
};

const statusPriority: Record<NormalizedStatusKey, number> = {
  destroyed: 5,
  'likely-destroyed': 4,
  construction: 3,
  operational: 2,
  unknown: 1,
  other: 0,
};

const buildStatusBreakdown = (locations: SystemLocation[]) => {
  const counts = new Map<NormalizedStatusKey, number>();

  locations.forEach((location) => {
    const key = location.statusMeta.key;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      count,
      label: STATUS_META[key].label,
      color: STATUS_META[key].color,
    }))
    .sort((a, b) => {
      if (a.count === b.count) {
        return statusPriority[b.key] - statusPriority[a.key];
      }
      return b.count - a.count;
    });
};

export const buildImpactSummaries = (
  systemGroups: SystemGroup[],
  configs: ImpactConfig[],
): ImpactSummary[] => {
  if (!systemGroups || systemGroups.length === 0) {
    return configs.map((config) => ({
      id: config.id,
      label: config.label,
      descriptor: config.descriptor,
      primaryValue: config.fallbackMagnitude,
      primaryLabel: config.descriptor,
      annotation: config.fallbackAnnotation,
      statusBreakdown: [],
      hasData: false,
      systemIds: [],
      category: config.category,
    }));
  }

  return configs.map((config) => {
    const keywords = config.keywords.map((keyword) => keyword.toLowerCase());
    const matchedSystems = systemGroups.filter((system) => {
      const name = system.name.toLowerCase();
      const mainCategory = system.mainCategory.toLowerCase();
      return keywords.some(
        (keyword) => name.includes(keyword) || mainCategory.includes(keyword),
      );
    });

    const matchedLocations = matchedSystems.flatMap((system) => system.locations);
    const statusBreakdown = buildStatusBreakdown(matchedLocations);
    const totalLocations = matchedLocations.length;
    const hasData = totalLocations > 0;

    const destroyedCount = matchedLocations.filter(
      (location) => location.statusMeta.key === 'destroyed',
    ).length;
    const likelyDestroyedCount = matchedLocations.filter(
      (location) => location.statusMeta.key === 'likely-destroyed',
    ).length;
    const operationalCount = matchedLocations.filter(
      (location) => location.statusMeta.key === 'operational',
    ).length;
    const offlineCount = destroyedCount + likelyDestroyedCount;

    let primaryValue = config.fallbackMagnitude;
    let primaryLabel = config.descriptor;
    let annotation = config.fallbackAnnotation;

    if (hasData) {
      primaryValue = offlineCount > 0 ? `${offlineCount}/${totalLocations}` : `${totalLocations}`;
      primaryLabel = offlineCount > 0 ? 'sites degraded' : 'sites tracked';

      const parts = [
        destroyedCount > 0 ? `${destroyedCount} destroyed` : null,
        likelyDestroyedCount > 0 ? `${likelyDestroyedCount} likely destroyed` : null,
        operationalCount > 0 ? `${operationalCount} operational` : null,
      ].filter(Boolean) as string[];

      annotation = parts.length > 0
        ? parts.join(' • ')
        : 'Status updates pending further analysis.';
    }

    return {
      id: config.id,
      label: config.label,
      descriptor: config.descriptor,
      primaryValue,
      primaryLabel,
      annotation,
      statusBreakdown,
      hasData,
      systemIds: matchedSystems.map((system) => system.id),
      category: config.category,
    };
  });
};

export const buildSystemSummary = (
  facilityData: FacilityData[],
  configs: ImpactConfig[],
): SystemSummaryResult => {
  const groupedSystems = buildSystemGroups(facilityData);
  const impactSummaries = buildImpactSummaries(groupedSystems, configs);
  const impactSummaryMap = impactSummaries.reduce<Record<string, ImpactSummary>>(
    (acc, summary) => {
      acc[summary.id] = summary;
      return acc;
    },
    {},
  );

  return { groupedSystems, impactSummaries, impactSummaryMap };
};
