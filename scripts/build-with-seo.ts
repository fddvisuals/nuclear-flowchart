import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { parseCsvData, IncidentData } from '../utils/csvParser.js';

// Load environment variables
config();

function generateStructuredData(incidents: IncidentData[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "@id": "https://fddvisuals.github.io/Gas-Leak-Incidents/#dataset",
      "name": "Gas Leak Incidents Database",
      "description": `Database of ${incidents.length} gas leak-induced fires and explosions with evidence and location data`,
      "url": "https://fddvisuals.github.io/Gas-Leak-Incidents/",
      "temporalCoverage": "2024-2025",
      "spatialCoverage": {
        "@type": "Place",
        "name": "Iran",
        "geo": {
          "@type": "GeoShape",
          "addressCountry": "IR"
        }
      },
      "distribution": [
        {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "https://fddvisuals.github.io/Gas-Leak-Incidents/incidents-data.json"
        },
        {
          "@type": "DataDownload", 
          "encodingFormat": "text/csv",
          "contentUrl": "https://fddvisuals.github.io/Gas-Leak-Incidents/incidents-data.csv"
        }
      ],
      "keywords": ["gas leak", "explosion", "fire", "incident", "safety", "infrastructure"],
      "license": "https://creativecommons.org/licenses/by/4.0/",
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
        "@id": "https://fddvisuals.github.io/Gas-Leak-Incidents/#dataset"
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
      "itemListElement": incidents.map((incident, index) => ({
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

async function fetchIncidentsData(): Promise<IncidentData[]> {
  const csvUrl = process.env.VITE_GOOGLE_SHEETS_CSV_URL;
  
  if (!csvUrl) {
    console.log('No VITE_GOOGLE_SHEETS_CSV_URL found, using local CSV file...');
    
    // Use existing local file
    const localCsvPath = path.join(process.cwd(), 'public', 'Incident Database_ Gas Leak-Induced Fires and Explosions - Sheet1.csv');
    if (fs.existsSync(localCsvPath)) {
      const csvText = fs.readFileSync(localCsvPath, 'utf-8');
      const incidents = parseCsvData(csvText);
      console.log(`✅ Loaded ${incidents.length} incidents from local CSV`);
      return incidents;
    } else {
      console.error('❌ No local CSV file found and no Google Sheets URL provided');
      process.exit(1);
    }
  }
  
  try {
    console.log('🔄 Fetching incidents data from Google Sheets...');
    console.log('URL:', csvUrl.substring(0, 50) + '...');
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV data length:', csvText.length);
    
    const incidents = parseCsvData(csvText);
    console.log(`✅ Parsed ${incidents.length} incidents from Google Sheets`);
    
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
    
    console.log('📁 Updated data files in public folder');
    
    return incidents;
  } catch (error) {
    console.error('❌ Error fetching incidents:', error);
    
    // Try to use existing local file as fallback
    const localCsvPath = path.join(process.cwd(), 'public', 'Incident Database_ Gas Leak-Induced Fires and Explosions - Sheet1.csv');
    if (fs.existsSync(localCsvPath)) {
      console.log('📄 Using existing local CSV file as fallback...');
      const csvText = fs.readFileSync(localCsvPath, 'utf-8');
      const incidents = parseCsvData(csvText);
      console.log(`✅ Loaded ${incidents.length} incidents from local fallback`);
      return incidents;
    }
    
    console.error('❌ No fallback CSV file available');
    process.exit(1);
  }
}

function injectStructuredDataIntoHTML(incidents: IncidentData[]) {
  const structuredData = generateStructuredData(incidents);
  const structuredDataJson = JSON.stringify(structuredData, null, 2);
  
  // Read the source HTML template
  const sourceHtmlPath = path.join(process.cwd(), 'index.html');
  let htmlContent = fs.readFileSync(sourceHtmlPath, 'utf-8');
  
  // Find and replace the structured data placeholder
  const structuredDataRegex = /<script type="application\/ld\+json" id="incidents-structured-data">\s*<\/script>/;
  
  if (structuredDataRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(
      structuredDataRegex,
      `<script type="application/ld+json" id="incidents-structured-data">
${structuredDataJson}
    </script>`
    );
    console.log('✅ Injected structured data into HTML template');
  } else {
    console.error('❌ Could not find structured data placeholder in HTML');
    return false;
  }
  
  // Ensure dist directory exists
  const distDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Write the updated HTML to dist folder
  const outputHtmlPath = path.join(distDir, 'index.html');
  fs.writeFileSync(outputHtmlPath, htmlContent);
  
  // Also save the structured data as a separate file for reference
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(publicDir, 'incidents-structured-data.json'),
    structuredDataJson
  );
  
  console.log(`✅ Updated HTML with ${incidents.length} incidents in structured data`);
  console.log('📁 Files updated:');
  console.log('  - dist/index.html (with injected JSON-LD)');
  console.log('  - public/incidents-structured-data.json');
  
  return true;
}

async function buildWithSEO() {
  console.log('🚀 Starting SEO-enhanced build process...');
  console.log('');
  
  try {
    // Step 1: Fetch fresh incidents data
    const incidents = await fetchIncidentsData();
    
    // Step 2: Inject structured data into HTML
    const success = injectStructuredDataIntoHTML(incidents);
    
    if (success) {
      console.log('');
      console.log('🎉 SEO-enhanced build completed successfully!');
      console.log(`📊 ${incidents.length} incidents included in JSON-LD structured data`);
      console.log('');
      console.log('Next steps:');
      console.log('1. Run your normal build process (npm run build)');
      console.log('2. The dist/index.html already has the fresh structured data');
      console.log('3. Deploy as usual');
    } else {
      console.error('❌ Build failed - could not inject structured data');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Build process failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  buildWithSEO();
}

export { buildWithSEO, fetchIncidentsData, generateStructuredData, injectStructuredDataIntoHTML };
