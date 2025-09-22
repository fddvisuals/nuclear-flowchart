import React from 'react';

interface TwitterEmbedProps {
  tweetUrl: string;
  theme?: 'light' | 'dark';
  width?: number;
  height?: number;
}

export function TwitterEmbed({ 
  tweetUrl, 
  theme = 'light', 
  width = 550, 
  height = 400 
}: TwitterEmbedProps) {
  const embedId = `twitter-embed-${Math.random().toString(36).substr(2, 9)}`;

  React.useEffect(() => {
    // Load Twitter widgets if not already loaded
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.head.appendChild(script);
    } else {
      // Re-render tweets if widgets already loaded
      window.twttr.widgets.load();
    }
  }, [tweetUrl]);

  const tweetId = tweetUrl.split('/').pop()?.split('?')[0];
  
  if (!tweetId) {
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <p>Invalid tweet URL</p>
      </div>
    );
  }

  return (
    <div id={embedId} style={{ width, height }}>
      <blockquote 
        className="twitter-tweet" 
        data-theme={theme}
        data-width={width}
      >
        <a href={tweetUrl}>Loading tweet...</a>
      </blockquote>
    </div>
  );
}

declare global {
  interface Window {
    twttr: any;
  }
}
