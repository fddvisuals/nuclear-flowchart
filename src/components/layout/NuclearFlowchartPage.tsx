import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import SVGViewer from '../SVGViewer';
import StatusChartsSection from '../StatusChartsSection';
import DamageSummaryGrid from '../DamageSummaryGrid';
import StickyFilterPanel from '../StickyFilterPanel';
import StrikeImpactSummary from '../StrikeImpactSummary';
import InteractiveTutorial from '../InteractiveTutorial';
import { FilterType } from '../../data/nuclearData';
import { loadFacilityData, FacilityData } from '../../utils/csvLoader';
import { buildSystemSummary, SystemSummaryResult } from '../../utils/systemSummary';
import { IMPACT_CONFIGS } from '../../data/impactConfigs';

// Layout components
import { Navigation } from './Navigation';
import { Header } from './Header';
import { TextSection } from './TextSection';
import { FDDFooter } from './FDDFooter';

interface NuclearVisualizationProps {
  showLocations?: boolean;
  onToggleLocations?: () => void;
  facilityData: FacilityData[];
  systemSummary: SystemSummaryResult;
  activeImpactId: string | null;
  activeFilters?: FilterType[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

function NuclearVisualization({
  showLocations = true,
  onToggleLocations,
  facilityData,
  systemSummary,
  activeImpactId,
  activeFilters,
  isExpanded = false,
  onToggleExpand,
}: NuclearVisualizationProps) {
  const [manualHighlights, setManualHighlights] = useState<string[]>([]);
  const flowchartContainerRef = useRef<HTMLDivElement>(null);

  const focusedSystemIds = useMemo(() => {
    if (!activeImpactId) return [];
    const activeImpact = systemSummary.impactSummaryMap[activeImpactId];
    return activeImpact?.systemIds ?? [];
  }, [activeImpactId, systemSummary]);

  const focusedFacilityIds = useMemo(() => {
    if (focusedSystemIds.length === 0) {
      return [];
    }

    return systemSummary.groupedSystems
      .filter((system) => focusedSystemIds.includes(system.id))
      .flatMap((system) => system.locations.map((location) => location.facilityId))
      .filter(Boolean);
  }, [focusedSystemIds, systemSummary]);

  const highlightedItems = useMemo(() => {
    const merged = new Set<string>(manualHighlights);
    focusedFacilityIds.forEach((id) => merged.add(id));
    return Array.from(merged);
  }, [manualHighlights, focusedFacilityIds]);

  const handleItemClick = useCallback(
    (itemId: string) => {
      const clickedFacility = facilityData.find((facility) => facility.Item_Id === itemId);
      if (!clickedFacility) {
        return;
      }

      const relatedIds = facilityData
        .filter(
          (facility) =>
            facility['Sub-Category'] === clickedFacility['Sub-Category'] &&
            facility['Main-Category'] === clickedFacility['Main-Category']
        )
        .map((facility) => facility.Item_Id)
        .filter(Boolean) as string[];

      setManualHighlights((prev) => {
        const shouldRemove = relatedIds.every((id) => prev.includes(id));
        if (shouldRemove) {
          return prev.filter((id) => !relatedIds.includes(id));
        }

        const merged = new Set(prev);
        relatedIds.forEach((id) => merged.add(id));
        return Array.from(merged);
      });
    },
    [facilityData]
  );

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className={`${isExpanded ? 'fixed inset-4 z-[1001] flex flex-col' : 'p-6'}`}>
        <div className={`flex items-center justify-between ${isExpanded ? 'p-6 border-b' : 'mb-6'}`}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Interactive Supply Chain Flowchart</h2>
            <p className="text-sm text-gray-600 mt-1">
              Explore the nuclear program's supply chain. Click nodes to highlight related facilities, or use filters to focus on specific categories and statuses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onToggleLocations && (
              <button
                onClick={onToggleLocations}
                className="px-4 py-2 flex items-center gap-2 rounded-lg transition-colors whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
                title={showLocations ? 'Hide Locations (Collapsed View)' : 'Show Locations (Detailed View)'}
              >
                {showLocations ? 'Hide Locations' : 'Show Locations'}
              </button>
            )}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="px-4 py-2 flex items-center gap-2 rounded-lg transition-colors whitespace-nowrap bg-blue-100 text-blue-700 hover:bg-blue-200"
                title={isExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-4 h-4 flex-shrink-0" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 flex-shrink-0" />
                    Fullscreen
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div 
          ref={flowchartContainerRef}
          className={`relative bg-white border border-gray-100 rounded-xl overflow-hidden ${isExpanded ? 'flex-1 m-6 mt-0' : ''}`}
          style={{ height: isExpanded ? 'auto' : '2000px' }}
        >
          <SVGViewer
            activeFilters={activeFilters ?? ['all']}
            highlightedItems={highlightedItems}
            focusedFacilityIds={focusedFacilityIds}
            onItemClick={handleItemClick}
            showLocations={showLocations}
          />
        </div>
      </div>
    </section>
  );
}

export function NuclearFlowchartPage() {
  const [facilityData, setFacilityData] = useState<FacilityData[]>([]);
  const [showLocations, setShowLocations] = useState(true);
  const [activeImpactId, setActiveImpactId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['all']);
  const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Load facility data
  useEffect(() => {
    loadFacilityData().then(data => {
      setFacilityData(data);
    });
  }, []);

  // Check if user has completed tutorial
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('nuclearFlowchartTutorialCompleted');
    if (!tutorialCompleted) {
      // Show tutorial after a short delay to let the page load
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const systemSummary = useMemo(() => buildSystemSummary(facilityData, IMPACT_CONFIGS), [facilityData]);

  const toggleLocations = () => {
    setShowLocations(!showLocations);
  };

  const toggleVisualizationExpand = () => {
    setIsVisualizationExpanded(!isVisualizationExpanded);
  };

  const handleFiltersChange = useCallback((filters: FilterType[]) => {
    setActiveFilters(filters);
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleRestartTutorial = () => {
    setShowTutorial(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {showTutorial && <InteractiveTutorial onComplete={handleTutorialComplete} />}
      
      <Navigation onHelpClick={handleRestartTutorial} />
      <StickyFilterPanel 
        activeFilters={activeFilters}
        onFiltersChange={handleFiltersChange}
        targetSectionIds={['waffle-chart-section', 'visualization-section']}
      />
      <div className="flex flex-col items-center justify-center pt-20">
        <Header />
      </div>
      <TextSection />
      <div id="strike-impact-summary">
        <StrikeImpactSummary />
      </div>
      
      {/* Status Charts Section - Between text and visualization */}
      {!isVisualizationExpanded && (
        <>
          <div id="waffle-chart-section">
            <StatusChartsSection 
              facilityData={facilityData}
              externalFilters={activeFilters}
            />
          </div>
          <div id="damage-grid-section">
            <DamageSummaryGrid
              facilityData={facilityData}
              activeImpactId={activeImpactId}
              onImpactSelect={setActiveImpactId}
              systemSummary={systemSummary}
              showImpactSection={false}
              showSystemGrid={true}
              showCapabilitiesSection={false}
              externalFilters={activeFilters}
            />
          </div>
        </>
      )}
      
      {/* Interactive Visualization Section */}
      <div id="visualization-section">
        <NuclearVisualization 
          showLocations={showLocations}
          onToggleLocations={toggleLocations}
          facilityData={facilityData}
          systemSummary={systemSummary}
          activeImpactId={activeImpactId}
          activeFilters={activeFilters}
          isExpanded={isVisualizationExpanded}
          onToggleExpand={toggleVisualizationExpand}
        />
      </div>

      {!isVisualizationExpanded && <FDDFooter />}
    </div>
  );
}