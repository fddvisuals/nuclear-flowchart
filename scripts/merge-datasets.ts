import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface IranianFacility {
  Item_Id: string;
  'Main-Category': string;
  'Sub-Category': string;
  'Sub_Item': string;
  Locations: string;
  Sub_Item_Status: string;
}

interface SVGShape {
  id: string;
  name: string;
  svgText: string; // Actual text content from SVG
  status: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

interface MergedFacility extends IranianFacility, SVGShape {
  shape_id: string;
}

// Status mapping from Iranian dataset to SVG colors
const STATUS_MAPPING = {
  'Known/Operational': 'operational',
  'Destroyed': 'destroyed',
  'Under construction': 'construction',
  'Unknown/Non-operational': 'operational', // Default to operational for unknown
  'Likely destroyed': 'destroyed',
  'Pink/Red with Purple Border': 'destroyed' // This seems to be a special status
};

// Category mapping
const CATEGORY_MAPPING = {
  'Fuel Production': 'Fuel Production',
  'Weaponization': 'Fuel Production' // Map weaponization to production for now
};

function parseIranianCSV(csvContent: string): IranianFacility[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    // More robust CSV parsing that handles commas within fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current); // Add the last field

    const facility: any = {};

    // Map to our expected structure
    facility.Item_Id = values[0]?.trim() || '';
    facility['Main-Category'] = values[1]?.trim() || '';
    facility['Sub-Category'] = values[2]?.trim() || '';
    facility.Sub_Item = values[4]?.trim() || ''; // Skip the empty column at index 3
    facility.Locations = values[5]?.trim() || '';
    facility.Sub_Item_Status = values[6]?.trim() || '';

    return facility as IranianFacility;
  });
}

function parseSVGCSV(csvContent: string): SVGShape[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const shape: any = {};

    headers.forEach((header, index) => {
      const value = values[index]?.replace(/"/g, '') || '';
      if (['x', 'y', 'width', 'height'].includes(header)) {
        shape[header] = parseFloat(value);
      } else {
        shape[header] = value;
      }
    });

    return shape as SVGShape;
  });
}

function extractSVGTextContent(svgPath: string): Record<string, string> {
  const svgContent = readFileSync(svgPath, 'utf-8');
  const textMap: Record<string, string> = {};

  // Extract text elements and their associated shape IDs
  // Handle nested group structure: <g id="Group X"><g id="ActualName"><rect id="Shape_Y"/><text>...</text></g></g>
  const nestedGroupRegex = /<g id="([^"]+)">\s*<g id="([^"]+)">\s*<rect id="([^"]+)"[\s\S]*?<\/rect>\s*<text[^>]*>([\s\S]*?)<\/text>\s*<\/g>/g;
  let match;

  while ((match = nestedGroupRegex.exec(svgContent)) !== null) {
    const outerGroupId = match[1];
    const innerGroupId = match[2];
    const shapeId = match[3];
    const textContent = match[4];

    // Extract the actual text from tspan elements
    const tspanRegex = /<tspan[^>]*>([^<]+)<\/tspan>/g;
    let tspanMatch;
    let fullText = '';

    while ((tspanMatch = tspanRegex.exec(textContent)) !== null) {
      fullText += tspanMatch[1];
    }

    if (fullText) {
      textMap[shapeId] = fullText.trim();
      console.log(`Extracted: ${shapeId} -> "${fullText.trim()}" (from group "${innerGroupId}")`);
    }
  }

  return textMap;
}

function mapStatusToSVG(iranianStatus: string): string {
  return STATUS_MAPPING[iranianStatus as keyof typeof STATUS_MAPPING] || 'operational';
}

function createFacilityMapping(iranianFacilities: IranianFacility[], svgShapes: SVGShape[]): MergedFacility[] {
  const merged: MergedFacility[] = [];
  const usedShapes = new Set<string>();

  // Manual mapping overrides for known shape-to-facility relationships
  const manualMappings: Record<string, number> = {
    'Shape_17': 52, // TABA/TESA Karaj Site
    // Add more manual mappings here as needed
  };

  // First pass: Apply manual mappings
  Object.entries(manualMappings).forEach(([shapeId, itemId]) => {
    const facility = iranianFacilities.find(f => f.Item_Id === itemId.toString());
    const shape = svgShapes.find(s => s.id === shapeId);

    if (facility && shape && !usedShapes.has(shapeId)) {
      usedShapes.add(shapeId);
      merged.push({
        ...facility,
        ...shape,
        shape_id: shapeId
      });
      console.log(`MANUAL MAPPING: Facility ${itemId} -> Shape ${shapeId}`);
    }
  });

  // Second pass: Try to match facilities by name/location to SVG shape text content
  iranianFacilities.forEach(facility => {
    if (merged.some(m => m.Item_Id === facility.Item_Id)) return; // Already mapped

    let assignedShape: SVGShape | null = null;

    // Try to find a shape whose SVG text matches facility location or sub-category
    const facilityLocation = facility.Locations.toLowerCase();
    const facilitySubCategory = facility['Sub-Category'].toLowerCase();

    console.log(`Matching facility: Item_Id=${facility.Item_Id}, Location="${facilityLocation}", Sub-Category="${facilitySubCategory}"`);

    for (const shape of svgShapes) {
      if (usedShapes.has(shape.id)) continue;

      const shapeText = shape.svgText.toLowerCase();

      // Check for exact matches or partial matches
      if (shapeText.includes(facilityLocation) ||
          facilityLocation.includes(shapeText) ||
          shapeText.includes(facilitySubCategory) ||
          facilitySubCategory.includes(shapeText)) {
        console.log(`  MATCH: Shape ${shape.id} ("${shapeText}") matches facility ${facility.Item_Id}`);
        assignedShape = shape;
        break;
      }
    }

    if (assignedShape) {
      usedShapes.add(assignedShape.id);
      merged.push({
        ...facility,
        ...assignedShape,
        shape_id: assignedShape.id
      });
      console.log(`  ASSIGNED: Facility ${facility.Item_Id} -> Shape ${assignedShape.id}`);
    } else {
      console.log(`  NO MATCH: Facility ${facility.Item_Id} not matched in second pass`);
    }
  });

  // Second pass: Status-based assignment for unmatched facilities
  const shapesByStatus = svgShapes.reduce((acc, shape) => {
    if (!acc[shape.status]) acc[shape.status] = [];
    acc[shape.status].push(shape);
    return acc;
  }, {} as Record<string, SVGShape[]>);

  // Sort Iranian facilities by status priority: destroyed first, then construction, then operational
  const statusPriority = { 'destroyed': 3, 'construction': 2, 'operational': 1 };
  const sortedFacilities = [...iranianFacilities].sort((a, b) => {
    const statusA = mapStatusToSVG(a.Sub_Item_Status);
    const statusB = mapStatusToSVG(b.Sub_Item_Status);
    return (statusPriority[statusB as keyof typeof statusPriority] || 0) -
           (statusPriority[statusA as keyof typeof statusPriority] || 0);
  });

  // Map remaining facilities to shapes by status priority
  sortedFacilities.forEach(facility => {
    // Skip if already mapped
    if (merged.some(m => m.Item_Id === facility.Item_Id)) return;

    const requiredStatus = mapStatusToSVG(facility.Sub_Item_Status);
    let assignedShape: SVGShape | null = null;

    // Try to find an unused shape with the correct status
    const availableShapes = shapesByStatus[requiredStatus]?.filter(shape => !usedShapes.has(shape.id)) || [];

    if (availableShapes.length > 0) {
      assignedShape = availableShapes[0];
    } else {
      // Fallback: find any unused shape
      const allUnusedShapes = svgShapes.filter(shape => !usedShapes.has(shape.id));
      if (allUnusedShapes.length > 0) {
        assignedShape = allUnusedShapes[0];
      }
    }

    if (assignedShape) {
      usedShapes.add(assignedShape.id);
      merged.push({
        ...facility,
        ...assignedShape,
        shape_id: assignedShape.id
      });
    }
  });

  return merged;
}

function generateMergedCSV(facilities: MergedFacility[]): string {
  const headers = [
    'shape_id', 'Item_Id', 'Main-Category', 'Sub-Category', 'Sub_Item',
    'Locations', 'Sub_Item_Status', 'name', 'status', 'category',
    'x', 'y', 'width', 'height', 'fill'
  ];

  const rows = facilities.map(facility =>
    [
      facility.shape_id,
      facility.Item_Id,
      facility['Main-Category'],
      facility['Sub-Category'],
      facility.Sub_Item,
      facility.Locations,
      facility.Sub_Item_Status,
      facility.name,
      facility.status,
      facility.category,
      facility.x,
      facility.y,
      facility.width,
      facility.height,
      facility.fill
    ].map(value => `"${String(value).replace(/"/g, '""')}"`) // Escape quotes and wrap in quotes
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

function main() {
  try {
    const iranianPath = join(process.cwd(), 'public', 'iranian_nuclear_facilities_dataset.csv');
    const svgPath = join(process.cwd(), 'public', 'nuclear_facilities_dataset.csv');
    const svgFilePath = join(process.cwd(), 'public', 'main.svg');
    const outputPath = join(process.cwd(), 'public', 'merged_nuclear_facilities_dataset.csv');

    console.log('Reading Iranian facilities CSV...');
    const iranianContent = readFileSync(iranianPath, 'utf-8');
    const iranianFacilities = parseIranianCSV(iranianContent);

    console.log('Reading SVG shapes CSV...');
    const svgContent = readFileSync(svgPath, 'utf-8');
    const svgShapes = parseSVGCSV(svgContent);

    console.log('Extracting SVG text content...');
    const svgTextMap = extractSVGTextContent(svgFilePath);

    // Add SVG text content to shapes
    svgShapes.forEach(shape => {
      shape.svgText = svgTextMap[shape.id] || shape.name;
      console.log(`Shape ${shape.id}: name="${shape.name}", svgText="${shape.svgText}"`);
    });

    console.log(`Found ${iranianFacilities.length} Iranian facilities`);
    console.log(`Found ${svgShapes.length} SVG shapes`);

    console.log('Creating facility-to-shape mapping...');
    const mergedFacilities = createFacilityMapping(iranianFacilities, svgShapes);

    console.log(`Successfully mapped ${mergedFacilities.length} facilities`);

    // Log mapping summary
    const mappedByCategory = mergedFacilities.reduce((acc, f) => {
      const key = f['Main-Category'];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Mapping summary by category:');
    Object.entries(mappedByCategory).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} facilities`);
    });

    console.log('Generating merged CSV...');
    const csvContent = generateMergedCSV(mergedFacilities);

    console.log('Writing merged CSV file...');
    writeFileSync(outputPath, csvContent, 'utf-8');

    console.log('Dataset merge complete!');
    console.log(`Output: ${outputPath}`);

  } catch (error) {
    console.error('Error merging datasets:', error);
    process.exit(1);
  }
}

main();