'use client';

import Link from 'next/link';
import { useState } from 'react';
import { OLIVE_BRANCH_BG_COLOR } from '@/lib/oliveGenerator';

// Import the rarity data (you'd import this from your actual generator file)
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
  },
  colors: {
    greenOlives: ['#6B8E23', '#808000', '#9ACD32', '#7CFC00', '#ADFF2F'],
    blackOlives: ['#2F2F2F', '#404040', '#1C1C1C', '#36454F', '#28282B'],
    brownOlives: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#BC9A6A'],
    purpleOlives: ['#663399', '#4B0082', '#800080', '#9932CC', '#8B008B'],
    ripeMixed: ['#6B8E23', '#2F2F2F', '#663399', '#8B4513']
  }
};

export default function OliveRarityPage() {
  const [activeTab, setActiveTab] = useState<'counts' | 'types'>('counts');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-green-600';
      case 'Uncommon': return 'text-blue-600';
      case 'Rare': return 'text-purple-600';
      case 'Very Rare': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-green-50 border-green-200';
      case 'Uncommon': return 'bg-blue-50 border-blue-200';
      case 'Rare': return 'bg-purple-50 border-purple-200';
      case 'Very Rare': return 'bg-red-50 border-red-200';
      default: return 'bg-neutral-50 border-neutral-200';
    }
  };

  const generateSampleOlive = (type: string, colorIndex: number = 0) => {
    const colors = OLIVE_RARITY_DATA.colors[type as keyof typeof OLIVE_RARITY_DATA.colors];
    const oliveColor = colors[colorIndex];
    
    return `<svg width="60" height="60" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
      <rect x="33" y="20" width="4" height="30" fill="#8B7355"/>
      <rect x="24" y="27" width="12" height="4" fill="#8B7355"/>
      <rect x="34" y="37" width="12" height="4" fill="#8B7355"/>
      <rect x="24" y="44" width="12" height="4" fill="#8B7355"/>
      <rect x="18" y="25" width="8" height="4" fill="#228B22"/>
      <rect x="20" y="29" width="8" height="4" fill="#228B22"/>
      <rect x="42" y="35" width="8" height="4" fill="#228B22"/>
      <rect x="44" y="39" width="8" height="4" fill="#228B22"/>
      <rect x="18" y="42" width="8" height="4" fill="#228B22"/>
      <rect x="20" y="46" width="8" height="4" fill="#228B22"/>
      <rect x="20" y="32" width="4" height="4" fill="${oliveColor}"/>
      <rect x="40" y="42" width="4" height="4" fill="${oliveColor}"/>
      <rect x="26" y="49" width="4" height="4" fill="${oliveColor}"/>
    </svg>`;
  };

  const generateCountSample = (count: number) => {
    const positions = [
      { x: 20, y: 32 }, { x: 40, y: 42 }, { x: 26, y: 49 }, 
      { x: 48, y: 35 }, { x: 22, y: 45 }
    ];
    
    let oliveElements = '';
    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      oliveElements += `<rect x="${pos.x}" y="${pos.y}" width="4" height="4" fill="#6B8E23"/>`;
    }
    
    return `<svg width="60" height="60" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
      <rect x="33" y="20" width="4" height="30" fill="#8B7355"/>
      <rect x="24" y="27" width="12" height="4" fill="#8B7355"/>
      <rect x="34" y="37" width="12" height="4" fill="#8B7355"/>
      <rect x="24" y="44" width="12" height="4" fill="#8B7355"/>
      <rect x="18" y="25" width="8" height="4" fill="#228B22"/>
      <rect x="20" y="29" width="8" height="4" fill="#228B22"/>
      <rect x="42" y="35" width="8" height="4" fill="#228B22"/>
      <rect x="44" y="39" width="8" height="4" fill="#228B22"/>
      <rect x="18" y="42" width="8" height="4" fill="#228B22"/>
      <rect x="20" y="46" width="8" height="4" fill="#228B22"/>
      ${oliveElements}
    </svg>`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-semibold text-neutral-900 lowercase">
                Olive Branch Rarity Guide
              </h1>
              <p className="text-sm font-mono text-neutral-600 mt-1 lowercase">
                botanical signature system distribution rates
              </p>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 font-mono text-sm border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200 lowercase"
            >
              ← back to home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-neutral-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('counts')}
            className={`flex-1 py-3 px-4 font-mono text-sm lowercase transition-all duration-200 rounded-md ${
              activeTab === 'counts'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            olive counts
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`flex-1 py-3 px-4 font-mono text-sm lowercase transition-all duration-200 rounded-md ${
              activeTab === 'types'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            olive types
          </button>
        </div>

        {/* Olive Counts Tab */}
        {activeTab === 'counts' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-mono font-medium text-neutral-900 lowercase mb-2">
                Olive Count Distribution
              </h2>
              <p className="text-sm font-mono text-neutral-600 lowercase">
                the number of olives on your botanical signature determines its rarity
              </p>
            </div>

            <div className="grid gap-4">
              {Object.entries(OLIVE_RARITY_DATA.counts).map(([count, data]) => (
                <div
                  key={count}
                  className={`p-6 rounded-lg border ${getRarityBgColor(data.rarity)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 bg-white"
                        dangerouslySetInnerHTML={{ __html: generateCountSample(parseInt(count)) }}
                      />
                      <div>
                        <div className="font-mono text-lg font-medium text-neutral-900 lowercase">
                          {count} {parseInt(count) === 1 ? 'olive' : 'olives'}
                        </div>
                        <div className={`font-mono text-sm lowercase ${getRarityColor(data.rarity)}`}>
                          {data.rarity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-semibold text-neutral-900">
                        {Math.round(data.weight * 100)}%
                      </div>
                      <div className="font-mono text-xs text-neutral-500 lowercase">
                        drop rate
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Olive Types Tab */}
        {activeTab === 'types' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-mono font-medium text-neutral-900 lowercase mb-2">
                Olive Type Distribution
              </h2>
              <p className="text-sm font-mono text-neutral-600 lowercase">
                different olive varieties have varying rarity levels based on real-world frequency
              </p>
            </div>

            <div className="grid gap-4">
              {Object.entries(OLIVE_RARITY_DATA.types).map(([type, data]) => (
                <div
                  key={type}
                  className={`p-6 rounded-lg border ${getRarityBgColor(data.rarity)}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 bg-white"
                        dangerouslySetInnerHTML={{ __html: generateSampleOlive(type) }}
                      />
                      <div>
                        <div className="font-mono text-lg font-medium text-neutral-900 lowercase">
                          {data.displayName}
                        </div>
                        <div className={`font-mono text-sm lowercase ${getRarityColor(data.rarity)}`}>
                          {data.rarity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-semibold text-neutral-900">
                        {Math.round(data.weight * 100)}%
                      </div>
                      <div className="font-mono text-xs text-neutral-500 lowercase">
                        drop rate
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Variations */}
                  <div className="space-y-2">
                    <div className="font-mono text-xs text-neutral-600 lowercase">color variations:</div>
                    <div className="flex space-x-2">
                      {OLIVE_RARITY_DATA.colors[type as keyof typeof OLIVE_RARITY_DATA.colors].map((color, index) => (
                        <div
                          key={color}
                          className="w-8 h-8 rounded border border-neutral-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-neutral-200">
          <h3 className="font-mono text-lg font-medium text-neutral-900 lowercase mb-3">
            Botanical Protocol Notes
          </h3>
          <div className="space-y-2 font-mono text-sm text-neutral-600 leading-relaxed">
            <p className="lowercase">
              • each operative receives a unique botanical signature during registration
            </p>
            <p className="lowercase">
              • olive count and type are determined independently using weighted randomization
            </p>
            <p className="lowercase">
              • signatures cannot be regenerated or modified once confirmed
            </p>
            <p className="lowercase">
              • rarity percentages are based on real-world olive cultivation patterns
            </p>
            <p className="lowercase">
              • the complete signature includes branch and leaf variations (not shown)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}