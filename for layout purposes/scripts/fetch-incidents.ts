import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { parseCsvData, IncidentData } from '../utils/csvParser.js';

// Load environment variables
config();

// Default Google Sheets CSV URL - can be overridden with environment variable
// This is a placeholder - replace with your actual Google Sheets publish URL
const DEFAULT_CSV_URL = './Incident Database_ Gas Leak-Induced Fires and Explosions - Sheet1.csv';

function generateStructuredData(incidents: IncidentData[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "Gas Leak Incidents Database",
      "description": `Database of ${incidents.length} gas leak-induced fires and explosions with evidence and location data`,
      "url": "https://fddvisuals.github.io/Gas-Leak-Incidents/",
      "temporalCoverage": "2024-2025",
      "spatialCoverage": {
        "@type": "Place",
        "geo": {
          "@type": "GeoShape",
          "addressCountry": "IR"
        }
      },
      "distribution": [
        {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "/incidents-data.json"
        },
        {
          "@type": "DataDownload", 
          "encodingFormat": "text/csv",
          "contentUrl": "/incidents-data.csv"
        }
      ],
      "keywords": ["gas leak", "explosion", "fire", "incident", "safety", "infrastructure"],
      "creator": {
        "@type": "Organization",
        "@id": "https://www.fdd.org/#organization",
        "name": "Foundation for Defense of Democracies",
        "alternateName": "FDD",
        "url": "https://www.fdd.org"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Gas Leak Incidents Map - FDD Visuals",
      "description": "Interactive map and database of gas leak-induced fires and explosions incidents with detailed evidence and analysis.",
      "url": "https://fddvisuals.github.io/Gas-Leak-Incidents/",
      "mainEntity": {
        "@type": "Dataset",
        "name": "Gas Leak Incidents Database",
        "description": `Interactive database of ${incidents.length} documented gas leak-induced fires and explosions`
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.fdd.org/#organization",
        "name": "Foundation for Defense of Democracies",
        "alternateName": "FDD",
        "url": "https://www.fdd.org"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList", 
      "name": "Gas Leak Incidents in Iran",
      "description": "List of documented gas leak incidents in Iran with evidence",
      "numberOfItems": incidents.length,
      "itemListElement": incidents.slice(0, 10).map((incident, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "name": incident.Description,
          "description": incident.evidence[0]?.TranslatedCaption?.substring(0, 200) || incident.Description,
          "location": {
            "@type": "Place",
            "name": `${incident.City}, ${incident.Province}`,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": incident.City,
              "addressRegion": incident.Province,
              "addressCountry": "IR"
            },
            ...(incident.latitude && incident.longitude ? {
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": incident.latitude,
                "longitude": incident.longitude
              }
            } : {})
          },
          "startDate": incident.earliestDate,
          "endDate": incident.earliestDate,
          "additionalType": incident.Categories.map(cat => `https://schema.org/${cat === 'Explosion' ? 'Explosion' : cat === 'Fire' ? 'Fire' : 'Event'}`),
          "keywords": incident.Categories.join(", "),
          "organizer": {
            "@type": "Organization",
            "@id": "https://www.fdd.org/#organization",
            "name": "Foundation for Defense of Democracies",
            "alternateName": "FDD",
            "url": "https://www.fdd.org"
          }
        }
      }))
    }
  ];
}

async function fetchIncidentsData() {
  const csvUrl = process.env.VITE_GOOGLE_SHEETS_CSV_URL;
  
  if (!csvUrl) {
    console.log('No VITE_GOOGLE_SHEETS_CSV_URL found, using local CSV file...');
    
    // Use existing local file
    const localCsvPath = path.join(process.cwd(), 'public', 'Incident Database_ Gas Leak-Induced Fires and Explosions - Sheet1.csv');
    if (fs.existsSync(localCsvPath)) {
      const csvText = fs.readFileSync(localCsvPath, 'utf-8');
      const incidents = parseCsvData(csvText);
      
      // Generate the other files
      const publicDir = path.join(process.cwd(), 'public');
      
      fs.writeFileSync(
        path.join(publicDir, 'incidents-data.json'),
        JSON.stringify(incidents, null, 2)
      );
      
      const structuredData = generateStructuredData(incidents);
      fs.writeFileSync(
        path.join(publicDir, 'incidents-structured-data.json'),
        JSON.stringify(structuredData, null, 2)
      );
      
      console.log(`✅ Generated files from local CSV with ${incidents.length} incidents`);
      return incidents;
    } else {
      console.error('❌ No local CSV file found and no Google Sheets URL provided');
      process.exit(1);
    }
  }
  
  try {
    console.log('Fetching incidents data from Google Sheets...');
    console.log('URL:', csvUrl);
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV data length:', csvText.length);
    
    const incidents = parseCsvData(csvText);
    console.log('Parsed incidents count:', incidents.length);
    
    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Save raw CSV data
    fs.writeFileSync(
      path.join(publicDir, 'incidents-data.csv'),
      csvText
    );
    
    // Save parsed JSON data for fast loading
    fs.writeFileSync(
      path.join(publicDir, 'incidents-data.json'),
      JSON.stringify(incidents, null, 2)
    );
    
    // Generate structured data
    const structuredData = generateStructuredData(incidents);
    fs.writeFileSync(
      path.join(publicDir, 'incidents-structured-data.json'),
      JSON.stringify(structuredData, null, 2)
    );
    
    console.log(`✅ Successfully saved ${incidents.length} incidents to public folder`);
    console.log('Files created:');
    console.log('  - incidents-data.csv');
    console.log('  - incidents-data.json');
    console.log('  - incidents-structured-data.json');
    
    return incidents;
  } catch (error) {
    console.error('❌ Error fetching incidents:', error);
    
    // Try to use existing local file as fallback
    const localCsvPath = path.join(process.cwd(), 'public', 'Incident Database_ Gas Leak-Induced Fires and Explosions - Sheet1.csv');
    if (fs.existsSync(localCsvPath)) {
      console.log('📄 Using existing local CSV file as fallback...');
      const csvText = fs.readFileSync(localCsvPath, 'utf-8');
      const incidents = parseCsvData(csvText);
      
      // Still generate the other files
      const publicDir = path.join(process.cwd(), 'public');
      
      fs.writeFileSync(
        path.join(publicDir, 'incidents-data.json'),
        JSON.stringify(incidents, null, 2)
      );
      
      const structuredData = generateStructuredData(incidents);
      fs.writeFileSync(
        path.join(publicDir, 'incidents-structured-data.json'),
        JSON.stringify(structuredData, null, 2)
      );
      
      console.log(`✅ Generated files from local CSV with ${incidents.length} incidents`);
      return incidents;
    }
    
    console.error('❌ No fallback CSV file available');
    process.exit(1);
  }
}

// Run the script
fetchIncidentsData().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
