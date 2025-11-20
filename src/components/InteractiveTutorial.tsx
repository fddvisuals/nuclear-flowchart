import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Hand, Target, Filter, Grid, Factory, MapPin, CheckCircle } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightArea?: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

interface InteractiveTutorialProps {
  onComplete: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

  const tutorialSteps: TutorialStep[] = [
    {
      id: 0,
      title: 'Welcome to the Nuclear Facilities Damage Assessment',
      description: 'This interactive tool helps you explore the impact of strikes on Iranian nuclear facilities. Let\'s take a quick tour of the key features.',
      icon: <Hand className="w-6 h-6" />,
      position: 'center',
    },
    {
      id: 1,
      title: 'Strike Impact Summary',
      description: 'View a categorized breakdown of facilities affected by Israeli and U.S. operations. This section provides an at-a-glance overview of the strike campaign.',
      icon: <Target className="w-6 h-6" />,
      targetElement: 'strike-impact-summary',
      position: 'bottom',
    },
    {
      id: 2,
      title: 'Filter Controls',
      description: 'Use these filters to focus on specific facility categories (Enrichment, Weaponization, etc.) or damage statuses. Filters apply to all visualizations below.',
      icon: <Filter className="w-6 h-6" />,
      targetElement: 'sticky-filter-panel',
      position: 'bottom',
    },
    {
      id: 3,
      title: 'Status Overview (Waffle Chart)',
      description: 'Each square represents a facility, color-coded by damage status. Hover over squares for details, or use filters to highlight specific categories.',
      icon: <Grid className="w-6 h-6" />,
      targetElement: 'waffle-chart-section',
      position: 'top',
    },
    {
      id: 4,
      title: 'System Damage Grid',
      description: 'Explore detailed damage assessments grouped by nuclear system. Click on cards to see facility-level information and filter by category or status.',
      icon: <Factory className="w-6 h-6" />,
      targetElement: 'damage-grid-section',
      position: 'top',
    },
    {
      id: 5,
      title: 'Interactive Flowchart',
      description: 'Navigate the nuclear supply chain flowchart. Zoom with scroll wheel, pan by dragging, and click the expand button for fullscreen mode.',
      icon: <MapPin className="w-6 h-6" />,
      targetElement: 'visualization-section',
      position: 'top',
    },
    {
      id: 6,
      title: 'You\'re all set!',
      description: 'Start exploring the data with filters, click on elements for details, and use fullscreen mode for detailed analysis. Enjoy your research!',
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
            borderRadius: '12px',
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

  useEffect(() => {
    // Scroll to highlighted element
    if (currentStepData.targetElement) {
      const element = document.getElementById(currentStepData.targetElement);
      if (element) {
        const offset = 150; // Account for sticky header
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth',
        });
      }
    } else if (currentStepData.position === 'center') {
      // Scroll to top for center-positioned steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, currentStepData]);

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
        <div
          className="bg-white rounded-2xl shadow-2xl border-2 overflow-hidden animate-fade-in"
          style={{ borderColor: '#00558c' }}
        >
          {/* Header */}
          <div className="px-6 py-4 text-white" style={{ backgroundColor: '#00558c' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {currentStepData.icon}
                </div>
                <h3 className="text-lg font-bold">{currentStepData.title}</h3>
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
            <p className="text-gray-700 leading-relaxed mb-6">
              {currentStepData.description}
            </p>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {tutorialSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="h-2 flex-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: index <= currentStep ? '#00558c' : '#e5e7eb' }}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isFirstStep
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
                className="flex items-center gap-2 px-6 py-2 text-white rounded-lg font-medium transition-colors bg-[#00558c] hover:bg-[#004472]"
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
