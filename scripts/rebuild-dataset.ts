import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Facility {
  id: string;
  name: string;
  status: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

// Color mappings based on the SVG
const COLOR_MAPPINGS = {
  '#00558C': { status: 'operational', category: 'Fuel Production' },
  '#BCD8F0': { status: 'operational', category: 'Fuel Production' }, // sub-items
  '#FFC7C2': { status: 'destroyed', category: 'Fuel Production' },
  '#C7E9C0': { status: 'operational', category: 'Fuel Production' },
  '#DCCCFF': { status: 'construction', category: 'Fuel Production' },
  '#874FFF': { status: 'construction', category: 'Fuel Production' },
};

function parseSVG(svgContent: string): Facility[] {
  const facilities: Facility[] = [];

  // Parse rectangles
  const rectRegex = /<rect[^>]*id="([^"]*)"[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*width="([^"]*)"[^>]*height="([^"]*)"[^>]*fill="([^"]*)"[^>]*\/>/g;
  let match;
  while ((match = rectRegex.exec(svgContent)) !== null) {
    const [, id, x, y, width, height, fill] = match;
    const colorMapping = COLOR_MAPPINGS[fill as keyof typeof COLOR_MAPPINGS];
    if (colorMapping) {
      facilities.push({
        id: id,
        name: `Facility ${facilities.length + 1}`,
        status: colorMapping.status,
        category: colorMapping.category,
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height),
        fill,
      });
    }
  }

  // Parse circles
  const circleRegex = /<circle[^>]*id="([^"]*)"[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*r="([^"]*)"[^>]*fill="([^"]*)"[^>]*\/>/g;
  while ((match = circleRegex.exec(svgContent)) !== null) {
    const [, id, cx, cy, r, fill] = match;
    const colorMapping = COLOR_MAPPINGS[fill as keyof typeof COLOR_MAPPINGS];
    if (colorMapping) {
      facilities.push({
        id: id,
        name: `Facility ${facilities.length + 1}`,
        status: colorMapping.status,
        category: colorMapping.category,
        x: parseFloat(cx) - parseFloat(r),
        y: parseFloat(cy) - parseFloat(r),
        width: parseFloat(r) * 2,
        height: parseFloat(r) * 2,
        fill,
      });
    }
  }

  // Parse ellipses (if any)
  const ellipseRegex = /<ellipse[^>]*id="([^"]*)"[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*rx="([^"]*)"[^>]*ry="([^"]*)"[^>]*fill="([^"]*)"[^>]*\/>/g;
  while ((match = ellipseRegex.exec(svgContent)) !== null) {
    const [, id, cx, cy, rx, ry, fill] = match;
    const colorMapping = COLOR_MAPPINGS[fill as keyof typeof COLOR_MAPPINGS];
    if (colorMapping) {
      facilities.push({
        id: id,
        name: `Facility ${facilities.length + 1}`,
        status: colorMapping.status,
        category: colorMapping.category,
        x: parseFloat(cx) - parseFloat(rx),
        y: parseFloat(cy) - parseFloat(ry),
        width: parseFloat(rx) * 2,
        height: parseFloat(ry) * 2,
        fill,
      });
    }
  }

  return facilities;
}

function generateCSV(facilities: Facility[]): string {
  const headers = ['id', 'name', 'status', 'category', 'x', 'y', 'width', 'height', 'fill'];
  const rows = facilities.map(facility =>
    [facility.id, facility.name, facility.status, facility.category, facility.x, facility.y, facility.width, facility.height, facility.fill]
      .map(value => `"${value}"`)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function main() {
  try {
    const svgPath = join(process.cwd(), 'public', 'main.svg');
    const csvPath = join(process.cwd(), 'public', 'nuclear_facilities_dataset.csv');

    console.log('Reading SVG file...');
    const svgContent = readFileSync(svgPath, 'utf-8');

    console.log('Parsing facilities from SVG...');
    const facilities = parseSVG(svgContent);

    console.log(`Found ${facilities.length} facilities`);

    // Log facility counts by type
    const rectCount = facilities.filter(f => f.id.startsWith('Shape')).length;
    const circleCount = facilities.filter(f => f.id.startsWith('Ellipse')).length;
    const ellipseCount = facilities.filter(f => f.id.startsWith('ellipse_')).length;

    console.log(`- Rectangles: ${rectCount}`);
    console.log(`- Circles: ${circleCount}`);
    console.log(`- Ellipses: ${ellipseCount}`);

    // Log some example IDs
    console.log('Example IDs:');
    facilities.slice(0, 5).forEach(f => {
      console.log(`- ${f.id}: ${f.status}`);
    });

    // Log by status
    const statusCounts = facilities.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('By status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`- ${status}: ${count}`);
    });

    console.log('Generating CSV...');
    const csvContent = generateCSV(facilities);

    console.log('Writing CSV file...');
    writeFileSync(csvPath, csvContent, 'utf-8');

    console.log('Dataset rebuild complete!');
    console.log(`Total facilities: ${facilities.length}`);

  } catch (error) {
    console.error('Error rebuilding dataset:', error);
    process.exit(1);
  }
}

main();