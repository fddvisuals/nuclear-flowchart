import React, { useEffect, useRef, useState } from 'react';
import { narrativeStages } from '../../data/narrativeStages';
import ScrollySVGViewer from '../ScrollySVGViewer';
import { ChevronDown } from 'lucide-react';

const ScrollytellingPage: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>(narrativeStages[0]?.id || '');
  const stageRefs = useRef<globalThis.Map<string, HTMLDivElement>>(new globalThis.Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Get the active stage configuration
  const activeStage = narrativeStages.find(stage => stage.id === activeStageId) || narrativeStages[0];

  // Set up Intersection Observer for scroll detection
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Trigger when element is in middle 20% of viewport
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const stageId = entry.target.getAttribute('data-stage-id');
          if (stageId) {
            setActiveStageId(stageId);
          }
        }
      });
    }, options);

    // Observe all stage elements
    stageRefs.current.forEach((element) => {
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Register a stage ref
  const setStageRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      stageRefs.current.set(id, el);
    } else {
      stageRefs.current.delete(id);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Fixed SVG Viewer on the right */}
      <div className="fixed top-0 right-0 w-1/2 h-screen">
        <ScrollySVGViewer
          viewConfig={activeStage.svgView}
          highlightIds={activeStage.highlightIds}
          dimOthers={activeStage.dimOthers}
          hideIds={activeStage.hideIds}
          backgroundColor={activeStage.backgroundColor}
        />
      </div>

      {/* Scrollable content on the left */}
      <div className="relative w-1/2 min-h-screen">
        {/* Hero Section */}
        <div className="h-screen flex flex-col items-center justify-center px-12 bg-gradient-to-br from-blue-900 to-black text-white">
          <h1 className="text-5xl font-bold mb-6 text-center">
            Iran's Nuclear Infrastructure
          </h1>
          <p className="text-xl text-blue-100 text-center mb-8 max-w-lg">
            An interactive journey through the facilities, capabilities, and recent developments
          </p>
          <div className="flex flex-col items-center animate-bounce mt-8">
            <span className="text-sm mb-2">Scroll to explore</span>
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>

        {/* Narrative Stages */}
        {narrativeStages.map((stage, index) => (
          <div
            key={stage.id}
            ref={setStageRef(stage.id)}
            data-stage-id={stage.id}
            className="min-h-screen flex items-center px-12 py-16"
          >
            <div
              className={`max-w-xl transition-all duration-500 ${
                activeStageId === stage.id
                  ? 'opacity-100 transform translate-x-0'
                  : 'opacity-30 transform -translate-x-4'
              }`}
            >
              {/* Stage Number */}
              <div className="text-sm font-semibold text-blue-600 mb-2">
                Stage {index + 1} of {narrativeStages.length}
              </div>

              {/* Stage Title */}
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {stage.title}
              </h2>

              {/* Stage Content */}
              <div
                className="prose prose-lg text-gray-700"
                dangerouslySetInnerHTML={{ __html: stage.content }}
              />

              {/* Progress Indicator */}
              <div className="mt-8 flex items-center gap-2">
                {narrativeStages.map((s, i) => (
                  <div
                    key={s.id}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i <= index
                        ? activeStageId === s.id
                          ? 'w-12 bg-blue-600'
                          : 'w-8 bg-blue-400'
                        : 'w-6 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Final CTA Section */}
        <div className="h-screen flex flex-col items-center justify-center px-12 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
          <h2 className="text-4xl font-bold mb-6 text-center">
            Explore the Full Interactive Map
          </h2>
          <p className="text-xl text-gray-200 text-center mb-8 max-w-lg">
            Dive deeper into the data with filters, detailed information, and real-time updates
          </p>
          <a
            href="#"
            className="px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg"
          >
            Open Interactive Visualization
          </a>
        </div>
      </div>
    </div>
  );
};

export default ScrollytellingPage;
