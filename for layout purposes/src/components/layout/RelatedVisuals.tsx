import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from "../../styles/components/RelatedVisuals.module.css";
import { ParsedVisualData } from '../../types/visuals';
import { fetchVisualsData, getPlaceholderImageUrl } from '../../lib/utils/visualsData';

interface RelatedVisualsProps {
  currentTitle?: string;
}

export function RelatedVisuals({ currentTitle }: RelatedVisualsProps) {
  const [visualsData, setVisualsData] = useState<ParsedVisualData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function loadVisualsData() {
      try {
        setIsLoading(true);
        console.log('Environment variable:', import.meta.env.VITE_FDD_VISUALS_CSV_URL);
        const data = await fetchVisualsData();
        console.log('Received data:', data);
        
        // Filter out the current visual if currentTitle is provided
        const filteredData = currentTitle 
          ? data.filter(visual => visual.name !== currentTitle)
          : data;
        
        setVisualsData(filteredData);
        setError(null);
      } catch (err) {
        setError('Failed to load visuals data');
        console.error('Error loading visuals:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadVisualsData();
  }, [currentTitle]);

  const handlePrevious = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCanGoPrev(!swiper.isBeginning);
    setCanGoNext(!swiper.isEnd);
  };

  if (isLoading) {
    return (
      <div className={styles.relatedVisualsContainer}>
        <Header />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.stateMessage}>Loading visuals...</p>
        </div>
      </div>
    );
  }

  if (error || visualsData.length === 0) {
    return (
      <div className={styles.relatedVisualsContainer}>
        <Header />
        <div className={styles.errorState}>
          <p className={styles.stateMessage}>{error || 'No visuals available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.relatedVisualsContainer}>
      <Header 
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={canGoPrev}
        canGoNext={canGoNext}
        showNavigation={visualsData.length > 1}
      />
      <div className={styles.sliderContainer}>
        <Swiper
          modules={[Navigation, Mousewheel]}
          spaceBetween={20}
          slidesPerView={1}
          slidesPerGroup={1}
          breakpoints={{
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
              slidesPerGroup: 1,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
              slidesPerGroup: 1,
            },
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          onSwiper={(swiper) => {
            // @ts-ignore - Swiper ref assignment
            swiperRef.current = swiper;
            setCanGoPrev(!swiper.isBeginning);
            setCanGoNext(!swiper.isEnd);
          }}
          onSlideChange={handleSlideChange}
          className={styles.swiper}
        >
          {isMobile ? (
            // Mobile: Group items in stacks of 4
            Array.from({ length: Math.ceil(visualsData.length / 4) }).map((_, groupIndex) => (
              <SwiperSlide key={`group-${groupIndex}`}>
                <div className={styles.mobileGroup}>
                  {visualsData
                    .slice(groupIndex * 4, (groupIndex + 1) * 4)
                    .map((visual, index) => (
                      <VisualCard key={`${groupIndex}-${index}-${visual.name}`} visual={visual} />
                    ))}
                </div>
              </SwiperSlide>
            ))
          ) : (
            // Desktop/Tablet: Individual slides
            visualsData.map((visual, index) => (
              <SwiperSlide key={`${index}-${visual.name}`}>
                <VisualCard visual={visual} />
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </div>
    </div>
  );
}

interface HeaderProps {
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  showNavigation?: boolean;
}

function Header({ onPrevious, onNext, canGoPrevious, canGoNext, showNavigation }: HeaderProps) {
  return (
    <div className={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <h2 className={styles.title}>FDD Visuals</h2>
        <div className={styles.divider} />
      </div>
      {showNavigation && (
        <div className={styles.navigation}>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={onPrevious}
            disabled={!canGoPrevious}
            aria-label="Previous visuals"
          >
            <ChevronIcon className={styles.navIcon} />
          </button>
          <button 
            className={styles.navButton}
            onClick={onNext}
            disabled={!canGoNext}
            aria-label="Next visuals"
          >
            <ChevronIcon className={styles.navIcon} />
          </button>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  );
}

interface VisualCardProps {
  visual: ParsedVisualData;
}

function VisualCard({ visual }: VisualCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if this was part of a drag gesture
    if (e.detail === 0) return; // This was triggered by keyboard, allow it
    
    if (visual.link) {
      window.open(visual.link, '_blank', 'noopener,noreferrer');
    }
  };

  const renderStatus = () => {
    const parts = [];
    
    if (visual.date) {
      parts.push(
        <span key="date" className={styles.dateSpan}>
          {visual.date}
        </span>
      );
    }
    
    if (visual.author) {
      parts.push(
        <span key="author">
          {visual.author}
        </span>
      );
    }
    
    return parts.reduce((acc, part, index) => {
      if (index === 0) return [part];
      return [...acc, ' | ', part];
    }, [] as React.ReactNode[]);
  };

  return (
    <div 
      className={styles.visualCard} 
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (visual.link) {
            window.open(visual.link, '_blank', 'noopener,noreferrer');
          }
        }
      }}
    >
      <div className={styles.imageContainer}>
        <img
          className={styles.cardImage}
          src={visual.featureImageLink || getPlaceholderImageUrl()}
          alt={visual.name}
          onError={(e) => {
            e.currentTarget.src = getPlaceholderImageUrl();
          }}
          loading="lazy"
          draggable={false}
        />
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{visual.name}</h3>
        <p className={styles.cardStatus}>
          {(visual.date || visual.author) && (
            <>
              {renderStatus()}
            </>
          )}
        </p>
      </div>
    </div>
  );
}