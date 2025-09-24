// import imgImage from "../imports/figma:asset/fdef816e742333aad5cf7fd18cd5df1c4efcdb9d.png";
import styles from "../../styles/components/Header.module.css";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showImage?: boolean;
}

export function Header({ 
  title = "Mapping a Shadow War:", 
  subtitle = "Explosions Across Iran After the 12-Day War",
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
      
      {/* <div className={styles.byline}>
        <p className={styles.bylineText}>
          <span>By </span>
          <span className={styles.bylineBold}>NUFDI open-source research team led by Khosro Isfahani and FDD's Iran Program </span>
        </p>
      </div> */}
      
      <div className={styles.horizontalDivider} />
    </div>
  );
}