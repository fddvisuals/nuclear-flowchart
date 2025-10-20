import styles from "../../styles/components/Header.module.css";
import { BookOpen, Map } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showImage?: boolean;
}

export function Header({ 
  title = "Post-Strike Assessment:", 
  subtitle = "Israeli and U.S. Strikes Caused Major Bottlenecks in Iran's Nuclear Weapons Supply Chain",
  showImage = true 
}: HeaderProps) {
  return (
    <>
      <NavigationBar />
      {showImage && <HeaderImageContainer />}
      <TitleContainer title={title} subtitle={subtitle} />
    </>
  );
}

function NavigationBar() {
  const currentPath = window.location.hash;
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a 
              href="#"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPath === '' || currentPath === '#'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Map className="w-4 h-4" />
              Interactive Map
            </a>
            <a 
              href="#story"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPath === '#story'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Story Mode
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeaderImageContainer() {
  return (
    <div className={styles.headerImageContainer}>
      <div className={styles.featureImage} />
    </div>
  );
}

function TitleContainer({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={styles.titleContainer}>
      <div className={styles.mainTitle}>
        <h1 className={styles.mainTitleText}>
          {title}
        </h1>
      </div>     
      <div className={styles.subtitle}>
        <p className={styles.subtitleText}>
          {subtitle}
        </p>
      </div>
      
      <div className={styles.horizontalDivider} />
    </div>
  );
}