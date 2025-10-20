/**
 * Narrative Scrollytelling Configuration
 * 
 * This file contains the configuration for each stage of the narrative.
 * Each stage defines what text to show and how to display the SVG.
 * 
 * To add or modify stages:
 * 1. Add/edit an entry in the narrativeStages array
 * 2. Set the title and content (supports HTML)
 * 3. Define SVG view (x, y, scale)
 * 4. Specify which elements to highlight (use SVG element IDs)
 * 5. Optionally set which elements to dim (all others will be dimmed)
 */

export interface SVGViewConfig {
  /** X position of the viewBox (left edge) */
  x: number;
  /** Y position of the viewBox (top edge) */
  y: number;
  /** Scale factor (1 = 100%, 2 = 200% zoom, 0.5 = 50% zoom out) */
  scale: number;
  /** Duration of the animation in milliseconds */
  duration?: number;
}

export interface NarrativeStage {
  /** Unique identifier for this stage */
  id: string;
  /** Title of this narrative section */
  title: string;
  /** Main content text (supports HTML) */
  content: string;
  /** SVG view configuration */
  svgView: SVGViewConfig;
  /** Array of SVG element IDs to highlight */
  highlightIds?: string[];
  /** If true, dims everything except highlighted elements */
  dimOthers?: boolean;
  /** Optional: specific elements to fade out completely */
  hideIds?: string[];
  /** Optional: background color for this stage */
  backgroundColor?: string;
}

/**
 * EDIT THIS ARRAY TO MODIFY THE NARRATIVE
 * 
 * SVG Coordinate Reference (from main-new.svg):
 * - Full viewBox: 0 0 4973 2319
 * - Center: ~2486, ~1159
 * - Fuel Production (left/blue side): x: 0-2400
 * - Fuel Weaponization (right/black side): x: 2500-4973
 */
export const narrativeStages: NarrativeStage[] = [
  {
    id: 'intro',
    title: 'Iran\'s Nuclear Program',
    content: `
      <p class="mb-4">
        Iran's nuclear infrastructure is a complex network of facilities spanning 
        fuel production and weaponization capabilities.
      </p>
      <p>
        This visualization maps the entire ecosystem, from uranium mining to 
        potential weapons development.
      </p>
    `,
    svgView: {
      x: 0,
      y: 0,
      scale: 1, // Full view
      duration: 1000,
    },
    dimOthers: false,
  },
  
  {
    id: 'fuel-production-overview',
    title: 'Fuel Production Pipeline',
    content: `
      <p class="mb-4">
        The fuel production side (blue) represents the pathway from raw uranium 
        to enriched nuclear fuel.
      </p>
      <p>
        This includes mining, milling, conversion, enrichment, and fuel manufacturing 
        facilities.
      </p>
    `,
    svgView: {
      x: 0,
      y: 200,
      scale: 1.5, // Zoom into left side
      duration: 1200,
    },
    highlightIds: ['fp-fuelproduction-blue'],
    dimOthers: false,
  },
  
  {
    id: 'uranium-mining',
    title: 'Stage 1: Uranium Mining',
    content: `
      <p class="mb-4">
        Iran operates several uranium mining sites, with Saghand being the primary 
        operational mine.
      </p>
      <p class="text-sm text-gray-600">
        <strong>Key facilities:</strong> Saghand 1 & 2, Gchine, Narigan
      </p>
    `,
    svgView: {
      x: 100,
      y: 1800,
      scale: 0.8, // Close zoom on mining section
      duration: 200,
    },
    highlightIds: ['main1-fp'], // Adjust based on actual SVG IDs
    dimOthers: false,
  },
  
  {
    id: 'enrichment',
    title: 'Stage 2: Uranium Enrichment',
    content: `
      <p class="mb-4">
        The enrichment facilities use centrifuges to increase the concentration 
        of U-235 isotope.
      </p>
      <p class="text-sm text-gray-600">
        <strong>Major sites:</strong> Natanz, Fordow - both have been targets 
        of strikes and sabotage.
      </p>
    `,
    svgView: {
      x: 800,
      y: 800,
      scale: 2.5,
      duration: 1000,
    },
    highlightIds: ['main7-fp'], // Adjust based on actual SVG IDs
    dimOthers: true,
  },
  
  {
    id: 'fuel-weaponization-overview',
    title: 'Weaponization Capabilities',
    content: `
      <p class="mb-4">
        The weaponization side (black) represents facilities involved in potential 
        nuclear weapons development.
      </p>
      <p>
        This includes warhead assembly, explosives development, and weapons-grade 
        material production.
      </p>
    `,
    svgView: {
      x: 1000,
      y: 200,
      scale: 0, // Zoom into right side
      duration: 1200,
    },
    highlightIds: ['fw-fuelweaponization-black'],
    dimOthers: false,
  },
  
  {
    id: 'warhead-assembly',
    title: 'Nuclear Warhead Assembly',
    content: `
      <p class="mb-4">
        Intelligence suggests facilities at Parchin have been involved in warhead 
        assembly research and testing.
      </p>
      <p class="text-sm text-red-600">
        <strong>Status:</strong> Most weaponization facilities have been destroyed 
        or are non-operational.
      </p>
    `,
    svgView: {
      x: 2600,
      y: 300,
      scale: 3,
      duration: 1000,
    },
    highlightIds: ['main1-fw'], // Adjust based on actual SVG IDs
    dimOthers: true,
  },
  
  {
    id: 'destroyed-facilities',
    title: 'Impact of Strikes',
    content: `
      <p class="mb-4">
        Red boxes indicate facilities that have been destroyed through military 
        strikes or sabotage operations.
      </p>
      <p>
        Recent Israeli strikes have significantly degraded Iran's nuclear capabilities, 
        particularly in weapons development.
      </p>
    `,
    svgView: {
      x: 1000,
      y: 400,
      scale: 1.2,
      duration: 1000,
    },
    // This would highlight all destroyed facilities - you'll need to add specific IDs
    highlightIds: [], // Add destroyed facility IDs
    dimOthers: false,
  },
  
  {
    id: 'conclusion',
    title: 'The Complete Picture',
    content: `
      <p class="mb-4">
        Iran's nuclear program represents a complex web of facilities at various 
        operational states.
      </p>
      <p class="mb-4">
        While fuel production continues, most weaponization infrastructure has been 
        neutralized or rendered non-operational.
      </p>
      <p class="text-sm text-gray-600">
        Continue to explore the interactive visualization to learn more about 
        each facility.
      </p>
    `,
    svgView: {
      x: 0,
      y: 0,
      scale: 1, // Back to full view
      duration: 1500,
    },
    dimOthers: false,
  },
];

/**
 * Helper function to get a stage by ID
 */
export function getStageById(id: string): NarrativeStage | undefined {
  return narrativeStages.find(stage => stage.id === id);
}

/**
 * Helper function to get the next stage
 */
export function getNextStage(currentId: string): NarrativeStage | undefined {
  const currentIndex = narrativeStages.findIndex(stage => stage.id === currentId);
  if (currentIndex === -1 || currentIndex === narrativeStages.length - 1) {
    return undefined;
  }
  return narrativeStages[currentIndex + 1];
}

/**
 * Helper function to get the previous stage
 */
export function getPreviousStage(currentId: string): NarrativeStage | undefined {
  const currentIndex = narrativeStages.findIndex(stage => stage.id === currentId);
  if (currentIndex <= 0) {
    return undefined;
  }
  return narrativeStages[currentIndex - 1];
}
