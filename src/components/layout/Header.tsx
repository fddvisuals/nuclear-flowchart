import styles from "../../styles/components/Header.module.css";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showImage?: boolean;
  contributors?: string[];
}

export function Header({ 
  title = "Post-Strike Assessment:", 
  subtitle = "U.S. and Israeli Strikes Caused Major Bottlenecks in Iran's Nuclear Weapons Supply Chain",
  showImage = true,
  contributors = [
    "David Albright, Institute for Science and International Security",
    "Sarah Burkhard, Institute for Science and International Security",
    "Olli Heinonen, Stimson Center",
    "Andrea Stricker, Foundation for Defense of Democracies",
  ]
}: HeaderProps) {
  return (
    <>
      {showImage && <HeaderImageContainer />}
      <TitleContainer title={title} subtitle={subtitle} contributors={contributors} />
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

function TitleContainer({ title, subtitle, contributors }: { title: string; subtitle: string; contributors: string[] }) {
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

      {contributors.length > 0 && (
        <div className={styles.byline}>
          <p className={styles.bylineText}>
            <span className={styles.bylineBold}>Contributors:</span>
          </p>
          {contributors.map(contributor => (
            <p key={contributor} className={styles.bylineText}>
              {contributor}
            </p>
          ))}
        </div>
      )}
      
      <div className={styles.horizontalDivider} />
    </div>
  );
}