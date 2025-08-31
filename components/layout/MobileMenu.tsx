'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { 
      name: 'CATALOG', 
      href: '/catalog',
      icon: 'attach_money',
      description: 'Browse our research catalog'
    },
    { 
      name: 'FORUM', 
      href: '/forum',
      icon: 'forum',
      description: 'Community discussions'
    },
    { 
      name: 'INSTITUTE', 
      href: '/institute',
      icon: 'info',
      description: 'About our research'
    },
    { 
      name: 'CORRESPONDENCE', 
      href: '/correspondence',
      icon: 'mail',
      description: 'Official communications'
    },
    { 
      name: 'DATABASE', 
      href: '/database',
      icon: 'search',
      description: 'Research database'
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="lg:hidden">
      {/* Menu button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-neutral-700 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 rounded-md transition-all duration-200 hover:bg-neutral-50 group"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          // Close icon (X) with rotation animation
          <svg className="w-6 h-6 transform rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Menu icon (hamburger) with hover animation
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className="w-6 h-0.5 bg-current transform group-hover:translate-x-1 transition-transform duration-200"></div>
            <div className="w-6 h-0.5 bg-current"></div>
            <div className="w-6 h-0.5 bg-current transform group-hover:-translate-x-1 transition-transform duration-200"></div>
          </div>
        )}
      </button>

      {/* Dropdown menu with enhanced animations */}
      {isOpen && (
        <>
          
          {/* Menu panel */}
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-xl z-50">
            <nav className="px-4 py-3 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between px-4 py-4 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50/80 rounded-lg transition-all duration-200 font-mono ${
                      isActive(item.href) 
                        ? 'bg-neutral-50 text-neutral-900' 
                        : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <span 
                        className="material-symbols-sharp text-lg group-hover:scale-110 transition-transform duration-200" 
                        style={{ fontSize: '18px' }}
                      >
                        {item.icon}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-200">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    
                    {/* Arrow indicator */}
                    <svg 
                      className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
              
              {/* Menu footer */}
              <div className="mt-4 pt-3 border-t border-neutral-200/50">
                <div className="text-xs text-neutral-400 text-center font-mono">
                  Navigation Menu
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}