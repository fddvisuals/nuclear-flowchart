# Post-Strike Assessment: Israeli and U.S. Strikes Caused Major Bottlenecks in Iran’s Nuclear Weapons Supply Chain Viewer

A comprehensive React + Tailwind CSS application for visualizing Iran's nuclear manufacturing flowchart with interactive filtering and dual view modes.

## Features

### 🔄 Dual View Modes
- **Flowchart View**: Interactive SVG visualization with zoom, pan, and click functionality
- **Stack View**: Hierarchical breakdown showing stages → components → sub-items

### 🎯 Advanced Filtering
- Filter by **Stage Type**: Fuel Production vs Weaponization
- Filter by **Status**: Operational, Confirmed, Disputed, Unknown, Destroyed, Underground
- Real-time highlighting and opacity adjustments based on active filters

### 🖱️ Interactive Features
- **Click to Highlight**: Select multiple items for comparison
- **Zoom & Pan**: Mouse wheel zoom and drag navigation in flowchart view
- **Expandable Hierarchy**: Collapsible sections in stack view
- **Search Functionality**: Find specific locations quickly

### 📊 Data Structure
The application organizes nuclear facilities into two major stages:

#### Fuel Production (Dark Blue #00558C)
- Centrifuge Component Manufacturing
- Centrifuge Manufacturing & Testing
- Uranium Mining & Processing
- Uranium Conversion & Enrichment
- HEU Storage
- Fuel Manufacturing

#### Weaponization (Black #1E1E1E)
- Nuclear Warhead Design & Development
- Nuclear Warhead Fabrication & Assembly
- Delivery Systems
- Nuclear Testing

### 🎨 Status Color Coding
- **Operational**: Green (#9FE2AA) - Active facilities
- **Confirmed**: Light Red (#FFC7C2) - Verified locations
- **Disputed**: Light Orange (#FFE0C2) - Uncertain status
- **Unknown**: Gray (#DCDCDC) - Status unknown
- **Destroyed**: Red (#FFB3B3) - Destroyed facilities
- **Underground**: Purple (#DCCCFF) - Underground/buried facilities

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

## Project Structure
```
src/
├── components/
│   ├── SVGViewer.tsx      # Interactive SVG flowchart component
│   ├── StackView.tsx      # Hierarchical list view component
│   └── FilterPanel.tsx    # Filter controls and legend
├── data/
│   └── nuclearData.ts     # Structured data and type definitions
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

## Usage Guide

### Flowchart View
1. **Navigation**: Use mouse wheel to zoom, click and drag to pan
2. **Selection**: Click on any facility to highlight it
3. **Filtering**: Use the sidebar filters to focus on specific categories
4. **Reset**: Use the reset button to return to default zoom/position

### Stack View
1. **Hierarchy**: Stages contain components, which contain sub-items (locations)
2. **Expansion**: Click the chevron arrows to expand/collapse sections
3. **Details**: Each location shows status, coordinates, and additional information
4. **Statistics**: Summary panel shows counts and casualty information

### Filtering System
- **All**: Shows all items (default)
- **Stage Filters**: Filter by Fuel Production or Weaponization
- **Status Filters**: Filter by facility status/condition
- **Multiple Selection**: Combine multiple filters for precise targeting

## Key Components

### Data Structure
- **Stages**: Two main categories (Fuel Production, Weaponization)
- **Components**: Functional groups within each stage
- **Sub-items**: Individual facilities/locations with coordinates and status

### Interactive Features
- **Highlighting**: Visual feedback for selected items
- **Real-time Filtering**: Instant visual updates based on filter selection
- **Responsive Design**: Works on various screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## Technology Stack
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast development and build tool
- **Lucide React**: Icon library

## Technical Notes

### SVG Rendering
- Original SVG dimensions: 2247×5174 pixels
- Scalable vector graphics maintain quality at all zoom levels
- Interactive elements with hover and click states

### Performance Optimizations
- Memoized callbacks to prevent unnecessary re-renders
- Efficient filtering algorithms
- Optimized event handlers for smooth interactions

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and tablet devices

## License
This project is for educational and analytical purposes.