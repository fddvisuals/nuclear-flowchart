import { ParsedVisualData } from '../types/visuals';

/**
 * Fetches visual data from Google Sheets CSV
 */
export async function fetchVisualsData(): Promise<ParsedVisualData[]> {
  const csvUrl = import.meta.env.VITE_FDD_VISUALS_CSV_URL as string;

  if (!csvUrl) {
    console.error('VITE_GOOGLE_SHEETS_CSV_URL environment variable is not set');
    return [];
  }

  console.log('Fetching CSV from:', csvUrl);

  try {
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV response received, length:', csvText.length);
    
    return parseCSVData(csvText);
  } catch (error) {
    console.error('Error fetching visuals data:', error);
    return [];
  }
}

/**
 * Properly parses a CSV line handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
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

/**
 * Parses CSV text into visual data objects
 */
function parseCSVData(csvText: string): ParsedVisualData[] {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    console.warn('CSV data appears to be empty or invalid');
    return [];
  }

  // Try comma-separated first, then tab-separated
  let separator = ',';
  if (lines[0].includes('\t') && lines[0].split('\t').length > lines[0].split(',').length) {
    separator = '\t';
  }

  console.log('Using separator:', separator === ',' ? 'comma' : 'tab');

  // Get headers from first line
  const headers = separator === ',' ? parseCSVLine(lines[0]) : lines[0].split(separator);
  // Clean headers
  const cleanHeaders = headers.map(header => header.trim().replace(/"/g, ''));
  console.log('Headers found:', cleanHeaders);
  
  // Map headers to indices (exact matching since we know the CSV structure)
  const headerMap: Record<string, number> = {
    'Name': cleanHeaders.indexOf('Name'),
    'Date': cleanHeaders.indexOf('Date'), 
    'Author': cleanHeaders.indexOf('Author'),
    'Link': cleanHeaders.indexOf('Link'),
    'FeatureImageLink': cleanHeaders.indexOf('FeatureImageLink')
  };

  console.log('Header mapping:', headerMap);

  // Validate that all required headers were found
  const missingHeaders = Object.entries(headerMap).filter(([_, index]) => index === -1);
  if (missingHeaders.length > 0) {
    console.error('Missing headers:', missingHeaders.map(([header]) => header));
    return [];
  }

  // Parse data rows
  const visualsData: ParsedVisualData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Use proper CSV parsing for comma-separated files
    const values = separator === ',' ? parseCSVLine(line) : line.split(separator);
    // Clean values
    const cleanValues = values.map(value => value.trim().replace(/"/g, ''));
    
    if (cleanValues.length >= Math.max(...Object.values(headerMap))) {
      const parsedData: ParsedVisualData = {
        name: cleanValues[headerMap['Name']] || '',
        date: cleanValues[headerMap['Date']] || '',
        author: cleanValues[headerMap['Author']] || '',
        link: cleanValues[headerMap['Link']] || '',
        featureImageLink: cleanValues[headerMap['FeatureImageLink']] || ''
      };

      console.log('Parsed row:', parsedData);

      // Only add if we have essential data (name is minimum requirement)
      if (parsedData.name) {
        visualsData.push(parsedData);
      }
    }
  }

  console.log('Total visuals parsed:', visualsData.length);
  return visualsData;
}

/**
 * Formats the status text for display
 */
export function formatStatus(date: string, author: string): string {
  const statusParts: string[] = [];
  
  if (date) {
    statusParts.push(date);
  }
  
  if (author) {
    statusParts.push(author);
  }
  
  return statusParts.join(' | ');
}

/**
 * Creates a simple placeholder image URL
 */
export function getPlaceholderImageUrl(): string {
  return `data:image/svg+xml,%3Csvg width='357' height='212' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='357' height='212' fill='%23f0f0f0'/%3E%3C/svg%3E`;
}
