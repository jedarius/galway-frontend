'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import PlaceholderLogo from '../PlaceholderLogo';
import MobileMenu from './MobileMenu';

export default function Header() {
  const { isLoggedIn, cartItemCount } = useAuth();  // ← Add cartItemCount
  const pathname = usePathname();

  const navItems = [
    { name: 'CATALOG', href: '/catalog' },
    { name: 'FORUM', href: '/forum' },
    { name: 'INSTITUTE', href: '/institute' },
    { name: 'CORRESPONDENCE', href: '/correspondence' },
    { name: 'DATABASE', href: '/database' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <div className="transform group-hover:scale-105 transition-transform duration-200">
              <PlaceholderLogo />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 text-neutral-700 hover:text-neutral-900 font-mono text-sm transition-all duration-200 rounded-md group ${
                  isActive(item.href) 
                    ? 'text-neutral-900 bg-neutral-100' 
                    : 'hover:bg-neutral-50'
                }`}
              >
                <span className="relative z-10">{item.name}</span>
                {/* Active indicator */}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-neutral-900 rounded-full"></div>
                )}
                {/* Hover indicator */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-neutral-400 group-hover:w-6 transition-all duration-200"></div>
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            {/* Cart icon with subtle badge */}
{/* Cart icon with conditional badge */}
<Link
    href="/cart"
    className="relative p-2 text-neutral-700 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 rounded-md transition-all duration-200 hover:bg-neutral-50 group"
    aria-label="Shopping cart"
  >
    <span className="material-symbols-sharp translate-y-1 group-hover:scale-110 transition-transform duration-200" style={{ fontSize: '24px' }}>shopping_cart</span>
    {/* Conditional cart badge */}
    {isLoggedIn && cartItemCount > 0 && (  // ← Updated condition
      <span className="absolute -top+1 -right-0.5 w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse-fast"></span>
    )}
  </Link>

            {/* Settings icon */}
            <Link
              href="/settings"
              className="p-2 text-neutral-700 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 rounded-md transition-all duration-200 hover:bg-neutral-50 group"
              aria-label="Settings"
            >
              <svg className="w-6 h-6 group-hover:rotate-45 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* Mobile menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}