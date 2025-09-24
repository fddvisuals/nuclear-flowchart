import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilterType } from '../data/nuclearData';
import { loadFacilityData, FacilityData, getStatusFromSVGColor, getFacilityById } from '../utils/csvLoader';

interface SVGViewerProps {
  activeFilters: FilterType[];
  highlightedItems: string[];
  onItemClick: (itemId: string) => void;
}

const SVGViewer: React.FC<SVGViewerProps> = ({ activeFilters, highlightedItems, onItemClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [facilityData, setFacilityData] = useState<FacilityData[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, transformX: 0, transformY: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  // Helper function to convert SVG Shape IDs to CSV rect IDs
  // This maps the actual rect elements in the SVG to the CSV facility IDs
  const convertShapeIdToRectId = (shapeId: string): string => {
    const rectMapping: Record<string, string> = {
      'Shape': 'rect-0',
      'Shape_2': 'rect-1', 
      'Shape_4': 'rect-2',
      'Shape_6': 'rect-3',
      'Shape_7': 'rect-4',
      'Shape_9': 'rect-5',
      'Shape_11': 'rect-6',
      'Shape_13': 'rect-7',
      'Shape_15': 'rect-8',
      'Shape_17': 'rect-9',
      'Shape_19': 'rect-10',
      'Shape_20': 'rect-11',
      'Shape_21': 'rect-12',
      'Shape_23': 'rect-13',
      'Shape_28': 'rect-14',
      'Shape_29': 'rect-15',
      'Shape_30': 'rect-16',
      'Shape_33': 'rect-17',
      'Shape_35': 'rect-18',
      'Shape_37': 'rect-19',
      'Shape_39': 'rect-20',
      'Shape_40': 'rect-21',
      'Shape_41': 'rect-22',
      'Shape_43': 'rect-23',
      'Shape_44': 'rect-24',
      'Shape_46': 'rect-25',
      'Shape_48': 'rect-26',
      'Shape_50': 'rect-27',
      'Shape_52': 'rect-28',
      'Shape_54': 'rect-29',
      'Shape_60': 'rect-30',
      'Shape_62': 'rect-31',
      'Shape_64': 'rect-32',
      'Shape_69': 'rect-33',
      'Shape_70': 'rect-34',
      'Shape_72': 'rect-35',
      'Shape_73': 'rect-36',
      'Shape_74': 'rect-37',
      'Shape_78': 'rect-38',
      'Shape_80': 'rect-39',
      'Shape_82': 'rect-40',
      'Shape_84': 'rect-41',
      'Shape_85': 'rect-42',
      'Shape_86': 'rect-43',
      'Shape_87': 'rect-44',
      'Shape_88': 'rect-45',
      'Shape_89': 'rect-46',
      'Shape_100': 'rect-47',
      'Shape_102': 'rect-48',
      'Shape_104': 'rect-49',
      'Shape_107': 'rect-50',
      'Shape_109': 'rect-51',
      'Shape_111': 'rect-52',
      'Shape_113': 'rect-53',
      'Shape_115': 'rect-54',
      'Shape_116': 'rect-55',
      'Shape_118': 'rect-56',
      'Shape_121': 'rect-57',
      'Shape_122': 'rect-58',
      'Shape_124': 'rect-59',
      'Shape_128': 'rect-60',
      'Shape_129': 'rect-61',
      'Shape_131': 'rect-62',
      'Shape_133': 'rect-63',
      'Shape_138': 'rect-64',
      'Shape_140': 'rect-65',
      'Shape_143': 'rect-66',
      'Shape_152': 'rect-67'
      // Note: CSV goes up to rect-71, but only 68 rect elements exist in SVG (rect-0 to rect-67)
      // The remaining CSV entries (rect-68 to rect-71) are conceptual categories without visual elements
    };
    
    return rectMapping[shapeId] || shapeId;
  };

  // Load CSV data
  useEffect(() => {
    loadFacilityData().then(data => {
      setFacilityData(data);
    });
  }, []);

  // Load SVG file
  useEffect(() => {
    fetch('/main.svg')
      .then(response => response.text())
      .then(text => setSvgContent(text))
      .catch(error => console.error('Error loading SVG:', error));
  }, []);

  // Apply filtering and highlighting to SVG elements
  useEffect(() => {
    if (!containerRef.current || facilityData.length === 0 || !svgContent) return;

    console.log('Filtering with:', { 
      activeFilters, 
      facilityDataCount: facilityData.length,
      svgContentLength: svgContent.length 
    });

    const timer = setTimeout(() => {
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) {
        console.log('No SVG element found');
        return;
      }

      const rectElements = svgElement.querySelectorAll('rect');
      console.log(`Found ${rectElements.length} rect elements`);
    
      let processedCount = 0;
      let matchedCount = 0;
      
      rectElements.forEach((rect) => {
        const shapeId = rect.getAttribute('id') || '';
        const rectId = convertShapeIdToRectId(shapeId);
        const facility = getFacilityById(rectId, facilityData);
        
        processedCount++;
        
        if (!facility) {
          rect.style.opacity = '0.2';
          if (processedCount <= 5) {
            console.log(`No facility found for rect ID: ${rectId}`);
          }
          return;
        }

        let shouldShow = false;
        
        if (activeFilters.includes('all')) {
          shouldShow = true;
        } else {
          if (activeFilters.includes('fuel-production') && facility.main_category === 'Fuel Production') {
            shouldShow = true;
          }
          if (activeFilters.includes('fuel-weaponization') && facility.main_category === 'Fuel Weaponization') {
            shouldShow = true;
          }
          if (activeFilters.includes('components') && facility.item_type === 'component') {
            shouldShow = true;
          }
          if (activeFilters.includes('sub-items') && facility.item_type === 'sub-item') {
            shouldShow = true;
          }
          if (activeFilters.includes('standalone') && facility.item_type === 'standalone') {
            shouldShow = true;
          }
          
          // Status filtering based on SVG fill color
          const currentFill = rect.getAttribute('fill') || '';
          const status = getStatusFromSVGColor(currentFill);
          
          if (processedCount <= 10) {
            console.log(`Color check - Shape: ${shapeId}, Fill: ${currentFill}, Status: ${status}`);
          }
          
          if (activeFilters.includes('operational') && status === 'operational') {
            shouldShow = true;
          }
          if (activeFilters.includes('destroyed') && status === 'destroyed') {
            shouldShow = true;
          }
          if (activeFilters.includes('likely-destroyed') && status === 'likely-destroyed') {
            shouldShow = true;
          }
          if (activeFilters.includes('unknown') && status === 'unknown') {
            shouldShow = true;
          }
          if (activeFilters.includes('construction') && status === 'construction') {
            shouldShow = true;
          }
        }

        if (shouldShow) matchedCount++;
        
        if (processedCount <= 5) {
          console.log(`Shape ${shapeId} -> Rect ${rectId}: facility=${facility.facility_name}, category=${facility.main_category}, type=${facility.item_type}, shouldShow=${shouldShow}`);
        }

        rect.style.opacity = shouldShow ? '1' : '0.1';
        
        if (highlightedItems.includes(rectId)) {
          rect.style.stroke = '#FF6B35';
          rect.style.strokeWidth = '3';
          rect.style.filter = 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.8))';
        } else {
          rect.style.stroke = '';
          rect.style.strokeWidth = '';
          rect.style.filter = '';
        }
      });
      
      console.log(`Processed ${processedCount} rects, ${matchedCount} matched filters`);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeFilters, highlightedItems, facilityData, svgContent]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as Element;
    if (target.tagName === 'rect' && target.getAttribute('id')) {
      const shapeId = target.getAttribute('id') || '';
      const rectId = convertShapeIdToRectId(shapeId);
      onItemClick(rectId);
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      transformX: transform.x,
      transformY: transform.y
    });
  }, [onItemClick, transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

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

  const handleMouseEnter = useCallback(() => {
    setShowMagnifier(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false);
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

  useEffect(() => {
    if (svgContent && containerRef.current) {
      const container = containerRef.current;
      
      setTimeout(() => {
        const svgElement = container.querySelector('svg');
        if (!svgElement) return;
        
        const svgBounds = svgElement.getBBox();
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scaleX = containerWidth / svgBounds.width;
        const scaleY = containerHeight / svgBounds.height;
        const scale = Math.min(scaleX, scaleY) * 0.8;
        
        const x = (containerWidth - svgBounds.width * scale) / 2;
        const y = (containerHeight - svgBounds.height * scale) / 2;
        
        setTransform({ x, y, scale });
      }, 100);
    }
  }, [svgContent]);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${
        isDragging ? 'cursor-grabbing' : 'cursor-none'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
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
      </div>

      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
        <div>Facilities loaded: {facilityData.length}</div>
        <div>Scale: {transform.scale.toFixed(2)}</div>
        <div>Position: ({transform.x.toFixed(0)}, {transform.y.toFixed(0)})</div>
        <div>Active filters: {activeFilters.join(', ')}</div>
        <div>Highlighted: {highlightedItems.length}</div>
        <div>SVG loaded: {svgContent ? 'Yes' : 'No'}</div>
        <div>Sample facility: {facilityData.length > 0 ? `${facilityData[0].facility_id} - ${facilityData[0].facility_name}` : 'None'}</div>
      </div>

      {/* Magnifying Glass Window */}
      {showMagnifier && svgContent && (() => {
        const magnifierSize = 250;
        const magnificationFactor = 3;
        const halfSize = magnifierSize / 2;
        
        // Calculate the position in the original SVG coordinate space
        const svgX = (mousePos.x - transform.x) / transform.scale;
        const svgY = (mousePos.y - transform.y) / transform.scale;
        
        // Calculate the transform for the magnified content
        const magnifiedTransformX = transform.x - svgX * transform.scale * magnificationFactor + halfSize;
        const magnifiedTransformY = transform.y - svgY * transform.scale * magnificationFactor + halfSize;
        
        return (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: mousePos.x - halfSize,
              top: mousePos.y - halfSize,
              width: magnifierSize,
              height: magnifierSize,
            }}
          >
            <div 
              className="w-full h-full rounded-full border-4 border-gray-800 shadow-2xl overflow-hidden bg-white"
              style={{
                clipPath: 'circle(50%)',
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  transform: `translate(${magnifiedTransformX}px, ${magnifiedTransformY}px) scale(${transform.scale * magnificationFactor})`,
                  transformOrigin: '0 0',
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
            {/* Magnifying glass handle */}
            <div 
              className="absolute bg-gray-800 rounded-full"
              style={{
                width: 8,
                height: 40,
                bottom: -35,
                right: 15,
                transform: 'rotate(45deg)',
                transformOrigin: 'top center',
              }}
            />
          </div>
        );
      })()}
    </div>
  );
};

export default SVGViewer;