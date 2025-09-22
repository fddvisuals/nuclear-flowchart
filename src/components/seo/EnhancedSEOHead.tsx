import { useEffect } from 'react';
import { ProjectConfig } from '../../types/template';

interface SEOHeadProps {
  config?: ProjectConfig['seo'];
  canonicalUrl?: string;
  isEmbedded?: boolean;
  structuredData?: Record<string, any>;
}

export function SEOHead({ 
  config, 
  canonicalUrl, 
  isEmbedded,
  structuredData 
}: SEOHeadProps) {
  useEffect(() => {
    if (!config) return;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const embedParam = urlParams.get('embedded');
    const canonicalParam = urlParams.get('canonical');
    
    // Determine if embedded and canonical URL
    const embedded = isEmbedded || embedParam === 'true';
    const targetCanonical = canonicalUrl || canonicalParam || config.canonicalUrl;
    
    // Update document title
    document.title = config.title;
    
    // Update meta description
    updateMetaTag('name', 'description', config.description);
    updateMetaTag('name', 'keywords', config.keywords.join(', '));
    updateMetaTag('name', 'author', config.author);
    
    // Update canonical URL
    updateCanonicalLink(targetCanonical);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:type', config.type);
    updateMetaTag('property', 'og:url', targetCanonical);
    updateMetaTag('property', 'og:title', config.title);
    updateMetaTag('property', 'og:description', config.description);
    updateMetaTag('property', 'og:image', config.ogImage);
    
    // Update Twitter tags
    updateMetaTag('property', 'twitter:card', 'summary_large_image');
    updateMetaTag('property', 'twitter:url', targetCanonical);
    updateMetaTag('property', 'twitter:title', config.title);
    updateMetaTag('property', 'twitter:description', config.description);
    updateMetaTag('property', 'twitter:image', config.ogImage);
    
    // Handle embedded mode
    if (embedded) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
      
      // Send structured data to parent window for WordPress SEO
      if (window.parent !== window && structuredData) {
        try {
          window.parent.postMessage({
            type: 'SEO_DATA',
            structuredData: structuredData,
            meta: {
              title: config.title,
              description: config.description,
              canonicalUrl: targetCanonical,
              ogImage: config.ogImage
            }
          }, '*');
        } catch (error) {
          console.warn('Could not send SEO data to parent:', error);
        }
      }
    } else {
      updateMetaTag('name', 'robots', 'index, follow');
    }
    
    // Update structured data if provided
    if (structuredData) {
      updateStructuredData(structuredData);
    }
    
  }, [config, canonicalUrl, isEmbedded, structuredData]);

  return null; // This component only manages head elements
}

function updateMetaTag(attribute: string, name: string, content: string) {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateCanonicalLink(href: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = href;
}

function updateStructuredData(data: Record<string, any>) {
  let script = document.getElementById('structured-data') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

// Hook for generating structured data
export function useStructuredData(config?: ProjectConfig['seo']) {
  if (!config) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": config.title,
    "description": config.description,
    "url": config.canonicalUrl,
    "author": {
      "@type": "Organization",
      "name": config.author
    },
    "publisher": {
      "@type": "Organization",
      "name": config.author
    },
    "image": config.ogImage,
    "inLanguage": "en-US"
  };
}
