import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from '../../styles/components/TweetModal.module.css';

interface TweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tweetUrl: string;
  incidentTitle: string;
}

declare global {
  interface Window {
    twttr: any;
  }
}

export function TweetModal({ isOpen, onClose, tweetUrl, incidentTitle }: TweetModalProps) {
  const tweetContainerRef = useRef<HTMLDivElement>(null);

  // Extract tweet ID from URL
  const getTweetId = (url: string): string | null => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    if (!isOpen || !tweetUrl) return;

    // Load Twitter widgets script if not already loaded
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = () => {
        embedTweet();
      };
      document.head.appendChild(script);
    } else {
      embedTweet();
    }

    function embedTweet() {
      const tweetId = getTweetId(tweetUrl);
      if (!tweetId || !tweetContainerRef.current) return;

      // Clear previous content
      tweetContainerRef.current.innerHTML = '';

      // Create embedded tweet
      window.twttr.widgets.createTweet(tweetId, tweetContainerRef.current, {
        theme: 'light',
        width: 550,
        align: 'center',
        conversation: 'none',
        cards: 'visible'
      }).then(() => {
        console.log('Tweet embedded successfully');
      }).catch((error: any) => {
        console.error('Error embedding tweet:', error);
        // Fallback: show link to tweet
        if (tweetContainerRef.current) {
          tweetContainerRef.current.innerHTML = `
            <div class="${styles.fallback}">
              <p>Unable to embed tweet. <a href="${tweetUrl}" target="_blank" rel="noopener noreferrer">View on X/Twitter</a></p>
            </div>
          `;
        }
      });
    }
  }, [isOpen, tweetUrl]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{incidentTitle}</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div ref={tweetContainerRef} className={styles.tweetContainer}>
            <div className={styles.loading}>Loading tweet...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
