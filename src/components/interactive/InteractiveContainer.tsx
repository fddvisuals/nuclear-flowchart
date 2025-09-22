import { useEffect, useState } from 'react';
import { IncidentMap } from './IncidentMap';
import { IncidentData } from '../../lib/utils/csvParser';
import styles from "../../styles/components/InteractiveContainer.module.css";

interface InteractiveContainerProps {
  height?: string;
  width?: string;
  backgroundColor?: string;
}

export function InteractiveContainer({
  height = "100vh",
  width = "100%", 
  backgroundColor = "transparent"
}: InteractiveContainerProps) {
  const [csvData, setCsvData] = useState<string>('');
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // First try to load pre-built data for faster initial render
        const [csvResponse, jsonResponse] = await Promise.all([
          fetch('./incidents-data.csv').catch(() => null),
          fetch('./incidents-data.json').catch(() => null)
        ]);

        if (csvResponse?.ok && jsonResponse?.ok) {
          const [csvText, jsonData] = await Promise.all([
            csvResponse.text(),
            jsonResponse.json()
          ]);
          
          setCsvData(csvText);
          setIncidents(jsonData);
          setLoading(false);
          console.log('✅ Loaded pre-built data with', jsonData.length, 'incidents');
          return;
        }

        // Fallback to fetching from the original CSV file
        console.log('📄 Falling back to original CSV file...');
        const response = await fetch('./Incident Database_ Gas Leak-Induced Fires and Explosions - Sheet1.csv');
        
        if (!response.ok) {
          throw new Error('Failed to fetch incident data');
        }
        
        const data = await response.text();
        setCsvData(data);
        setLoading(false);
        console.log('✅ Loaded fallback CSV data');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Inject structured data for SEO when incidents are loaded
  useEffect(() => {
    if (incidents.length > 0) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": "Gas Leak Incidents Database",
        "description": `Interactive database of ${incidents.length} gas leak-induced fires and explosions`,
        "temporalCoverage": "2024",
        "spatialCoverage": {
          "@type": "Place",
          "geo": {
            "@type": "GeoShape",
            "addressCountry": "IR"
          }
        },
        "keywords": ["gas leak", "explosion", "fire", "incident", "safety", "infrastructure"]
      };

      // Update structured data if not already present from build time
      const script = document.getElementById('incidents-structured-data');
      if (script && !script.textContent?.trim()) {
        script.textContent = JSON.stringify(structuredData);
      }
    }
  }, [incidents]);

  if (loading) {
    return (
      <div 
        className={styles.interactiveContainer}
        style={{
          backgroundColor,
          height,
          width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className={styles.loading}>Loading incident data...</div>
      </div>
    );
  }

  return (
    <div 
      className={styles.interactiveContainer}
      style={{
        backgroundColor,
        height,
        width
      }}
    >
      {csvData && <IncidentMap csvData={csvData} />}
    </div>
  );
}