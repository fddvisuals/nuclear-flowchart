import fs from 'fs';
import path from 'path';
import { ProjectConfig } from '../src/types/template';

export class TemplateConfigManager {
  private configPath: string;
  private publicPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.configPath = path.join(projectRoot, 'src/config/template.config.json');
    this.publicPath = path.join(projectRoot, 'public');
  }

  loadConfig(): ProjectConfig {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(configContent);
    } catch (error) {
      console.warn('Could not load template.config.json, using defaults');
      return this.getDefaultConfig();
    }
  }

  updateViteConfig(config: ProjectConfig) {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    
    try {
      let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
      
      // Update base URL for GitHub Pages
      const baseUrlRegex = /base:\s*['"`][^'"`]*['"`]/;
      const newBaseUrl = `base: '${config.project.githubPages.baseUrl}'`;
      
      if (baseUrlRegex.test(viteConfig)) {
        viteConfig = viteConfig.replace(baseUrlRegex, newBaseUrl);
      } else {
        // Add base URL if it doesn't exist
        viteConfig = viteConfig.replace(
          /export default defineConfig\(\{/,
          `export default defineConfig({\n  ${newBaseUrl},`
        );
      }
      
      fs.writeFileSync(viteConfigPath, viteConfig);
      console.log('✅ Updated vite.config.ts with project base URL');
    } catch (error) {
      console.warn('Could not update vite.config.ts:', error);
    }
  }

  updatePackageJson(config: ProjectConfig) {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Update name and homepage
      packageJson.name = config.project.shortName;
      packageJson.homepage = `https://fddvisuals.github.io/${config.project.githubPages.repository}`;
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json with project settings');
    } catch (error) {
      console.warn('Could not update package.json:', error);
    }
  }

  generateIndexHtml(config: ProjectConfig) {
    const indexHtmlPath = path.join(process.cwd(), 'index.html');
    
    const htmlTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://use.typekit.net/vlo7ifg.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Dynamic SEO content - will be updated by TemplateConfigManager -->
    <title>${config.seo.title}</title>
    <meta name="description" content="${config.seo.description}">
    <meta name="keywords" content="${config.seo.keywords.join(', ')}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${config.seo.type}">
    <meta property="og:url" content="${config.seo.canonicalUrl}">
    <meta property="og:title" content="${config.seo.title}">
    <meta property="og:description" content="${config.seo.description}">
    <meta property="og:image" content="${config.seo.ogImage}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${config.seo.canonicalUrl}">
    <meta property="twitter:title" content="${config.seo.title}">
    <meta property="twitter:description" content="${config.seo.description}">
    <meta property="twitter:image" content="${config.seo.ogImage}">
    
    <!-- Additional SEO -->
    <meta name="robots" content="index, follow">
    <meta name="author" content="${config.seo.author}">
    <link rel="canonical" href="${config.seo.canonicalUrl}">
    
    <!-- Structured Data for SEO -->
    <script type="application/ld+json" id="structured-data">
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>`;

    fs.writeFileSync(indexHtmlPath, htmlTemplate);
    console.log('✅ Generated index.html with SEO configuration');
  }

  generateStructuredData(config: ProjectConfig) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": config.seo.title,
      "description": config.seo.description,
      "url": config.seo.canonicalUrl,
      "author": {
        "@type": "Organization",
        "name": config.seo.author
      },
      "publisher": {
        "@type": "Organization",
        "name": config.seo.author
      },
      "image": config.seo.ogImage,
      "inLanguage": "en-US"
    };

    const structuredDataPath = path.join(this.publicPath, 'structured-data.json');
    
    if (!fs.existsSync(this.publicPath)) {
      fs.mkdirSync(this.publicPath, { recursive: true });
    }
    
    fs.writeFileSync(structuredDataPath, JSON.stringify(structuredData, null, 2));
    console.log('✅ Generated structured data JSON');
    
    return structuredData;
  }

  private getDefaultConfig(): ProjectConfig {
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
}
