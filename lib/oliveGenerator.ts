// Enhanced Olive Branch Generator - Galway Research Institute
// Botanical Signature System with Rarity System

// Olive branch background color constant
export const OLIVE_BRANCH_BG_COLOR = '#fcfcfc';

interface OliveBranchData {
  svg: string;
  colors: {
    olive: string;
    branch: string;
    leaf: string;
  };
  oliveCount: number;
  oliveType: string;
  rarity: {
    count: string;
    type: string;
    countPercentage: number;
    typePercentage: number;
  };
  id: number;
}

const oliveColors = {
  greenOlives: ['#6B8E23', '#808000', '#9ACD32', '#7CFC00', '#ADFF2F'],
  blackOlives: ['#2F2F2F', '#404040', '#1C1C1C', '#36454F', '#28282B'],
  brownOlives: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#BC9A6A'],
  purpleOlives: ['#663399', '#4B0082', '#800080', '#9932CC', '#8B008B'],
  ripeMixed: ['#6B8E23', '#2F2F2F', '#663399', '#8B4513']
};

const branchColors = {
  youngBranch: ['#8FBC8F', '#90EE90', '#98FB98', '#7CFC00'],
  matureBranch: ['#556B2F', '#6B8E23', '#808000', '#9ACD32'],
  brownBranch: ['#8B7355', '#A0522D', '#CD853F', '#DEB887'],
  silverBranch: ['#C0C0C0', '#D3D3D3', '#DCDCDC', '#F5F5F5']
};

const leafColors = {
  freshLeaves: ['#228B22', '#32CD32', '#00FF00', '#7CFC00'],
  matureLeaves: ['#006400', '#228B22', '#2E8B57', '#3CB371'],
  silverLeaves: ['#9ACD32', '#C0C0C0', '#D3D3D3', '#E6E6FA'],
  dryLeaves: ['#6B8E23', '#808000', '#BDB76B', '#F0E68C']
};

// Rarity weights for olive count
const oliveCountWeights = {
  1: { weight: 0.33, rarity: 'Common' },
  2: { weight: 0.28, rarity: 'Common' },
  3: { weight: 0.19, rarity: 'Uncommon' },
  4: { weight: 0.12, rarity: 'Rare' },
  5: { weight: 0.08, rarity: 'Very Rare' }
};

// Rarity weights for olive types
const oliveTypeWeights = {
  greenOlives: { weight: 0.30, rarity: 'Common', displayName: 'Green Olives' },
  blackOlives: { weight: 0.25, rarity: 'Common', displayName: 'Black Olives' },
  brownOlives: { weight: 0.20, rarity: 'Uncommon', displayName: 'Brown Olives' },
  purpleOlives: { weight: 0.15, rarity: 'Rare', displayName: 'Purple Olives' },
  ripeMixed: { weight: 0.10, rarity: 'Very Rare', displayName: 'Mixed Ripe Olives' }
};

function getRandomColor(colorArray: string[]): string {
  return colorArray[Math.floor(Math.random() * colorArray.length)];
}

function getRandomBranchColor(): string {
  const palettes = Object.values(branchColors);
  const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
  return getRandomColor(randomPalette);
}

function getRandomLeafColor(): string {
  const palettes = Object.values(leafColors);
  const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
  return getRandomColor(randomPalette);
}

function generateWeightedOliveCount(): { count: number; rarity: string; percentage: number } {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [count, data] of Object.entries(oliveCountWeights)) {
    cumulative += data.weight;
    if (random <= cumulative) {
      return {
        count: parseInt(count),
        rarity: data.rarity,
        percentage: Math.round(data.weight * 100)
      };
    }
  }
  return { count: 1, rarity: 'Common', percentage: 33 }; // fallback
}

function generateWeightedOliveType(): { type: string; color: string; rarity: string; displayName: string; percentage: number } {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [type, data] of Object.entries(oliveTypeWeights)) {
    cumulative += data.weight;
    if (random <= cumulative) {
      const palette = oliveColors[type as keyof typeof oliveColors];
      return {
        type,
        color: getRandomColor(palette),
        rarity: data.rarity,
        displayName: data.displayName,
        percentage: Math.round(data.weight * 100)
      };
    }
  }
  // fallback
  return {
    type: 'greenOlives',
    color: getRandomColor(oliveColors.greenOlives),
    rarity: 'Common',
    displayName: 'Green Olives',
    percentage: 30
  };
}

function generateOlivePositions(count: number): Array<{x: number, y: number}> {
  const possiblePositions = [
    { x: 20, y: 32 }, { x: 40, y: 42 }, { x: 26, y: 49 }, 
    { x: 48, y: 35 }, { x: 22, y: 45 }
  ];
  const shuffled = possiblePositions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateOliveBranch(): OliveBranchData {
  const oliveCountData = generateWeightedOliveCount();
  const oliveTypeData = generateWeightedOliveType();
  const branchColor = getRandomBranchColor();
  const leafColor = getRandomLeafColor();
  
  const olivePositions = generateOlivePositions(oliveCountData.count);

  let oliveElements = '';
  olivePositions.forEach(pos => {
    oliveElements += `<rect x="${pos.x}" y="${pos.y}" width="4" height="4" fill="${oliveTypeData.color}"/>`;
  });

  const svg = `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
<!-- Main Stem -->
<rect x="33" y="20" width="4" height="30" fill="${branchColor}"/>
<!-- Branches -->
<rect x="24" y="27" width="12" height="4" fill="${branchColor}"/>
<rect x="34" y="37" width="12" height="4" fill="${branchColor}"/>
<rect x="24" y="44" width="12" height="4" fill="${branchColor}"/>
<!-- Leaves -->
<rect x="18" y="25" width="8" height="4" fill="${leafColor}"/>
<rect x="20" y="29" width="8" height="4" fill="${leafColor}"/>
<rect x="42" y="35" width="8" height="4" fill="${leafColor}"/>
<rect x="44" y="39" width="8" height="4" fill="${leafColor}"/>
<rect x="18" y="42" width="8" height="4" fill="${leafColor}"/>
<rect x="20" y="46" width="8" height="4" fill="${leafColor}"/>
<!-- Olives -->
${oliveElements}
</svg>`;

  return {
    svg,
    colors: { 
      olive: oliveTypeData.color, 
      branch: branchColor, 
      leaf: leafColor 
    },
    oliveCount: oliveCountData.count,
    oliveType: oliveTypeData.displayName,
    rarity: {
      count: oliveCountData.rarity,
      type: oliveTypeData.rarity,
      countPercentage: oliveCountData.percentage,
      typePercentage: oliveTypeData.percentage
    },
    id: Date.now() + Math.random()
  };
}

// Export rarity data for reference page
export const OLIVE_RARITY_DATA = {
  counts: oliveCountWeights,
  types: oliveTypeWeights,
  colors: oliveColors
};