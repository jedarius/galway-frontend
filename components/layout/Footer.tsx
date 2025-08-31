export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-50 border-t border-neutral-200 mt-auto relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Main tagline */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 font-mono leading-relaxed">
              © 2025 Galway Research Institute
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <p className="text-xs text-neutral-500 font-mono">
                Field-tested research. Evidence-based iteration.
              </p>
            </div>
          </div>

          {/* Research ethics statement (Temporarirly Removed)
          <div className="text-center border-t border-neutral-200/50 pt-4 max-w-md">
            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              All research recorded in line with temporal ethics protocols. 
              
              Data integrity maintained via peer review and operative accountability
            </p>
          </div>*/}

          {/* Status indicators */}
          <div className="flex items-center space-x-4 text-xs text-neutral-400 font-mono">
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 rounded-full animate-pulse-fast" style={{backgroundColor: '#2cff00'}}></div>
    <span>SYSTEMS OPERATIONAL</span>
  </div>
  <div className="w-px h-4 bg-neutral-300"></div>
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 rounded-full animate-pulse-fast" style={{backgroundColor: '#2cff00'}}></div>
    <span>DATA SECURE</span>
  </div>
  <div className="w-px h-4 bg-neutral-300"></div>
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 rounded-full animate-pulse-fast" style={{backgroundColor: '#ff0000'}}></div>
    <span>STARS ALIGNED</span>
  </div>
</div>
        </div>
      </div>
    </footer>
  );
}