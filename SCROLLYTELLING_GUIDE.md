# Scrollytelling Feature Guide

## Overview

The scrollytelling feature provides a narrative-driven experience where text content on the left is synchronized with animated SVG views on the right. As users scroll through the story, the SVG automatically zooms, pans, and highlights relevant elements.

## Architecture

### Files Structure

```
src/
├── data/
│   └── narrativeStages.ts          # Configuration for all narrative stages
├── components/
│   ├── ScrollySVGViewer.tsx        # SVG viewer with animation
│   └── layout/
│       └── ScrollytellingPage.tsx  # Main scrollytelling page
└── App.tsx                         # Routing
```

## How to Edit the Narrative

### 1. Editing Stages

All narrative content is configured in `src/data/narrativeStages.ts`. This file contains an array of `NarrativeStage` objects.

**To add a new stage:**

```typescript
{
  id: 'my-new-stage',
  title: 'Stage Title',
  content: `
    <p class="mb-4">
      Your HTML content here. You can use Tailwind CSS classes.
    </p>
    <p>More paragraphs...</p>
  `,
  svgView: {
    x: 2000,        // X coordinate to center on
    y: 1000,        // Y coordinate to center on
    scale: 2,       // Zoom level (1 = 100%, 2 = 200%)
    duration: 1000  // Animation duration in ms
  },
  highlightIds: ['main1-fp', 'main2-fp'],  // SVG element IDs to highlight
  dimOthers: true,                         // Dim non-highlighted elements
  hideIds: [],                             // Optional: IDs to hide completely
  backgroundColor: '#f9fafb'               // Optional: background color
}
```

### 2. Finding SVG Coordinates

The SVG viewBox is `0 0 4973 2319`. To find coordinates:

1. Open `public/main-new.svg` in a text editor
2. Find the element you want to focus on
3. Look for its position attributes (x, y, transform, etc.)
4. Use those coordinates in your stage configuration

**Quick reference:**
- Full width: 4973
- Full height: 2319
- Center: x=2486, y=1159
- Left side (Fuel Production): x=0-2400
- Right side (Fuel Weaponization): x=2500-4973

### 3. Highlighting Elements

To highlight specific SVG elements:

1. Open `public/main-new.svg` and find element IDs
2. Add those IDs to the `highlightIds` array
3. Set `dimOthers: true` to make non-highlighted elements fade

**Example:**
```typescript
highlightIds: ['main1-fp', 'operational_1'],
dimOthers: true
```

### 4. Zoom Levels

The `scale` property controls zoom:
- `scale: 1` - Normal view (100%)
- `scale: 2` - 2x zoom (shows half the width/height)
- `scale: 3` - 3x zoom (shows one third)
- `scale: 0.5` - Zoom out (shows twice the area)

### 5. Animation Timing

The `duration` property (in milliseconds) controls how fast the SVG transitions:
- `duration: 500` - Fast (0.5 seconds)
- `duration: 1000` - Normal (1 second) - default
- `duration: 2000` - Slow (2 seconds)

## How It Works

### Scroll Detection

The page uses **Intersection Observer API** to detect which narrative box is in view:

```typescript
rootMargin: '-40% 0px -40% 0px'
```

This triggers when an element enters the middle 20% of the viewport, providing smooth transitions.

### SVG Animation

The `ScrollySVGViewer` component:
1. Loads the SVG from `public/main-new.svg`
2. Animates the `viewBox` attribute with easing
3. Applies opacity and filter effects for highlighting
4. Uses CSS transitions for smooth visual changes

### Navigation

Simple hash-based routing:
- `#` or empty → Main interactive map
- `#story` → Scrollytelling page

## Customization Tips

### Styling Text Content

Use Tailwind CSS classes in your HTML content:

```typescript
content: `
  <p class="text-lg font-bold text-blue-600 mb-4">
    Important point
  </p>
  <ul class="list-disc list-inside space-y-2">
    <li>Bullet point 1</li>
    <li>Bullet point 2</li>
  </ul>
`
```

### Multiple Highlights

You can highlight multiple elements from different parts of the SVG:

```typescript
highlightIds: [
  'main1-fp',      // First main section
  'main5-fp',      // Another section
  'operational_2'  // Specific facility
]
```

### Hiding Elements

To completely hide certain elements:

```typescript
hideIds: ['background-layer', 'annotations']
```

### Stage-Specific Backgrounds

Each stage can have its own background color:

```typescript
backgroundColor: '#1e3a8a'  // Dark blue
```

## Testing Your Changes

1. Edit `src/data/narrativeStages.ts`
2. Save the file
3. Navigate to `#story` in your browser
4. Scroll through to see your changes
5. Check browser console for any errors

## Tips for Creating Good Narratives

1. **Start Wide, End Wide**: Begin with a full overview, zoom into details, then return to overview
2. **Smooth Transitions**: Don't jump too far between stages (keep x/y changes < 1000)
3. **Consistent Zoom Speeds**: Use similar `duration` values for a cohesive feel
4. **Progressive Disclosure**: Introduce one concept per stage
5. **Visual Emphasis**: Use `dimOthers: true` when focusing on specific elements
6. **Test on Mobile**: The responsive layout adapts for smaller screens

## Common SVG Element Patterns

Based on the SVG structure, common ID patterns:

- Main groups: `main1-fp`, `main2-fp`, ..., `main1-fw`, `main2-fw`
- Status groups: `operational_1`, `destroyed_2`, `unknown_3`
- Category groups: `fp-fuelproduction-blue`, `fw-fuelweaponization-black`

## Troubleshooting

**SVG not loading:**
- Check that `public/main-new.svg` exists
- Verify `BASE_URL` in Vite config

**Elements not highlighting:**
- Open browser DevTools → Elements
- Find the SVG and verify the ID exists
- Make sure the ID matches exactly (case-sensitive)

**Jumpy animations:**
- Reduce the distance between x/y coordinates
- Increase `duration` for smoother transitions
- Check that scale values don't change too dramatically

**Text not updating:**
- Verify HTML is valid
- Check for syntax errors in the content string
- Make sure you're using template literals (backticks)

## Future Enhancements

Potential improvements:
- Add keyboard navigation (arrow keys)
- Progress indicator in header
- Direct stage navigation menu
- Mobile-optimized layout (stack vertically)
- Audio narration support
- Share specific stages via URL parameters
