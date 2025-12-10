import { CarModel } from './types';

export const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/GewoonJaap/custom-tesla-wraps/master';

const CYBERTRUCK_EXAMPLES = [
  'Ani.png', 'Camo_Blue.png', 'Camo_Brown.png', 'Camo_Green.png', 'Camo_Pink.png', 
  'Camo_Sand.png', 'Camo_Snow.png', 'Camo_Stealth.png', 'Clay.png', 'Cosmic_Burst.png', 
  'Digital_Camo_Green.png', 'Digital_Camo_Snow.png', 'Digital_Camo_Stealth.png', 
  'Doge_Camo.png', 'Gradient_Black.png', 'Gradient_Burn.png', 'Gradient_Cotton_Candy.png', 
  'Gradient_Green.png', 'Gradient_Purple_Burn.png', 'Gradient_Sunburst.png', 
  'Graffiti_back.png', 'Graffiti_green.png', 'Graffiti_orange.png', 'Grandmas_Sofa.png', 
  'Houndstooth.png', 'Leopard.png', 'Mika.png', 'Rc_prototype.png', 'Retro.png', 
  'Rudi.png', 'Rust.png', 'Valentine.png', 'Woody.png', 'Xmas_Camo.png', 
  'Xmas_Lights.png', 'Xray.png'
];

const STANDARD_EXAMPLES = [
  'Acid_Drip.png', 'Ani.png', 'Apocalypse.png', 'Avocado_Green.png', 'Camo.png', 
  'Cosmic_Burst.png', 'Divide.png', 'Doge.png', 'Dot_Matrix.png', 'Ice_Cream.png', 
  'Leopard.png', 'Pixel_Art.png', 'Reindeer.png', 'Rudi.png', 'Sakura.png', 
  'Sketch.png', 'String_Lights.png', 'Valentine.png', 'Vintage_Gradient.png', 
  'Vintage_Stripes.png'
];

export const CAR_MODELS: CarModel[] = [
  { id: 'cybertruck', name: 'Cybertruck', folderName: 'cybertruck', examples: CYBERTRUCK_EXAMPLES },
  { id: 'model3-2024-perf', name: 'Model 3 (2024 Performance)', folderName: 'model3-2024-performance', examples: STANDARD_EXAMPLES },
  { id: 'model3-2024-base', name: 'Model 3 (2024 Base)', folderName: 'model3-2024-base', examples: STANDARD_EXAMPLES },
  { id: 'model3', name: 'Model 3 Highland', folderName: 'model3', examples: STANDARD_EXAMPLES },
  { id: 'modely-2025-base', name: 'Model Y (2025 Base)', folderName: 'modely-2025-base', examples: STANDARD_EXAMPLES },
  { id: 'modely-2025-perf', name: 'Model Y (2025 Performance)', folderName: 'modely-2025-performance', examples: STANDARD_EXAMPLES },
  { id: 'modely-2025-prem', name: 'Model Y (2025 Premium)', folderName: 'modely-2025-premium', examples: STANDARD_EXAMPLES },
  { id: 'modely-l', name: 'Model Y (Long Range)', folderName: 'modely-l', examples: STANDARD_EXAMPLES },
  { id: 'modely', name: 'Model Y (Standard)', folderName: 'modely', examples: STANDARD_EXAMPLES },
];

export const PRESET_COLORS = [
  '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', 
  '#FFFFFF', '#000000', '#808080',
  '#C0C0C0', '#800000', '#800000', 
  '#008000', '#800080', '#008080', 
  '#000080'
];