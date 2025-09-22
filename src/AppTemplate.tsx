import { TemplateLayout } from "./components/layout/TemplateLayout";
import { InteractiveContainer } from "./components/interactive/InteractiveContainer";
import styles from "./styles/components/App.module.css";

export default function App() {
  return (
    <div className={styles.container}>
      <TemplateLayout 
        customInteractive={<InteractiveContainer />}
        className={styles.border}
      />
    </div>
  );
}
