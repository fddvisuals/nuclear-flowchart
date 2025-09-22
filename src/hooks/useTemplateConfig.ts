import { useState, useEffect } from 'react';
import { ProjectConfig } from '../types/template';

export function useTemplateConfig(): ProjectConfig | null {
  const [config, setConfig] = useState<ProjectConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('./config/template.config.json');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        } else {
          console.warn('Could not load template config, using defaults');
        }
      } catch (error) {
        console.error('Error loading template config:', error);
      }
    };

    loadConfig();
  }, []);

  return config;
}

export function getStaticConfig(): ProjectConfig {
  // Fallback config for build-time usage
  return {
    project: {
      name: "FDD Visual Template",
      shortName: "fdd-visual-template",
      githubPages: {
        baseUrl: "/template/",
        repository: "template"
      }
    },
    seo: {
      title: "FDD Visual Template",
      description: "Interactive visual template for FDD projects",
      keywords: ["template", "interactive", "visualization"],
      canonicalUrl: "https://www.fdd.org/",
      ogImage: "/images/preview.png",
      author: "FDD Visuals",
      type: "website"
    },
    content: {
      header: {
        title: "Template Title",
        subtitle: "Template Subtitle"
      },
      navigation: {
        showHome: true,
        customLinks: []
      },
      sections: {
        enableTextSection: true,
        enableMethodology: true,
        enableRelatedProducts: true,
        enableCredits: true,
        enableRelatedVisuals: true
      }
    },
    interactive: {
      type: 'custom',
      availableTypes: ["map", "chart", "custom"],
      height: "100vh",
      backgroundColor: "transparent",
      dataSource: "./data.csv"
    },
    styling: {
      theme: "default",
      primaryColor: "#1a472a",
      accentColor: "#2563eb"
    }
  };
}
