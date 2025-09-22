import { useState, useEffect } from "react";
import styles from "../../styles/components/Navigation.module.css";

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
    <nav className={`${styles.fddNavBar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.logoContainer}>
        <FddLogo isScrolled={isScrolled} />
      </div>
      <div className={`${styles.titleContainer} ${showTitle ? styles.titleVisible : styles.titleHidden}`}>
        <span className={styles.navTitle}>Mapping a Shadow War:
          Explosions Across Iran After the 12-Day War</span>
      </div>
    </nav>
  );
}

function FddLogo({ isScrolled }: { isScrolled: boolean }) {
  return (
    <img
      src="/Gas-Leak-Incidents/images/fdd-logo.png"
      alt="FDD Logo"
      className={`${styles.fddLogoSvg} ${isScrolled ? styles.logoScrolled : ''}`}
    />
  );
}
