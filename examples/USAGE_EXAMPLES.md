# Template Examples

This directory contains examples of how to use the FDD Visual Template for different types of projects.

## Example 1: Map-Based Visualization

```json
// template.config.json
{
  "project": {
    "name": "Iran Infrastructure Analysis",
    "shortName": "iran-infrastructure",
    "githubPages": {
      "baseUrl": "/Iran-Infrastructure/",
      "repository": "Iran-Infrastructure"
    }
  },
  "seo": {
    "title": "Mapping Infrastructure Vulnerabilities in Iran",
    "description": "Interactive analysis of critical infrastructure across Iran with incident mapping and risk assessment.",
    "keywords": ["Iran", "infrastructure", "security", "mapping", "analysis"],
    "canonicalUrl": "https://www.fdd.org/analysis/2025/infrastructure-iran/",
    "ogImage": "https://fddvisuals.github.io/Iran-Infrastructure/images/preview.png"
  },
  "content": {
    "header": {
      "title": "Infrastructure at Risk",
      "subtitle": "Mapping Vulnerabilities Across Iran"
    }
  },
  "interactive": {
    "type": "map",
    "height": "80vh",
    "dataSource": "./infrastructure-data.csv"
  }
}
```

## Example 2: Chart-Based Analysis

```json
// template.config.json
{
  "project": {
    "name": "Economic Sanctions Timeline",
    "shortName": "sanctions-timeline",
    "githubPages": {
      "baseUrl": "/Sanctions-Timeline/",
      "repository": "Sanctions-Timeline"
    }
  },
  "seo": {
    "title": "Timeline of Economic Sanctions: Impact Analysis",
    "description": "Interactive timeline showing the progression and impact of economic sanctions over time.",
    "keywords": ["sanctions", "economics", "timeline", "analysis", "policy"],
    "canonicalUrl": "https://www.fdd.org/analysis/2025/sanctions-timeline/"
  },
  "content": {
    "header": {
      "title": "Sanctions Through Time",
      "subtitle": "Economic Impact and Policy Evolution"
    }
  },
  "interactive": {
    "type": "chart",
    "height": "70vh",
    "dataSource": "./sanctions-data.json"
  }
}
```

## Example 3: Custom Interactive Component

```typescript
// components/CustomAnalysis.tsx
import { InteractiveComponentProps } from '../types/template';
import { BaseInteractive } from './interactive/BaseInteractive';
import { useState, useEffect } from 'react';

interface AnalysisData {
  id: string;
  title: string;
  category: string;
  impact: number;
}

export function CustomAnalysis(props: InteractiveComponentProps) {
  const [data, setData] = useState<AnalysisData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Load your custom data
    fetch(props.dataSource || './analysis-data.json')
      .then(res => res.json())
      .then(setData);
  }, [props.dataSource]);

  const categories = [...new Set(data.map(item => item.category))];
  const filteredData = selectedCategory === 'all' 
    ? data 
    : data.filter(item => item.category === selectedCategory);

  return (
    <BaseInteractive {...props} className="custom-analysis">
      <div style={{ padding: '2rem', height: '100%', overflow: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem' 
        }}>
          {filteredData.map(item => (
            <div key={item.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: 'white'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                {item.title}
              </h3>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                {item.category}
              </p>
              <div style={{ 
                backgroundColor: '#f0f0f0', 
                height: '8px', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#22c55e',
                  width: `${item.impact}%`,
                  height: '100%'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseInteractive>
  );
}

// App.tsx
import { TemplateLayout } from "./components/TemplateLayout";
import { CustomAnalysis } from "./components/CustomAnalysis";

export default function App() {
  return (
    <TemplateLayout 
      customInteractive={<CustomAnalysis />}
    />
  );
}
```

## Example 4: Multiple Interactive Sections

```typescript
// App.tsx - Multiple interactive components
import { TemplateLayout } from "./components/TemplateLayout";
import { MapInteractive } from "./components/interactive/MapInteractive";
import { ChartInteractive } from "./components/interactive/ChartInteractive";

export default function App() {
  return (
    <TemplateLayout>
      {/* First interactive section */}
      <section style={{ marginBottom: '4rem' }}>
        <h2>Geographic Distribution</h2>
        <MapInteractive height="60vh" dataSource="./geographic-data.csv" />
      </section>
      
      {/* Second interactive section */}
      <section style={{ marginBottom: '4rem' }}>
        <h2>Temporal Analysis</h2>
        <ChartInteractive 
          height="50vh" 
          chartType="line"
          dataSource="./temporal-data.json" 
        />
      </section>
    </TemplateLayout>
  );
}
```

## Example 5: Minimal Configuration

```json
// template.config.json - Minimal setup
{
  "project": {
    "name": "Quick Analysis",
    "shortName": "quick-analysis",
    "githubPages": {
      "baseUrl": "/Quick-Analysis/",
      "repository": "Quick-Analysis"
    }
  },
  "seo": {
    "title": "Quick Analysis Template",
    "description": "Rapid deployment analysis template",
    "keywords": ["analysis", "template"],
    "canonicalUrl": "https://www.fdd.org/analysis/quick/"
  },
  "content": {
    "header": {
      "title": "Quick Analysis",
      "subtitle": "Rapid Insights"
    },
    "sections": {
      "enableTextSection": false,
      "enableMethodology": false,
      "enableRelatedProducts": false,
      "enableCredits": true,
      "enableRelatedVisuals": false
    }
  },
  "interactive": {
    "type": "custom",
    "height": "90vh"
  }
}
```

## Migration Examples

### From Existing React Project

1. **Install template dependencies**:
```bash
npm install lucide-react mapbox-gl papaparse react react-dom swiper
```

2. **Copy template files**:
```bash
# Copy these directories to your project
cp -r template/components/ ./
cp -r template/hooks/ ./
cp -r template/types/ ./
cp -r template/scripts/ ./
cp template/template.config.json ./
```

3. **Update your App.tsx**:
```typescript
// Before
export default function App() {
  return (
    <div>
      <Header />
      <YourContent />
      <Footer />
    </div>
  );
}

// After
import { TemplateLayout } from "./components/TemplateLayout";
import { YourContent } from "./components/YourContent";

export default function App() {
  return (
    <TemplateLayout 
      customInteractive={<YourContent />}
    />
  );
}
```

### From Static HTML

1. **Extract content to configuration**:
```json
{
  "seo": {
    "title": "Your Page Title",
    "description": "Your meta description"
  },
  "content": {
    "header": {
      "title": "Your H1 Title",
      "subtitle": "Your subtitle"
    }
  }
}
```

2. **Convert interactive elements**:
```typescript
// Convert your existing JavaScript to React component
export function YourInteractive(props: InteractiveComponentProps) {
  useEffect(() => {
    // Your existing JavaScript here
  }, []);

  return (
    <BaseInteractive {...props}>
      {/* Your existing HTML structure */}
    </BaseInteractive>
  );
}
```
