import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilterType } from '../data/nuclearData';
import { loadFacilityData, FacilityData, getFacilityById } from '../utils/csvLoader';
import { Map } from 'lucide-react';

interface SVGViewerProps {
  activeFilters: FilterType[];
  highlightedItems: string[];
  onItemClick: (itemId: string) => void;
  showLocations?: boolean;
  focusedFacilityIds?: string[];
}

// Mini-map component
interface MiniMapProps {
  svgContent: string;
  transform: { x: number; y: number; scale: number };
  containerWidth: number;
  containerHeight: number;
  svgWidth: number;
  svgHeight: number;
  onNavigate: (x: number, y: number) => void;
}

const MiniMap: React.FC<MiniMapProps> = ({
  svgContent,
  transform,
  containerWidth,
  containerHeight,
  svgWidth,
  svgHeight,
  onNavigate,
}) => {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Mini-map dimensions - fit entire SVG within constraints
  const maxMiniMapWidth = 140;
  const maxMiniMapHeight = 250;
  
  // Calculate scale to fit entire SVG within max dimensions
  const scaleByWidth = maxMiniMapWidth / svgWidth;
  const scaleByHeight = maxMiniMapHeight / svgHeight;
  const miniMapScale = Math.min(scaleByWidth, scaleByHeight);
  
  // Actual dimensions based on the scale
  const miniMapWidth = svgWidth * miniMapScale;
  const miniMapHeight = svgHeight * miniMapScale;
  
  // Calculate viewport rectangle in mini-map coordinates
  const viewportWidth = (containerWidth / transform.scale) * miniMapScale;
  const viewportHeight = (containerHeight / transform.scale) * miniMapScale;
  const viewportX = (-transform.x / transform.scale) * miniMapScale;
  const viewportY = (-transform.y / transform.scale) * miniMapScale;
  
  const handleMiniMapClick = useCallback((e: React.MouseEvent) => {
    if (!miniMapRef.current) return;
    
    const rect = miniMapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert click position to SVG coordinates
    const svgX = clickX / miniMapScale;
    const svgY = clickY / miniMapScale;
    
    // Calculate new transform to center the clicked position
    const newX = -(svgX * transform.scale) + containerWidth / 2;
    const newY = -(svgY * transform.scale) + containerHeight / 2;
    
    onNavigate(newX, newY);
  }, [miniMapScale, transform.scale, containerWidth, containerHeight, onNavigate]);

  const handleMiniMapDrag = useCallback((e: React.MouseEvent) => {
    if (e.buttons !== 1) return; // Only handle left mouse button
    handleMiniMapClick(e);
  }, [handleMiniMapClick]);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center z-10"
        title="Show mini-map"
      >
        <Map className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-10">
      <div className="flex items-center justify-between px-2 py-1 bg-gray-50 border-b border-gray-200">
        <span className="text-[10px] sm:text-xs font-medium text-gray-600">Mini-map</span>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 text-xs leading-none"
          title="Hide mini-map"
        >
          ✕
        </button>
      </div>
      <div
        ref={miniMapRef}
        className="relative cursor-crosshair overflow-hidden"
        style={{ width: miniMapWidth, height: miniMapHeight }}
        onClick={handleMiniMapClick}
        onMouseMove={handleMiniMapDrag}
      >
        {/* SVG thumbnail */}
        <div
          className="absolute opacity-70 pointer-events-none"
          style={{
            width: svgWidth,
            height: svgHeight,
            transform: `scale(${miniMapScale})`,
            transformOrigin: '0 0',
            left: 0,
            top: 0,
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        
        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
          style={{
            left: Math.max(0, viewportX),
            top: Math.max(0, viewportY),
            width: Math.min(viewportWidth, miniMapWidth - Math.max(0, viewportX)),
            height: Math.min(viewportHeight, miniMapHeight - Math.max(0, viewportY)),
          }}
        />
      </div>
    </div>
  );
};

const SVGViewer: React.FC<SVGViewerProps> = ({
  activeFilters,
  highlightedItems,
  onItemClick,
  showLocations = true,
  focusedFacilityIds = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [facilityData, setFacilityData] = useState<FacilityData[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, transformX: 0, transformY: 0 });
  const [svgDimensions, setSvgDimensions] = useState({ width: 2247, height: 5174 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Handle mini-map navigation
  const handleMiniMapNavigate = useCallback((x: number, y: number) => {
    setTransform(prev => ({ ...prev, x, y }));
  }, []);

  // Track container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateContainerDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    
    updateContainerDimensions();
    
    const resizeObserver = new ResizeObserver(updateContainerDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Load CSV data
  useEffect(() => {
    loadFacilityData().then(data => {
      setFacilityData(data);
    });
  }, []);

  // Add click handlers to SVG elements
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const handleElementClick = (event: Event) => {
      const target = event.target as SVGElement;
      const shapeId = target.getAttribute('id');

      if (shapeId && facilityData.length > 0) {
        const facility = getFacilityById(shapeId, facilityData);
        if (facility) {
          onItemClick(facility.Item_Id);
        }
      }
    };

    // Add click handlers to all interactive elements
    const elements = svgElement.querySelectorAll('rect, circle, ellipse');
    elements.forEach((element) => {
      const el = element as SVGElement;
      el.addEventListener('click', handleElementClick);
      el.style.cursor = 'pointer';
    });

    // Cleanup function
    return () => {
      elements.forEach((element) => {
        element.removeEventListener('click', handleElementClick);
      });
    };
  }, [svgContent, facilityData, onItemClick]);

  // Load SVG file
  useEffect(() => {
    const svgFile = showLocations ? 'main-new.svg' : 'main-withgroupings-collapsed.svg';
    fetch(`${import.meta.env.BASE_URL}${svgFile}`)
      .then(response => response.text())
      .then(text => {
        // Replace all instances of font-family="Inter" with font-family="urw-din" or "URW DIN"
        const updatedText = text.replace(/font-family="Inter"/g, 'font-family="urw-din"')
          .replace(/font-family="URW DIN"/g, 'font-family="urw-din"');
        setSvgContent(updatedText);
      })
      .catch(error => console.error('Error loading SVG:', error));
  }, [showLocations]);

  // Helper function to determine element category from SVG group hierarchy
  const getElementCategory = (element: SVGElement): 'FP' | 'FW' | null => {
    let currentElement: Element | null = element;

    // Traverse up the DOM tree to find the main category group
    while (currentElement) {
      const id = currentElement.getAttribute('id');
      if (id === 'fp-fuelproduction-blue') {
        return 'FP';
      }
      if (id === 'fw-fuelweaponization-black') {
        return 'FW';
      }
      currentElement = currentElement.parentElement;
    }

    return null;
  };

  // Helper function to determine element status from SVG group hierarchy
  const getElementStatus = (element: SVGElement): string | null => {
    let currentElement: Element | null = element;

    // Traverse up the DOM tree to find the status group
    while (currentElement) {
      const id = currentElement.getAttribute('id');
      if (!id) {
        currentElement = currentElement.parentElement;
        continue;
      }

      // Check for status groups (with or without numeric suffixes)
      if (id === 'operational' || id.startsWith('operational_')) {
        return 'operational';
      }
      if (id === 'destroyed' || id.startsWith('destroyed_')) {
        return 'destroyed';
      }
      if (id === 'unknown' || id.startsWith('unknown_')) {
        return 'unknown';
      }
      if (id === 'under-construction' || id === 'construction' || id.startsWith('construction_') || id.startsWith('under-construction_')) {
        return 'construction';
      }
      if (id === 'likely-destroyed' || id.startsWith('likely-destroyed_')) {
        return 'likely-destroyed';
      }
      currentElement = currentElement.parentElement;
    }

    return null;
  };

  // Helper function to get the main text box element for a mainXX-fp/fw group
  const getMainTextBox = (element: SVGElement): SVGElement | null => {
    let currentElement: Element | null = element;

    // Traverse up to find the mainXX-fp or mainXX-fw group
    while (currentElement) {
      const id = currentElement.getAttribute('id');
      if (id && (id.match(/^main\d+-fp$/) || id.match(/^main\d+-fw$/))) {
        // Found the main group, now find its first direct child group (the text box group)
        const mainGroup = currentElement as SVGElement;
        const children = Array.from(mainGroup.children);

        // Find the first group that contains a rect (the text group)
        // It should be the first child that's not a status group or connector
        for (const child of children) {
          const childId = child.getAttribute('id');
          if (childId &&
            !childId.startsWith('operational') &&
            !childId.startsWith('destroyed') &&
            !childId.startsWith('unknown') &&
            !childId.startsWith('construction') &&
            !childId.startsWith('under-construction') &&
            !childId.startsWith('likely-destroyed') &&
            !childId.startsWith('Connector') &&
            !childId.startsWith('icon-container')) {
            // This should be the text group, find the rect inside it
            const rect = child.querySelector('rect');
            if (rect) {
              return rect as SVGElement;
            }
          }
        }
      }
      currentElement = currentElement.parentElement;
    }

    return null;
  };

  // Apply filtering and highlighting to SVG elements
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    const timer = setTimeout(() => {
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) {
        return;
      }

      // Get all interactive elements (rect elements that represent facilities)
      const allElements = svgElement.querySelectorAll('rect, circle, ellipse');

      // Track which main text boxes should be highlighted
      const mainTextBoxesToHighlight = new Set<SVGElement>();

      allElements.forEach((element) => {
        const el = element as SVGElement;
        const shapeId = el.getAttribute('id') || '';

        // Determine the category and status from the group hierarchy
        const category = getElementCategory(el);
        const status = getElementStatus(el);

        // Get facility data if available (for highlighting)
        const facility = getFacilityById(shapeId, facilityData);

        let shouldShow = false;

        if (activeFilters.includes('all')) {
          shouldShow = true;
        } else {
          // Apply category filters
          const hasCategoryFilter = activeFilters.includes('fuel-production') || activeFilters.includes('fuel-weaponization');
          const hasStatusFilter = activeFilters.some(filter =>
            ['operational', 'destroyed', 'construction', 'unknown', 'likely-destroyed'].includes(filter)
          );

          let categoryMatch = !hasCategoryFilter; // If no category filter, assume match
          let statusMatch = !hasStatusFilter; // If no status filter, assume match

          // Check category match
          if (hasCategoryFilter) {
            if (activeFilters.includes('fuel-production') && category === 'FP') {
              categoryMatch = true;
            }
            if (activeFilters.includes('fuel-weaponization') && category === 'FW') {
              categoryMatch = true;
            }
          }

          // Check status match (OR logic - match if ANY active status filter matches)
          if (hasStatusFilter) {
            statusMatch = false; // Reset to false, then check if any match
            if (activeFilters.includes('operational') && status === 'operational') {
              statusMatch = true;
            }
            if (activeFilters.includes('destroyed') && status === 'destroyed') {
              statusMatch = true;
            }
            if (activeFilters.includes('construction') && status === 'construction') {
              statusMatch = true;
            }
            if (activeFilters.includes('unknown') && status === 'unknown') {
              statusMatch = true;
            }
            if (activeFilters.includes('likely-destroyed') && status === 'likely-destroyed') {
              statusMatch = true;
            }
          }

          // Element should show if both category and status match
          shouldShow = categoryMatch && statusMatch;
        }

        const matchesFocus = focusedFacilityIds.length === 0
          ? true
          : Boolean(facility && focusedFacilityIds.includes(facility.Item_Id));

        shouldShow = shouldShow && matchesFocus;

        // If this element should be shown, also mark its main text box for highlighting
        if (shouldShow && status) {
          const mainTextBox = getMainTextBox(el);
          if (mainTextBox) {
            mainTextBoxesToHighlight.add(mainTextBox);
          }
        }

        // Apply opacity based on filter
        el.style.opacity = shouldShow ? '1' : '0.1';

        // Highlighting - use Item_Id for highlighting if facility data is available
        const isHighlighted = facility
          ? highlightedItems.includes(facility.Item_Id) || focusedFacilityIds.includes(facility.Item_Id)
          : false;

        if (isHighlighted) {
          el.style.stroke = '#FF6B35';
          el.style.strokeWidth = '3';
          el.style.filter = 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.8))';
        } else {
          el.style.stroke = '';
          el.style.strokeWidth = '';
          el.style.filter = '';
        }
      });

      // Apply full opacity to main text boxes that have matching status children
      mainTextBoxesToHighlight.forEach((textBox) => {
        textBox.style.opacity = '1';
      });

    }, 100);

    return () => clearTimeout(timer);
  }, [activeFilters, highlightedItems, focusedFacilityIds, facilityData, svgContent]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Start dragging (click handling is done via event listeners in useEffect)
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      transformX: transform.x,
      transformY: transform.y
    });
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setTransform(prev => ({
      ...prev,
      x: dragStart.transformX + deltaX,
      y: dragStart.transformY + deltaY
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX,
        y: touch.clientY,
        transformX: transform.x,
        transformY: transform.y
      });
    }
  }, [transform]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    setTransform(prev => ({
      ...prev,
      x: dragStart.transformX + deltaX,
      y: dragStart.transformY + deltaY
    }));
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, transform.scale * scaleFactor));

    const scaleChange = newScale / transform.scale;
    const newX = mouseX - (mouseX - transform.x) * scaleChange;
    const newY = mouseY - (mouseY - transform.y) * scaleChange;

    setTransform({
      x: newX,
      y: newY,
      scale: newScale
    });
  }, [transform]);

  // Add native wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Function to fit SVG to screen
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Try to get dimensions from viewBox first, fallback to getBBox
    let svgWidth, svgHeight;
    const viewBox = svgElement.getAttribute('viewBox');

    if (viewBox) {
      const [, , width, height] = viewBox.split(' ').map(Number);
      svgWidth = width;
      svgHeight = height;
    } else {
      try {
        const svgBounds = svgElement.getBBox();
        svgWidth = svgBounds.width;
        svgHeight = svgBounds.height;
      } catch (e) {
        // Fallback to SVG attributes
        svgWidth = parseFloat(svgElement.getAttribute('width') || '2247');
        svgHeight = parseFloat(svgElement.getAttribute('height') || '5174');
      }
    }

    // Update SVG dimensions for mini-map
    setSvgDimensions({ width: svgWidth, height: svgHeight });

    // For tall images, fit to width and show top portion instead of fitting entire height
    const scaleX = containerWidth / svgWidth;
    const scaleY = containerHeight / svgHeight;
    
    // Use width-based scale for better default zoom on tall images
    // This shows more detail and doesn't squish everything
    const scale = scaleX * 0.9;

    // Center horizontally, start from near the top
    const x = (containerWidth - svgWidth * scale) / 2;
    const y = 20; // Small offset from top

    setTransform({ x, y, scale });
  }, []);

  // Center and scale SVG to fit container
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    // Initial update with a delay to ensure DOM is ready
    const timer = setTimeout(fitToScreen, 100);

    // Watch for container size changes (e.g., when expanding/minimizing)
    const resizeObserver = new ResizeObserver(() => {
      fitToScreen();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [svgContent, fitToScreen]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {svgContent ? (
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading SVG...</div>
        </div>
      )}

      {/* Navigation hint arrows - only show when content is hidden in that direction */}
      {(() => {
        const scaledWidth = svgDimensions.width * transform.scale;
        const scaledHeight = svgDimensions.height * transform.scale;
        const canScrollLeft = transform.x < 0;
        const canScrollRight = transform.x + scaledWidth > containerDimensions.width;
        const canScrollUp = transform.y < 0;
        const canScrollDown = transform.y + scaledHeight > containerDimensions.height;
        
        return (
          <>
            {/* Left/Right arrows */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2">
              {canScrollLeft && (
                <div className="text-blue-600 animate-pulse bg-white rounded-full p-2 shadow-md border border-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              )}
              {!canScrollLeft && <div />}
              {canScrollRight && (
                <div className="text-blue-600 animate-pulse bg-white rounded-full p-2 shadow-md border border-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
            {/* Top/Bottom arrows */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-2">
              {canScrollUp && (
                <div className="text-blue-600 animate-pulse bg-white rounded-full p-2 shadow-md border border-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              )}
              {!canScrollUp && <div />}
              {canScrollDown && (
                <div className="text-blue-600 animate-pulse bg-white rounded-full p-2 shadow-md border border-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
          </>
        );
      })()}

      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(5, prev.scale * 1.2) }))}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-base sm:text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale * 0.8) }))}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-base sm:text-lg font-bold"
        >
          −
        </button>
        <button
          onClick={fitToScreen}
          className="px-2 sm:px-3 h-9 sm:h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-[10px] sm:text-xs font-semibold whitespace-nowrap"
          title="Fit to screen"
        >
          Fit
        </button>
      </div>

      {/* Mini-map */}
      {svgContent && containerDimensions.width > 0 && (
        <MiniMap
          svgContent={svgContent}
          transform={transform}
          containerWidth={containerDimensions.width}
          containerHeight={containerDimensions.height}
          svgWidth={svgDimensions.width}
          svgHeight={svgDimensions.height}
          onNavigate={handleMiniMapNavigate}
        />
      )}
    </div>
  );
};

export default SVGViewer;