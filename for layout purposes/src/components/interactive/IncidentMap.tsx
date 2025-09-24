import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Search, MapPin, Calendar, Map, List, Plus, Minus, RotateCcw } from 'lucide-react';
import { IncidentData, parseCsvData } from '../../lib/utils/csvParser';
import { IncidentModal } from './IncidentModal';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../../styles/components/IncidentMap.module.css';

// Mapbox access token is now loaded from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface IncidentMapProps {
  csvData: string;
}

export function IncidentMap({ csvData }: IncidentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(null);
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    const parsed = parseCsvData(csvData);
    setIncidents(parsed);
    setFilteredIncidents(parsed);
  }, [csvData]);

  useEffect(() => {
    if (!mapContainer.current || !incidents.length) return;

    // Set your Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/fddvisuals/cme72np9701th01s2ghowc6j6',
      // style: 'mapbox://styles/fddvisuals/cmcksowr5006u01p683cmcbc2',
      center: [51.3890, 35.6892], // Tehran coordinates
      zoom: 6
    });

    map.current.on('load', () => {
      // Calculate bounding box to fit all incidents
      if (incidents.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        incidents.forEach(incident => {
          if (incident.longitude && incident.latitude) {
            bounds.extend([incident.longitude, incident.latitude]);
          }
        });
        
        // Fit map to show all incidents with padding
        map.current?.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 10
        });
      }
      // Add incidents as a data source
      map.current?.addSource('incidents', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: incidents.map(incident => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [incident.longitude!, incident.latitude!]
            },
            properties: {
              ...incident,
              id: incident.IncidentID
            }
          }))
        }
      });

      // Add incidents layer
      map.current?.addLayer({
        id: 'incidents',
        type: 'circle',
        source: 'incidents',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'primaryCategory'], 'Explosion'], 12,
            ['==', ['get', 'primaryCategory'], 'Fire'], 10,
            8
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'primaryCategory'], 'Explosion'], '#ef4444',
            ['==', ['get', 'primaryCategory'], 'Fire'], '#f97316',
            ['==', ['get', 'primaryCategory'], 'Visible Smoke'], '#6b7280',
            '#3b82f6'
          ],
          'circle-opacity': 0.7
        }
      });

      // Add click event
      map.current?.on('click', 'incidents', (e) => {
        if (e.features && e.features[0]) {
          const properties = e.features[0].properties;
          const incident = incidents.find(i => i.IncidentID === properties?.id);
          if (incident) {
            setSelectedIncident(incident);
          }
        }
      });

      // Change cursor on hover
      map.current?.on('mouseenter', 'incidents', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current?.on('mouseleave', 'incidents', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    // Handle responsive resize
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.current?.remove();
    };
  }, [incidents]);

  // Filter incidents based on search and filters
  useEffect(() => {
    let filtered = incidents;

    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.City.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.NeighborhoodSite.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.evidence.some((evidence: any) => 
          evidence.TranslatedCaption.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(incident => 
        incident.Categories.includes(selectedCategory)
      );
    }

    if (selectedProvince) {
      filtered = filtered.filter(incident => incident.Province === selectedProvince);
    }

    setFilteredIncidents(filtered);

    // Update map data
    if (map.current?.getSource('incidents')) {
      (map.current.getSource('incidents') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: filtered.map(incident => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [incident.longitude!, incident.latitude!]
          },
          properties: {
            ...incident,
            id: incident.IncidentID
          }
        }))
      });
    }
  }, [searchTerm, selectedCategory, selectedProvince, incidents]);

  const categories = [...new Set(incidents.flatMap(i => i.Categories))];
  const provinces = [...new Set(incidents.map(i => i.Province))];

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleResetMap = () => {
    if (map.current && incidents.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      incidents.forEach(incident => {
        if (incident.longitude && incident.latitude) {
          bounds.extend([incident.longitude, incident.latitude]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 10
      });
    }
  };

  const handleIncidentClick = (incident: IncidentData) => {
    setSelectedIncident(incident);
  };

  const handleLocateIncident = (incident: IncidentData, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the incident click
    if (map.current && incident.latitude && incident.longitude) {
      setActiveView('map'); // Switch to map view
      map.current.flyTo({
        center: [incident.longitude, incident.latitude],
        zoom: 12
      });
    }
  };

  // Handle map resize when switching to map view
  useEffect(() => {
    if (activeView === 'map' && map.current) {
      // Small delay to ensure the map container is visible
      setTimeout(() => {
        map.current?.resize();
      }, 100);
    }
  }, [activeView]);

  return (
    <div className={styles.container}>
      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeView === 'map' ? styles.active : ''}`}
            onClick={() => setActiveView('map')}
          >
            <Map size={16} />
            Map View
          </button>
          <button
            className={`${styles.tab} ${activeView === 'list' ? styles.active : ''}`}
            onClick={() => setActiveView('list')}
          >
            <List size={16} />
            List View
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filters}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Provinces</option>
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.incidentCount}>
        {filteredIncidents.length} incidents found
      </div>

      <div className={`${styles.mapSection} ${activeView === 'list' ? styles.hidden : ''}`}>
        {incidents.length > 0 ? (
          <>
            <div ref={mapContainer} className={styles.map} />
            <div className={styles.mapControls}>
              <button
                className={styles.mapControlButton}
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <Plus size={20} />
              </button>
              <button
                className={styles.mapControlButton}
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <Minus size={20} />
              </button>
              <button
                className={styles.mapControlButton}
                onClick={handleResetMap}
                title="Reset Map View"
              >
                <RotateCcw size={20} />
              </button>
            </div>
            <div className={styles.mapLegend}>
              <div className={styles.legendTitle}>Incident Types</div>
              <div className={styles.legendItems}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.explosion}`}></div>
                  <span className={styles.legendLabel}>Explosion</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.fire}`}></div>
                  <span className={styles.legendLabel}>Fire</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.smoke}`}></div>
                  <span className={styles.legendLabel}>Visible Smoke</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.other}`}></div>
                  <span className={styles.legendLabel}>Other</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.mapPlaceholder}>
            <MapPin size={48} />
            <h3>Gas Leak Incidents Map</h3>
            <p>Loading incident locations...</p>
          </div>
        )}
      </div>

      <div className={`${styles.listSection} ${activeView === 'map' ? styles.hidden : ''}`}>
        <div className={styles.incidentList} itemScope itemType="https://schema.org/Dataset">
          <meta itemProp="name" content="Gas Leak Incidents Database" />
          <meta itemProp="description" content={`Interactive database of ${filteredIncidents.length} gas leak-induced fires and explosions`} />
          <meta itemProp="temporalCoverage" content="2024-2025" />
          <meta itemProp="spatialCoverage" content="Iran" />
          <meta itemProp="keywords" content="gas leak, explosion, fire, incident, safety, infrastructure" />
          
          {filteredIncidents.map((incident) => (
            <article
              key={incident.IncidentID}
              className={styles.incidentCard}
              onClick={() => handleIncidentClick(incident)}
              itemScope
              itemType="https://schema.org/Event"
            >
              <div className={styles.incidentHeader}>
                <div className={styles.categoryBadges}>
                  {incident.Categories.map((category: string, index: number) => (
                    <span 
                      key={index}
                      className={`${styles.categoryBadge} ${styles[category.toLowerCase().replace(/\s+/g, '')]}`}
                      itemProp="keywords"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <span className={styles.date}>
                  <Calendar size={14} />
                  <time itemProp="startDate" dateTime={incident.earliestDate}>
                    {incident.earliestDate}
                  </time>
                </span>
              </div>
              
              <h4 className={styles.incidentTitle} itemProp="name">{incident.Description}</h4>
              
              <div className={styles.location} itemProp="location" itemScope itemType="https://schema.org/Place">
                <MapPin size={14} />
                <span itemProp="name">
                  {incident.NeighborhoodSite && `${incident.NeighborhoodSite}, `}
                  {incident.City}, {incident.Province}
                </span>
                <meta itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates" />
                <meta itemProp="latitude" content={incident.latitude?.toString()} />
                <meta itemProp="longitude" content={incident.longitude?.toString()} />
              </div>
              
              <p className={styles.caption} itemProp="description">
                {incident.evidence[0]?.TranslatedCaption?.substring(0, 150) || ''}
                {(incident.evidence[0]?.TranslatedCaption?.length || 0) > 150 ? '...' : ''}
              </p>
              
              <div className={styles.incidentActions}>
                <div className={styles.source}>
                  <span>{incident.evidenceCount} evidence piece{incident.evidenceCount !== 1 ? 's' : ''}</span>
                  {incident.evidence[0]?.SourceName && (
                    <span>Primary source: {incident.evidence[0].SourceName}</span>
                  )}
                </div>
                <button
                  className={styles.locateButton}
                  onClick={(event) => handleLocateIncident(incident, event)}
                  title="Locate on map"
                >
                  <MapPin size={16} />
                  Locate
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <IncidentModal 
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        incident={selectedIncident}
      />
    </div>
  );
}
