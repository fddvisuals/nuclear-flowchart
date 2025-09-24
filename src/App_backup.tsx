import React, { useState, useCallback } from 'react';
import { Map, List, Search, Filter } from 'lucide-react';
import SVGViewer from './components/SVGViewer';
import StackView from './components/StackView';
import FilterPanel from './components/FilterPanel';
import { FilterType } from './data/nuclearData';

type ViewMode = 'flowchart' | 'stack';

function App() {
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

  const toggleView = () => {
    setViewMode(prev => prev === 'flowchart' ? 'stack' : 'flowchart');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Post-Strike Assessment: Israeli and U.S. Strikes Caused Major Bottlenecks in Iran’s Nuclear Weapons Supply Chain
            </h1>
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
                  className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                    viewMode === 'flowchart'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Flowchart
                </button>
                <button
                  onClick={() => setViewMode('stack')}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors border-l ${
                    viewMode === 'stack'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Stack View
                </button>
              </div>
              <button
                onClick={clearHighlights}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showFilters && (
          <aside className="w-80 bg-white border-r overflow-y-auto shadow-lg z-10" style={{ minWidth: '320px' }}>
            <div className="p-6">
              <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-sm">
                Debug: Filters panel visible (showFilters: {String(showFilters)})
              </div>
              <FilterPanel
                activeFilters={activeFilters}
                onFiltersChange={handleFiltersChange}
              />

              {/* Status Legend */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00558C' }}></div>
                    <span className="text-xs text-gray-700">Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1E1E1E' }}></div>
                    <span className="text-xs text-gray-700">Destroyed/Unknown</span>
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
                      <li>• Click and drag to pan around</li>
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

      {/* Status Bar */}
      <footer className="bg-white border-t px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>View: {viewMode === 'flowchart' ? 'Flowchart' : 'Stack View'}</span>
            <span>Filters: {activeFilters.includes('all') ? 'All' : activeFilters.join(', ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Iran Nuclear Manufacturing Analysis</span>
            <span>•</span>
            <span>Interactive Visualization</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;