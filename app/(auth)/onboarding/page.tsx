'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { saveUserProfile } from '@/lib/kv';

export default function OnboardingWelcome() {
  const router = useRouter();
  const { userId } = useUser();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    occupation: '',
    primaryGoal: '',
  });

  const handleContinue = async () => {
    if (step === 1 && profile.name && profile.email) {
      setStep(2);
    } else if (step === 2 && profile.primaryGoal) {
      // Use real userId if available, otherwise use demo userId for local dev
      const effectiveUserId = userId || 'demo-user-local';
      
      // Save to KV
      await saveUserProfile({
        userId: effectiveUserId,
        email: profile.email,
        name: profile.name,
        createdAt: new Date().toISOString(),
        lifeContext: {
          age: parseInt(profile.age) || undefined,
          employmentStatus: profile.occupation,
        },
        statedPreferences: {
          priorityGoals: [profile.primaryGoal],
        },
      });
      router.push('/onboarding/assessment');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 group mb-8">
            <span className="text-3xl font-bold gradient-text">FinCoach</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to Your Financial Journey
          </h1>
          <p className="text-neutral-400 text-lg">
            Let&apos;s get to know you so we can personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-all ${step >= 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-neutral-900 text-neutral-600 border-neutral-700'}`}>
              1
            </div>
            <div className={`h-0.5 w-16 transition-colors ${step >= 2 ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-all ${step >= 2 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-neutral-900 text-neutral-600 border-neutral-700'}`}>
              2
            </div>
            <div className={`h-0.5 w-16 bg-neutral-800`} />
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 bg-neutral-900 text-neutral-600 border-neutral-700">
              3
            </div>
          </div>
          <div className="text-center text-sm text-neutral-500">
            {step === 1 && 'Step 1: Basic Info'}
            {step === 2 && 'Step 2: Your Goals'}
          </div>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl p-8 border border-white/10">

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2 flex items-center gap-2">
                  <span>👋</span> Tell us about yourself
                </h2>
                <p className="text-stone-700 font-serif text-sm">
                  We&apos;ll use this to personalize your experience and provide better insights.
                </p>
              </div>

              <div>
                <label className="block text-sm font-serif font-semibold text-stone-900 mb-2">
                  What&apos;s your name? <span className="text-red-800">*</span>
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-lg font-serif text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-serif font-semibold text-stone-900 mb-2">
                  Email address <span className="text-red-800">*</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-lg font-serif text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-900 mb-2">
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="30"
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-lg font-serif text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-900 mb-2">
                    Occupation (optional)
                  </label>
                  <input
                    type="text"
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-lg font-serif text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Primary Goal */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2 flex items-center gap-2">
                  <span>🎯</span> What&apos;s your primary financial goal?
                </h2>
                <p className="text-stone-700 font-serif text-sm">
                  Choose the goal that matters most to you right now. You can add more later.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'house', emoji: '🏠', title: 'Buy a house', description: 'Save for down payment and closing costs' },
                  { value: 'debt', emoji: '💳', title: 'Pay off debt', description: 'Eliminate credit cards, loans, or student debt' },
                  { value: 'emergency', emoji: '🚨', title: 'Build emergency fund', description: 'Create financial safety net (3-6 months expenses)' },
                  { value: 'retirement', emoji: '🏖️', title: 'Retirement savings', description: 'Secure your financial future' },
                  { value: 'investment', emoji: '📈', title: 'Start investing', description: 'Build wealth through investments' },
                  { value: 'education', emoji: '🎓', title: 'Education fund', description: 'Save for your or your children\'s education' },
                  { value: 'business', emoji: '💼', title: 'Start a business', description: 'Fund your entrepreneurial dreams' },
                  { value: 'other', emoji: '✨', title: 'Something else', description: 'Custom financial goal' },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setProfile({ ...profile, primaryGoal: goal.value })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      profile.primaryGoal === goal.value
                        ? 'border-amber-800 bg-gradient-to-r from-amber-50 to-red-50 shadow-lg'
                        : 'border-stone-300 bg-stone-50 hover:border-amber-600 hover:bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goal.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-serif font-bold text-stone-900">{goal.title}</h3>
                        <p className="text-sm font-serif text-stone-600">{goal.description}</p>
                      </div>
                      {profile.primaryGoal === goal.value && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-800 to-red-900 flex items-center justify-center">
                          <span className="text-stone-50 text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-lg font-serif font-semibold transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleContinue}
              disabled={step === 1 ? !profile.name || !profile.email : !profile.primaryGoal}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-800 to-red-900 hover:from-amber-900 hover:to-red-950 text-stone-50 rounded-lg font-serif font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {step === 2 ? 'Continue to Assessment →' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm font-serif text-stone-600">
            Next: Take our 3-minute Money Style assessment to personalize your experience
          </p>
        </div>
      </div>
    </div>
  );
}
