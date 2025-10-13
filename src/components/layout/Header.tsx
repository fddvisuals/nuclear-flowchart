import styles from "../../styles/components/Header.module.css";

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
      {showImage && <HeaderImageContainer />}
      <TitleContainer title={title} subtitle={subtitle} />
    </>
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