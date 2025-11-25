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
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  useEffect(() => {
    const targetSections = targetSectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (targetSections.length === 0) return;

    // Get the first target section
    const firstSection = targetSections[0];

    const handleScroll = () => {
      if (!firstSection) return;

      const rect = firstSection.getBoundingClientRect();
      const navHeight = 75; // Height of the navigation bar

      // Show sticky filter when the first section has scrolled past the nav
      // Hide it when we're back at the top (first section is below the nav)
      const shouldShow = rect.top < navHeight;
      setIsVisible(shouldShow);
    };

    // Initial check
    handleScroll();

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
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

  const statusFilters = filterOptions
    .filter(option => ['operational', 'unknown', 'construction', 'likely-destroyed', 'destroyed'].includes(option.value))
    .reverse();

  return (
    <div
      id="sticky-filter-panel"
      className={`fixed top-[75px] left-0 w-full z-[999] transition-all duration-300 ${isVisible
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

          {/* Status Filters */}
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-white/65 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Filter Status:
            </span>
            {statusFilters.map((option) => {
              const isActive = activeFilters.includes(option.value);
              const baseColor = option.color ?? '#ffe0c2';
              const isHovered = hoveredStatus === option.value;
              const defaultBackground = '#141c2c';
              const activeBackground = baseColor;
              let backgroundColor = isActive ? activeBackground : defaultBackground;
              let borderColor = isActive ? lightenHex(baseColor, 0.08) : 'rgba(255,255,255,0.35)';
              let textColor = isActive ? '#1f2b3f' : 'rgba(255,255,255,0.85)';
              let circleBackground = isActive ? darkenHex('#1f2b3f', 0.08) : lightenHex(baseColor, 0.35);
              let circleBorder = isActive ? 'transparent' : 'rgba(255,255,255,0.4)';
              let boxShadow = isActive ? '0 8px 20px rgba(0,0,0,0.25)' : '0 3px 10px rgba(0,0,0,0.25)';
              let opacity = isActive ? 1 : 0.92;

              if (isHovered) {
                if (isActive) {
                  backgroundColor = lightenHex(baseColor, 0.08);
                  borderColor = lightenHex(baseColor, 0.15);
                  circleBackground = darkenHex('#1f2b3f', 0.15);
                } else {
                  backgroundColor = '#26324a';
                  borderColor = 'rgba(255,255,255,0.6)';
                  circleBackground = baseColor;
                  circleBorder = 'rgba(255,255,255,0.5)';
                }
                textColor = isActive ? '#1a2537' : '#ffffff';
                boxShadow = '0 8px 22px rgba(0,0,0,0.45)';
                opacity = 1;
              }

              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterToggle(option.value)}
                  onMouseEnter={() => setHoveredStatus(option.value)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-black tracking-[0.08em] uppercase border transition-all whitespace-nowrap"
                  style={{
                    backgroundColor,
                    borderColor,
                    color: textColor,
                    fontFamily: 'Lato, sans-serif',
                    boxShadow,
                    opacity,
                    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease'
                  }}
                  aria-pressed={isActive}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}images/${option.value}.svg`}
                    alt=""
                    className="w-6 h-6"

                  />
                  {option.label}
                  {/* <span
                    className="inline-flex h-4 w-4 rounded-full border"
                    style={{
                      backgroundColor: circleBackground,
                      borderColor: circleBorder
                    }}
                  /> */}
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
