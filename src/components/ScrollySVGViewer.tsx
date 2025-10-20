import React, { useEffect, useRef, useState } from 'react';
import { SVGViewConfig } from '../data/narrativeStages';

interface ScrollySVGViewerProps {
  /** Current SVG view configuration */
  viewConfig: SVGViewConfig;
  /** Array of element IDs to highlight */
  highlightIds?: string[];
  /** Whether to dim non-highlighted elements */
  dimOthers?: boolean;
  /** Array of element IDs to hide */
  hideIds?: string[];
  /** Background color */
  backgroundColor?: string;
}

const ScrollySVGViewer: React.FC<ScrollySVGViewerProps> = ({
  viewConfig,
  highlightIds = [],
  dimOthers = false,
  hideIds = [],
  backgroundColor = '#f9fafb',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');

  // Load SVG on mount
  useEffect(() => {
    const loadSVG = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}main-new.svg`);
        const svgText = await response.text();
        setSvgContent(svgText);
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };

    loadSVG();
  }, []);

  // Set up SVG ref after content is rendered
  useEffect(() => {
    if (containerRef.current && svgContent && !svgLoaded) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svgRef.current = svg;
        svg.style.width = '100%';
        svg.style.height = '100%';
        setSvgLoaded(true);
      }
    }
  }, [svgContent, svgLoaded]);

  // Update viewBox when viewConfig changes
  useEffect(() => {
    if (!svgRef.current || !svgLoaded) return;

    const svg = svgRef.current;
    const originalViewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 4973, 2319];
    const [, , fullWidth, fullHeight] = originalViewBox;

    // Calculate viewBox dimensions based on scale
    const viewWidth = fullWidth / viewConfig.scale;
    const viewHeight = fullHeight / viewConfig.scale;

    // Center the view around the specified x, y
    const viewX = viewConfig.x - (viewWidth / 2);
    const viewY = viewConfig.y - (viewHeight / 2);

    // Clamp to valid ranges
    const clampedX = Math.max(0, Math.min(viewX, fullWidth - viewWidth));
    const clampedY = Math.max(0, Math.min(viewY, fullHeight - viewHeight));

    // Animate viewBox change
    const duration = viewConfig.duration || 1000;
    const startTime = performance.now();
    const startViewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, fullWidth, fullHeight];
    const targetViewBox = [clampedX, clampedY, viewWidth, viewHeight];

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const interpolated = startViewBox.map((start, i) => 
        start + (targetViewBox[i] - start) * eased
      );

      svg.setAttribute('viewBox', interpolated.join(' '));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [viewConfig, svgLoaded]);

  // Update highlighting when highlightIds or dimOthers changes
  useEffect(() => {
    if (!svgRef.current || !svgLoaded) return;

    const svg = svgRef.current;
    
    // Reset all elements first
    const allElements = svg.querySelectorAll('g, rect, circle, path, ellipse');
    allElements.forEach(el => {
      (el as SVGElement).style.opacity = '1';
      (el as SVGElement).style.filter = 'none';
      (el as SVGElement).style.transition = 'opacity 0.5s ease, filter 0.5s ease';
    });

    // Hide specific elements
    hideIds.forEach(id => {
      const element = svg.querySelector(`#${id}`);
      if (element) {
        (element as SVGElement).style.opacity = '0';
      }
    });

    // Apply highlighting
    if (highlightIds.length > 0) {
      const highlightedElements = new Set<Element>();

      // Collect highlighted elements and their descendants
      highlightIds.forEach(id => {
        const element = svg.querySelector(`#${id}`);
        if (element) {
          highlightedElements.add(element);
          // Add all descendants
          element.querySelectorAll('*').forEach(child => {
            highlightedElements.add(child);
          });
        }
      });

      // Dim non-highlighted elements if requested
      if (dimOthers) {
        allElements.forEach(el => {
          if (!highlightedElements.has(el)) {
            (el as SVGElement).style.opacity = '0.2';
          }
        });
      }

      // Add glow effect to highlighted elements
      highlightedElements.forEach(el => {
        (el as SVGElement).style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))';
      });
    } else if (dimOthers) {
      // If dimOthers but no highlights, dim everything slightly
      allElements.forEach(el => {
        (el as SVGElement).style.opacity = '0.4';
      });
    }
  }, [highlightIds, dimOthers, hideIds, svgLoaded]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor }}
    >
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
        dangerouslySetInnerHTML={svgContent ? { __html: svgContent } : undefined}
      >
      </div>
      {!svgContent && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          Loading visualization...
        </div>
      )}
    </div>
  );
};

export default ScrollySVGViewer;
