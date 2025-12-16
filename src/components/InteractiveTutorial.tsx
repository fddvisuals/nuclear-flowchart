import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Hand, Filter, Grid, Factory, MapPin, CheckCircle } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  byline?: string;
  description: string;
  icon: React.ReactNode;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'switch-to-stack' | 'switch-to-flowchart';
  highlightArea?: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

interface InteractiveTutorialProps {
  onComplete: () => void;
  onViewChange?: (view: 'stack' | 'flowchart') => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onComplete, onViewChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

  const tutorialSteps: TutorialStep[] = [
    {
      id: 0,
      title: 'Post-Strike Assessment:',
      byline: "Major Bottlenecks Exist in Iran's Nuclear Weapons Supply Chain",
      description: 'Tutorial: This quick walkthrough is here to help you use the interactive tool. You can explore the impact of Israeli and U.S. strikes on Iranian nuclear facilities — let\'s take a quick tour of the key features.',
      icon: <Hand className="w-6 h-6" />,
      position: 'center',
    },
    {
      id: 1,
      title: 'Damage Report by Component System',
      description: 'Explore detailed damage assessments grouped by nuclear production system. Each card shows all facility locations for that system, with color-coded status indicators. Hover over the icons to see specific facility details.',
      icon: <Factory className="w-6 h-6" />,
      targetElement: 'damage-grid-section',
      position: 'top',
      action: 'switch-to-stack',
    },
    {
      id: 2,
      title: 'Nuclear Program Damage Flowchart',
      description: 'Navigate the nuclear supply-chain flowchart to see what parts of the Iran nuclear program are still functional and what parts aren’t — and how they fit together. Zoom with the scroll wheel, pan by dragging, and click the expand button for fullscreen mode.',
      icon: <MapPin className="w-6 h-6" />,
      targetElement: 'visualization-section',
      position: 'top',
      action: 'switch-to-flowchart',
    },
    {
      id: 3,
      title: 'Facility Status Overview (Waffle Chart)',
      description: 'Each square represents a nuclear fuel processing or weaponization facility, color-coded by damage status. Hover over squares for details or use filters to highlight different statuses.',
      icon: <Grid className="w-6 h-6" />,
      targetElement: 'waffle-chart-section',
      position: 'top',
    },
    {
      id: 4,
      title: 'Controlling the View with Filters',
      description: 'Use these filters to focus on specific types of facilities — Fuel Processing or Weaponization — or by damage status. Filters selected at the top apply to all visualizations below.',
      icon: <Filter className="w-6 h-6" />,
      targetElement: 'sticky-filter-panel',
      position: 'bottom',
    },
    {
      id: 5,
      title: 'You\'re all set!',
      description: 'Start exploring',
      icon: <CheckCircle className="w-6 h-6" />,
      position: 'center',
    },
  ];

  const currentStepData = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  // Update spotlight position when step changes
  useEffect(() => {
    const updateSpotlight = () => {
      if (currentStepData.targetElement) {
        const element = document.getElementById(currentStepData.targetElement);
        if (element) {
          const rect = element.getBoundingClientRect();
          setSpotlightStyle({
            top: `${rect.top - 8}px`,
            left: `${rect.left - 8}px`,
            width: `${rect.width + 16}px`,
            height: `${rect.height + 16}px`,
            borderRadius: '6px',
          });
        }
      } else {
        setSpotlightStyle({});
      }
    };

    // Initial update
    updateSpotlight();

    // Update on window resize or scroll
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight);

    return () => {
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight);
    };
  }, [currentStepData]);

  // Handle view switching when step changes
  useEffect(() => {
    if (currentStepData.action && onViewChange) {
      if (currentStepData.action === 'switch-to-stack') {
        onViewChange('stack');
      } else if (currentStepData.action === 'switch-to-flowchart') {
        onViewChange('flowchart');
      }
    }
  }, [currentStep, currentStepData.action, onViewChange]);

  useEffect(() => {
    // Get step data fresh for this effect
    const stepData = tutorialSteps[currentStep];
    // Scroll to highlighted element only once when step changes
    // Use longer delay if there's a view switch action to let the new view render
    const delay = stepData.action ? 400 : 100;
    const scrollTimeout = setTimeout(() => {
      if (stepData.targetElement) {
        const element = document.getElementById(stepData.targetElement);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if the top of element is visible in viewport with some margin
          const isInView = rect.top >= 80 && rect.top <= window.innerHeight * 0.4;
          
          // Only scroll if element is not already in view
          if (!isInView) {
            // Scroll so element appears near the top of the viewport
            const offset = 100; // Account for sticky header
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: elementPosition - offset,
              behavior: 'smooth',
            });
          }
        }
      } else if (stepData.position === 'center' && currentStep === 0) {
        // Only scroll to top for the first welcome step
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, delay);

    return () => clearTimeout(scrollTimeout);
  }, [currentStep]); // Only depend on currentStep

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('nuclearFlowchartTutorialCompleted', 'true');
    onComplete();
  };

  if (!isVisible) return null;

  const getTooltipPosition = () => {
    if (currentStepData.position === 'center' || !currentStepData.targetElement) {
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }

    // For elements with targets, position relative to viewport
    return 'fixed bottom-8 left-1/2 transform -translate-x-1/2';
  };

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {currentStepData.targetElement && spotlightStyle.width && (
                <rect
                  x={spotlightStyle.left}
                  y={spotlightStyle.top}
                  width={spotlightStyle.width}
                  height={spotlightStyle.height}
                  rx={spotlightStyle.borderRadius}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight border for targeted element */}
      {currentStepData.targetElement && spotlightStyle.width && (
        <div
          className="fixed z-[9999] pointer-events-none border-4 transition-all duration-300"
          style={{ ...spotlightStyle, borderColor: '#00558c' }}
        />
      )}

      {/* Tutorial Card */}
      <div className={`${getTooltipPosition()} z-[10000] w-full max-w-lg px-4`}>
        <div className="bg-white rounded-lg shadow-2xl border-2 overflow-hidden animate-fade-in" style={{ borderColor: '#00558c' }}>
          {/* Header */}
          <div className="px-6 py-4 text-white" style={{ backgroundColor: '#00558c' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col leading-tight">
                  <span className="inline-flex w-fit items-center rounded-full border border-white/80 px-2 py-0.5 text-sm font-semibold uppercase tracking-wide">Tutorial</span>
                  <h3 className="text-base font-bold">{currentStepData.title}</h3>
                  {currentStepData.byline && (
                    <p className="text-xs font-medium opacity-90">{currentStepData.byline}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mb-6">
              <p className="text-gray-700 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {tutorialSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-2 flex-1 rounded transition-all duration-300`}
                  style={{ backgroundColor: index <= currentStep ? '#00558c' : '#e5e7eb' }}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${isFirstStep
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm text-gray-500 font-medium">
                {currentStep + 1} / {tutorialSteps.length}
              </span>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 text-white rounded font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#00558c' }}
              >
                {isLastStep ? (
                  <>
                    <Check className="w-4 h-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Skip option */}
            {!isLastStep && (
              <div className="text-center mt-4">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  Skip tutorial
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global styles for animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default InteractiveTutorial;
