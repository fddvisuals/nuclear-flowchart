# FDD Visual Template - File Structure

## 📁 Organized Modular Structure

```
FDDVisuals-Template-React/
├── 📄 index.html                      # Main HTML entry point
├── 📄 package.json                    # Dependencies and scripts
├── 📄 tsconfig.json                   # TypeScript config for src
├── 📄 tsconfig.node.json              # TypeScript config for build tools
├── 📄 vite.config.ts                  # Vite configuration
├── 📄 README.md                       # Main documentation
│
├── 📁 src/                             # Source code (NEW STRUCTURE)
│   ├── 📄 main.tsx                     # React entry point
│   ├── 📄 App.tsx                      # Original App (for backward compatibility)
│   ├── 📄 AppTemplate.tsx             # Template-driven App
│   ├── 📄 vite-env.d.ts               # Vite type definitions
│   │
│   ├── 📁 components/                  # All React components
│   │   ├── 📄 index.ts                 # Main component exports
│   │   │
│   │   ├── 📁 layout/                  # Layout & structural components
│   │   │   ├── 📄 index.ts             # Layout exports
│   │   │   ├── 📄 Header.tsx           # Configurable page header
│   │   │   ├── 📄 Navigation.tsx       # Top navigation bar
│   │   │   ├── 📄 FDDFooter.tsx        # Footer component
│   │   │   └── 📄 TemplateLayout.tsx   # Main layout orchestrator
│   │   │
│   │   ├── 📁 content/                 # Content section components
│   │   │   ├── 📄 index.ts             # Content exports
│   │   │   ├── 📄 TextSection.tsx      # Main text content + methodology
│   │   │   ├── 📄 Credits.tsx          # Credits section
│   │   │   ├── 📄 RelatedProducts.tsx  # Related products carousel
│   │   │   └── 📄 RelatedVisuals.tsx   # Related visuals section
│   │   │
│   │   ├── 📁 interactive/             # Interactive visualizations
│   │   │   ├── 📄 index.tsx            # Interactive factory & exports
│   │   │   ├── 📄 exports.ts           # Clean export interface
│   │   │   ├── 📄 BaseInteractive.tsx  # Base wrapper component
│   │   │   ├── 📄 MapInteractive.tsx   # Map placeholder component
│   │   │   ├── 📄 ChartInteractive.tsx # Chart placeholder component
│   │   │   ├── 📄 InteractiveContainer.tsx # Legacy interactive (map-based)
│   │   │   ├── 📄 IncidentMap.tsx      # Mapbox incident map
│   │   │   ├── 📄 IncidentModal.tsx    # Incident detail modal
│   │   │   ├── 📄 TweetModal.tsx       # Twitter embed modal
│   │   │   └── 📄 TwitterEmbed.tsx     # Twitter embed component
│   │   │
│   │   ├── 📁 seo/                     # SEO & metadata components
│   │   │   ├── 📄 index.ts             # SEO exports
│   │   │   ├── 📄 EnhancedSEOHead.tsx  # New template-driven SEO
│   │   │   └── 📄 SEOHead.tsx          # Legacy SEO component
│   │   │
│   │   ├── 📁 ui/                      # Reusable UI components (shadcn/ui)
│   │   │   ├── 📄 index.ts             # UI exports
│   │   │   ├── 📄 button.tsx           # Button component
│   │   │   ├── 📄 card.tsx             # Card component
│   │   │   └── 📄 ...                  # Other UI components
│   │   │
│   │   └── 📁 figma/                   # Figma-generated components
│   │       ├── 📄 index.ts             # Figma exports
│   │       └── 📄 ImageWithFallback.tsx # Image component with fallback
│   │
│   ├── 📁 config/                      # Configuration files
│   │   └── 📄 template.config.json     # Main template configuration
│   │
│   ├── 📁 hooks/                       # React hooks
│   │   └── 📄 useTemplateConfig.ts     # Template configuration hook
│   │
│   ├── 📁 types/                       # TypeScript type definitions
│   │   ├── 📄 template.ts              # Template configuration types
│   │   ├── 📄 relatedProducts.ts       # Related products types
│   │   └── 📄 visuals.ts               # Visuals types
│   │
│   ├── 📁 lib/                         # Utility libraries
│   │   └── 📁 utils/                   # Utility functions
│   │       ├── 📄 csvParser.ts         # CSV parsing utilities
│   │       ├── 📄 relatedProductsData.ts # Related products data
│   │       └── 📄 visualsData.ts       # Visuals data
│   │
│   └── 📁 styles/                      # All styling files
│       ├── 📄 globals.css              # Global styles & CSS variables
│       └── 📁 components/              # Component-specific CSS modules
│           ├── 📄 App.module.css       # App component styles
│           ├── 📄 Header.module.css    # Header component styles
│           ├── 📄 Navigation.module.css # Navigation styles
│           ├── 📄 FDDFooter.module.css # Footer styles
│           ├── 📄 TextSection.module.css # Text section styles
│           ├── 📄 Credits.module.css   # Credits styles
│           ├── 📄 RelatedProducts.module.css # Related products styles
│           ├── 📄 RelatedVisuals.module.css # Related visuals styles
│           ├── 📄 InteractiveContainer.module.css # Interactive container styles
│           ├── 📄 IncidentMap.module.css # Map styles
│           ├── 📄 IncidentModal.module.css # Modal styles
│           └── 📄 TweetModal.module.css # Tweet modal styles
│
├── 📁 scripts/                         # Build & automation scripts
│   ├── 📄 build-with-seo.ts           # SEO-enhanced build script
│   ├── 📄 fetch-incidents.ts          # Data fetching script
│   ├── 📄 setup-template.ts           # Template setup automation
│   ├── 📄 template-config-manager.ts  # Configuration management
│   ├── 📄 update-seo.ts               # SEO update script
│   └── 📄 vite-seo-plugin.ts          # Enhanced Vite SEO plugin
│
├── 📁 public/                          # Static assets
│   ├── 📄 incidents-data.csv          # Sample data file
│   ├── 📄 incidents-data.json         # Sample JSON data
│   ├── 📄 incidents-seo.html          # SEO content
│   ├── 📄 incidents-structured-data.json # Structured data
│   └── 📁 images/                      # Image assets
│
├── 📁 examples/                        # Usage examples & documentation
│   └── 📄 USAGE_EXAMPLES.md           # Comprehensive usage examples
│
├── 📁 guidelines/                      # Development guidelines
│   └── 📄 Guidelines.md                # Development guidelines
│
└── 📁 imports/                         # Legacy imports (to be organized)
    ├── 📄 FddVisualsTemplate.tsx       # Legacy template component
    └── 📄 ...                          # Other legacy assets
```

## 🎯 Key Benefits of This Structure

### 📦 **Modular Organization**
- **Components by purpose**: Layout, Content, Interactive, SEO, UI
- **Styles separated**: All CSS modules in dedicated folder
- **Clean exports**: Index files for easy imports
- **Type safety**: Comprehensive TypeScript definitions

### 🔗 **Import Patterns**
```typescript
// Clean component imports
import { TemplateLayout } from '@/components/layout';
import { TextSection, Credits } from '@/components/content';
import { MapInteractive } from '@/components/interactive';
import { SEOHead } from '@/components/seo';

// Configuration and utilities
import { useTemplateConfig } from '@/hooks/useTemplateConfig';
import { ProjectConfig } from '@/types/template';
import { csvParser } from '@/lib/utils/csvParser';

// Styles
import styles from '@/styles/components/Header.module.css';
import '@/styles/globals.css';
```

### 🛠 **Development Workflow**
1. **Configure**: Edit `src/config/template.config.json`
2. **Run setup**: `npm run setup-template`
3. **Develop**: Components auto-load from configuration
4. **Customize**: Override specific components as needed
5. **Build**: `npm run build` with automatic SEO injection

### 📱 **Component Categories**

#### **Layout Components** (`src/components/layout/`)
- Structural elements that appear on every page
- Header, Navigation, Footer, TemplateLayout
- Responsive and configurable through template config

#### **Content Components** (`src/components/content/`)
- Content sections that can be enabled/disabled
- TextSection, Credits, RelatedProducts, RelatedVisuals
- Modular inclusion based on project needs

#### **Interactive Components** (`src/components/interactive/`)
- Main visualization components
- Factory pattern for easy switching between types
- BaseInteractive wrapper for consistent styling

#### **SEO Components** (`src/components/seo/`)
- Metadata and structured data management
- Automatic social sharing optimization
- WordPress embedding support

#### **UI Components** (`src/components/ui/`)
- Reusable design system components
- shadcn/ui compatible
- Consistent styling across projects

### 🎨 **CSS Module Strategy**
- **One CSS file per component** in `src/styles/components/`
- **Global styles** in `src/styles/globals.css`
- **CSS custom properties** for theming
- **Responsive-first** approach

### ⚙️ **Configuration-Driven**
- **Single source of truth**: `template.config.json`
- **Type-safe configuration**: Full TypeScript support
- **Runtime flexibility**: Change behavior without code changes
- **Build-time optimization**: Automatic setup and SEO injection

## 🚀 **Migration Benefits**

1. **Easier maintenance**: Related files are grouped together
2. **Better scalability**: Clear separation of concerns
3. **Improved reusability**: Clean component interfaces
4. **Enhanced developer experience**: Logical file organization
5. **Consistent styling**: Centralized CSS management
6. **Type safety**: Comprehensive TypeScript coverage
