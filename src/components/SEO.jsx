import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig, generateSchemaGraph } from '../config/site';

/**
 * Dynamic SEO, AEO, and AX Component for Zoth Studio v2
 * Updates runtime document head metadata and injects Schema.org JSON-LD graph.
 */
export default function SEO({ title: customTitle, description: customDescription, path: customPath }) {
  const location = useLocation();
  const currentPath = customPath || location.pathname;
  const routeMeta = siteConfig.routes[currentPath] || {
    title: `${siteConfig.name} // Sovereign Agent Studio`,
    description: siteConfig.description,
    keywords: siteConfig.keywords.join(', '),
    type: 'website'
  };

  const pageTitle = customTitle || routeMeta.title;
  const pageDescription = customDescription || routeMeta.description;
  const canonicalUrl = `${siteConfig.url}${currentPath === '/' ? '' : currentPath}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = pageTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attribute, name, content) => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', pageDescription);
    setMetaTag('name', 'keywords', routeMeta.keywords || siteConfig.keywords.join(', '));
    setMetaTag('name', 'author', siteConfig.author);
    setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // 3. Open Graph Tags
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', routeMeta.type || 'website');
    setMetaTag('property', 'og:site_name', siteConfig.name);
    setMetaTag('property', 'og:image', siteConfig.ogImage);

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', siteConfig.twitterHandle);
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);
    setMetaTag('name', 'twitter:image', siteConfig.ogImage);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 6. Schema.org JSON-LD Graph Injection
    let schemaScript = document.getElementById('zoth-schema-graph');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('id', 'zoth-schema-graph');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateSchemaGraph(currentPath));

  }, [currentPath, pageTitle, pageDescription, canonicalUrl, routeMeta]);

  return null;
}
