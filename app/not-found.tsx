import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="text-center max-w-md">
          {/* Animated GIF */}
          <div className="mb-8">
            <img 
              src="/msn-emoticons/extra/break-computer.gif" 
              alt="Computer breaking"
              className="w-42 h-16 mx-auto"
            />
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-1xl font-mono font-semibold text-neutral-900 mb-4">
              404: PAGE NOT FOUND
            </h1>
            <div className="max-w-xs mx-auto">
              <p className="text-xs font-mono text-neutral-600 leading-relaxed">
                The requested resource could not be located in The Galway Research Institute database.
              </p>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block w-full px-6 py-3 bg-transparent text-neutral-900 font-mono text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-all duration-200 border-2 border-neutral-300 hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              RETURN HOME
            </Link>
            
            <Link
              href="/correspondence"
              className="inline-block w-full px-6 py-3 bg-neutral-100 text-neutral-700 font-mono text-sm uppercase tracking-wide hover:bg-neutral-200 transition-all duration-200 border-2 border-neutral-200 hover:border-neutral-300"
            >
              REPORT ISSUE
            </Link>
          </div>

          {/* Technical Details */}
          <div className="mt-8 pt-6 border-t border-neutral-200/50">
            <p className="text-xs text-neutral-400 font-mono mt-3">
             © 2025 Galway Research Institute
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}