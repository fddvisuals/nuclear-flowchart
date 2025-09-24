import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Calendar, ExternalLink, User, AlertTriangle } from 'lucide-react';
import { IncidentData } from '../../lib/utils/csvParser';
import styles from '../../styles/components/IncidentModal.module.css';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentData | null;
}

export function IncidentModal({ isOpen, onClose, incident }: IncidentModalProps) {

  // Helper function to check if a URL is from X/Twitter
  const isTwitterUrl = (url: string): boolean => {
    return url.includes('twitter.com') || url.includes('x.com');
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'explosion': return '#ef4444';
      case 'fire': return '#f97316';
      case 'visible smoke': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'explosion': return '';
      case 'fire': return '';
      case 'visible smoke': return '';
      default: return '';
    }
  };

  // Handle escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      
      // Preserve scroll position and prevent background scrolling
      const scrollY = window.scrollY;
      const body = document.body;
      const originalStyle = window.getComputedStyle(body);
      const originalOverflow = originalStyle.overflow;
      const originalPosition = originalStyle.position;
      
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = `-${scrollY}px`;
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        body.style.overflow = originalOverflow;
        body.style.position = originalPosition;
        body.style.width = '';
        body.style.top = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !incident) return null;

  return createPortal(
    <div 
      className={styles.overlay} 
      onClick={onClose}
      onTouchMove={(e) => e.preventDefault()} // Prevent scroll on touch devices
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.categoryBadges}>
              {incident.Categories.map((category: string, index: number) => (
                <div 
                  key={index}
                  className={styles.categoryBadge} 
                  style={{ backgroundColor: getCategoryColor(category) }}
                >
                  <span className={styles.categoryIcon}>{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                </div>
              ))}
            </div>
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          <h2 className={styles.title}>{incident.Description}</h2>
          <div className={styles.evidenceCount}>
            {incident.evidenceCount} evidence piece{incident.evidenceCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Incident Details */}
          <div className={styles.detailsSection}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <MapPin size={16} className={styles.detailIcon} />
                <div>
                  <span className={styles.detailLabel}>Location</span>
                  <span className={styles.detailValue}>
                    {incident.NeighborhoodSite && `${incident.NeighborhoodSite}, `}
                    {incident.City}, {incident.Province}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Calendar size={16} className={styles.detailIcon} />
                <div>
                  <span className={styles.detailLabel}>Earliest Report</span>
                  <span className={styles.detailValue}>{incident.earliestDate}</span>
                </div>
              </div>

              {incident.ApproxTimeOfIncident && (
                <div className={styles.detailItem}>
                  <AlertTriangle size={16} className={styles.detailIcon} />
                  <div>
                    <span className={styles.detailLabel}>Incident Time</span>
                    <span className={styles.detailValue}>{incident.ApproxTimeOfIncident}</span>
                  </div>
                </div>
              )}

              {incident.FatalityInjuryCounts && (
                <div className={styles.detailItem}>
                  <AlertTriangle size={16} className={styles.detailIcon} />
                  <div>
                    <span className={styles.detailLabel}>Casualties</span>
                    <span className={styles.detailValue}>{incident.FatalityInjuryCounts}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Evidence List */}
          <div className={styles.evidenceSection}>
            {/* <h3 className={styles.sectionTitle}>Evidence</h3> */}
            <div className={styles.evidenceList}>
              {incident.evidence.map((evidence: any, index: number) => (
                <div key={index} className={styles.evidenceItem}>
                  <div className={styles.evidenceHeader}>
                    <div className={styles.evidenceCategory}>
                      <span className={styles.categoryIcon}>{getCategoryIcon(evidence.Category)}</span>
                      <span>{evidence.Category}</span>
                    </div>
                    <div className={styles.evidenceDate}>
                      <Calendar size={14} />
                      <span>{evidence.DateOfPost}</span>
                      {evidence.TimeOfPost && <span>{evidence.TimeOfPost}</span>}
                    </div>
                  </div>
                  
                  <div className={styles.evidenceSource}>
                    <User size={14} />
                    <span>{evidence.SourceName}</span>
                    <span className={styles.mediaType}>({evidence.MediaType})</span>
                  </div>

                  {evidence.TranslatedCaption && (
                    <p className={styles.evidenceCaption}>{evidence.TranslatedCaption}</p>
                  )}

                  {evidence.Link && (
                    <div className={styles.evidenceLink}>
                      {isTwitterUrl(evidence.Link) ? (
                        <a 
                          href={evidence.Link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.tweetLink}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          View on X
                        </a>
                      ) : (
                        <a 
                          href={evidence.Link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.externalLink}
                        >
                          <ExternalLink size={16} />
                          View Source
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
