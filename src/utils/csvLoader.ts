export interface FacilityData {
  shape_id: string;
  Item_Id: string;
  'Main-Category': string;
  'Sub-Category': string;
  Sub_Item: string;
  Locations: string;
  Sub_Item_Status: string;
  name: string;
  status: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export async function loadFacilityData(): Promise<FacilityData[]> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}iranian_nuclear_facilities_dataset.csv`);
    const text = await response.text();

    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const facilities: FacilityData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',');
      if (values.length < headers.length) continue;

      // CSV Format: Item_Id,Main-Category,Sub-Category,,Sub_Item,Locations,Sub_Item_Status
      facilities.push({
        shape_id: values[0]?.replace(/"/g, '') || '',
        Item_Id: values[0]?.replace(/"/g, '') || '',
        'Main-Category': values[1]?.replace(/"/g, '') || '',
        'Sub-Category': values[2]?.replace(/"/g, '') || '',
        Sub_Item: values[4]?.replace(/"/g, '') || '', // Skip empty column 3
        Locations: values[5]?.replace(/"/g, '') || '',
        Sub_Item_Status: values[6]?.replace(/"/g, '') || '',
        name: values[5]?.replace(/"/g, '') || '', // Use Locations as name
        status: values[6]?.replace(/"/g, '') || '', // Use Sub_Item_Status as status
        category: values[1]?.replace(/"/g, '') || '', // Use Main-Category as category
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fill: ''
      });
    }

    return facilities;
  } catch (error) {
    console.error('Error loading facility data:', error);
    return [];
  }
}

export function getStatusFromSVGColor(fillColor: string, _facilityData?: FacilityData[]): string {
  // Direct mapping of SVG colors to status values based on actual SVG content
  const colorToStatusMap: Record<string, string> = {
    '#00558C': 'operational',
    '#BCD8F0': 'operational',
    '#FFC7C2': 'destroyed',
    '#C7E9C0': 'operational',
    '#DCCCFF': 'construction',
    '#874FFF': 'construction'
  };

  // Normalize the color (remove spaces, convert to uppercase)
  const normalizedColor = fillColor.trim().toUpperCase();

  // Check direct match first
  if (colorToStatusMap[normalizedColor]) {
    return colorToStatusMap[normalizedColor];
  }

  // Check lowercase version
  const lowerColor = fillColor.trim().toLowerCase();
  for (const [color, status] of Object.entries(colorToStatusMap)) {
    if (color.toLowerCase() === lowerColor) {
      return status;
    }
  }

  return 'unknown';
}

export function getFacilityByName(name: string, facilityData: FacilityData[]): FacilityData | null {
  const lowerName = name.toLowerCase();
  return facilityData.find(facility => {
    const facilityNameLower = facility.Locations.toLowerCase();
    return facilityNameLower.includes(lowerName) || lowerName.includes(facilityNameLower);
  }) || null;
}

export function getFacilityById(id: string, facilityData: FacilityData[]): FacilityData | null {
  return facilityData.find(facility => facility.shape_id === id) || null;
}