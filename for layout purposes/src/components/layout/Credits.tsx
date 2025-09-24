import styles from '../../styles/components/Credits.module.css';

export function Credits() {
  return (
    <div className={styles.credits}>
      <p className={styles.byline}>
        By NUFDI open-source research team led by Khosro Isfahani and FDD's Iran Program
      </p>
      <p className={styles.byline}>
        Development and Design by Pavak Patel
      </p>
    </div>
  );
}
