/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        role: {
          guest: 'rgb(57, 57, 57)',
          operative: '#DB52F4',
          contributor: '#D5B504',
          'beta-tester': '#0D7F10',
          moderator: '#D40684',
        },
        neutral: {
          150: '#f4f4f5',
        }
      },
      aspectRatio: {
        'cr80': '54 / 86',
      },
      dropShadow: {
        'card-guest': ['0 0 17px rgba(0, 0, 0, 0.14)'],
        'card-operative': ['0 0 17px rgba(219, 82, 244, 0.14)'],
        'card-contributor': ['0 0 17px rgba(213, 181, 4, 0.14)'],
        'card-beta-tester': ['0 0 17px rgba(13, 127, 16, 0.14)'],
        'card-moderator': ['0 0 17px rgba(212, 6, 132, 0.14)'],
        // Username text drop shadows
        'username-guest': ['0 0 7px rgba(57, 57, 57, 0.14)'],
        'username-operative': ['0 0 7px rgba(219, 82, 244, 0.14)'],
        'username-contributor': ['0 0 7px rgba(213, 181, 4, 0.14)'],
        'username-beta-tester': ['0 0 7px rgba(13, 127, 16, 0.14)'],
        'username-moderator': ['0 0 7px rgba(212, 6, 132, 0.14)'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse-fast 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 0.8s ease-in-out infinite',  // ← Add this
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pulse-glow': {  // ← Add this
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(219, 82, 244, 0.4)' 
          },
          '50%': { 
            boxShadow: '0 0 35px rgba(219, 82, 244, 0.8)' 
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}