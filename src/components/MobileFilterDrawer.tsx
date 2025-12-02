import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronUp } from 'lucide-react';
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

// darkenHex available if needed for future use
// function darkenHex(hex: string, ratio: number): string {
//   return mixHexColor(hex, '#000000', ratio);
// }

interface MobileFilterDrawerProps {
  activeFilters: FilterType[];
  onFiltersChange: (filters: FilterType[]) => void;
  isVisible: boolean;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  activeFilters,
  onFiltersChange,
  isVisible
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  // Close drawer when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  const activeFilterCount = activeFilters.includes('all') ? 0 : activeFilters.length;

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Filter Toggle Button - Fixed at bottom, hidden on desktop */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[998] flex md:hidden items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #1b263b 0%, #162239 100%)',
          boxShadow: '0 8px 32px rgba(10, 19, 35, 0.45), 0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-5 h-5 text-white" />
        <span className="text-white font-semibold text-sm">
          Filter Status
        </span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 text-white text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[1001] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #1b263b 0%, #162239 100%)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -8px 32px rgba(10, 19, 35, 0.55)',
          maxHeight: '80vh',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)'
        }}
      >
        {/* Drawer Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-white/70" />
            <h3 className="text-lg font-bold text-white">Filter by Status</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
          <div className="grid grid-cols-1 gap-3">
            {statusFilters.map((option) => {
              const isActive = activeFilters.includes(option.value);
              const baseColor = option.color ?? '#ffe0c2';
              const isHovered = hoveredStatus === option.value;
              const defaultBackground = '#141c2c';
              const activeBackground = baseColor;
              let backgroundColor = isActive ? activeBackground : defaultBackground;
              let borderColor = isActive ? lightenHex(baseColor, 0.08) : 'rgba(255,255,255,0.35)';
              let textColor = isActive ? '#1f2b3f' : 'rgba(255,255,255,0.85)';

              if (isHovered) {
                if (isActive) {
                  backgroundColor = lightenHex(baseColor, 0.08);
                  borderColor = lightenHex(baseColor, 0.15);
                } else {
                  backgroundColor = '#26324a';
                  borderColor = 'rgba(255,255,255,0.6)';
                }
                textColor = isActive ? '#1a2537' : '#ffffff';
              }

              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterToggle(option.value)}
                  onTouchStart={() => setHoveredStatus(option.value)}
                  onTouchEnd={() => setHoveredStatus(null)}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl text-[14px] font-bold tracking-[0.06em] uppercase border transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor,
                    borderColor,
                    color: textColor,
                    fontFamily: 'Lato, sans-serif',
                    boxShadow: isActive 
                      ? '0 4px 12px rgba(0,0,0,0.2)' 
                      : '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                  aria-pressed={isActive}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}images/${option.value}.svg`}
                    alt=""
                    className="w-7 h-7"
                  />
                  <span className="flex-1 text-left">{option.label}</span>
                  {isActive && (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Clear All Button */}
          {!activeFilters.includes('all') && (
            <button
              onClick={() => {
                onFiltersChange(['all']);
                setIsOpen(false);
              }}
              className="w-full mt-4 px-5 py-3 rounded-xl text-[13px] font-semibold uppercase tracking-[0.12em] text-white border border-white/40 hover:border-white hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Clear All Filters
            </button>
          )}

          {/* Apply Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-3 px-5 py-4 rounded-xl text-[14px] font-bold uppercase tracking-[0.08em] text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <ChevronUp className="w-5 h-5" />
              Apply Filters
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileFilterDrawer;
