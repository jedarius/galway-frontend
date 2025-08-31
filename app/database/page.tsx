'use client';

import { useState, useEffect, useMemo } from 'react';
import GalwayIdCard from '@/components/GalwayIdCard'; // Import the real component
import { Role } from '@/lib/types';
import { OLIVE_BRANCH_BG_COLOR } from '@/lib/oliveGenerator';

interface InventoryItem {
  id: string;
  type: 'seed' | 'branch';
  data?: any;
  createdAt: string;
  quantity?: number;
  rarity?: {
    count: string;
    type: string;
    countPercentage: number;
    typePercentage: number;
  };
}

interface DatabaseUser {
  username: string;
  role: Role;
  onset: string;
  idNo: string;
  bio: string;
  oliveBranch: any;
  birthday?: string;
  country?: string;
  city?: string;
  inventory?: InventoryItem[];
  inventoryPublic: boolean;
  lastSeen: string;
  joinDate: string;
}

// Olive Branch Generator (simplified)
const oliveColors = {
  greenOlives: ['#6B8E23', '#808000', '#9ACD32', '#7CFC00', '#ADFF2F'],
  blackOlives: ['#2F2F2F', '#404040', '#1C1C1C', '#36454F', '#28282B'],
  brownOlives: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#BC9A6A'],
  purpleOlives: ['#663399', '#4B0082', '#800080', '#9932CC', '#8B008B'],
  ripeMixed: ['#6B8E23', '#2F2F2F', '#663399', '#8B4513']
};

const branchColors = ['#8B7355', '#A0522D', '#CD853F', '#DEB887'];
const leafColors = ['#228B22', '#32CD32', '#00FF00', '#7CFC00'];

const oliveCountWeights = {
  1: { weight: 0.33, rarity: 'Common' },
  2: { weight: 0.28, rarity: 'Common' },
  3: { weight: 0.19, rarity: 'Uncommon' },
  4: { weight: 0.12, rarity: 'Rare' },
  5: { weight: 0.08, rarity: 'Very Rare' }
};

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
  return { count: 1, rarity: 'Common', percentage: 33 };
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

function generateOliveBranch(): any {
  const oliveCountData = generateWeightedOliveCount();
  const oliveTypeData = generateWeightedOliveType();
  const branchColor = getRandomColor(branchColors);
  const leafColor = getRandomColor(leafColors);
  const bgColor = `${OLIVE_BRANCH_BG_COLOR}`;

  const olivePositions = generateOlivePositions(oliveCountData.count);

  let oliveElements = '';
  olivePositions.forEach(pos => {
    oliveElements += `<rect x="${pos.x}" y="${pos.y}" width="4" height="4" fill="${oliveTypeData.color}"/>`;
  });

  const svg = `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${bgColor}"/>
<rect x="33" y="20" width="4" height="30" fill="${branchColor}"/>
<rect x="24" y="27" width="12" height="4" fill="${branchColor}"/>
<rect x="34" y="37" width="12" height="4" fill="${branchColor}"/>
<rect x="24" y="44" width="12" height="4" fill="${branchColor}"/>
<rect x="18" y="25" width="8" height="4" fill="${leafColor}"/>
<rect x="20" y="29" width="8" height="4" fill="${leafColor}"/>
<rect x="42" y="35" width="8" height="4" fill="${leafColor}"/>
<rect x="44" y="39" width="8" height="4" fill="${leafColor}"/>
<rect x="18" y="42" width="8" height="4" fill="${leafColor}"/>
<rect x="20" y="46" width="8" height="4" fill="${leafColor}"/>
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

// Mock user data generator
const generateMockUsers = (): DatabaseUser[] => {
  // Reddit-style username components
  const adjectives = [
    'ancient', 'cosmic', 'digital', 'epic', 'frozen', 'golden', 'hidden', 'infinite', 'jolly', 'kinetic',
    'lunar', 'mystic', 'neon', 'omega', 'plasma', 'quantum', 'radiant', 'stellar', 'turbo', 'ultra',
    'vivid', 'wild', 'xenon', 'young', 'zesty', 'broken', 'cursed', 'dank', 'edgy', 'final'
  ];
  
  const nouns = [
    'wizard', 'phoenix', 'dragon', 'knight', 'raven', 'wolf', 'tiger', 'eagle', 'shark', 'bear',
    'viper', 'falcon', 'lion', 'cobra', 'hawk', 'panther', 'fox', 'owl', 'badger', 'lynx',
    'spider', 'mantis', 'scorpion', 'wasp', 'beetle', 'moth', 'butterfly', 'dragonfly', 'cricket', 'firefly'
  ];
  
  const numbers = ['69', '420', '1337', '2025', '404', '007', '360', '888', '999', '123', '789', '666'];
  
  const roles: Role[] = ['operative', 'contributor', 'beta-tester', 'moderator'];
  
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 
    'India', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'South Korea', 'Singapore',
    'New Zealand', 'Switzerland', 'Austria', 'Belgium', 'Ireland', 'Portugal', 'Spain', 'Italy'
  ];
  
  const cities = [
    'New York', 'Toronto', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sydney', 'São Paulo', 'Mumbai', 'Amsterdam',
    'Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Seoul', 'Singapore', 'Auckland', 'Zurich', 'Vienna',
    'Brussels', 'Dublin', 'Lisbon', 'Madrid', 'Rome', 'Barcelona', 'Milan', 'Prague', 'Warsaw', 'Budapest'
  ];
  
  const bioPhrases = [
    'Studying quantum botany and temporal leaf patterns...',
    'Researching olive cultivation in extreme environments...',
    'Analyzing botanical signatures for authentication protocols...',
    'Investigating plant-based data encryption methods...',
    'Documenting rare olive varieties across dimensions...',
    'Examining the correlation between olive rarity and magnetic fields...',
    'Developing bio-computational models using olive branch structures...',
    'Cataloging temporal variations in botanical specimens...',
    'Researching the acoustic properties of olive leaves...',
    'Studying olive branch growth patterns in zero gravity...',
    'Working on photosynthetic efficiency optimization...',
    'Investigating olive oil composition across parallel timelines...',
    'Analyzing the fractal geometry of olive branch formations...',
    'Documenting olive cultivation techniques from ancient manuscripts...',
    'Researching the therapeutic properties of rare olive varieties...',
    'Exploring hydroponics systems for space agriculture...',
    'Mapping genetic sequences in synthetic plant matter...',
    'Testing soil composition effects on botanical growth rates...',
    'Developing AI models for predicting harvest yields...',
    'Investigating symbiotic relationships in controlled ecosystems...',
    'Analyzing photosynthetic efficiency under artificial lighting...',
    'Studying plant behavior in electromagnetic field environments...',
    'Researching cellular regeneration in damaged plant tissue...',
    'Documenting evolutionary adaptations in lab specimens...',
    'Investigating the effects of sound frequencies on plant growth...',
    'Analyzing root system networks using graph theory...',
    'Studying plant memory and learning behaviors...',
    'Researching bioluminescent properties in modified organisms...',
    'Developing sustainable cultivation methods for urban environments...',
    'Investigating time-dilated growth patterns in controlled chambers...'
  ];

  const generateRedditUsername = (): string => {
    const patterns = [
      () => `${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}`,
      () => `${nouns[Math.floor(Math.random() * nouns.length)]}_${adjectives[Math.floor(Math.random() * adjectives.length)]}`,
      () => `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}`,
      () => `${nouns[Math.floor(Math.random() * nouns.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}`,
      () => `x${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}x`,
      () => `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}_${Math.floor(Math.random() * 9999)}`,
      () => `i_am_${adjectives[Math.floor(Math.random() * adjectives.length)]}`,
      () => `${nouns[Math.floor(Math.random() * nouns.length)]}_lord_${numbers[Math.floor(Math.random() * numbers.length)]}`,
      () => `${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}_${Math.floor(Math.random() * 99)}`,
      () => `the_${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}`
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return pattern();
  };

  const users: DatabaseUser[] = [];

  // Generate 30 users
  for (let i = 0; i < 30; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const oliveBranch = generateOliveBranch();
    const hasInventory = Math.random() > 0.25; // 75% chance of having inventory
    const inventoryPublic = Math.random() > 0.3; // 70% chance of public inventory
    
    let inventory: InventoryItem[] = [];
    if (hasInventory) {
      const numItems = Math.floor(Math.random() * 12) + 1; // 1-12 items
      let totalSeeds = 0; // Track total seeds to consolidate
      
      for (let j = 0; j < numItems; j++) {
        if (Math.random() > 0.65) { // 35% chance of seeds
          totalSeeds += Math.floor(Math.random() * 8) + 1; // Add to total seed count
        } else { // 65% chance of branches
          const branchData = generateOliveBranch();
          inventory.push({
            id: `branch_${Date.now()}_${i}_${j}`,
            type: 'branch',
            data: branchData,
            rarity: branchData.rarity,
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
      
      // Add consolidated seeds as a single stack if any were generated
      if (totalSeeds > 0) {
        inventory.unshift({ // Add at beginning so seeds appear first
          id: `seed_${Date.now()}_${i}_consolidated`,
          type: 'seed',
          quantity: totalSeeds,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    const joinDate = new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000); // Up to 2 years ago
    const lastSeen = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Up to 30 days ago

    users.push({
      username: generateRedditUsername(),
      role,
      onset: `${(joinDate.getMonth() + 1).toString().padStart(2, '0')}/${joinDate.getDate().toString().padStart(2, '0')}/${joinDate.getFullYear()}`,
      idNo: Math.floor(100000 + Math.random() * 900000).toString(),
      bio: bioPhrases[Math.floor(Math.random() * bioPhrases.length)],
      oliveBranch,
      birthday: Math.random() > 0.5 ? `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${1980 + Math.floor(Math.random() * 25)}` : undefined,
      country: Math.random() > 0.2 ? countries[Math.floor(Math.random() * countries.length)] : undefined, // 80% chance of having a country
      city: Math.random() > 0.4 ? cities[Math.floor(Math.random() * cities.length)] : undefined,
      inventory,
      inventoryPublic,
      joinDate: joinDate.toISOString(),
      lastSeen: lastSeen.toISOString(),
    });
  }

  return users.sort((a, b) => a.username.localeCompare(b.username));
};

export default function DatabasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [users] = useState<DatabaseUser[]>(generateMockUsers());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const roleStats = useMemo(() => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<Role, number>);
    return stats;
  }, [users]);

  const formatLastSeen = (lastSeenDate: string) => {
    const date = new Date(lastSeenDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Active now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleColor = (role: Role) => {
    const colors = {
      guest: 'rgb(57, 57, 57)',
      operative: '#DB52F4',
      contributor: '#D5B504',
      'beta-tester': '#0D7F10',
      moderator: '#D40684'
    };
    return colors[role];
  };

  const getFlagUrl = (country?: string) => {
    if (!country) return null;
    
    // Country code mapping for flags - using flagcdn.com instead
    const countryFlags = {
      'United States': 'us',
      'Canada': 'ca',
      'United Kingdom': 'gb',
      'Germany': 'de',
      'France': 'fr',
      'Japan': 'jp',
      'Australia': 'au',
      'Brazil': 'br',
      'India': 'in',
      'Netherlands': 'nl',
      'Sweden': 'se',
      'Norway': 'no',
      'Denmark': 'dk',
      'Finland': 'fi',
      'South Korea': 'kr',
      'Singapore': 'sg',
      'New Zealand': 'nz',
      'Switzerland': 'ch',
      'Austria': 'at',
      'Belgium': 'be',
      'Ireland': 'ie',
      'Portugal': 'pt',
      'Spain': 'es',
      'Italy': 'it'
    };
    
    const countryCode = countryFlags[country as keyof typeof countryFlags];
    if (!countryCode) return null;
    return `https://flagcdn.com/16x12/${countryCode}.png`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-mono animate-pulse text-sm lowercase">accessing database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-2">User Database</h1>
            <p className="text-sm text-neutral-600 font-mono">
              {filteredUsers.length} of {users.length} operatives indexed
            </p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 font-mono text-sm border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200 lowercase"
          >
            ← back to home
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-neutral-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-2 font-mono">
                search users
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                  placeholder="bot_apple, bot_banana..."
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-neutral-700 mb-2 font-mono">
                filter by role
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
                className="px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
              >
                <option value="all">all roles ({users.length})</option>
                <option value="operative">operative ({roleStats.operative || 0})</option>
                <option value="contributor">contributor ({roleStats.contributor || 0})</option>
                <option value="beta-tester">beta-tester ({roleStats['beta-tester'] || 0})</option>
                <option value="moderator">moderator ({roleStats.moderator || 0})</option>
              </select>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="divide-y divide-neutral-100">
            {filteredUsers.map((user) => (
              <div
                key={user.username}
                className="p-4 hover:bg-neutral-50 transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  {/* Username */}
                  <div className="flex items-center space-x-3">
                    {user.country && getFlagUrl(user.country) && (
                      <img 
                        src={getFlagUrl(user.country)!} 
                        alt={`${user.country} flag`}
                        className="w-4 h-3 object-cover border border-neutral-300"
                        onError={(e) => {
                          console.log(`Failed to load flag for ${user.country}: ${getFlagUrl(user.country)}`);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded flag for ${user.country}`);
                        }}
                      />
                    )}
                    <h3 
                      className="font-mono text-lg font-medium group-hover:underline"
                      style={{ color: getRoleColor(user.role) }}
                    >
                      {user.username}
                    </h3>
                    <span className="text-xs text-neutral-500 font-mono uppercase tracking-wide">
                      {user.role === 'beta-tester' ? 'beta-tester' : user.role}
                    </span>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center space-x-6 text-xs font-mono text-neutral-500">
                    {user.inventoryPublic && user.inventory && (
                      <div className="text-right">
                        <div className="text-neutral-900">{user.inventory.length} items</div>
                      </div>
                    )}
                    <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-neutral-600 font-mono text-sm">
              No users found matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white font-mono text-sm rounded hover:bg-neutral-700 transition-colors duration-200"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 font-mono">
                User Profile: {selectedUser.username}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - ID Card and Basic Info */}
                <div className="space-y-6">
                  {/* ID Card - Now using the real component with modal context! */}
                  <div className="flex justify-center">
                    <div className="w-64">
                      <GalwayIdCard
                        role={selectedUser.role}
                        username={selectedUser.username}
                        onset={selectedUser.onset}
                        idNo={selectedUser.idNo}
                        bio={selectedUser.bio}
                        oliveBranch={selectedUser.oliveBranch}
                        followMouse={true}
                        size="large"
                        context="modal"
                      />
                    </div>
                  </div>

                  {/* Basic Stats */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-mono text-sm font-medium text-neutral-900 mb-3 uppercase tracking-wide">
                      Account Information
                    </h3>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Joined:</span>
                        <span className="text-neutral-900">{new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Last seen:</span>
                        <span className="text-neutral-900">{formatLastSeen(selectedUser.lastSeen)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Role:</span>
                        <span style={{ color: getRoleColor(selectedUser.role) }}>
                          {selectedUser.role === 'beta-tester' ? 'beta-tester' : selectedUser.role}
                        </span>
                      </div>
                      {selectedUser.country && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Country:</span>
                          <span className="text-neutral-900">{selectedUser.country}</span>
                        </div>
                      )}
                      {selectedUser.city && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">City:</span>
                          <span className="text-neutral-900">{selectedUser.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Olive Branch Details and Inventory */}
                <div className="space-y-6">
                  {/* Olive Branch Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-mono text-sm font-medium text-neutral-900 mb-3 uppercase tracking-wide">
                      Botanical Signature
                    </h3>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Olive count:</span>
                        <span className="text-neutral-900">{selectedUser.oliveBranch.oliveCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Olive type:</span>
                        <span className="text-neutral-900">{selectedUser.oliveBranch.oliveType?.toLowerCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Count rarity:</span>
                        <span className={`${
                          selectedUser.oliveBranch.rarity?.count === 'Very Rare' ? 'text-red-600' :
                          selectedUser.oliveBranch.rarity?.count === 'Rare' ? 'text-purple-600' :
                          selectedUser.oliveBranch.rarity?.count === 'Uncommon' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {selectedUser.oliveBranch.rarity?.count?.toLowerCase()} ({selectedUser.oliveBranch.rarity?.countPercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Type rarity:</span>
                        <span className={`${
                          selectedUser.oliveBranch.rarity?.type === 'Very Rare' ? 'text-red-600' :
                          selectedUser.oliveBranch.rarity?.type === 'Rare' ? 'text-purple-600' :
                          selectedUser.oliveBranch.rarity?.type === 'Uncommon' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {selectedUser.oliveBranch.rarity?.type?.toLowerCase()} ({selectedUser.oliveBranch.rarity?.typePercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Branch ID:</span>
                        <span className="text-neutral-500">#{selectedUser.oliveBranch.id.toString().slice(-6)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-mono text-sm font-medium text-neutral-900 mb-3 uppercase tracking-wide">
                      Inventory
                    </h3>
                    {selectedUser.inventoryPublic ? (
                      selectedUser.inventory && selectedUser.inventory.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedUser.inventory.slice(0, 8).map((item, index) => (
                            <div
                              key={item.id}
                              className="aspect-square border border-neutral-200 rounded-lg p-1 bg-white relative"
                            >
                              {item.type === 'seed' ? (
                                <div className="w-full h-full relative">
                                  <div 
                                    className="w-full h-full rounded"
                                    dangerouslySetInnerHTML={{ 
                                      __html: `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
                                        <rect x="28" y="28" width="4" height="4" fill="#D2B48C"/>
                                        <rect x="32" y="30" width="4" height="4" fill="#CD853F"/>
                                        <rect x="36" y="32" width="4" height="4" fill="#DEB887"/>
                                        <rect x="30" y="34" width="4" height="4" fill="#F5DEB3"/>
                                        <rect x="34" y="36" width="4" height="4" fill="#D2B48C"/>
                                        <rect x="38" y="34" width="4" height="4" fill="#CD853F"/>
                                      </svg>` 
                                    }}
                                  />
                                  {item.quantity && item.quantity > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-mono rounded-full w-4 h-4 flex items-center justify-center">
                                      {item.quantity}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div 
                                  className="w-full h-full rounded"
                                  dangerouslySetInnerHTML={{ __html: item.data?.svg || '' }}
                                />
                              )}
                              {item.type === 'branch' && item.rarity && (
                                <div className="absolute bottom-0 left-0 text-xs font-mono">
                                  <span className={`px-1 py-0.5 rounded text-white text-[8px] ${
                                    item.rarity.count === 'Very Rare' ? 'bg-red-500' :
                                    item.rarity.count === 'Rare' ? 'bg-purple-500' :
                                    item.rarity.count === 'Uncommon' ? 'bg-blue-500' : 'bg-green-500'
                                  }`}>
                                    {item.rarity.count[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                          {selectedUser.inventory.length > 8 && (
                            <div className="aspect-square border border-neutral-200 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <span className="text-xs font-mono text-neutral-500">
                                +{selectedUser.inventory.length - 8}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-mono text-neutral-500">No items in inventory</p>
                      )
                    ) : (
                      <p className="text-sm font-mono text-neutral-500">
                        🔒 Inventory is private
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}