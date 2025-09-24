import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import { TemplateConfigManager } from './template-config-manager';

export function injectSEODataPlugin(): Plugin {
  return {
    name: 'inject-seo-data',
    configResolved() {
      // Setup template configuration during build
      const configManager = new TemplateConfigManager();
      const config = configManager.loadConfig();
      configManager.generateStructuredData(config);
    },
    transformIndexHtml: {
      order: 'post',
      handler(html: string) {
        try {
          let modifiedHtml = html;
          
          // Inject structured data
          const structuredDataPath = path.join(process.cwd(), 'public', 'structured-data.json');
          if (fs.existsSync(structuredDataPath)) {
            const structuredData = fs.readFileSync(structuredDataPath, 'utf-8');
            modifiedHtml = modifiedHtml.replace(
              '<script type="application/ld+json" id="structured-data">\n    </script>',
              `<script type="application/ld+json" id="structured-data">\n${structuredData}\n    </script>`
            );
          }
          
          // Also check for legacy structured data file
          const legacyStructuredDataPath = path.join(process.cwd(), 'public', 'incidents-structured-data.json');
          if (fs.existsSync(legacyStructuredDataPath)) {
            const legacyStructuredData = fs.readFileSync(legacyStructuredDataPath, 'utf-8');
            modifiedHtml = modifiedHtml.replace(
              '<script type="application/ld+json" id="incidents-structured-data">\n    </script>',
              `<script type="application/ld+json" id="incidents-structured-data">\n${legacyStructuredData}\n    </script>`
            );
          }
          
          return modifiedHtml;
        } catch (error) {
          console.warn('Warning: Could not inject SEO data:', error);
          return html;
        }
      }
    }
  };
}
