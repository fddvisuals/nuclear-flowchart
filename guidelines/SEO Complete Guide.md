# SEO Implementation Guide - FDD Visual Template

## Overview
This document covers the complete SEO implementation for the FDD Visual Template, including automated scripts, structured data, and penalty-safe optimization strategies.

## 🎯 SEO Problem & Solution

### The Challenge
- **Dynamic Data Loading**: Google Sheets data loaded in browser, invisible to crawlers
- **Poor Search Indexing**: No structured data for rich snippets
- **Template Scalability**: Need standardized SEO across all FDD visual projects

### ✅ Our Solution
- **Build-time Data Fetching**: Fresh data from Google Sheets during build
- **Penalty-Safe Pre-rendering**: Static HTML with proper structured data
- **Automated SEO Pipeline**: No manual SEO work required
- **Template-Driven Configuration**: Consistent SEO across all projects

---

## 🛠 Automated SEO Scripts

### Available Scripts

#### `npm run setup-template`
**Use this to configure your project SEO**
- Updates all SEO meta tags from `template.config.json`
- Generates structured data based on your project
- Updates `index.html` with proper meta tags
- Copies configuration for runtime access

#### `npm run update-seo` 
**Use this to refresh data-driven SEO**
- Fetches latest data from Google Sheets
- Generates fresh JSON-LD structured data with ALL incidents
- Updates HTML template with fresh data
- Perfect for content updates

#### `npm run build-seo`
**Automatically runs before builds**
- Combines template configuration with fresh data
- Generates comprehensive SEO package
- Runs automatically via `prebuild` script

#### `npm run build`
**Your normal build process with SEO**
1. Runs `npm run build-seo` automatically
2. Runs Vite build process  
3. Results in optimized bundle with fresh SEO

---

## ⚙️ Configuration-Driven SEO

### Template Configuration (`src/config/template.config.json`)
```json
{
  "seo": {
    "title": "Your Project Title",
    "description": "Your comprehensive project description for search engines",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "canonicalUrl": "https://www.fdd.org/your-analysis/",
    "ogImage": "https://yoursite.com/images/preview.png",
    "author": "FDD Visuals",
    "type": "website"
  }
}
```

### Environment Variables
```bash
# .env file
VITE_GOOGLE_SHEETS_CSV_URL=your_google_sheets_csv_url_here
```

---

## 📊 Structured Data Implementation

### Multiple Schema Types

#### 1. Dataset Schema (For Data Projects)
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Your Dataset Name",
  "description": "Comprehensive description of your dataset",
  "url": "https://www.fdd.org/your-project/",
  "temporalCoverage": "2024-2025",
  "spatialCoverage": {
    "@type": "Place",
    "geo": {
      "@type": "GeoShape",
      "addressCountry": "US"
    }
  },
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "/your-data.json"
    }
  ],
  "keywords": ["analysis", "data", "research"],
  "creator": {
    "@type": "Organization",
    "name": "FDD Visuals",
    "url": "https://www.fdd.org"
  }
}
```

#### 2. WebPage Schema (Universal)
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title from Config",
  "description": "Page description from config",
  "url": "Canonical URL from config",
  "author": {
    "@type": "Organization",
    "name": "FDD Visuals"
  },
  "publisher": {
    "@type": "Organization", 
    "name": "FDD Visuals"
  },
  "image": "OG Image from config",
  "inLanguage": "en-US"
}
```

#### 3. Event Schema (For Incident Data)
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Incident Database",
  "numberOfItems": 30,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Event",
        "name": "Incident Description",
        "location": {
          "@type": "Place",
          "name": "City, Province",
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 35.752,
            "longitude": 51.304
          }
        },
        "startDate": "2025-06-25",
        "endDate": "2025-06-25",
        "additionalType": ["https://schema.org/Explosion"],
        "keywords": "Explosion",
        "organizer": {
          "@type": "Organization",
          "name": "FDD Visuals"
        }
      }
    }
  ]
}
```

---

## 🔍 Penalty-Safe Content Strategy

### The Problem with Hidden Content
❌ **Dangerous Approaches:**
- `position: absolute; left: -10000px` (cloaking risk)
- Different content for users vs crawlers
- Invisible text with `color: transparent`

### ✅ Our Safe Solution

#### Static HTML for Crawlers
```html
<!-- Safe method - accessible to search engines -->
<div id="seo-content" style="display: none;">
  <section itemscope itemtype="https://schema.org/Dataset">
    <meta itemprop="name" content="Your Dataset">
    <article itemscope itemtype="https://schema.org/Event">
      <h3 itemprop="name">Event Title</h3>
      <div itemprop="location" itemscope itemtype="https://schema.org/Place">
        <span itemprop="name">Location</span>
        <meta itemprop="latitude" content="35.752">
        <meta itemprop="longitude" content="51.304">
      </div>
      <time itemprop="startDate" datetime="2025-06-25">June 25, 2025</time>
      <p itemprop="description">Event description...</p>
    </article>
  </section>
</div>

<!-- Fallback for users without JavaScript -->
<noscript>
  <div id="fallback-content">
    <h2>Data Browser Fallback</h2>
    <p>This content appears when JavaScript is disabled</p>
    <!-- Basic HTML version of your data -->
  </div>
</noscript>
```

#### Why This is Safe
1. **Standard CSS hiding**: `display: none` is accepted for legitimate purposes
2. **noscript fallback**: Genuine value for users without JavaScript  
3. **No content duplication**: Different presentations, same information
4. **Accessible**: Available to screen readers and assistive technology

---

## 🚀 Build Process Integration

### Automated Pipeline
```bash
# What happens during build:
1. Template setup (from config)
2. Fresh data fetch (from Google Sheets)  
3. Structured data generation
4. HTML injection
5. Vite build process
```

### File Generation
```
public/
├── config/
│   └── template.config.json     # Runtime config access
├── your-data.csv                # Fresh CSV data
├── your-data.json               # Parsed JSON data
├── structured-data.json         # Generated JSON-LD
└── seo-content.html            # Pre-rendered HTML

dist/
└── index.html                   # Final HTML with injected SEO
```

### Workflow Integration
```json
{
  "scripts": {
    "setup-template": "tsx scripts/setup-template.ts",
    "fetch-data": "tsx scripts/fetch-incidents.ts", 
    "build-seo": "tsx scripts/build-with-seo.ts",
    "prebuild": "npm run build-seo",
    "build": "vite build"
  }
}
```

---

## 📈 SEO Benefits

### For Search Engines
✅ **Complete Content Indexing**: All data visible in HTML source  
✅ **Rich Snippets**: Dataset, Event, and Organization markup  
✅ **Proper Meta Tags**: Title, description, keywords optimized  
✅ **Multi-level Structured Data**: JSON-LD + microdata  
✅ **Fast Crawling**: No JavaScript required for content access  

### For Users  
✅ **Instant Loading**: Pre-built data loads immediately  
✅ **Interactive Features**: Full React functionality preserved  
✅ **Responsive Design**: Works on all devices  
✅ **Real-time Updates**: Fresh data on each build  

### For Developers
✅ **Configuration-Driven**: Single source of truth for SEO settings  
✅ **Automated Pipeline**: No manual SEO work required  
✅ **Template Reusability**: Same system across all FDD projects  
✅ **Fallback Safety**: Works even if external data fails  

---

## 🔧 Setup Instructions

### 1. Project Configuration
```bash
# 1. Update your project settings
# Edit src/config/template.config.json with your project details

# 2. Set up environment variables  
# Create .env file with your Google Sheets URL
VITE_GOOGLE_SHEETS_CSV_URL=your_sheets_url

# 3. Run initial setup
npm run setup-template
```

### 2. Development Workflow
```bash
# Regular development
npm run dev

# When you need fresh data
npm run update-seo

# Build for production (includes SEO automatically)
npm run build
```

### 3. Deployment
```bash
# GitHub Pages (automatic)
npm run deploy

# Manual deployment
npm run build
# Deploy contents of dist/ folder
```

---

## ✅ Validation & Testing

### Recommended Tools
- **Google Rich Results Test**: Test structured data recognition
- **Schema.org Validator**: Verify JSON-LD markup  
- **Facebook Sharing Debugger**: Check Open Graph implementation
- **Twitter Card Validator**: Verify Twitter meta tags
- **Lighthouse SEO Audit**: Overall SEO health check

### Validation Checklist
- [ ] All meta tags present and unique
- [ ] Structured data validates without errors
- [ ] Open Graph image loads correctly
- [ ] Canonical URL is correct
- [ ] No duplicate content warnings
- [ ] Rich snippets preview correctly

---

## 🏗 Template Architecture

### SEO Component System
```
src/components/seo/
├── EnhancedSEOHead.tsx         # Main SEO component
├── index.ts                    # SEO exports
└── LegacySEOHead.tsx          # Backward compatibility

src/config/
└── template.config.json        # SEO configuration

scripts/
├── template-config-manager.ts  # Configuration management
├── setup-template.ts          # Project setup automation
├── build-with-seo.ts          # SEO build integration
└── vite-seo-plugin.ts         # Vite integration
```

### Usage in Components
```typescript
import { SEOHead, useStructuredData } from '@/components/seo';
import { useTemplateConfig } from '@/hooks/useTemplateConfig';

function MyComponent() {
  const config = useTemplateConfig();
  const structuredData = useStructuredData(config?.seo);
  
  return (
    <>
      <SEOHead 
        config={config?.seo}
        structuredData={structuredData}
      />
      {/* Your component content */}
    </>
  );
}
```

---

## 🔄 Migration from Legacy SEO

### If you have existing FDD projects:
1. **Copy template files** to your project
2. **Create `template.config.json`** with your project details  
3. **Update imports** to use new SEO components
4. **Run setup script** to generate optimized SEO
5. **Test and deploy** with automated pipeline

### Backward Compatibility
The template includes legacy SEO components for smooth migration without breaking existing projects.

---

This unified SEO system provides enterprise-level optimization while maintaining the interactive user experience FDD's audience expects. The configuration-driven approach ensures consistency across all FDD visual projects while allowing for project-specific customization.
