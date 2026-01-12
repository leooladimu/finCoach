import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/kv';

export default async function Home() {
  const { userId } = await auth();
  
  // If already signed in, check their profile status
  if (userId) {
    try {
      const profile = await getUserProfile(userId);
      
      // If they have a money style, they've completed assessment - go to goals
      if (profile?.moneyStyle) {
        redirect('/goals');
      } else {
        // No money style yet - send to onboarding
        redirect('/onboarding');
      }
    } catch {
      // If error getting profile, send to onboarding to start fresh
      redirect('/onboarding');
    }
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">FinCoach</span>
          </h1>
          <p className="text-3xl md:text-4xl text-white mb-4 font-medium">
            Financial Coaching That Speaks Your Language
          </p>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Personalized AI-powered guidance aligned with your unique money style
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass rounded-2xl p-8 border border-white/10 hover:border-emerald-500/30 transition-all group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-3">Goals Mode</h3>
            <p className="text-neutral-400 leading-relaxed">
              Vision and aspiration-focused planning for your financial future
            </p>
          </div>
          
          <div className="glass rounded-2xl p-8 border border-white/10 hover:border-blue-500/30 transition-all group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="text-xl font-semibold text-white mb-3">Behavior Mode</h3>
            <p className="text-neutral-400 leading-relaxed">
              Understand your money patterns and build better habits
            </p>
          </div>
          
          <div className="glass rounded-2xl p-8 border border-white/10 hover:border-violet-500/30 transition-all group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="text-xl font-semibold text-white mb-3">Plan Mode</h3>
            <p className="text-neutral-400 leading-relaxed">
              Concrete actions and tactical optimization strategies
            </p>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/sign-up"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 mb-4"
          >
            Get Started — Free 3-Minute Setup
          </Link>
          
          <p className="text-neutral-500 text-sm mb-4">
            Discover your Money Style • No credit card required
          </p>
          
          <Link 
            href="/sign-in"
            className="text-sm text-neutral-400 hover:text-emerald-500 transition-colors inline-flex items-center gap-2"
          >
            Already using FinCoach? Sign In
            <span>→</span>
          </Link>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-16 text-neutral-600 text-xs">
          <p>BUILT WITH NEXT.JS • POWERED BY AI • SECURED ON VERCEL</p>
        </div>
      </div>
    </div>
  );
}
