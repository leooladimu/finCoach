'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AssessmentResult } from '@/types';
import { useUser } from '@/lib/hooks/useUser';
import { getUserProfile, updateUserProfile } from '@/lib/kv';

export default function ProfilePage() {
  const { userId, isLoaded } = useUser();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    occupation: '',
    primaryGoal: '',
  });
  
  const [moneyStyle, setMoneyStyle] = useState<AssessmentResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  // Load profile and money style from KV
  useEffect(() => {
    async function loadData() {
      if (!isLoaded || !userId) return;
      
      const kvProfile = await getUserProfile(userId);
      if (kvProfile) {
        const profileData = {
          name: kvProfile.name,
          email: kvProfile.email,
          age: kvProfile.lifeContext?.age?.toString() || '',
          occupation: kvProfile.lifeContext?.employmentStatus || '',
          primaryGoal: kvProfile.statedPreferences?.priorityGoals?.[0] || '',
        };
        setProfile(profileData);
        setEditedProfile(profileData);
        
        if (kvProfile.moneyStyle) {
          setMoneyStyle({
            type: kvProfile.moneyStyle.type,
            scores: kvProfile.moneyStyle.scores,
            moneyStyleDescription: '',
            coachingApproach: '',
          });
        }
      }
    }
    
    loadData();
  }, [userId, isLoaded]);

  const handleSave = async () => {
    setProfile(editedProfile);
    
    // Save to KV
    if (userId) {
      await updateUserProfile(userId, {
        name: editedProfile.name,
        email: editedProfile.email,
        lifeContext: {
          age: parseInt(editedProfile.age) || undefined,
          employmentStatus: editedProfile.occupation,
        },
        statedPreferences: {
          priorityGoals: [editedProfile.primaryGoal],
        },
      });
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const goalLabels: Record<string, { emoji: string; title: string }> = {
    house: { emoji: '🏠', title: 'Buy a house' },
    debt: { emoji: '💳', title: 'Pay off debt' },
    emergency: { emoji: '🚨', title: 'Build emergency fund' },
    retirement: { emoji: '🏖️', title: 'Retirement savings' },
    investment: { emoji: '📈', title: 'Start investing' },
    education: { emoji: '🎓', title: 'Education fund' },
    business: { emoji: '💼', title: 'Start a business' },
    other: { emoji: '✨', title: 'Custom goal' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-50/80 to-amber-50/80 backdrop-blur-sm shadow-lg border-b-2 border-amber-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-2xl">💰</div>
              <span className="text-2xl font-serif font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-red-900 to-amber-800">
                  Fin
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-orange-900 to-red-900">
                  Coach
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/goals" className="text-sm text-stone-800 font-serif hover:text-amber-900 transition-colors">
                Dashboard
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-800 to-red-900 rounded-full flex items-center justify-center text-stone-50 font-serif font-semibold border-2 border-amber-900/40 shadow-md">
                {profile.name.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Your Profile</h1>
          <p className="text-stone-700 font-serif">
            Manage your personal information and financial preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-8 shadow-xl relative overflow-hidden mb-6">
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />

          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <span>👤</span> Personal Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-stone-50 rounded-lg font-serif font-semibold text-sm transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-stone-300 hover:bg-stone-400 text-stone-900 rounded-lg font-serif font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 text-stone-50 rounded-lg font-serif font-semibold text-sm transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-serif font-semibold text-stone-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-lg font-serif text-stone-900 focus:outline-none focus:border-amber-800 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-serif font-semibold text-stone-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-lg font-serif text-stone-900 focus:outline-none focus:border-amber-800 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-900 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={editedProfile.age}
                    onChange={(e) => setEditedProfile({ ...editedProfile, age: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-lg font-serif text-stone-900 focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-900 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={editedProfile.occupation}
                    onChange={(e) => setEditedProfile({ ...editedProfile, occupation: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-lg font-serif text-stone-900 focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-serif text-stone-600 mb-1">Name</p>
                <p className="font-serif font-semibold text-stone-900 text-lg">
                  {profile.name || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-serif text-stone-600 mb-1">Email</p>
                <p className="font-serif font-semibold text-stone-900 text-lg">
                  {profile.email || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-serif text-stone-600 mb-1">Age</p>
                <p className="font-serif font-semibold text-stone-900 text-lg">
                  {profile.age || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-serif text-stone-600 mb-1">Occupation</p>
                <p className="font-serif font-semibold text-stone-900 text-lg">
                  {profile.occupation || 'Not set'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Primary Goal Card */}
        <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-8 shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />

          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span>🎯</span> Primary Financial Goal
          </h2>
          
          {profile.primaryGoal && goalLabels[profile.primaryGoal] ? (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-red-50 rounded-lg border-2 border-amber-800/30">
              <span className="text-5xl">{goalLabels[profile.primaryGoal].emoji}</span>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-xl">
                  {goalLabels[profile.primaryGoal].title}
                </h3>
                <Link 
                  href="/goals"
                  className="text-sm font-serif text-amber-900 hover:text-amber-700 transition-colors"
                >
                  View all goals →
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-stone-700 font-serif">
              No primary goal set. <Link href="/onboarding" className="text-amber-900 hover:text-amber-700 font-semibold">Complete onboarding</Link>
            </p>
          )}
        </div>

        {/* Money Style Card */}
        {moneyStyle && (
          <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-8 shadow-xl relative overflow-hidden mb-6">
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />

            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span>🧠</span> Your Money Style
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-serif text-stone-600 mb-1">Personality Type</p>
                <p className="font-serif font-bold text-stone-900 text-3xl mb-2">{moneyStyle.type}</p>
                <p className="font-serif text-stone-800 leading-relaxed">
                  {moneyStyle.moneyStyleDescription}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-stone-300">
                <div>
                  <p className="text-xs font-serif text-stone-600 mb-1">Energy</p>
                  <p className="font-serif font-semibold text-stone-900">
                    {moneyStyle.type.charAt(0) === 'E' ? 'Extrovert' : 'Introvert'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-serif text-stone-600 mb-1">Information</p>
                  <p className="font-serif font-semibold text-stone-900">
                    {moneyStyle.type.charAt(1) === 'S' ? 'Sensing' : 'Intuitive'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-serif text-stone-600 mb-1">Decisions</p>
                  <p className="font-serif font-semibold text-stone-900">
                    {moneyStyle.type.charAt(2) === 'T' ? 'Thinking' : 'Feeling'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-serif text-stone-600 mb-1">Structure</p>
                  <p className="font-serif font-semibold text-stone-900">
                    {moneyStyle.type.charAt(3) === 'J' ? 'Judging' : 'Perceiving'}
                  </p>
                </div>
              </div>

              <Link
                href="/onboarding/assessment"
                className="inline-block mt-4 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-stone-50 rounded-lg font-serif font-semibold text-sm transition-colors"
              >
                Retake Assessment
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />

          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/goals"
              className="p-4 bg-stone-50 hover:bg-amber-50 border-2 border-stone-300 hover:border-amber-800 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <h3 className="font-serif font-semibold text-stone-900 group-hover:text-amber-900">
                    Manage Goals
                  </h3>
                  <p className="text-sm font-serif text-stone-600">Add or update your financial goals</p>
                </div>
              </div>
            </Link>

            <Link
              href="/behavior"
              className="p-4 bg-stone-50 hover:bg-amber-50 border-2 border-stone-300 hover:border-amber-800 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <div>
                  <h3 className="font-serif font-semibold text-stone-900 group-hover:text-amber-900">
                    View Insights
                  </h3>
                  <p className="text-sm font-serif text-stone-600">Check your spending behavior</p>
                </div>
              </div>
            </Link>

            <Link
              href="/plan"
              className="p-4 bg-stone-50 hover:bg-amber-50 border-2 border-stone-300 hover:border-amber-800 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📋</span>
                <div>
                  <h3 className="font-serif font-semibold text-stone-900 group-hover:text-amber-900">
                    Action Plan
                  </h3>
                  <p className="text-sm font-serif text-stone-600">See your prioritized tasks</p>
                </div>
              </div>
            </Link>

            <Link
              href="/onboarding"
              className="p-4 bg-stone-50 hover:bg-amber-50 border-2 border-stone-300 hover:border-amber-800 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔄</span>
                <div>
                  <h3 className="font-serif font-semibold text-stone-900 group-hover:text-amber-900">
                    Restart Onboarding
                  </h3>
                  <p className="text-sm font-serif text-stone-600">Go through setup again</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
