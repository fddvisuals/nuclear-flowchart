export interface FacilityData {
  facility_id: string;
  facility_name: string;
  main_category: 'Fuel Production' | 'Fuel Weaponization';
  item_type: 'component' | 'sub-item' | 'standalone';
  parent_component: string;
  sub_items: string[];
  category_color: string;
  description: string;
  status_colors: Record<string, string>; // hex color -> status mapping
}

export async function loadFacilityData(): Promise<FacilityData[]> {
  try {
    const response = await fetch('/nuclear_facilities_dataset.csv');
    const text = await response.text();
    
    console.log('CSV response received, length:', text.length);
    
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const facilities: FacilityData[] = [];
    
    console.log('CSV headers:', headers);
    console.log('Total lines:', lines.length);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      if (values.length < headers.length) continue;
      
      // Parse status colors mapping
      const statusColorsStr = values[8] || '';
      const statusColors: Record<string, string> = {};
      
      statusColorsStr.split(';').forEach(mapping => {
        const [color, status] = mapping.split('=');
        if (color && status) {
          statusColors[color] = status.replace('#', '');
        }
      });
      
      // Parse sub_items array
      const subItemsStr = values[5] || '';
      const subItems = subItemsStr ? subItemsStr.split(',').map(s => s.trim()) : [];
      
      facilities.push({
        facility_id: values[0],
        facility_name: values[1],
        main_category: values[2] as 'Fuel Production' | 'Fuel Weaponization',
        item_type: values[3] as 'component' | 'sub-item' | 'standalone',
        parent_component: values[4],
        sub_items: subItems,
        category_color: values[6],
        description: values[7],
        status_colors: statusColors
      });
    }
    
    console.log(`Loaded ${facilities.length} facilities from CSV`);
    if (facilities.length > 0) {
      console.log('Sample facility:', facilities[0]);
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
    '#9FE2AA': 'operational',      // Light Green (5 elements in SVG)
    '#DCCCFF': 'construction',     // Light Purple (1 element in SVG)
    '#FFE0C2': 'likely-destroyed', // Light Orange (3 elements in SVG)  
    '#FFC7C2': 'destroyed',        // Light Red (28 elements in SVG)
    '#DCDCDC': 'unknown',          // Light Gray (11 elements in SVG)
    '#00558C': 'operational',      // Dark Blue (33 elements in SVG) - main operational color
    '#1E1E1E': 'unknown',          // Dark color (22 elements in SVG)
    '#2D2E2D': 'unknown',          // Another dark color (14 elements in SVG)
    '#F5F5F5': 'unknown'           // Light gray/white (1 element in SVG)
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
    const facilityNameLower = facility.facility_name.toLowerCase();
    return facilityNameLower.includes(lowerName) || lowerName.includes(facilityNameLower);
  }) || null;
}

export function getFacilityById(id: string, facilityData: FacilityData[]): FacilityData | null {
  return facilityData.find(facility => facility.facility_id === id) || null;
}