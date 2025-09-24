import { useState, useEffect } from "react";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

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

  return (
    <nav className={`fixed top-0 left-0 w-full z-[1000] flex items-center justify-start h-[75px] px-[30px] transition-all duration-300 ${
      isScrolled 
        ? 'shadow-[0_2px_10px_rgba(0,0,0,0.1)]' 
        : ''
    }`} style={{ backgroundColor: '#00558c' }}>
      <div className="flex items-center gap-2 h-full">
        <FddLogo isScrolled={isScrolled} />
      </div>
      <div className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-400 ${
        showTitle 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-2.5 pointer-events-none'
      }`}>
        <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
          Post-Strike Assessment: Israeli and U.S. Strikes Caused Major Bottlenecks in Iran's Nuclear Weapons Supply Chain
        </span>
      </div>
    </nav>
  );
}

function FddLogo({ isScrolled }: { isScrolled: boolean }) {
  return (
    <img
          src="/images/Visuals_Logo_Temporary_v01 2.svg"
      alt="FDD Logo"
      className={`transition-all duration-300 ${
        isScrolled ? 'h-[65%]' : 'h-[80%]'
      } w-auto`}
      onError={(e) => {
        // Fallback to SVG version if PNG doesn't load
        const target = e.target as HTMLImageElement;
        target.src = "/images/fdd-logo.svg";
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