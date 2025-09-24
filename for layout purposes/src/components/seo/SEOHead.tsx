import { useEffect } from 'react';

interface SEOHeadProps {
  canonicalUrl?: string;
  isEmbedded?: boolean;
}

export function SEOHead({ canonicalUrl, isEmbedded }: SEOHeadProps) {
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const embedParam = urlParams.get('embedded');
    const canonicalParam = urlParams.get('canonical');
    
    // Determine if embedded and canonical URL
    const embedded = isEmbedded || embedParam === 'true';
    const targetCanonical = canonicalUrl || canonicalParam || 'https://www.fdd.org/analysis/2025/08/12/mapping-a-shadow-war-explosions-across-iran-after-the-12-day-war/';
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = targetCanonical;
    
    // Update Open Graph URL for proper sharing
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (ogUrl) {
      ogUrl.content = targetCanonical;
    }
    
    // Update Twitter URL
    let twitterUrl = document.querySelector('meta[property="twitter:url"]') as HTMLMetaElement;
    if (twitterUrl) {
      twitterUrl.content = targetCanonical;
    }
    
    // Add noindex for embedded version to prevent duplicate content
    if (embedded) {
      let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
      if (robotsMeta) {
        robotsMeta.content = 'noindex, nofollow';
      }
      
      // Send structured data to parent window for WordPress SEO
      if (window.parent !== window) {
        const structuredDataScript = document.getElementById('incidents-structured-data');
        if (structuredDataScript && structuredDataScript.textContent) {
          window.parent.postMessage({
            type: 'FDD_STRUCTURED_DATA',
            data: JSON.parse(structuredDataScript.textContent),
            canonicalUrl: targetCanonical,
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.getAttribute('content')
          }, '*');
        }
      }
    }
    
    console.log(`SEO Head configured - Embedded: ${embedded}, Canonical: ${targetCanonical}`);
  }, [canonicalUrl, isEmbedded]);

  return null; // This component only manages head elements
}
