import { useState, useEffect } from 'react';
import { NuclearFlowchartPage } from './components/layout/NuclearFlowchartPage';
import ScrollytellingPage from './components/layout/ScrollytellingPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'story'>('main');

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the '#'
      if (hash === 'story') {
        setCurrentPage('story');
      } else {
        setCurrentPage('main');
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentPage === 'story') {
    return <ScrollytellingPage />;
  }

  return <NuclearFlowchartPage />;
}

export default App;
