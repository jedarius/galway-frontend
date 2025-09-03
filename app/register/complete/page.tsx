'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CompletedUser {
  userId: string;
  username: string;
  email: string;
  role: string;
  onset: string;
  idNo: string;
  bio: string;
  emailVerified?: boolean;
  registrationComplete: boolean;
  oliveBranch: {
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
  };
}

// Mock Galway ID Card Component (you can replace this with your actual component)
const GalwayIdCard = ({ user }: { user: CompletedUser }) => {
  const roleColors = {
    guest: 'rgb(57, 57, 57)',
    operative: '#DB52F4',
    contributor: '#D5B504',
    'beta-tester': '#0D7F10',
    moderator: '#D40684'
  };

  const roleColor = roleColors[user.role as keyof typeof roleColors] || roleColors.operative;

  return (
    <div className="w-80 h-[480px] relative">
      {/* Card Background */}
      <div 
        className="w-full h-full rounded-lg shadow-lg border-2 border-neutral-300 bg-white overflow-hidden"
        style={{ 
          filter: `drop-shadow(0 0 17px ${roleColor}14)` 
        }}
      >
        {/* Header */}
        <div className="bg-neutral-900 text-white px-4 py-3">
          <div className="text-center">
            <h3 className="text-sm font-mono uppercase tracking-wide">
              Galway Research Institute
            </h3>
            <p className="text-xs text-neutral-400 font-mono">Operative Identification</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="text-center">
            <h2 
              className="text-xl font-mono font-semibold mb-1"
              style={{ 
                color: roleColor,
                filter: `drop-shadow(0 0 7px ${roleColor}14)`
              }}
            >
              {user.username}
            </h2>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-wide">
              {user.role}
            </p>
          </div>

          {/* Olive Branch */}
          <div className="flex justify-center">
            <div className="w-32 h-32 border border-neutral-300 rounded p-2 bg-neutral-50">
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: user.oliveBranch.svg }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-500">ID No:</span>
              <span className="text-neutral-900">{user.idNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Onset:</span>
              <span className="text-neutral-900">{user.onset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Branch ID:</span>
              <span className="text-neutral-900">{user.oliveBranch.botanicalId}</span>
            </div>
          </div>

          {/* Bio */}
          <div className="pt-2 border-t border-neutral-200">
            <p className="text-xs text-neutral-600 font-mono leading-relaxed">
              {user.bio}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-neutral-200 text-center">
            <p className="text-xs text-neutral-400 font-mono">
              EST. 2025 • VERIFIED OPERATIVE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RegistrationCompletePage() {
  const router = useRouter();
  const [user, setUser] = useState<CompletedUser | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Load completed user data
    const storedUser = localStorage.getItem('galwayUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.registrationComplete) {
          setUser(userData);
        } else {
          router.push('/register');
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        router.push('/register');
      }
    } else {
      router.push('/register');
    }
  }, [router]);

  useEffect(() => {
    // Auto-dismiss welcome message after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // Update auth state and redirect to dashboard/home
    router.push('/');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Very Rare': return 'text-red-600';
      case 'Rare': return 'text-purple-600';
      case 'Uncommon': return 'text-blue-600';
      case 'Common': return 'text-green-600';
      default: return 'text-neutral-600';
    }
  };

  const getOverallRarity = () => {
    if (!user) return 'Unknown';
    const { count, type } = user.oliveBranch.rarity;
    
    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Very Rare'];
    const countIndex = rarityOrder.indexOf(count);
    const typeIndex = rarityOrder.indexOf(type);
    
    return rarityOrder[Math.max(countIndex, typeIndex)];
  };

  if (!user) {
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

      <div className="relative z-10 p-4 sm:p-6 pt-8 sm:pt-10 min-h-screen">
        {/* Welcome Message */}
        {showWelcome && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono text-green-800">
                  <strong>Registration Complete!</strong>
                </p>
                <p className="text-xs font-mono text-green-600 mt-1">
                  Welcome to the Galway Research Institute
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="flex-shrink-0 text-green-500 hover:text-green-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
              Welcome to Galway Research
            </h1>
            <p className="text-neutral-600 text-sm font-mono">
              Your operative credentials have been issued
            </p>
          </div>

          {/* Progress Bar - Complete */}
          <div className="mb-12 max-w-md mx-auto">
            <div className="flex justify-between mb-2 text-xs font-mono">
              <span className="text-neutral-900">Register</span>
              <span className="text-neutral-900">Verify</span>
              <span className="text-neutral-900">Branch</span>
              <span className="text-neutral-900">Complete</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-neutral-900 h-2 rounded-full w-full"></div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:space-x-12 space-y-8 lg:space-y-0">
            {/* ID Card */}
            <div className="flex justify-center lg:flex-shrink-0">
              <GalwayIdCard user={user} />
            </div>

            {/* Info Panel */}
            <div className="lg:flex-1 lg:max-w-xl w-full">
              <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-neutral-200">
                <div className="space-y-6">
                  {/* Account Status */}
                  <div>
                    <h2 className="text-lg font-medium text-neutral-900 font-mono mb-4">
                      Account Status
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm font-mono">
                        <span className="text-neutral-500">Registration:</span>
                        <span className="text-green-600">✓ Complete</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-mono">
                        <span className="text-neutral-500">Email Verification:</span>
                        <span className={user.emailVerified ? "text-green-600" : "text-orange-600"}>
                          {user.emailVerified ? "✓ Verified" : "⚠️ Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-mono">
                        <span className="text-neutral-500">Botanical Signature:</span>
                        <span className="text-green-600">✓ Generated</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-mono">
                        <span className="text-neutral-500">Operative Status:</span>
                        <span className="text-green-600">✓ Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Email Verification Warning */}
                  {!user.emailVerified && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-mono text-orange-800 font-medium">
                            Email Verification Required
                          </p>
                          <p className="text-xs font-mono text-orange-600 mt-1">
                            Please verify your email within 7 days or your account will be deleted.
                          </p>
                          <Link 
                            href="/verify-email" 
                            className="text-xs font-mono text-orange-700 hover:text-orange-900 hover:underline mt-2 inline-block"
                          >
                            Resend verification email →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Branch Summary */}
                  <div>
                    <h3 className="text-md font-medium text-neutral-900 font-mono mb-3">
                      Botanical Signature Summary
                    </h3>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-neutral-500">Specimen ID:</span>
                        <span className="text-neutral-900">{user.oliveBranch.botanicalId}</span>
                      </div>
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-neutral-500">Olive Count:</span>
                        <span className="text-neutral-900">{user.oliveBranch.oliveCount}</span>
                      </div>
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-neutral-500">Olive Type:</span>
                        <span className="text-neutral-900">{user.oliveBranch.oliveType}</span>
                      </div>
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-neutral-500">Overall Rarity:</span>
                        <span className={`${getRarityColor(getOverallRarity())}`}>
                          {getOverallRarity()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="text-md font-medium text-neutral-900 font-mono mb-3">
                      Getting Started
                    </h3>
                    <div className="space-y-3 text-sm font-mono">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-neutral-700">
                          Explore your inventory and begin collecting seeds and specimens
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-neutral-700">
                          Connect with other operatives and participate in research discussions
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-neutral-700">
                          Visit the marketplace to trade specimens and acquire research materials
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-neutral-200">
                    <button
                      onClick={handleGetStarted}
                      className="w-full py-3 px-6 font-mono text-sm uppercase tracking-wide bg-transparent text-neutral-900 border-2 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Enter Institute →
                    </button>

                    <div className="mt-4 text-center">
                      <Link 
                        href="/correspondence"
                        className="text-xs text-neutral-500 font-mono hover:text-neutral-700 hover:underline"
                      >
                        Need help getting started? Contact support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-neutral-200/50">
            <p className="text-xs text-neutral-400 font-mono">
              Welcome to the Galway Research Institute • EST. 2025
            </p>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Your journey in botanical research begins now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}