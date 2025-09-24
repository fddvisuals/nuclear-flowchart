import { useState, useCallback } from 'react';
import { Map, List, Search, Filter, Maximize2 } from 'lucide-react';
import SVGViewer from '../SVGViewer';
import StackView from '../StackView';
import FilterPanel from '../FilterPanel';
import StatusBarChart from '../StatusBarChart';
import { FilterType } from '../../data/nuclearData';

// Layout components
import { Navigation } from './Navigation';
import { Header } from './Header';
import { TextSection } from './TextSection';
import { FDDFooter } from './FDDFooter';

type ViewMode = 'flowchart' | 'stack';

interface NuclearVisualizationProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

function NuclearVisualization({ isExpanded = false, onToggleExpand }: NuclearVisualizationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('flowchart');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['all']);
  const [highlightedItems, setHighlightedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>(['fuel-production', 'fuel-weaponization']);
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleItemClick = useCallback((itemId: string) => {
    setHighlightedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleToggleExpand = useCallback((itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleFiltersChange = useCallback((filters: FilterType[]) => {
    setActiveFilters(filters);
  }, []);

  const clearHighlights = () => {
    setHighlightedItems([]);
  };

  return (
    <div className={`bg-gray-100 ${isExpanded ? 'fixed inset-0 z-50' : 'rounded-xl border shadow-lg'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('flowchart')}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors whitespace-nowrap min-h-[2.5rem] ${
                    viewMode === 'flowchart'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Map className="w-4 h-4 flex-shrink-0" />
                  Flowchart
                </button>
                <button
                  onClick={() => setViewMode('stack')}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors border-l whitespace-nowrap min-h-[2.5rem] ${
                    viewMode === 'stack'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4 flex-shrink-0" />
                  Stack View
                </button>
              </div>
              <button
                onClick={clearHighlights}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors whitespace-nowrap min-h-[2.5rem] flex items-center justify-center"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-colors whitespace-nowrap min-h-[2.5rem] ${
                  showFilters
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 flex-shrink-0" />
                Filters
              </button>
              {onToggleExpand && (
                <button
                  onClick={onToggleExpand}
                  className="px-4 py-2 flex items-center gap-2 rounded-lg transition-colors whitespace-nowrap min-h-[2.5rem] bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <Maximize2 className="w-4 h-4 flex-shrink-0" />
                  {isExpanded ? 'Minimize' : 'Expand'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex overflow-hidden ${isExpanded ? 'h-screen' : 'h-96'}`} style={{ height: isExpanded ? 'calc(100vh - 80px)' : '600px' }}>
        {/* Sidebar */}
        {showFilters && (
          <aside className="w-80 bg-white border-r overflow-y-auto shadow-lg z-10" style={{ minWidth: '320px' }}>
            <div className="p-6">
              <FilterPanel
                activeFilters={activeFilters}
                onFiltersChange={handleFiltersChange}
              />

              {/* Status Bar Chart */}
              <div className="mt-6">
                <StatusBarChart
                  statusCounts={[
                    { status: 'destroyed', count: 25, color: '#FFC7C2', displayName: 'Destroyed' },
                    { status: 'unknown', count: 11, color: '#DCDCDC', displayName: 'Unknown' },
                    { status: 'operational', count: 5, color: '#9FE2AA', displayName: 'Operational' },
                    { status: 'likely-destroyed', count: 3, color: '#FFE0C2', displayName: 'Likely Destroyed' },
                    { status: 'construction', count: 1, color: '#DCCCFF', displayName: 'Under Construction' }
                  ]}
                  totalCount={45}
                />
              </div>

              {/* Status Legend */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" style={{ backgroundColor: '#00558C' }}></div>
                    <span className="text-sm text-gray-700">Operational</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" style={{ backgroundColor: '#1E1E1E' }}></div>
                    <span className="text-sm text-gray-700">Destroyed/Unknown</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Instructions</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Click items to highlight them</li>
                  <li>• Use filters to focus on specific categories</li>
                  <li>• Switch between flowchart and stack views</li>
                  {viewMode === 'flowchart' && (
                    <>
                      <li>• Mouse wheel to zoom in/out</li>
                      <li>• Hover for magnifying glass view</li>
                    </>
                  )}
                  {viewMode === 'stack' && (
                    <li>• Click arrows to expand/collapse sections</li>
                  )}
                </ul>
              </div>
            </div>
          </aside>
        )}

        {/* Main View */}
        <main className="flex-1 relative" style={{ minWidth: '0' }}>
          {viewMode === 'flowchart' ? (
            <SVGViewer
              activeFilters={activeFilters}
              highlightedItems={highlightedItems}
              onItemClick={handleItemClick}
            />
          ) : (
            <StackView
              activeFilters={activeFilters}
              highlightedItems={highlightedItems}
              onItemClick={handleItemClick}
              expandedItems={expandedItems}
              onToggleExpand={handleToggleExpand}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export function NuclearFlowchartPage() {
  const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);

  const toggleVisualizationExpand = () => {
    setIsVisualizationExpanded(!isVisualizationExpanded);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Header />
      <TextSection />
      
      {/* Interactive Visualization Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <NuclearVisualization 
          isExpanded={isVisualizationExpanded}
          onToggleExpand={toggleVisualizationExpand}
        />
      </div>

      <FDDFooter />

      {/* Expanded Visualization Overlay */}
      {isVisualizationExpanded && (
        <NuclearVisualization 
          isExpanded={true}
          onToggleExpand={toggleVisualizationExpand}
        />
      )}
    </div>
  );
}