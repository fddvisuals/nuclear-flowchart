# FDD Visual Template

A modular, configuration-driven React template for creating interactive visualizations with standardized SEO and consistent styling.

## Features

- **🔧 Configuration-Driven**: Customize everything through `template.config.json`
- **🎨 Modular Components**: Reusable Header, Navigation, Footer, and Content sections
- **📊 Flexible Interactive Container**: Support for maps, charts, or custom components
- **🔍 Standardized SEO**: Automatic meta tags, structured data, and social sharing
- **📱 Responsive Design**: Mobile-first approach with consistent styling
- **🚀 Easy Deployment**: GitHub Pages ready with automated builds

## Quick Start

### 1. Initial Setup

```bash
# Clone or use this template
npm install

# Setup the template configuration
npm run setup-template

# Start development
npm run dev
```

### 2. Configure Your Project

Edit `template.config.json` to customize your project:

```json
{
  "project": {
    "name": "Your Project Name",
    "shortName": "your-project-name",
    "githubPages": {
      "baseUrl": "/Your-Repository-Name/",
      "repository": "Your-Repository-Name"
    }
  },
  "seo": {
    "title": "Your Page Title",
    "description": "Your page description for SEO",
    "keywords": ["keyword1", "keyword2"],
    "canonicalUrl": "https://www.fdd.org/your-page/",
    "ogImage": "https://yoursite.com/preview.png"
  },
  "content": {
    "header": {
      "title": "Your Main Title",
      "subtitle": "Your Subtitle"
    },
    "sections": {
      "enableTextSection": true,
      "enableMethodology": true,
      "enableRelatedProducts": true,
      "enableCredits": true,
      "enableRelatedVisuals": true
    }
  },
  "interactive": {
    "type": "map",
    "height": "100vh",
    "dataSource": "./your-data.csv"
  }
}
```

### 3. Customize the Interactive Component

Choose from three approaches:

#### Option A: Use Built-in Components
```typescript
// In template.config.json
"interactive": {
  "type": "map", // or "chart"
  // ... other config
}
```

#### Option B: Use Your Custom Component
```typescript
// In your App.tsx
import { TemplateLayout } from "./components/TemplateLayout";
import { YourCustomComponent } from "./components/YourCustomComponent";

export default function App() {
  return (
    <TemplateLayout 
      customInteractive={<YourCustomComponent />}
    />
  );
}
```

#### Option C: Extend the Existing Interactive Container
```typescript
// Modify components/InteractiveContainer.tsx directly
// This maintains backward compatibility
```

## Architecture

### Component Structure

```
components/
├── TemplateLayout.tsx          # Main layout orchestrator
├── EnhancedSEOHead.tsx        # SEO management
├── Header.tsx                 # Configurable header
├── Navigation.tsx             # Navigation bar
├── TextSection.tsx           # Content sections
├── FDDFooter.tsx             # Footer
├── interactive/              # Interactive components
│   ├── index.tsx             # Factory for interactive types
│   ├── BaseInteractive.tsx   # Base wrapper
│   ├── MapInteractive.tsx    # Map placeholder
│   ├── ChartInteractive.tsx  # Chart placeholder
│   └── ...
└── ui/                       # Reusable UI components
```

### Configuration System

- **`template.config.json`**: Main configuration file
- **`hooks/useTemplateConfig.ts`**: React hook for configuration
- **`scripts/template-config-manager.ts`**: Build-time configuration management
- **`types/template.ts`**: TypeScript definitions

### SEO System

The template includes a comprehensive SEO system:

1. **Meta Tags**: Automatic generation from config
2. **Structured Data**: Schema.org JSON-LD
3. **Social Sharing**: Open Graph and Twitter cards
4. **Embedded Mode**: Support for WordPress embedding with `?embedded=true`
5. **Canonical URLs**: Proper canonicalization

## Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run setup-template   # Configure template from config file
npm run build-seo        # Build with SEO optimization
npm run build           # Standard build
npm run preview         # Preview built site
npm run deploy          # Deploy to GitHub Pages
```

### Adding New Interactive Types

1. Create your component in `components/interactive/`
2. Add it to the factory in `components/interactive/index.tsx`
3. Update the TypeScript types in `types/template.ts`
4. Add configuration options to `template.config.json`

Example:

```typescript
// components/interactive/CustomInteractive.tsx
import { InteractiveComponentProps } from '../../types/template';
import { BaseInteractive } from './BaseInteractive';

export function CustomInteractive(props: InteractiveComponentProps) {
  return (
    <BaseInteractive {...props}>
      {/* Your custom content */}
    </BaseInteractive>
  );
}

// Add to components/interactive/index.tsx
import { CustomInteractive } from './CustomInteractive';

export function InteractiveFactory({ type, ...props }) {
  switch (type) {
    case 'custom':
      return <CustomInteractive {...props} />;
    // ... other cases
  }
}
```

## Styling

The template uses CSS Modules for component-specific styling while maintaining global consistency.

### Global Styles
- `styles/globals.css` - Global styles and CSS variables
- Component-specific `.module.css` files

### Customization
Update CSS variables in `styles/globals.css` or configure colors in `template.config.json`:

```json
{
  "styling": {
    "theme": "default",
    "primaryColor": "#1a472a",
    "accentColor": "#2563eb"
  }
}
```

## Deployment

### GitHub Pages

1. Update `template.config.json` with your repository details
2. Run `npm run setup-template`
3. Push to your repository
4. Enable GitHub Pages in repository settings
5. Use GitHub Actions for automated builds (optional)

### Manual Deployment

```bash
npm run build
# Deploy contents of dist/ to your hosting provider
```

## Migration from Existing Projects

To convert an existing FDD visual project to use this template:

1. Copy `template.config.json` to your project
2. Install this template as a dependency or copy the components
3. Update your `App.tsx` to use `TemplateLayout`
4. Move your interactive content to the new structure
5. Run `npm run setup-template`

## Best Practices

1. **Configuration First**: Always update `template.config.json` before making component changes
2. **Modular Development**: Keep interactive components separate and reusable
3. **SEO Optimization**: Use the built-in SEO features rather than manual meta tag management
4. **Responsive Design**: Test on multiple screen sizes
5. **Performance**: Optimize images and data files for web delivery

## Troubleshooting

### Common Issues

1. **SEO not updating**: Run `npm run setup-template` after config changes
2. **Styles not loading**: Check CSS Module imports
3. **Build failures**: Ensure all TypeScript types are properly defined
4. **GitHub Pages 404**: Verify `baseUrl` in config matches repository name

### Getting Help

- Check the existing components for examples
- Review the TypeScript types for available options
- Look at the configuration schema in `types/template.ts`
