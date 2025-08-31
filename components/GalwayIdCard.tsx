'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CardProps } from '@/lib/types';
import { OLIVE_BRANCH_BG_COLOR } from '@/lib/oliveGenerator';

interface OliveBranchData {
  svg: string;
  colors: {
    olive: string;
    branch: string;
    leaf: string;
  };
  oliveCount: number;
  oliveType?: string;
  rarity?: {
    count: string;
    type: string;
    countPercentage: number;
    typePercentage: number;
  };
  id: number;
}

interface ExtendedCardProps extends CardProps {
  oliveBranch?: OliveBranchData;
  size?: 'small' | 'large';
  compact?: boolean;
  context?: 'default' | 'modal';
}

export default function GalwayIdCard({
  role = 'guest',
  username,
  onset,
  idNo,
  bio,
  oliveBranch,
  followMouse = true,
  size = 'large',
  compact = false,
  context = 'default'
}: ExtendedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 0 });
  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [guestOliveBranch, setGuestOliveBranch] = useState<OliveBranchData | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);

  // Generate a consistent black olive branch for guest users
  useEffect(() => {
    if (role === 'guest') {
      const demoBranch = {
        svg: `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
<!-- Main Stem -->
<rect x="33" y="20" width="4" height="30" fill="#8B7355"/>
<!-- Branches -->
<rect x="24" y="27" width="12" height="4" fill="#8B7355"/>
<rect x="34" y="37" width="12" height="4" fill="#8B7355"/>
<rect x="24" y="44" width="12" height="4" fill="#8B7355"/>
<!-- Leaves -->
<rect x="18" y="25" width="8" height="4" fill="#228B22"/>
<rect x="20" y="29" width="8" height="4" fill="#228B22"/>
<rect x="42" y="35" width="8" height="4" fill="#228B22"/>
<rect x="44" y="39" width="8" height="4" fill="#228B22"/>
<rect x="18" y="42" width="8" height="4" fill="#228B22"/>
<rect x="20" y="46" width="8" height="4" fill="#228B22"/>
<!-- Black Olives -->
<rect x="20" y="32" width="4" height="4" fill="#2F2F2F"/>
<rect x="40" y="42" width="4" height="4" fill="#2F2F2F"/>
<rect x="26" y="49" width="4" height="4" fill="#2F2F2F"/>
</svg>`,
        colors: { olive: '#2F2F2F', branch: '#8B7355', leaf: '#228B22' },
        oliveCount: 3,
        oliveType: 'black olives',
        rarity: {
          count: 'Uncommon',
          type: 'Common',
          countPercentage: 19,
          typePercentage: 25
        },
        id: 999999
      };
      setGuestOliveBranch(demoBranch);
    }
  }, [role]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Mouse tracking for tilt effect (desktop only) - disabled for small cards
  useEffect(() => {
    if (!followMouse || prefersReducedMotion || size === 'small') return;

    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const strength = 20;
      const rotY = (x - 0.5) * strength;
      const rotX = -(y - 0.5) * strength;
      
      setMousePos({ x: x * 100, y: y * 100 });
      setTilt({ rotX, rotY });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: 50, y: 0 });
      setTilt({ rotX: 0, rotY: 0 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [followMouse, prefersReducedMotion, size]);

  // Enhanced device orientation tracking for mobile tilt - disabled for small cards
  useEffect(() => {
    if (prefersReducedMotion || size === 'small') return;

    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const isTouchDevice = 'ontouchstart' in window;
    
    if (!isMobile && !isTouchDevice) return;

    let permissionGranted = false;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && event.gamma !== null) {
        const betaScale = 0.4;
        const gammaScale = 0.4;
        
        const rotX = Math.max(-20, Math.min(20, event.beta * betaScale));
        const rotY = Math.max(-20, Math.min(20, event.gamma * gammaScale));
        
        setTilt({ rotX: -rotX, rotY: rotY });
      }
    };

    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            permissionGranted = true;
            setGyroEnabled(true);
            window.addEventListener('deviceorientation', handleOrientation);
            console.log('Gyroscope permission granted');
          } else {
            console.log('Gyroscope permission denied');
          }
        } catch (error) {
          console.error('Error requesting gyroscope permission:', error);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } else {
        permissionGranted = true;
        setGyroEnabled(true);
        window.addEventListener('deviceorientation', handleOrientation);
        console.log('Gyroscope enabled (no permission required)');
      }
    };

    requestPermission();

    return () => {
      if (permissionGranted) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [prefersReducedMotion, size]);

  // Role-specific data
  const isGuest = role === 'guest';
  const displayUsername = isGuest ? 'guest_user' : username || 'guest_user';
  const displayOnset = isGuest ? 'n/a' : onset || 'n/a';
  const displayIdNo = isGuest ? '######' : idNo || '######';
  const displayBio = isGuest ? 'Register your operative id today!' : bio || 'No self-reported data on record...';

  // Dynamic username sizing with proportional scaling to card sizes
  const getUsernameSize = (name: string) => {
    if (size === 'small') {
      return 'text-[10px]';
    }
    // Scale proportionally: 280px base → 320px (14% larger) → 340px (21% larger)
    if (name.length <= 12) return 'text-xl lg:text-2xl xl:text-3xl';
    if (name.length <= 16) return 'text-lg lg:text-xl xl:text-2xl';
    return 'text-base lg:text-lg xl:text-xl';
  };

  // Dynamic bio text sizing with proportional scaling
  const getBioTextSize = (bio: string) => {
    if (size === 'small') {
      if (bio.length <= 30) return 'text-[5px] leading-[6px]';
      if (bio.length <= 50) return 'text-[4px] leading-[5px]';
      if (bio.length <= 80) return 'text-[3.5px] leading-[4px]';
      return 'text-[3px] leading-[4px]';
    }
    // Scale proportionally to maintain perfect ratios
    if (bio.length <= 40) return 'text-[10px] lg:text-[11px] xl:text-xs';
    if (bio.length <= 60) return 'text-[9px] lg:text-[10px] xl:text-[11px]';
    if (bio.length <= 80) return 'text-[8px] lg:text-[11px] leading-[12px] xl:text-xs leading-[14px]';
    if (bio.length <= 100) return 'text-[7px] lg:text-[10px] leading-[11px] xl:text-[11px] leading-[12px]';
    if (bio.length <= 130) return 'text-[6px] lg:text-[9px] leading-[10px] xl:text-[10px] leading-[11px]';
    return 'text-[5px] lg:text-[8px] leading-[9px] xl:text-[9px] leading-[10px]';
  };

  // Role colors and styling
  const roleStyles = {
    guest: { color: 'rgb(57, 57, 57)' },
    operative: { color: '#DB52F4' },
    contributor: { color: '#D5B504' },
    'beta-tester': { color: '#0D7F10' },
    moderator: { color: '#D40684' }
  };

  const currentStyle = roleStyles[role];

  // Proportional sizing - scale everything based on your card size progression
  // Base: 280px, SM: 280px, LG: 320px (14% increase), XL: 340px (21% increase from base)
  const containerClass = size === 'small' 
    ? 'w-full max-w-[100px] min-w-[80px]' 
    : 'w-full max-w-[280px] sm:max-w-[280px] lg:max-w-[320px] xl:max-w-[340px] min-w-[260px]';
    
  const cardRounding = size === 'small' ? 'rounded-[8px]' : 'rounded-[24px] lg:rounded-[28px] xl:rounded-[30px]';
  const cardPadding = size === 'small' 
    ? 'px-1.5 pt-1.5 pb-1' 
    : 'px-5 pt-5 pb-4 lg:px-6 lg:pt-6 lg:pb-4 xl:px-7 xl:pt-7 xl:pb-5';
  const imageRounding = size === 'small' ? 'rounded-sm' : 'rounded-xl lg:rounded-2xl xl:rounded-2xl';
  const bioHeight = size === 'small' 
    ? 'h-[16px]' 
    : 'h-10 lg:h-12 xl:h-14';
  const bioRounding = size === 'small' ? 'rounded-sm' : 'rounded-md lg:rounded-md xl:rounded-lg';
  const bioPadding = size === 'small' 
    ? 'px-1.5 py-1' 
    : 'px-3 py-2 lg:px-3 lg:py-2.5 xl:px-3 xl:py-3';
  
  // Proportional text sizing for metadata
  const metadataText = size === 'small' 
    ? 'text-[6px]' 
    : 'text-sm lg:text-base xl:text-lg';
      
  const metadataGap = size === 'small' 
    ? 'gap-y-0' 
    : 'gap-y-1.5 lg:gap-y-2 xl:gap-y-3';
      
  const usernameMargin = size === 'small' ? 'mt-0.5' : 'mt-2 lg:mt-2 xl:mt-3';
  const bioMargin = size === 'small' ? 'mt-0.5' : 'mt-2.5 lg:mt-3 xl:mt-4';
  const bioWidth = size === 'small' ? 'w-[85%]' : 'w-[82%]';
  const metadataWidth = size === 'small' ? 'w-[90%]' : 'w-[86%]';

  const dropShadowClass = {
    guest: size === 'small' ? 'shadow-md' : 'drop-shadow-card-guest',
    operative: size === 'small' ? 'shadow-md' : 'drop-shadow-card-operative',
    contributor: size === 'small' ? 'shadow-md' : 'drop-shadow-card-contributor',
    'beta-tester': size === 'small' ? 'shadow-md' : 'drop-shadow-card-beta-tester',
    moderator: size === 'small' ? 'shadow-md' : 'drop-shadow-card-moderator'
  };

  const usernameDropShadowClass = {
    guest: size === 'small' ? '' : 'drop-shadow-username-guest',
    operative: size === 'small' ? '' : 'drop-shadow-username-operative',
    contributor: size === 'small' ? '' : 'drop-shadow-username-contributor',
    'beta-tester': size === 'small' ? '' : 'drop-shadow-username-beta-tester',
    moderator: size === 'small' ? '' : 'drop-shadow-username-moderator'
  };

  // Enhanced olive branch rendering
  const renderOliveBranch = () => {
    if (!isGuest && oliveBranch && oliveBranch.svg) {
      return (
        <div className="w-full h-full">
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: oliveBranch.svg }}
          />
        </div>
      );
    }

    if (isGuest && guestOliveBranch && guestOliveBranch.svg) {
      return (
        <div className="w-full h-full">
          <div 
            className="w-full h-full opacity-60"
            dangerouslySetInnerHTML={{ __html: guestOliveBranch.svg }}
          />
          <div className="absolute inset-0 bg-neutral-900/5 flex items-center justify-center">
            <div className="text-center"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className={`${size === 'small' ? 'w-0.5 h-0.5' : 'w-4 h-4'} mx-auto mb-1 opacity-30 animate-pulse`}>
            <div className="w-full h-full bg-neutral-400 rounded-full"></div>
          </div>
          <div className={`${size === 'small' ? 'text-[4px]' : 'text-xs'} font-mono text-neutral-500`}>loading...</div>
        </div>
      </div>
    );
  };

  // Get the current olive branch data
  const currentOliveBranch = !isGuest && oliveBranch ? oliveBranch : guestOliveBranch;

  // Get rarity color based on rarity level
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-green-600';
      case 'Uncommon': return 'text-blue-600';
      case 'Rare': return 'text-purple-600';
      case 'Very Rare': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div style={{ perspective: size === 'small' ? '600px' : '1200px' }} className={`${containerClass} mx-auto`}>
      <div
        ref={cardRef}
        className={`relative w-full aspect-cr80 ${cardRounding} bg-white border overflow-hidden ${dropShadowClass[role]} transition-transform duration-150 ease-out`}
        style={{
          transform: (prefersReducedMotion || size === 'small') ? 'none' : `rotateY(${tilt.rotY}deg) rotateX(${tilt.rotX}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Top gloss streak */}
        <div 
          className="absolute -top-[30%] -left-[10%] w-[140%] h-[40%] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,.65) 0%, rgba(255,255,255,.15) 60%, rgba(255,255,255,0) 100%)',
            transform: 'rotate(-16deg)',
            borderRadius: size === 'small' ? '24px' : '48px',
            filter: size === 'small' ? 'blur(0.5px)' : 'blur(1px)',
            mixBlendMode: 'screen'
          }}
        />

        {/* Card content */}
        <div className={`absolute inset-0 flex flex-col ${cardPadding}`}>
          {/* Profile image with olive branch */}
          <div className="flex justify-center">
            <div className={`relative aspect-square ${imageRounding} border border-neutral-200 overflow-hidden bg-neutral-50 flex-shrink-0`}
                 style={{ 
                   width: size === 'small' ? '60%' : '68%',
                   aspectRatio: '1'
                 }}>
              {renderOliveBranch()}
              
              {/* Context menu for olive branch info - only for large cards */}
              {currentOliveBranch && size === 'large' && (
                <div className="absolute top-2 right-3 z-20">
                  <button
                    onClick={() => {
                      setShowContextMenu(!showContextMenu);
                      setShowTooltip(false);
                    }}
                    className="text-sm font-mono text-neutral-600 hover:text-neutral-800 transition-colors duration-200 w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center bg-white/90 hover:bg-white/100"
                  >
                    ⋯
                  </button>
                  
                  {/* Context Menu */}
                  {showContextMenu && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-30 min-w-36 overflow-hidden">
                      <Link 
                        href="/olive-rarity"
                        className="block px-3 py-2 text-xs font-mono text-neutral-700 hover:bg-neutral-50 transition-colors duration-150 lowercase"
                        onClick={() => setShowContextMenu(false)}
                      >
                        view rarities →
                      </Link>
                      <button 
                        onClick={() => {
                          setShowTooltip(!showTooltip);
                          setShowContextMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-xs font-mono text-neutral-700 hover:bg-neutral-50 transition-colors duration-150 lowercase border-t border-neutral-100"
                      >
                        branch info
                      </button>
                    </div>
                  )}

                  {/* Branch Info Tooltip */}
                  {showTooltip && (
                    <div className="absolute top-full right-0 mt-1 w-56 p-3 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-md shadow-lg text-xs font-mono text-neutral-600 leading-tight z-30">
                      <button 
                        onClick={() => setShowTooltip(false)}
                        className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                      
                      {!isGuest && currentOliveBranch.rarity ? (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>count:</span>
                              <span>{currentOliveBranch.oliveCount} olives</span>
                            </div>
                            <div className="flex justify-between">
                              <span>rarity:</span>
                              <span className={getRarityColor(currentOliveBranch.rarity.count)}>{currentOliveBranch.rarity.count.toLowerCase()} ({currentOliveBranch.rarity.countPercentage}%)</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>type:</span>
                              <span>{currentOliveBranch.oliveType?.toLowerCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>rarity:</span>
                              <span className={getRarityColor(currentOliveBranch.rarity.type)}>{currentOliveBranch.rarity.type.toLowerCase()} ({currentOliveBranch.rarity.typePercentage}%)</span>
                            </div>
                          </div>
                          
                          <div className="pt-1 border-t border-neutral-300">
                            <div className="text-neutral-500">id: #{currentOliveBranch.id.toString().slice(-6)}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div>demo branch</div>
                          <div>olives: {currentOliveBranch.oliveCount}</div>
                          <div>type: {currentOliveBranch.oliveType?.toLowerCase()}</div>
                          <div className="text-neutral-500 pt-1 border-t border-neutral-300">
                            <div>register to get your own</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Username and bio - now with flex-grow to take available space */}
          <div className="w-full flex flex-col items-center flex-grow justify-center">
            <div 
              className={`${usernameMargin} font-mono leading-none lowercase ${getUsernameSize(displayUsername)} ${usernameDropShadowClass[role]}`}
              style={{ color: role === 'guest' ? 'inherit' : currentStyle.color }}
            >
              {displayUsername}
            </div>
            <div className={`${bioMargin} ${bioWidth} ${bioHeight} ${bioRounding} bg-neutral-300/80 text-center ${bioPadding} flex items-center justify-center overflow-hidden`}>
              <p className={`font-mono text-neutral-700 leading-tight ${getBioTextSize(displayBio)} break-words hyphens-auto`}>
                {displayBio}
              </p>
            </div>
          </div>

          {/* Metadata - now at bottom with flex-shrink-0 and consistent styling */}
          <div className={`${metadataWidth} flex-shrink-0 mx-auto`}>
            <div className={`grid grid-cols-2 ${metadataGap} font-mono ${metadataText} text-left`}>
              <div className="text-neutral-900 lowercase text-left">role:</div>
              <div 
                className="text-right lowercase justify-self-end"
                style={{ color: currentStyle.color }}
              >
                {role === 'beta-tester' ? 'beta-tester' : role}
              </div>

              <div className="text-neutral-900 lowercase text-left">onset:</div>
              <div className="text-right lowercase justify-self-end">{displayOnset}</div>

              <div className="text-neutral-900 lowercase text-left">id-no:</div>
              <div className="text-right lowercase justify-self-end">{displayIdNo}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card shadow - only for large cards */}
      {size === 'large' && (
        <div className="mx-auto mt-4 sm:mt-6 h-4 sm:h-6 w-2/3 rounded-full bg-black/10 blur-xl"></div>
      )}
    </div>
  );
}