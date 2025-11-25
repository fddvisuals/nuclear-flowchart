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

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

export async function loadFacilityData(): Promise<FacilityData[]> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}iranian_nuclear_facilities_dataset.csv`);
    const text = await response.text();

    const lines = text.split('\n');
    const facilities: FacilityData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      if (values.length < 7) continue; // Need at least 7 fields

      // CSV Format: Item_Id,Main-Category,Sub-Category,,Sub_Item,Locations,Sub_Item_Status
      facilities.push({
        shape_id: values[0] || '',
        Item_Id: values[0] || '',
        'Main-Category': values[1] || '',
        'Sub-Category': values[2] || '',
        Sub_Item: values[4] || '', // Skip empty column 3
        Locations: values[5] || '',
        Sub_Item_Status: values[6] || '',
        name: values[5] || '', // Use Locations as name
        status: values[6] || '', // Use Sub_Item_Status as status
        category: values[1] || '', // Use Main-Category as category
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