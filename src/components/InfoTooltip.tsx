import { Info } from 'lucide-react';
import { useState } from 'react';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="More information"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      
      {isVisible && (
        <div
          className="absolute z-50 w-72 sm:w-80 p-3 text-sm text-gray-700 bg-white rounded-lg shadow-lg border border-gray-200 pointer-events-none"
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)',
            marginBottom: '0px',
          }}
        >
          <div className="relative">
            {text}
            {/* Arrow pointing down */}
            <div
              className="absolute w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"
              style={{
                bottom: '-7px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
