'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PendingUser {
  userId: string;
  username: string;
  email: string;
  emailVerified?: boolean;
  registrationComplete: boolean;
}

interface OliveBranch {
  id: string;
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
  botanicalId: string;
}

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

export default function GenerateBranchPage() {
  const router = useRouter();
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [generationAttempts, setGenerationAttempts] = useState(0);
  const [currentBranch, setCurrentBranch] = useState<OliveBranch | null>(null);
  const [generationHistory, setGenerationHistory] = useState<OliveBranch[]>([]);
  const [error, setError] = useState<string>('');

  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    // Load pending user data
    const storedUser = localStorage.getItem('pendingUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setPendingUser(userData);
      } catch (error) {
        console.error('Failed to parse pending user data:', error);
        router.push('/register');
      }
    } else {
      router.push('/register');
    }
  }, [router]);

  const generateBranch = async () => {
    if (!pendingUser || generationAttempts >= MAX_ATTEMPTS) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/olive-branches/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: pendingUser.userId,
          isRegistration: true 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate branch');
      }

      const newBranch = data.oliveBranch;
      setCurrentBranch(newBranch);
      setGenerationHistory(prev => [...prev, newBranch]);
      setGenerationAttempts(prev => prev + 1);

    } catch (error) {
      console.error('Branch generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate branch');
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmBranch = async () => {
    if (!pendingUser || !currentBranch) return;

    setIsConfirming(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/olive-branches/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: pendingUser.userId,
          branchId: currentBranch.id 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm branch');
      }

      // Update user data with completed registration
      const completedUser = {
        ...pendingUser,
        registrationComplete: true,
        oliveBranch: currentBranch
      };
      
      localStorage.setItem('galwayUser', JSON.stringify(completedUser));
      localStorage.removeItem('pendingUser');

      // Navigate to completed registration page
      router.push('/register/complete');

    } catch (error) {
      console.error('Branch confirmation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to confirm branch');
    } finally {
      setIsConfirming(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Very Rare': return 'text-red-600 bg-red-50 border-red-200';
      case 'Rare': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Uncommon': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Common': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getOverallRarity = () => {
    if (!currentBranch) return 'Unknown';
    const { count, type } = currentBranch.rarity;
    
    // Determine overall rarity based on rarest component
    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Very Rare'];
    const countIndex = rarityOrder.indexOf(count);
    const typeIndex = rarityOrder.indexOf(type);
    
    return rarityOrder[Math.max(countIndex, typeIndex)];
  };

  if (!pendingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-mono text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 pt-8 sm:pt-10 min-h-screen">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              Generate Your Botanical Signature
            </h1>
            <p className="text-neutral-600 text-sm font-mono">
              Step 3 of 4: Olive Branch Generation Protocol
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-xs font-mono">
              <span className="text-neutral-900">Register</span>
              <span className="text-neutral-900">Verify</span>
              <span className="text-neutral-900">Branch</span>
              <span className="text-neutral-400">Complete</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-neutral-900 h-2 rounded-full w-3/4"></div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-neutral-200">
            <div className="flex items-center justify-between text-sm font-mono">
              <div>
                <span className="text-neutral-500">Operative:</span>
                <span className="text-neutral-900 ml-2">{pendingUser.username}</span>
              </div>
              <div>
                <span className="text-neutral-500">Attempts:</span>
                <span className="text-neutral-900 ml-2">{generationAttempts}/{MAX_ATTEMPTS}</span>
              </div>
            </div>
            {!pendingUser.emailVerified && (
              <div className="mt-2 text-xs text-orange-600 font-mono">
                ⚠️ Email verification pending - complete within 7 days
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-neutral-200">
            {/* Instructions */}
            {!currentBranch && (
              <div className="text-center mb-8">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-neutral-900 font-mono mb-2">
                    Botanical Signature Protocol
                  </h2>
                  <p className="text-sm text-neutral-600 font-mono leading-relaxed max-w-md mx-auto">
                    Your unique olive branch will serve as your botanical signature within the institute. 
                    You have {MAX_ATTEMPTS} generations to find your preferred specimen.
                  </p>
                </div>

                <button
                  onClick={generateBranch}
                  disabled={isGenerating || generationAttempts >= MAX_ATTEMPTS}
                  className={`px-8 py-4 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                    isGenerating || generationAttempts >= MAX_ATTEMPTS
                      ? 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                      : 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(219,82,244,0.3)] hover:shadow-[0_0_30px_rgba(219,82,244,0.6)] animate-pulse-glow'
                  }`}
                >
                  {isGenerating ? 'generating specimen...' : 'generate botanical signature'}
                </button>
              </div>
            )}

            {/* Current Branch Display */}
            {currentBranch && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-neutral-900 font-mono mb-4">
                    Generation #{generationAttempts}
                  </h3>

                  {/* Branch Visualization */}
                  <div className="flex justify-center mb-6">
                    <div className="w-48 h-48 border-2 border-neutral-300 rounded-lg p-4 bg-neutral-50">
                      <div 
                        className="w-full h-full rounded"
                        dangerouslySetInnerHTML={{ __html: currentBranch.svg }}
                      />
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                      <div>
                        <span className="text-neutral-500 block mb-1">Botanical ID:</span>
                        <span className="text-neutral-900 font-medium">{currentBranch.botanicalId}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block mb-1">Olive Count:</span>
                        <span className="text-neutral-900">{currentBranch.oliveCount}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block mb-1">Olive Type:</span>
                        <span className="text-neutral-900">{currentBranch.oliveType}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block mb-1">Overall Rarity:</span>
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getRarityColor(getOverallRarity())}`}>
                          {getOverallRarity()}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Rarity Breakdown */}
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-neutral-500 block mb-1">Count Rarity:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 rounded font-medium ${getRarityColor(currentBranch.rarity.count)}`}>
                              {currentBranch.rarity.count}
                            </span>
                            <span className="text-neutral-400">({currentBranch.rarity.countPercentage}%)</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500 block mb-1">Type Rarity:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 rounded font-medium ${getRarityColor(currentBranch.rarity.type)}`}>
                              {currentBranch.rarity.type}
                            </span>
                            <span className="text-neutral-400">({currentBranch.rarity.typePercentage}%)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Palette */}
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <span className="text-neutral-500 text-xs font-mono block mb-2">Color Palette:</span>
                      <div className="flex space-x-3 justify-center">
                        <div className="text-center">
                          <div 
                            className="w-6 h-6 rounded border border-neutral-300 mx-auto mb-1"
                            style={{ backgroundColor: currentBranch.colors.olive }}
                          ></div>
                          <span className="text-xs text-neutral-500 font-mono">olive</span>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-6 h-6 rounded border border-neutral-300 mx-auto mb-1"
                            style={{ backgroundColor: currentBranch.colors.branch }}
                          ></div>
                          <span className="text-xs text-neutral-500 font-mono">branch</span>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-6 h-6 rounded border border-neutral-300 mx-auto mb-1"
                            style={{ backgroundColor: currentBranch.colors.leaf }}
                          ></div>
                          <span className="text-xs text-neutral-500 font-mono">leaf</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {/* Confirm Branch */}
                    <button
                      onClick={confirmBranch}
                      disabled={isConfirming}
                      className={`px-6 py-3 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                        isConfirming
                          ? 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                          : 'bg-transparent text-green-700 border-green-300 hover:bg-green-700 hover:text-white hover:border-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    >
                      {isConfirming ? 'confirming...' : 'confirm & continue'}
                    </button>

                    {/* Generate Another (if attempts left) */}
                    {generationAttempts < MAX_ATTEMPTS && (
                      <button
                        onClick={generateBranch}
                        disabled={isGenerating}
                        className={`px-6 py-3 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                          isGenerating
                            ? 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                            : 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5'
                        }`}
                      >
                        {isGenerating ? 'generating...' : `try again (${MAX_ATTEMPTS - generationAttempts} left)`}
                      </button>
                    )}
                  </div>

                  {/* Warning if last attempt */}
                  {generationAttempts >= MAX_ATTEMPTS && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-700 font-mono">
                        ⚠️ This is your final generation. You must confirm this branch to proceed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="text-sm text-red-700 font-mono">{error}</p>
                </div>
              </div>
            )}

            {/* Generation History */}
            {generationHistory.length > 1 && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-700 font-mono mb-4 text-center">
                  Previous Generations
                </h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {generationHistory.slice(0, -1).map((branch, index) => (
                    <div key={branch.id} className="text-center">
                      <div className="w-20 h-20 border border-neutral-300 rounded p-2 bg-neutral-50 mb-2">
                        <div 
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: branch.svg }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500 font-mono">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
              <p className="text-xs text-neutral-500 font-mono leading-relaxed">
                Your botanical signature will be permanently associated with your operative profile. 
                Choose carefully, as it cannot be changed after confirmation.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <Link 
              href="/register/confirm-email" 
              className="text-xs text-neutral-500 font-mono hover:text-neutral-700"
            >
              ← back to email verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}