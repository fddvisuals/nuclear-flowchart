export interface ProjectConfig {
  project: {
    name: string;
    shortName: string;
    githubPages: {
      baseUrl: string;
      repository: string;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl: string;
    ogImage: string;
    author: string;
    type: string;
  };
  content: {
    header: {
      title: string;
      subtitle: string;
    };
    navigation: {
      showHome: boolean;
      customLinks: Array<{
        label: string;
        url: string;
      }>;
    };
    sections: {
      enableTextSection: boolean;
      enableMethodology: boolean;
      enableRelatedProducts: boolean;
      enableCredits: boolean;
      enableRelatedVisuals: boolean;
    };
  };
  interactive: {
    type: 'map' | 'chart' | 'custom';
    availableTypes: string[];
    height: string;
    backgroundColor: string;
    dataSource: string;
  };
  styling: {
    theme: string;
    primaryColor: string;
    accentColor: string;
  };
}

export interface InteractiveComponentProps {
  height?: string;
  width?: string;
  backgroundColor?: string;
  dataSource?: string;
}
