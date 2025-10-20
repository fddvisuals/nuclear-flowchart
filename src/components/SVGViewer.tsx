import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, Map } from 'lucide-react';
import { FilterType } from '../data/nuclearData';
import { loadFacilityData, FacilityData, getFacilityById } from '../utils/csvLoader';

interface SVGViewerProps {
  activeFilters: FilterType[];
  highlightedItems: string[];
  onItemClick: (itemId: string) => void;
  showLocations?: boolean;
  onToggleLocations?: () => void;
}

const SVGViewer: React.FC<SVGViewerProps> = ({ 
  activeFilters, 
  highlightedItems, 
  onItemClick,
  showLocations = true,
  onToggleLocations
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [facilityData, setFacilityData] = useState<FacilityData[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, transformX: 0, transformY: 0 });

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
        if (facility && highlightedItems.includes(facility.Item_Id)) {
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
  }, [activeFilters, highlightedItems, facilityData, svgContent]);

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

  const handleWheel = useCallback((e: React.WheelEvent) => {
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

  // Center and scale SVG to fit container
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const container = containerRef.current;
    
    const updateTransform = () => {
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
      
      const scaleX = containerWidth / svgWidth;
      const scaleY = containerHeight / svgHeight;
      const scale = Math.min(scaleX, scaleY) * 0.95;
      
      const x = (containerWidth - svgWidth * scale) / 2;
      const y = (containerHeight - svgHeight * scale) / 2;
      
      setTransform({ x, y, scale });
    };

    // Initial update with a delay to ensure DOM is ready
    const timer = setTimeout(updateTransform, 100);

    // Watch for container size changes (e.g., when expanding/minimizing)
    const resizeObserver = new ResizeObserver(() => {
      updateTransform();
    });
    
    resizeObserver.observe(container);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [svgContent]);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
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
      
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(5, prev.scale * 1.2) }))}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale * 0.8) }))}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center text-lg font-bold"
        >
          −
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center text-xs font-semibold"
        >
          ⌂
        </button>
        {onToggleLocations && (
          <button
            onClick={onToggleLocations}
            className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center"
            title={showLocations ? "Hide Locations (Collapsed View)" : "Show Locations (Detailed View)"}
          >
            {showLocations ? <MapPin className="w-5 h-5" /> : <Map className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default SVGViewer;