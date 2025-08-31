'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { OLIVE_BRANCH_BG_COLOR } from '@/lib/oliveGenerator';

interface OliveBranchData {
  svg: string;
  colors: {
    olive: string;
    branch: string;
    leaf: string;
  };
  oliveCount: number;
  oliveType: string;
  id: number;
}

interface UserData {
  username: string;
  email: string;
  password: string;
  role: string;
  onset: string;
  isEmailVerified: boolean;
  registrationStep: string;
  accountCreated: string;
  deletionWarningDate?: string;
}

// Enhanced olive generation with rarity system
const OLIVE_RARITY_DATA = {
  counts: {
    1: { weight: 0.33, rarity: 'Common' },
    2: { weight: 0.28, rarity: 'Common' },
    3: { weight: 0.19, rarity: 'Uncommon' },
    4: { weight: 0.12, rarity: 'Rare' },
    5: { weight: 0.08, rarity: 'Very Rare' }
  },
  types: {
    greenOlives: { weight: 0.30, rarity: 'Common', displayName: 'Green Olives' },
    blackOlives: { weight: 0.25, rarity: 'Common', displayName: 'Black Olives' },
    brownOlives: { weight: 0.20, rarity: 'Uncommon', displayName: 'Brown Olives' },
    purpleOlives: { weight: 0.15, rarity: 'Rare', displayName: 'Purple Olives' },
    ripeMixed: { weight: 0.10, rarity: 'Very Rare', displayName: 'Mixed Ripe Olives' }
  }
};

const oliveColors = {
  greenOlives: ['#6B8E23', '#808000', '#9ACD32', '#7CFC00', '#ADFF2F'],
  blackOlives: ['#2F2F2F', '#404040', '#1C1C1C', '#36454F', '#28282B'],
  purpleOlives: ['#663399', '#4B0082', '#800080', '#9932CC', '#8B008B'],
  brownOlives: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#BC9A6A'],
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

function getRandomColor(colorArray: string[]): string {
  return colorArray[Math.floor(Math.random() * colorArray.length)];
}

// Weighted random selection
function weightedRandomSelection(items: any): string {
  const totalWeight = Object.values(items).reduce((sum: number, item: any) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [key, item] of Object.entries(items)) {
    random -= (item as any).weight;
    if (random <= 0) return key;
  }
  
  return Object.keys(items)[0]; // fallback
}

function generateOliveCount(): number {
  const selectedKey = weightedRandomSelection(OLIVE_RARITY_DATA.counts);
  return parseInt(selectedKey);
}

function generateOliveType(): string {
  return weightedRandomSelection(OLIVE_RARITY_DATA.types);
}

function getRandomOliveColor(oliveType: string): string {
  const colors = oliveColors[oliveType as keyof typeof oliveColors];
  return getRandomColor(colors);
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

function generateOlivePositions(count: number): Array<{x: number, y: number}> {
  const possiblePositions = [
    { x: 20, y: 32 }, { x: 40, y: 42 }, { x: 26, y: 49 }, 
    { x: 48, y: 35 }, { x: 22, y: 45 }
  ];
  const shuffled = possiblePositions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function createSystematicOliveBranch(): OliveBranchData {
  const oliveType = generateOliveType();
  const oliveColor = getRandomOliveColor(oliveType);
  const branchColor = getRandomBranchColor();
  const leafColor = getRandomLeafColor();
  const bgColor = `${OLIVE_BRANCH_BG_COLOR}`;
  const oliveCount = generateOliveCount();
  const olivePositions = generateOlivePositions(oliveCount);

  let oliveElements = '';
  olivePositions.forEach(pos => {
    oliveElements += `<rect x="${pos.x}" y="${pos.y}" width="4" height="4" fill="${oliveColor}"/>`;
  });

  const svg = `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${bgColor}"/>
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
    svg: svg,
    colors: { olive: oliveColor, branch: branchColor, leaf: leafColor },
    oliveCount: oliveCount,
    oliveType: OLIVE_RARITY_DATA.types[oliveType as keyof typeof OLIVE_RARITY_DATA.types].displayName,
    id: Date.now() + Math.random()
  };
}

function calculateRarity(oliveCount: number, oliveType: string) {
  const countRarity = OLIVE_RARITY_DATA.counts[oliveCount as keyof typeof OLIVE_RARITY_DATA.counts];
  const typeRarity = OLIVE_RARITY_DATA.types[oliveType as keyof typeof OLIVE_RARITY_DATA.types];
  
  return {
    count: countRarity.rarity,
    type: typeRarity.rarity,
    countPercentage: Math.round(countRarity.weight * 100),
    typePercentage: Math.round(typeRarity.weight * 100)
  };
}

export default function GenerateOliveBranchPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentBranch, setCurrentBranch] = useState<OliveBranchData | null>(null);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showDescription, setShowDescription] = useState(1);
  
  const maxGenerations = 3;

  useEffect(() => {
    // Check for verified user data
    const verifiedUser = localStorage.getItem('galwayUserVerified');
    const pendingUser = localStorage.getItem('galwayUserPending');
    
    if (verifiedUser) {
      setUserData(JSON.parse(verifiedUser));
    } else if (pendingUser) {
      setUserData(JSON.parse(pendingUser));
    } else {
      router.push('/register');
    }
  }, [router]);

  const handleGenerate = async () => {
    if (generationsUsed >= maxGenerations || isGenerating) return;
    
    setIsGenerating(true);
    
    // Simulate generation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newBranch = createSystematicOliveBranch();
    setCurrentBranch(newBranch);
    setGenerationsUsed(prev => prev + 1);
    setIsGenerating(false);
  };

  const handleRegenerate = async () => {
    if (generationsUsed >= maxGenerations) return;
    
    setCurrentBranch(null);
    await handleGenerate();
  };

  const handleConfirm = async () => {
    if (!currentBranch || !userData || isConfirming) return;
    
    setIsConfirming(true);
    
    // Simulate confirmation processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Determine olive type key for rarity calculation
    const oliveTypeKey = Object.keys(OLIVE_RARITY_DATA.types).find(key => 
      OLIVE_RARITY_DATA.types[key as keyof typeof OLIVE_RARITY_DATA.types].displayName === currentBranch.oliveType
    ) || 'greenOlives';
    
    // Calculate rarity
    const rarity = calculateRarity(currentBranch.oliveCount, oliveTypeKey);
    
    // Create inventory item
    const branchInventoryItem = {
      id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'branch' as const,
      data: currentBranch,
      createdAt: new Date().toISOString(),
      rarity: rarity
    };
    
    // Create final user data with olive branch
    const finalUserData = {
      username: userData.username,
      email: userData.email,
      role: userData.role as 'operative',
      roles: ['operative'],
      onset: userData.onset,
      idNo: Math.floor(100000 + Math.random() * 900000).toString(),
      bio: 'New operative. Studies pending assignment...',
      isEmailVerified: userData.isEmailVerified,
      oliveBranch: currentBranch,
      inventory: [branchInventoryItem],
      activeOliveBranchId: branchInventoryItem.id,
      registrationComplete: true,
      twoFactor: {
        sms: { enabled: false },
        email: { enabled: false }
      }
    };
    
    // Clean up temporary storage
    localStorage.removeItem('galwayUserVerified');
    localStorage.removeItem('galwayUserPending');
    
    // Log the user in with complete profile
    login({
      username: finalUserData.username,
      role: finalUserData.role,
      onset: finalUserData.onset,
      idNo: finalUserData.idNo,
      bio: finalUserData.bio,
      oliveBranch: currentBranch
    });
    
    // Store complete user data
    localStorage.setItem('galwayUser', JSON.stringify(finalUserData));
    
    // Redirect to homepage (now logged in)
    router.push('/');
  };

  const renderCounterDots = () => {
    return Array.from({ length: maxGenerations }, (_, index) => (
      <div
        key={index}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          index < generationsUsed 
            ? 'bg-neutral-400' 
            : 'bg-green-600'
        }`}
      />
    ));
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-mono animate-pulse text-sm uppercase">loading botanical protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center p-4 pt-8 min-h-screen">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm">
            {/* Description Toggle */}
            <h1 className="text-xl font-mono font-bold text-black mb-6 uppercase tracking-wide">
              Botanical Signature Protocol
            </h1>
            <div className="mb-6">
              <div className="text-sm font-mono text-neutral-700 leading-relaxed mb-4 min-h-[80px] flex items-center text-left">
                {showDescription === 1 ? (
                  <p>
                      This system generates <strong>unique</strong> Botanical Signatures using randomized olive branch elements.
                      Each operative receives a uniquely generated visual signature that authenticates their account across the platform.
                      We've provided one <strong>free seed</strong>, granting you three chances to plant a uniquely generated branch. Each generation is distinct.
                  </p>
                ) : (
                  <p>
                     Additional seeds may be earned through memberships and events, or purchased through our CATALOG to generate further branches. The moment one speaks to you, confirm it.
                    Follow your eyes and your judgment.
                  </p>
                )}
              </div>
              
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setShowDescription(1)}
                  className={`w-8 h-8 text-xs font-mono border transition-all duration-200 ${
                    showDescription === 1
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-black hover:text-black'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setShowDescription(2)}
                  className={`w-8 h-8 text-xs font-mono border transition-all duration-200 ${
                    showDescription === 2
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-black hover:text-black'
                  }`}
                >
                  2
                </button>
              </div>
            </div>

            {/* Generation Parameters */}
            <div className="mb-6 text-xs font-mono text-neutral-600 text-left">
              <h3 className="text-black font-normal mb-3 uppercase tracking-wide text-sm">Generation Parameters</h3>
              <ul className="space-y-1 leading-relaxed list-none">
                <li className="relative pl-4 uppercase">
                  <span className="absolute left-0 text-green-600">•</span>
                  1–5 olives, algorithmically positioned
                </li>
                <li className="relative pl-4 uppercase">
                  <span className="absolute left-0 text-green-600">•</span>
                  coloration based on observed phenotypes
                </li>
                <li className="relative pl-4 uppercase">
                  <span className="absolute left-0 text-green-600">•</span>
                  branch/leaf tones sampled from natural pigments
                </li>
                <li className="relative pl-4 uppercase">
                  <span className="absolute left-0 text-green-600">•</span>
                  Up-to 3 <strong>free</strong> generation chances
                </li>
              </ul>
            </div>

            {/* Preview Area */}
            <div className="relative bg-neutral-50 border border-neutral-200 rounded-lg p-8 mb-6 min-h-[200px] flex items-center justify-center overflow-hidden">
              {/* Generation overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="text-sm font-mono text-neutral-600 animate-pulse uppercase">
                      cultivating botanical signature...
                    </div>
                  </div>
                </div>
              )}
              
              {!currentBranch && !isGenerating && (
                <div className="text-center text-neutral-500">
                  <p className="text-sm font-mono uppercase">
                    branch preview will appear here upon generation
                  </p>
                </div>
              )}
              
              {currentBranch && !isGenerating && (
                <div className="text-center">
                  <div className="relative group">
                    <div 
                      className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden border border-neutral-200 bg-white hover:scale-105 transition-transform duration-300"
                      dangerouslySetInnerHTML={{ __html: currentBranch.svg }}
                    />
                  </div>
                  
                  <div className="text-xs font-mono text-black leading-relaxed space-y-2 text-left uppercase">
                    {/* Olive count with color cube */}
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border border-neutral-300 bg-black"></div>
                      <p>COUNT: {currentBranch.oliveCount} olive{currentBranch.oliveCount !== 1 ? 's' : ''}</p>
                    </div>
                    
                    {/* Fruit pigmentation */}
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border border-neutral-300" style={{ backgroundColor: currentBranch.colors.olive }}></div>
                      <p>fruit: {currentBranch.colors.olive}</p>
                    </div>
                    
                    {/* Stem pigmentation */}
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border border-neutral-300" style={{ backgroundColor: currentBranch.colors.branch }}></div>
                      <p>stem: {currentBranch.colors.branch}</p>
                    </div>
                    
                    {/* Foliage pigmentation */}
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border border-neutral-300" style={{ backgroundColor: currentBranch.colors.leaf }}></div>
                      <p>foliage: {currentBranch.colors.leaf}</p>
                    </div>
                    
                    {/* Botanical ID */}
                    <div className="pt-1">
                      <p className="text-neutral-500 uppercase">botanical id: #{currentBranch.id.toString().slice(-6)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Counter */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <span className="text-sm font-mono text-neutral-600 uppercase">seeds remaining:</span>
              <div className="flex space-x-1">
                {renderCounterDots()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!currentBranch ? (
                <button
                  onClick={handleGenerate}
                  disabled={generationsUsed >= maxGenerations || isGenerating}
                  className={`flex-1 py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                    generationsUsed < maxGenerations && !isGenerating
                      ? 'bg-white text-black border-black hover:bg-black hover:text-white'
                      : 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? 'cultivating...' : 'plant'}
                </button>
              ) : (
                <>
                  {generationsUsed < maxGenerations && (
                    <button
                      onClick={handleRegenerate}
                      disabled={isGenerating || isConfirming}
                      className="flex-1 py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100 hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      re-plant
                    </button>
                  )}
                  <button
                    onClick={handleConfirm}
                    disabled={isGenerating || isConfirming}
                    className={`flex-1 py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                      !isConfirming
                        ? 'bg-white text-black border-black hover:bg-black hover:text-white'
                        : 'bg-black text-white border-black cursor-wait'
                    }`}
                  >
                    {isConfirming ? 'harvesting signature...' : 'confirm signature'}
                  </button>
                </>
              )}
            </div>

            {/* Exhausted generations warning */}
            {generationsUsed >= maxGenerations && !currentBranch && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-mono text-yellow-800 font-medium lowercase">
                      All generations exhausted
                    </p>
                    <p className="text-sm font-mono text-yellow-700 mt-1 lowercase">
                      Contact institute administration for assistance or restart registration process.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
          </div>
        </div>
      </div>
    </div>
  );
}