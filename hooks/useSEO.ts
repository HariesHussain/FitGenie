import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

export function useSEO({ title, description, keywords, image = '/logo.png' }: SEOProps) {
  useEffect(() => {
    // Top-level title
    document.title = `${title} | FitGenie AI Coach`;

    // Internal helper to set meta attributes
    const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
      let element = document.querySelector(
        isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`
      );
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', nameOrProperty);
        } else {
          element.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    
    // Open Graph
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    
    // Twitter
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    
  }, [title, description, keywords, image]);
}
