import { Header } from "./components/layout/Header";
import { MethodologySection, TextSection } from "./components/layout/TextSection";
import { InteractiveContainer } from "./components/interactive/InteractiveContainer";
import { RelatedProducts } from "./components/layout/RelatedProducts";
import { Credits } from "./components/layout/Credits";
import { RelatedVisuals } from "./components/layout/RelatedVisuals";
import { Navigation } from "./components/layout/Navigation";
import { SEOHead } from "./components/seo/SEOHead";
import Footer from "./components/layout/FDDFooter";
import styles from "./styles/components/App.module.css";

export default function App() {
  const currentPageTitle = "Mapping a Shadow War: Explosions Across Iran After the 12-Day War";
  
  return (
    <div className={styles.container}>
      <SEOHead />
      <div className={styles.border} />
      
      <Navigation />
      
      <Header />
      
      <TextSection />
      
      <InteractiveContainer />
      
      <MethodologySection />
      
      <RelatedProducts />
      
      <Credits />
      
      <RelatedVisuals currentTitle={currentPageTitle} />
      
      <Footer />
    </div>
  );
}