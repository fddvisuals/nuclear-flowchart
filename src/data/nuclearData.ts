export type StatusType = 'operational' | 'unknown' | 'construction' | 'likely-destroyed' | 'destroyed';

export interface SubItem {
  id: string;
  name: string;
  status: StatusType;
  description?: string;
  coordinates?: { x: number; y: number };
}

export interface Component {
  id: string;
  name: string;
  type: 'fuel-production' | 'fuel-weaponization';
  subItems: SubItem[];
  coordinates?: { x: number; y: number };
}

export interface Stage {
  id: string;
  name: string;
  type: 'fuel-production' | 'fuel-weaponization';
  components: Component[];
  color: string;
}

// Nuclear Manufacturing Data Structure
export const nuclearData: Stage[] = [
  {
    id: 'fuel-production',
    name: 'Fuel Production',
    type: 'fuel-production',
    color: '#00558C',
    components: [
      {
        id: 'centrifuge-components',
        name: 'Centrifuge Component Manufacturing Companies',
        type: 'fuel-production',
        coordinates: { x: 0, y: 0 },
        subItems: [
          {
            id: 'unknown-site-1',
            name: 'Unknown site(s)',
            status: 'unknown',
            coordinates: { x: 87, y: 112 }
          }
        ]
      },
      {
        id: 'centrifuge-manufacturing',
        name: 'Centrifuge Manufacturing',
        type: 'fuel-production',
        coordinates: { x: 416, y: 0 },
        subItems: [
          {
            id: 'taba-tesa-karaj',
            name: 'TABA/TESA Karaj Site',
            status: 'destroyed',
            coordinates: { x: 503, y: 112 }
          },
          {
            id: 'esfahan-site',
            name: 'Esfahan Site',
            status: 'destroyed',
            coordinates: { x: 503, y: 224 }
          },
          {
            id: 'kalaye-electric',
            name: 'Kalaye Electric/Damavand Rd',
            status: 'destroyed',
            coordinates: { x: 503, y: 336 }
          },
          {
            id: 'pickaxe-mountain-site',
            name: 'Pickaxe Mountain Site at Natanz',
            status: 'construction',
            coordinates: { x: 503, y: 448 }
          }
        ]
      },
      {
        id: 'centrifuge-testing',
        name: 'Centrifuge Testing and Development',
        type: 'fuel-production',
        coordinates: { x: 832, y: 0 },
        subItems: [
          {
            id: 'tehran-nuclear-research',
            name: 'Tehran Nuclear Research Center',
            status: 'destroyed',
            coordinates: { x: 919, y: 112 }
          }
        ]
      },
      {
        id: 'centrifuge-stockpiles',
        name: 'Centrifuge Stockpiles',
        type: 'fuel-production',
        coordinates: { x: 1248, y: 0 },
        subItems: [
          {
            id: 'unknown-site-2',
            name: 'Unknown site(s)',
            status: 'unknown',
            coordinates: { x: 1335, y: 112 }
          }
        ]
      },
      {
        id: 'uranium-mining',
        name: 'Uranium Mining',
        type: 'fuel-production',
        coordinates: { x: 199, y: 688 },
        subItems: [
          {
            id: 'saghand-1-2',
            name: 'Saghand 1 & 2',
            status: 'operational',
            coordinates: { x: 293, y: 800 }
          },
          {
            id: 'khoshumi',
            name: 'Khoshumi',
            status: 'unknown',
            coordinates: { x: 293, y: 916 }
          },
          {
            id: 'narigan',
            name: 'Narigan',
            status: 'unknown',
            coordinates: { x: 293, y: 1024 }
          }
        ]
      },
      {
        id: 'foreign-uranium',
        name: 'Foreign Uranium Imports',
        type: 'fuel-production',
        coordinates: { x: 615, y: 688 },
        subItems: [
          {
            id: 'unknown-foreign',
            name: 'Unknown',
            status: 'unknown',
            coordinates: { x: 702, y: 800 }
          }
        ]
      },
      {
        id: 'uranium-milling',
        name: 'Uranium Milling',
        type: 'fuel-production',
        coordinates: { x: 471, y: 1272 },
        subItems: [
          {
            id: 'ardakan-yellowcake',
            name: 'Ardakan Yellowcake Production Plant',
            status: 'operational',
            coordinates: { x: 558, y: 1416 }
          }
        ]
      },
      {
        id: 'uranium-conversion',
        name: 'Uranium Conversion/Production of UF₆',
        type: 'fuel-production',
        coordinates: { x: 951, y: 1272 },
        subItems: [
          {
            id: 'esfahan-ucf',
            name: 'Esfahan Uranium Conversion Facility',
            status: 'destroyed',
            coordinates: { x: 1047, y: 1409 }
          }
        ]
      },
      {
        id: 'uranium-enrichment',
        name: 'Uranium Enrichment',
        type: 'fuel-production',
        coordinates: { x: 1415, y: 1272 },
        subItems: [
          {
            id: 'natanz-pilot-above',
            name: 'Natanz Pilot Fuel Enrichment Plant (Above-ground plant 8-30m) - Likely no intact HEU',
            status: 'destroyed',
            coordinates: { x: 1495, y: 1384 }
          },
          {
            id: 'natanz-pilot-below',
            name: 'Natanz Pilot Fuel Enrichment Plant (Below-ground plant 8-30m) - Likely no intact HEU',
            status: 'likely-destroyed',
            coordinates: { x: 1495, y: 1592 }
          },
          {
            id: 'natanz-fuel-below',
            name: 'Natanz Fuel Enrichment Plant - Below-ground (8-30 m) Any intact HEU requires excavation',
            status: 'likely-destroyed',
            coordinates: { x: 1495, y: 1800 }
          },
          {
            id: 'fordow-fuel',
            name: 'Fordow Fuel Enrichment Plant, Qom - Deeply buried (60-90 m) Any intact HEU requires excavation',
            status: 'likely-destroyed',
            coordinates: { x: 1495, y: 2008 }
          },
          {
            id: 'pickaxe-mountain-natanz',
            name: 'Pickaxe Mountain at Natanz (Deeply buried >100+ m)',
            status: 'unknown',
            coordinates: { x: 1495, y: 2216 }
          },
          {
            id: 'esfahan-tunnels',
            name: 'Esfahan Tunnels (Deeply buried)',
            status: 'unknown',
            coordinates: { x: 1495, y: 2360 }
          }
        ]
      },
      {
        id: 'heu-storage',
        name: 'HEU Storage',
        type: 'fuel-production',
        coordinates: { x: 1895, y: 1272 },
        subItems: [
          {
            id: 'esfahan-tunnel-complex',
            name: 'Esfahan Tunnel Complex - Entrances destroyed - Any intact HEU requires excavation',
            status: 'destroyed',
            coordinates: { x: 1975, y: 1384 }
          },
          {
            id: 'esfahan-shipping',
            name: 'Esfahan Shipping and Receiving Building (possible HEU location)',
            status: 'destroyed',
            coordinates: { x: 1975, y: 1560 }
          }
        ]
      },
      {
        id: 'heavy-water-production',
        name: 'Heavy Water Production',
        type: 'fuel-production',
        coordinates: { x: 439, y: 1704 },
        subItems: []
      },
      {
        id: 'fuel-manufacturing',
        name: 'Fuel Manufacturing',
        type: 'fuel-production',
        coordinates: { x: 855, y: 1704 },
        subItems: [
          {
            id: 'esfahan-fmp',
            name: 'Esfahan Fuel Manufacturing Plant (FMP)',
            status: 'destroyed',
            coordinates: { x: 935, y: 1818 }
          },
          {
            id: 'esfahan-fpfp',
            name: 'Esfahan Fuel Plate Manufacturing Plant (FPFP)',
            status: 'destroyed',
            coordinates: { x: 935, y: 1930 }
          },
          {
            id: 'esfahan-ccl',
            name: 'Esfahan Central Chemical Laboratory',
            status: 'destroyed',
            coordinates: { x: 935, y: 2058 }
          },
          {
            id: 'esfahan-upp',
            name: 'Esfahan Uranium Powder Plant (EUPP)',
            status: 'operational',
            coordinates: { x: 935, y: 2170 }
          },
          {
            id: 'zirconium-production',
            name: 'Zirconium Production Plant (ZPP)/hafnium oxide production',
            status: 'operational',
            coordinates: { x: 935, y: 2300 }
          }
        ]
      },
      {
        id: 'research-reactor',
        name: 'Research Reactor',
        type: 'fuel-production',
        coordinates: { x: 750, y: 2616 },
        subItems: []
      },
      {
        id: 'heavy-water-reactor',
        name: 'Heavy Water Reactor and Plutonium Fabrication',
        type: 'fuel-production',
        coordinates: { x: 341, y: 2616 },
        subItems: []
      }
    ]
  },
  {
    id: 'fuel-weaponization',
    name: 'Weaponization',
    type: 'fuel-weaponization',
    color: '#1E1E1E',
    components: [
      {
        id: 'nuclear-warhead-design',
        name: 'Nuclear Warhead Design and Development',
        type: 'fuel-weaponization',
        coordinates: { x: 1155, y: 3192 },
        subItems: [
          {
            id: 'parchin-military-complex',
            name: 'Parchin Military Complex',
            status: 'destroyed',
            description: '10 scientists killed',
            coordinates: { x: 1319, y: 3288 }
          }
        ]
      },
      {
        id: 'nuclear-warhead-fabrication',
        name: 'Nuclear Warhead Fabrication and Assembly',
        type: 'fuel-weaponization',
        coordinates: { x: 839, y: 4040 },
        subItems: [
          {
            id: 'shahid-karimi',
            name: 'Shahid Karimi Group/Lavisan 2/Mojdeh Site',
            status: 'destroyed',
            description: '6 scientists killed',
            coordinates: { x: 1463, y: 4270 }
          },
          {
            id: 'goleb-dareh',
            name: 'Goleb Dareh',
            status: 'unknown',
            coordinates: { x: 1463, y: 4398 }
          }
        ]
      },
      {
        id: 'delivery-systems',
        name: 'Delivery Systems (Missile/Aircraft)',
        type: 'fuel-weaponization',
        coordinates: { x: 199, y: 4608 },
        subItems: [
          {
            id: 'unknown-site-destroyed',
            name: 'Unknown Site - Destroyed',
            status: 'destroyed',
            description: '4 experts killed',
            coordinates: { x: 183, y: 4654 }
          }
        ]
      },
      {
        id: 'nuclear-testing',
        name: 'Nuclear Testing (if conducted)',
        type: 'fuel-weaponization',
        coordinates: { x: 615, y: 4608 },
        subItems: [
          {
            id: 'unknown-to-exist',
            name: 'Unknown to Exist',
            status: 'unknown',
            coordinates: { x: 791, y: 4656 }
          }
        ]
      }
    ]
  }
];

// Status color mapping
export const statusColors: Record<StatusType, string> = {
  operational: '#C7E9C0',
  unknown: '#BCD8F0',
  construction: '#DCCCFF',
  'likely-destroyed': '#FFE0C2',
  destroyed: '#FFC7C2'
};

// Function to convert SVG fill color to status
export function getStatusFromFill(fill: string): StatusType {
  switch (fill) {
    case "#C7E9C0":
      return "operational";
    case "#BCD8F0":
      return "unknown";
    case "#DCCCFF":
      return "construction";
    case "#FFE0C2":
      return "likely-destroyed";
    case "#FFC7C2":
      return "destroyed";
    default:
      return "unknown";
  }
}

// Filter types
export type FilterType = 'all' | 'fuel-production' | 'fuel-weaponization' | 'components' | 'sub-items' | 'standalone' | StatusType;

export const filterOptions = [
  { value: 'all' as FilterType, label: 'All Items', color: '#6B7280' },
  { value: 'fuel-production' as FilterType, label: 'Fuel Production', color: '#00558C' },
  { value: 'fuel-weaponization' as FilterType, label: 'Weaponization', color: '#1E1E1E' },
  { value: 'components' as FilterType, label: 'Main Components', color: '#059669' },
  { value: 'sub-items' as FilterType, label: 'Sub-Items', color: '#7C3AED' },
  { value: 'standalone' as FilterType, label: 'Standalone', color: '#DC2626' },
  { value: 'operational' as FilterType, label: 'Operational', color: '#C7E9C0' },
  { value: 'unknown' as FilterType, label: 'Unknown', color: '#BCD8F0' },
  { value: 'construction' as FilterType, label: 'Construction', color: '#DCCCFF' },
  { value: 'likely-destroyed' as FilterType, label: 'Likely Destroyed', color: '#FFE0C2' },
  { value: 'destroyed' as FilterType, label: 'Destroyed', color: '#FFC7C2' }
];