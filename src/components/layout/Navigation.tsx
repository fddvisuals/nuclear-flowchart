import { useState, useEffect } from "react";
import { HelpCircle } from 'lucide-react';

interface NavigationProps {
  onHelpClick?: () => void;
}

export function Navigation({ onHelpClick }: NavigationProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const headerHeight = 500; // Approximate header height
      
      // Set scrolled state for styling
      setIsScrolled(scrollTop > 50);
      
      // Show title when header is scrolled past
      setShowTitle(scrollTop > headerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleScroll = () => setIsMobileMenuOpen(false);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[1000] flex items-center justify-between h-[60px] md:h-[75px] px-4 md:px-[30px] transition-all duration-300 ${
        isScrolled 
          ? 'shadow-[0_2px_10px_rgba(0,0,0,0.1)]' 
          : ''
      }`} style={{ backgroundColor: '#00558c' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 h-full">
          <FddLogo isScrolled={isScrolled} />
        </div>

        {/* Desktop title - hidden on mobile */}
        <div className={`hidden md:block absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-400 ${
          showTitle 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-2.5 pointer-events-none'
        }`}>
          <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
            Post-Strike Assessment: Major Bottlenecks Exist in Iran's Nuclear Weapons Supply Chain
          </span>
        </div>

        {/* Mobile: Hamburger menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {onHelpClick && (
            <button
              onClick={onHelpClick}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              title="How to use this visual"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Desktop: Help button */}
        {onHelpClick && (
          <button
            onClick={onHelpClick}
            className="hidden md:flex ml-auto items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            title="How to use this visual"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">How to Use This Visual</span>
          </button>
        )}
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div className={`fixed top-[60px] right-0 w-64 bg-[#00558c] z-[1000] md:hidden transform transition-transform duration-300 shadow-xl ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4">
          {onHelpClick && (
            <button
              onClick={() => {
                onHelpClick();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">How to Use This Visual</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function FddLogo({ isScrolled }: { isScrolled: boolean }) {
  return (
    <img
          src={`${import.meta.env.BASE_URL}images/Visuals_Logo_Temporary_v01 2.svg`}
      alt="FDD Logo"
      className={`transition-all duration-300 ${
        isScrolled ? 'h-[65%]' : 'h-[80%]'
      } w-auto`}
      onError={(e) => {
        // Fallback to SVG version if PNG doesn't load
        const target = e.target as HTMLImageElement;
        target.src = `${import.meta.env.BASE_URL}images/fdd-logo.svg`;
        target.onerror = () => {
          // Final fallback to placeholder
          target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.className = `w-12 h-8 bg-white rounded flex items-center justify-center transition-all duration-300`;
          fallback.innerHTML = '<span class="text-blue-800 font-bold text-sm">FDD</span>';
          target.parentNode?.appendChild(fallback);
        };
      }}
    />
  );
}