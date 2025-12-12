import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import SVGViewer from '../SVGViewer';
import StatusChartsSection from '../StatusChartsSection';
import DamageSummaryGrid from '../DamageSummaryGrid';
import StickyFilterPanel from '../StickyFilterPanel';
import MobileFilterDrawer from '../MobileFilterDrawer';
import InteractiveTutorial from '../InteractiveTutorial';
import { InfoTooltip } from '../InfoTooltip';
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className={`${isExpanded ? 'fixed top-[140px] left-4 right-4 bottom-4 z-[990] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200' : ''}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isExpanded ? 'p-4 sm:p-6 border-b' : 'mb-4 sm:mb-6'}`}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">Supply Chain Flowchart</h2>
              <InfoTooltip text="Thanks to 12 days of strikes by Israel and the United States, Iran's ability to build a nuclear weapon has been degraded. To create a bomb, it is necessary to follow precise steps, from mining uranium to enriching it to then building the bomb itself. The flowchart below demonstrates the step-by-step, facility-by-facility challenges Iran now faces to building weapon." />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Navigate the nuclear supply-chain flowchart to see what parts of the Iran nuclear program still functional and what parts aren’t 
— and how they fit together. Zoom with the scroll wheel, pan by dragging, and click the expand button for fullscreen mode.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {onToggleLocations && (
              <button
                onClick={onToggleLocations}
                className="px-3 sm:px-4 py-2 flex items-center gap-2 rounded-lg transition-colors whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                title={showLocations ? 'Hide Locations (Collapsed View)' : 'Show Locations (Detailed View)'}
              >
                {showLocations ? 'Hide Locations' : 'Show Locations'}
              </button>
            )}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="hidden sm:flex px-4 py-2 items-center gap-2 rounded-lg transition-colors whitespace-nowrap bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
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
          className={`relative bg-white border border-gray-100 rounded-xl overflow-hidden ${isExpanded ? 'flex-1 m-4 sm:m-6 mt-0' : ''}`}
          style={{ height: isExpanded ? 'auto' : 'min(2000px, 80vh)' }}
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
  const [activeMainView, setActiveMainView] = useState<'flowchart' | 'stack'>('stack');
  const [animateFlowchartTab, setAnimateFlowchartTab] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Animate flowchart tab once to draw attention
  useEffect(() => {
    const hasAnimated = sessionStorage.getItem('flowchartTabAnimated');
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        setAnimateFlowchartTab(true);
        sessionStorage.setItem('flowchartTabAnimated', 'true');
        setTimeout(() => setAnimateFlowchartTab(false), 2500); // Animate for 2.5 seconds
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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

  // Track scroll position to show/hide mobile filter button
  useEffect(() => {
    const handleScroll = () => {
      const waffleSection = document.getElementById('waffle-chart-section');
      if (waffleSection) {
        const rect = waffleSection.getBoundingClientRect();
        const navHeight = 60; // Mobile nav height
        setShowMobileFilters(rect.top < navHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
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

  useEffect(() => {
    if (activeMainView !== 'flowchart' && isVisualizationExpanded) {
      setIsVisualizationExpanded(false);
    }
  }, [activeMainView, isVisualizationExpanded]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    // Reset to stack view and scroll to top
    setActiveMainView('stack');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Trigger flowchart tab animation after tutorial
    setTimeout(() => {
      setAnimateFlowchartTab(true);
      setTimeout(() => setAnimateFlowchartTab(false), 2500);
    }, 500);
  };

  const handleRestartTutorial = () => {
    setShowTutorial(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {showTutorial && <InteractiveTutorial onComplete={handleTutorialComplete} onViewChange={setActiveMainView} />}

      <Navigation onHelpClick={handleRestartTutorial} />
      
      {/* Desktop sticky filter panel */}
      <StickyFilterPanel
        activeFilters={activeFilters}
        onFiltersChange={handleFiltersChange}
        targetSectionIds={['waffle-chart-section', 'primary-view-section']}
        forceVisible={isVisualizationExpanded}
      />
      
      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        activeFilters={activeFilters}
        onFiltersChange={handleFiltersChange}
        isVisible={showMobileFilters && !isVisualizationExpanded}
      />
      
      <div className="flex flex-col items-center justify-center">
        <Header />
      </div>
      <TextSection />
      {/* View tabs section */}
      {!isVisualizationExpanded && (
        <>
          <div id="view-tabs-container" className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6 flex flex-col items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Two Ways to Understand the Destruction Caused by the Strikes</h3>
            <div
              role="tablist"
              aria-label="Primary visualization view"
              className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 sm:p-1.5"
            >
              {[
                {
                  id: 'stack',
                  label: 'List',
                  shortLabel: 'Stack',
                  description: 'Status of Iran\'s Nuclear Facilities',
                  shortDescription: 'Damage Summary',
                },
                {
                  id: 'flowchart',
                  label: 'Flowchart View',
                  shortLabel: 'Flowchart',
                  description: 'Supply Chain Flowchart',
                  shortDescription: 'Supply Chain',
                },
              ].map((tab) => {
                const isActive = activeMainView === tab.id;
                const isFlowchart = tab.id === 'flowchart';
                const shouldAnimate = isFlowchart && animateFlowchartTab;

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`px-4 sm:px-10 py-2.5 sm:py-4 text-sm sm:text-lg font-semibold rounded-full transition-all duration-500 whitespace-nowrap ${isActive
                        ? 'bg-white text-blue-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      } ${shouldAnimate ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 animate-pulse' : ''}`}
                    onClick={() => setActiveMainView(tab.id as 'flowchart' | 'stack')}
                  >
                    <span className="block leading-tight sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:block leading-tight">{tab.label}</span>
                    <span className="block text-[10px] sm:text-sm font-normal text-slate-500 mt-0.5 sm:mt-1">
                      <span className="sm:hidden">{tab.shortDescription}</span>
                      <span className="hidden sm:inline">{tab.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Primary View Section */}
      <div id="primary-view-section">
        {activeMainView === 'stack' && !isVisualizationExpanded && (
          <div id="damage-grid-section">
            <DamageSummaryGrid
              facilityData={facilityData}
              activeImpactId={activeImpactId}
              onImpactSelect={setActiveImpactId}
              systemSummary={systemSummary}
              showImpactSection={false}
              showSystemGrid={true}
              externalFilters={activeFilters}
            />
          </div>
        )}

        {activeMainView === 'flowchart' && (
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
        )}
      </div>

      {/* Status Charts Section - Facility Status */}
      {!isVisualizationExpanded && (
        <div id="waffle-chart-section">
          <StatusChartsSection
            facilityData={facilityData}
            externalFilters={activeFilters}
          />
        </div>
      )}

      {/* Data attribution note and credits */}
      {!isVisualizationExpanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Download Infographic Section */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Download Infographic</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={`${import.meta.env.BASE_URL}images/fdd-infographic-post-strike-assessment-landscape.png`}
                download="fdd-infographic-post-strike-assessment-landscape.png"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00558c] hover:bg-[#004778] text-white font-semibold rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Landscape
              </a>
              <a
                href={`${import.meta.env.BASE_URL}images/fdd-infographic-post-strike-assessment-portrait.png`}
                download="fdd-infographic-post-strike-assessment-portrait.png"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00558c] hover:bg-[#004778] text-white font-semibold rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Portrait
              </a>
            </div>
          </div>

          <p className="text-sm italic text-gray-500 mb-4 text-center">Data collected through December 2025</p>
          <div className="w-[150px] h-px bg-gray-300 mx-auto mb-6" />
          <div className="flex flex-col md:flex-row justify-center gap-6">
            {/* Contributors - Left side */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex-1 max-w-md">
              <p className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-200 pb-3">Research Contributors</p>
              <div className="space-y-3 text-gray-600">
                <p><span className="font-semibold text-gray-800">David Albright</span><br /><span className="text-sm">Institute for Science and International Security</span></p>
                <p><span className="font-semibold text-gray-800">Sarah Burkhard</span><br /><span className="text-sm">Institute for Science and International Security</span></p>
                <p><span className="font-semibold text-gray-800">Olli Heinonen</span><br /><span className="text-sm">Stimson Center</span></p>
                <p><span className="font-semibold text-gray-800">Andrea Stricker</span><br /><span className="text-sm">Foundation for Defense of Democracies</span></p>
              </div>
            </div>
            {/* FDD Visuals - Right side */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex-1 max-w-md">
              <p className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-200 pb-3">FDD Visuals</p>
              <div className="space-y-3 text-gray-600">
                <p>Concept and Development by <span className="font-semibold text-gray-800">Pavak Patel</span></p>
                <p>Edited by <span className="font-semibold text-gray-800">Jason Fields</span></p>
                <p>Creative Direction by <span className="font-semibold text-gray-800">Daniel Ackerman</span></p>
                <p>Design by <span className="font-semibold text-gray-800">Bella Besuud</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isVisualizationExpanded && <FDDFooter />}
      
      {/* Bottom padding for mobile filter button */}
      <div className="h-20 md:hidden" />
    </div>
  );
}