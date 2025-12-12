import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative ornamental pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B4513' fill-opacity='1'%3E%3Cpath d='M0 0h80v1H0zM0 20h80v1H0zM0 40h80v1H0zM0 60h80v1H0z'/%3E%3Cpath d='M0 0v80h1V0zM20 0v80h1V0zM40 0v80h1V0zM60 0v80h1V0z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px'
      }} />
      
      <div className="max-w-4xl w-full text-center relative z-10">
        {/* Elaborate ornamental top border */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-amber-800 to-amber-700" />
            <div className="text-amber-800/60">❖</div>
            <div className="h-[2px] w-8 bg-amber-700" />
            <div className="text-amber-900">◆</div>
            <div className="h-[2px] w-8 bg-amber-700" />
            <div className="text-amber-800/60">❖</div>
            <div className="h-[2px] w-20 bg-gradient-to-l from-transparent via-amber-800 to-amber-700" />
          </div>
          <div className="text-amber-800/40 text-xs">⟡ ⟡ ⟡</div>
        </div>
        
        <div className="mb-8">
          <h1 className="text-7xl font-serif font-bold mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-red-900 to-amber-800">
              Fin
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-orange-900 to-red-900">
              Coach
            </span>
          </h1>
          <p className="text-2xl font-serif text-stone-800 mb-2 italic">
            Financial Coaching That Speaks Your Language
          </p>
          <p className="text-lg text-stone-700/80 font-light">
            Personalized guidance aligned with your unique money style
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-stone-50/95 to-amber-50/90 backdrop-blur-sm rounded-lg shadow-2xl border-4 border-double border-amber-800/40 p-8 mb-8 relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-amber-800/30 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-amber-800/30 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-amber-800/30 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-amber-800/30 rounded-br-lg" />
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-amber-100/70 to-stone-100/60 rounded-lg border-2 border-amber-700/30 hover:border-amber-700/60 transition-all hover:shadow-lg group relative">
              <div className="absolute top-2 right-2 text-xs text-amber-800/30">❖</div>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="font-serif font-bold text-stone-900 mb-2 text-lg">Goals Mode</h3>
              <p className="text-stone-700/80 text-sm font-light leading-relaxed">
                Vision and aspiration-focused planning
              </p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-red-100/60 to-amber-100/60 rounded-lg border-2 border-red-800/30 hover:border-red-800/60 transition-all hover:shadow-lg group relative">
              <div className="absolute top-2 right-2 text-xs text-red-800/30">❖</div>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="font-serif font-bold text-red-950 mb-2 text-lg">Behavior Mode</h3>
              <p className="text-red-900/80 text-sm font-light leading-relaxed">
                Understand your money patterns and habits
              </p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-orange-100/60 to-stone-100/60 rounded-lg border-2 border-orange-800/30 hover:border-orange-800/60 transition-all hover:shadow-lg group relative">
              <div className="absolute top-2 right-2 text-xs text-orange-800/30">❖</div>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📋</div>
              <h3 className="font-serif font-bold text-orange-950 mb-2 text-lg">Plan Mode</h3>
              <p className="text-orange-900/80 text-sm font-light leading-relaxed">
                Concrete actions and tactical optimization
              </p>
            </div>
          </div>
          
          {/* Elaborate decorative divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="text-amber-800/40 text-xs">⟡</div>
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-amber-700/50 mx-2" />
            <div className="text-amber-800/60">❖</div>
            <div className="h-[2px] w-6 bg-amber-700/70 mx-1" />
            <div className="text-amber-900 text-lg">◆</div>
            <div className="h-[2px] w-6 bg-amber-700/70 mx-1" />
            <div className="text-amber-800/60">❖</div>
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-amber-700/50 mx-2" />
            <div className="text-amber-800/40 text-xs">⟡</div>
          </div>
          
          <Link
            href="/onboarding"
            className="inline-block bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 text-stone-50 px-12 py-4 rounded-lg text-lg font-serif font-semibold hover:from-amber-950 hover:via-red-950 hover:to-amber-950 transition-all shadow-lg hover:shadow-xl border-2 border-amber-950/40"
          >
            Get Started — Free 3-Minute Setup
          </Link>
          
          <p className="text-stone-700/70 text-sm mt-4 font-light italic">
            Discover your Money Style • No obligations required
          </p>
          
          <div className="mt-4">
            <Link 
              href="/goals"
              className="text-sm font-serif text-amber-900 hover:text-amber-700 underline transition-colors"
            >
              Already have an account? Go to Dashboard →
            </Link>
          </div>
        </div>
        
        {/* Elaborate ornamental bottom border */}
        <div className="mb-4 flex flex-col items-center">
          <div className="text-amber-800/40 text-xs mb-2">⟡ ⟡ ⟡</div>
          <div className="flex items-center gap-2">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-amber-800 to-amber-700" />
            <div className="text-amber-800/60">❖</div>
            <div className="h-[2px] w-8 bg-amber-700" />
            <div className="text-amber-900">◆</div>
            <div className="h-[2px] w-8 bg-amber-700" />
            <div className="text-amber-800/60">❖</div>
            <div className="h-[2px] w-20 bg-gradient-to-l from-transparent via-amber-800 to-amber-700" />
          </div>
        </div>
        
        <div className="text-stone-700/60 text-xs font-light tracking-widest">
          <p>CRAFTED WITH NEXT.JS • POWERED BY INTELLIGENCE • SECURED ON VERCEL</p>
        </div>
      </div>
    </div>
  );
}
