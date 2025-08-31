'use client';
import { generateOliveBranch } from '@/lib/oliveGenerator';
import { useAuth } from '@/lib/auth';
import GalwayIdCard from '@/components/GalwayIdCard';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface StoredUserData {
  username: string;
  email: string;
  role: string;
  onset: string;
  idNo: string;
  bio: string;
  isEmailVerified: boolean;
  oliveBranch?: {
    svg: string;
    colors: {
      olive: string;
      branch: string;
      leaf: string;
    };
    oliveCount: number;
    id: number;
  };
  registrationComplete?: boolean;
}

export default function HomePage() {
  const { isLoggedIn, user, toggleAuth, cartItemCount, addToCart, clearCart } = useAuth();
  const [storedUserData, setStoredUserData] = useState<StoredUserData | null>(null);

  // Load stored user data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('galwayUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setStoredUserData(userData);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
  }, [isLoggedIn]);

  // Role colors
  const roleColors = {
    guest: 'rgb(57, 57, 57)',
    operative: '#DB52F4',
    contributor: '#D5B504',
    'beta-tester': '#0D7F10',
    moderator: '#D40684'
  };

  // Get the olive branch data for the card
  const getOliveBranchForCard = () => {
    if (isLoggedIn && storedUserData?.oliveBranch) {
      return storedUserData.oliveBranch;
    }
    return undefined;
  };

  // Handle logout functionality
  const handleLogout = () => {
    // Clear stored user data
    localStorage.removeItem('galwayUser');
    setStoredUserData(null);
    // Toggle auth state (or call actual logout function)
    toggleAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 pt-8 sm:pt-10 min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:space-x-8 space-y-6 lg:space-y-0">
            {/* Card Section */}
            <div className="w-full lg:w-96 flex justify-center lg:flex-shrink-0">
              <GalwayIdCard
                role={isLoggedIn && user ? user.role : 'guest'}
                username={user?.username}
                onset={user?.onset}
                idNo={user?.idNo}
                bio={user?.bio}
                oliveBranch={getOliveBranchForCard()}
                followMouse={true}
              />
            </div>

            {/* Content Section */}
            <div className="lg:flex-1 lg:max-w-xl w-full">
              {!isLoggedIn ? (
                // Guest state
                <div className="text-center lg:text-center">
                  <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3 leading-tight">
                      Welcome to Galaway Research!
                    </h1>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="rounded-lg p-4">
                      <p className="text-neutral-700 leading-relaxed">
                        Claim your Operative ID to record your findings, engage in official discourse, and access restricted items.
                      </p>
                    </div>
                    
                    <div className="rounded-lg p-4">
                      <p className="text-neutral-600 leading-relaxed">
                        Unregistered visitors remain outside the network and cannot participate in studies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-center">
                    <Link
                      href="/register"
                      className="group px-6 py-3 bg-transparent text-neutral-900 font-mono text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-all duration-200 border-2 border-neutral-300 hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(219,82,244,0.4)] hover:shadow-[0_0_30px_rgba(219,82,244,0.7)] animate-pulse-glow"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>REGISTER</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                      </span>
                    </Link>
                    <Link
                      href="/login"
                      className="group px-6 py-3 bg-transparent text-neutral-900 font-mono text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-all duration-200 border-2 border-neutral-300 hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>LOG-IN</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                // Logged in state
                <div className="text-center lg:text-center">
                  <div className="mb-0">
                    {/*<h1 className="text-sm sm:text-sm font-semibold text-neutral-900 mb-2 leading-tight">
                      Hello, <span 
                        style={{ color: user?.role ? roleColors[user.role] : roleColors.guest }}
                      >
                        {user?.username}
                      </span>!
                    </h1>*/}
                  </div>
                  
                  <div className="rounded-lg p-0 mb-0">
                     {/*<p className="text-xs text-neutral-700 leading-relaxed max-w-60 text-center">
                      Your credentials have been verified and your operative profile is active.
                    </p> 
                    {/*{storedUserData?.oliveBranch && (
                      <p className="text-neutral-600 text-sm mt-2 font-mono">
                       Botanical signature confirmed: #{storedUserData.oliveBranch.id.toString().slice(-6)}
                      </p> 
                    )}*/}
                  </div> 
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Link
                      href="/inventory"
                      className="group px-4 py-3 bg-transparent text-neutral-900 font-mono text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-all duration-200 border-2 border-neutral-300 hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5 text-center"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>INVENTORY</span>
                      </span>
                    </Link>
                    <Link
                      href="/cart"
                      className="group px-4 py-3 bg-transparent text-neutral-900 font-mono text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-all duration-200 border-2 border-neutral-300 hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5 text-center">
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5 6m0 0h9" />
                        </svg>
                        <span>CATALOG</span>
                      </span>
                    </Link>
                    <Link
                      href="/settings"
                      className="group px-4 py-3 bg-transparent text-neutral-900 font-mono text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-all duration-200 border-2 border-neutral-300 hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5 text-center"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>SETTINGS</span>
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="group px-4 py-3 bg-transparent text-neutral-900 font-mono text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-all duration-200 border-2 border-neutral-300 hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5 text-center"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>LOG-OUT</span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Demo toggle button - remove when real auth is implemented */}
              <div className="mt-8 pt-6 border-t border-neutral-200/50">
                <p className="text-xs text-neutral-400 mb-3 text-center lg:text-left font-mono">Demo Controls (Remove in production):</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={toggleAuth}
                    className="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs font-mono border border-yellow-200 rounded hover:bg-yellow-100 transition-colors duration-200"
                  >
                    Toggle Auth State
                  </button>
                  <button
                    onClick={addToCart}
                    className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-mono border border-blue-200 rounded hover:bg-blue-100 transition-colors duration-200"
                  >
                    Add to Cart ({cartItemCount})
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-4 py-2 bg-red-50 text-red-700 text-xs font-mono border border-red-200 rounded hover:bg-red-100 transition-colors duration-200"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}