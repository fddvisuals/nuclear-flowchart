import React, { useState, useEffect } from 'react';
import { FilterType, filterOptions } from '../data/nuclearData';

function mixHexColor(hex: string, targetHex: string, ratio: number): string {
  const sanitize = (value: string) => value.replace('#', '').toLowerCase();
  const safeRatio = Math.min(Math.max(ratio, 0), 1);

  const from = sanitize(hex);
  const to = sanitize(targetHex);

  if (from.length !== 6 || to.length !== 6) {
    return hex;
  }

  const mixChannel = (start: number, end: number) =>
    Math.round(start + (end - start) * safeRatio)
      .toString(16)
      .padStart(2, '0');

  const start = [0, 2, 4].map((i) => parseInt(from.slice(i, i + 2), 16));
  const end = [0, 2, 4].map((i) => parseInt(to.slice(i, i + 2), 16));

  return `#${start
    .map((channel, index) => mixChannel(channel, end[index]))
    .join('')}`;
}

function lightenHex(hex: string, ratio: number): string {
  return mixHexColor(hex, '#ffffff', ratio);
}

function darkenHex(hex: string, ratio: number): string {
  return mixHexColor(hex, '#000000', ratio);
}

function getReadableTextColor(hex: string): string {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) {
    return 'rgba(255,255,255,0.9)';
  }

  const r = parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = parseInt(sanitized.slice(4, 6), 16) / 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.65 ? 'rgba(78,78,78,0.85)' : 'rgba(255,255,255,0.9)';
}

interface StickyFilterPanelProps {
  activeFilters: FilterType[];
  onFiltersChange: (filters: FilterType[]) => void;
  targetSectionIds?: string[]; // IDs of the sections to watch for scroll
}

const StickyFilterPanel: React.FC<StickyFilterPanelProps> = ({ 
  activeFilters, 
  onFiltersChange,
  targetSectionIds = ['waffle-chart-section', 'visualization-section']
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const targetSections = targetSectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    
    if (targetSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Show sticky filter when ANY of the target sections is in view
        const anyInView = entries.some(entry => entry.isIntersecting);
        setIsVisible(anyInView);
      },
      {
        // Trigger when the top of the section crosses the top of the viewport (plus nav height)
        rootMargin: '-75px 0px 0px 0px',
        threshold: 0,
      }
    );

    targetSections.forEach(section => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [targetSectionIds]);

  const handleFilterToggle = (filter: FilterType) => {
    if (filter === 'all') {
      onFiltersChange(['all']);
      return;
    }

    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter && f !== 'all')
      : [...activeFilters.filter(f => f !== 'all'), filter];

    if (newFilters.length === 0) {
      onFiltersChange(['all']);
    } else {
      onFiltersChange(newFilters);
    }
  };

  const categoryFilters = filterOptions
    .filter(option => ['fuel-production', 'fuel-weaponization'].includes(option.value))
    .reverse();

  const statusFilters = filterOptions
    .filter(option => ['operational', 'unknown', 'construction', 'likely-destroyed', 'destroyed'].includes(option.value))
    .reverse();

  return (
    <div
      id="sticky-filter-panel"
      className={`fixed top-[75px] left-0 w-full z-[999] transition-all duration-300 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{
        background: 'linear-gradient(90deg, #162239 0%, #1b263b 55%, #121c2f 100%)',
        boxShadow: '0 6px 18px rgba(10, 19, 35, 0.55)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <style>{`
            #sticky-filter-panel::-webkit-scrollbar { display: none; }
          `}</style>
          {/* <span className="text-white/90 text-xs font-semibold tracking-[0.18em] uppercase whitespace-nowrap">
            Filters
          </span> */}

          {/* Category Filters */}
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-white/65 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Categories:
            </span>
            {categoryFilters.map((option) => {
              const isActive = activeFilters.includes(option.value);
              const base = option.color ?? '#00558C';
              const backgroundColor = isActive ? base : '#ffffff';
              const textColor = isActive ? '#ffffff' : '#1e293b';

              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterToggle(option.value)}
                  className={`px-4 py-2 text-[13px] font-bold tracking-wide uppercase border-2 transition-all rounded-md whitespace-nowrap ${
                    isActive
                      ? 'shadow-[0_4px_12px_rgba(0,85,140,0.3)]'
                      : 'hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:border-opacity-80'
                  }`}
                  style={{
                    backgroundColor,
                    color: textColor,
                    borderColor: base,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-white/65 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Status:
            </span>
            {statusFilters.map((option) => {
              const isActive = activeFilters.includes(option.value);
              const baseColor = option.color ?? '#c7e9c0';
              const backgroundColor = isActive
                ? baseColor
                : lightenHex(baseColor, 0.7);
              const chipTextColor = getReadableTextColor(backgroundColor);

              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterToggle(option.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-black tracking-[0.08em] uppercase border transition-all whitespace-nowrap ${
                    isActive
                      ? 'shadow-[0_6px_18px_rgba(0,0,0,0.18)]'
                      : 'hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)]'
                  }`}
                  style={{
                    backgroundColor,
                    color: chipTextColor,
                    borderColor: baseColor
                  }}
                >
                  <span
                    className="inline-flex h-3.5 w-3.5 rounded-full border border-white/45"
                    style={{ backgroundColor: isActive ? baseColor : darkenHex(baseColor, 0.15) }}
                  />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Clear All */}
          {!activeFilters.includes('all') && (
            <button
              onClick={() => onFiltersChange(['all'])}
              className="ml-auto px-3.5 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.18em] text-white border border-white/45 hover:border-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyFilterPanel;
