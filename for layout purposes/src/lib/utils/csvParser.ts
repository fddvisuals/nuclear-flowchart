import Papa from 'papaparse';

export interface EvidenceData {
  Category: string;
  MediaType: string;
  OriginalCaption: string;
  TranslatedCaption: string;
  SourceName: string;
  DateOfPost: string;
  TimeOfPost: string;
  Link: string;
}

export interface IncidentData {
  IncidentID: string;
  Categories: string[]; // Combined unique categories from all evidence
  NeighborhoodSite: string;
  City: string;
  Province: string;
  Coordinates: string;
  Description: string;
  ApproxTimeOfIncident: string;
  FatalityInjuryCounts: string;
  latitude?: number;
  longitude?: number;
  evidence: EvidenceData[]; // Array of all evidence for this incident
  // Derived fields for display
  primaryCategory: string; // Most severe category (Explosion > Fire > others)
  earliestDate: string; // Earliest evidence date
  evidenceCount: number; // Number of evidence pieces
}

export function parseCoordinates(coordinates: string): { lat: number; lng: number } | null {
  if (!coordinates || coordinates.trim() === '') return null;
  
  const parts = coordinates.split(',').map(part => part.trim());
  if (parts.length !== 2) return null;
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  return { lat, lng };
}

export function parseCsvData(csvText: string): IncidentData[] {
  const result = Papa.parse<any>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      // Transform headers to match our interface
      const headerMap: Record<string, string> = {
        'Category': 'Category',
        'Media Type': 'MediaType',
        'Neighborhood/Site': 'NeighborhoodSite',
        'City': 'City',
        'Province': 'Province',
        'Coordinates': 'Coordinates',
        'Description': 'Description',
        'Original Caption': 'OriginalCaption',
        'Translated Caption': 'TranslatedCaption',
        'Source Name': 'SourceName',
        'Date of Post (ET)': 'DateOfPost',
        'Time of Post (24HR, ET)': 'TimeOfPost',
        'Approx. Time of Incident (24HR, ET)': 'ApproxTimeOfIncident',
        'Fatality/Injury Counts': 'FatalityInjuryCounts',
        'Link': 'Link',
        'Incident ID': 'IncidentID'
      };
      return headerMap[header] || header;
    }
  });

  // Parse coordinates for each row and filter out invalid ones
  const rawData = result.data.map(item => {
    const coords = parseCoordinates(item.Coordinates);
    return {
      ...item,
      latitude: coords?.lat,
      longitude: coords?.lng
    };
  }).filter(item => item.latitude && item.longitude && item.IncidentID);

  // Group by Incident ID
  const groupedData = rawData.reduce((acc, item) => {
    const incidentId = item.IncidentID;
    
    if (!acc[incidentId]) {
      acc[incidentId] = {
        IncidentID: incidentId,
        NeighborhoodSite: item.NeighborhoodSite || '',
        City: item.City || '',
        Province: item.Province || '',
        Coordinates: item.Coordinates || '',
        Description: item.Description || '',
        ApproxTimeOfIncident: item.ApproxTimeOfIncident || '',
        FatalityInjuryCounts: item.FatalityInjuryCounts || '',
        latitude: item.latitude,
        longitude: item.longitude,
        evidence: [],
        Categories: [],
        primaryCategory: '',
        earliestDate: '',
        evidenceCount: 0
      };
    }

    // Add this evidence to the incident
    acc[incidentId].evidence.push({
      Category: item.Category || '',
      MediaType: item.MediaType || '',
      OriginalCaption: item.OriginalCaption || '',
      TranslatedCaption: item.TranslatedCaption || '',
      SourceName: item.SourceName || '',
      DateOfPost: item.DateOfPost || '',
      TimeOfPost: item.TimeOfPost || '',
      Link: item.Link || ''
    });

    return acc;
  }, {} as Record<string, IncidentData>);

  // Process grouped data to calculate derived fields
  const incidents: IncidentData[] = Object.values(groupedData).map((incident) => {
    const typedIncident = incident as IncidentData;
    // Get unique categories
    const categories = [...new Set(typedIncident.evidence.map((e: EvidenceData) => e.Category).filter(Boolean))];
    typedIncident.Categories = categories;
    typedIncident.evidenceCount = typedIncident.evidence.length;

    // Determine primary category (most severe)
    const categoryPriority = ['Explosion', 'Fire', 'Visible Smoke', 'Air Defense Activation'];
    typedIncident.primaryCategory = categoryPriority.find(cat => categories.includes(cat)) || categories[0] || 'Unknown';

    // Find earliest date
    const dates = typedIncident.evidence
      .map((e: EvidenceData) => e.DateOfPost)
      .filter(Boolean)
      .sort();
    typedIncident.earliestDate = dates[0] || '';

    return typedIncident;
  });

  return incidents;
}
