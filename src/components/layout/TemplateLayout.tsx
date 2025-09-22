import React from 'react';
import { useTemplateConfig } from '../../hooks/useTemplateConfig';
import { SEOHead as EnhancedSEOHead, useStructuredData } from '../seo/EnhancedSEOHead';
import { InteractiveFactory } from '../interactive';

// Import existing components
import { Header } from './Header';
import { MethodologySection, TextSection } from './TextSection';
import { RelatedProducts } from './RelatedProducts';
import { Credits } from './Credits';
import { RelatedVisuals } from './RelatedVisuals';
import { Navigation } from './Navigation';
import Footer from './FDDFooter';

interface TemplateLayoutProps {
  children?: React.ReactNode;
  customInteractive?: React.ReactNode;
  className?: string;
}

export function TemplateLayout({ 
  children, 
  customInteractive,
  className = "" 
}: TemplateLayoutProps) {
  const config = useTemplateConfig();
  const structuredData = useStructuredData(config?.seo);
  
  if (!config) {
    return (
      <div className="loading-container">
        <div>Loading template configuration...</div>
      </div>
    );
  }

  const {
    content: { sections, header },
    interactive,
    seo
  } = config;

  return (
    <div className={`template-container ${className}`}>
      <EnhancedSEOHead 
        config={seo}
        structuredData={structuredData || undefined}
      />
      
      <div className="template-border" />
      
      <Navigation />
      
      <Header title={header.title} subtitle={header.subtitle} />
      
      {sections.enableTextSection && <TextSection />}
      
      {customInteractive || (
        <InteractiveFactory 
          type={interactive.type}
          config={interactive}
        />
      )}
      
      {sections.enableMethodology && <MethodologySection />}
      
      {sections.enableRelatedProducts && <RelatedProducts />}
      
      {sections.enableCredits && <Credits />}
      
      {sections.enableRelatedVisuals && (
        <RelatedVisuals currentTitle={seo.title} />
      )}
      
      <Footer />
      
      {children}
    </div>
  );
}
