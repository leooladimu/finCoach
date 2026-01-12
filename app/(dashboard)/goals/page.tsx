'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { AssessmentResult, FinancialGoal } from '@/types';
import { useUser } from '@/lib/hooks/useUser';
import { getGoals, saveGoal, updateGoal, getUserProfile } from '@/lib/kv';
import { PlaidLinkButton } from '@/components/PlaidLinkButton';

export default function GoalsPage() {
  const { userId, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'goals' | 'behavior' | 'plan'>('goals');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showUpdateProgressModal, setShowUpdateProgressModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [moneyStyle, setMoneyStyle] = useState<AssessmentResult | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  // Goals state
  const [goals, setGoals] = useState<Array<{
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    category: string;
  }>>([]);
  
  // Load money style and goals from KV on mount
  useEffect(() => {
    async function loadData() {
      if (!isLoaded || !userId) return;
      
      // Load money style from profile
      const profile = await getUserProfile(userId);
      if (profile?.moneyStyle) {
        setMoneyStyle({
          type: profile.moneyStyle.type,
          scores: profile.moneyStyle.scores,
          moneyStyleDescription: '',
          coachingApproach: '',
        });
      }
      
      // Set user name for avatar
      if (profile?.name) {
        setUserName(profile.name);
      }
      
      // Load goals from KV
      const savedGoals = await getGoals(userId);
      if (savedGoals.length > 0) {
        setGoals(savedGoals.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          targetDate: g.targetDate,
          category: g.category,
        })));
      } else {
        // Only create default goals if user has completed assessment
        // Otherwise, leave empty to encourage completing onboarding
        if (profile?.moneyStyle) {
          const defaultGoals = [
            {
              id: 'emergency-fund',
              title: 'Build Emergency Fund',
              targetAmount: 10000,
              currentAmount: 6500,
              targetDate: '2025-06-30',
              category: 'Savings',
            },
            {
              id: 'house-down-payment',
              title: 'House Down Payment',
              targetAmount: 60000,
              currentAmount: 12000,
              targetDate: '2026-12-31',
              category: 'Home',
            },
          ];
          setGoals(defaultGoals);
          
          // Save to KV
          for (const goal of defaultGoals) {
            const kvGoal: FinancialGoal = {
              ...goal,
              userId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await saveGoal(kvGoal);
          }
        }
      }
    }
    
    loadData();
  }, [userId, isLoaded]);
  
  // Removed duplicate link token fetch useEffect. Only fetch in handleSyncAccounts.
  
  // New goal form state
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    currentAmount: '',
  });
  
  // Update progress form state
  const [updateProgress, setUpdateProgress] = useState({
    goalId: 'emergency-fund',
    newAmount: '',
  });
  
  const handleNewGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new goal object
    const goal = {
      id: `goal-${Date.now()}`,
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      targetDate: newGoal.targetDate,
      category: 'Custom',
    };
    
    // Add to goals list
    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    
    // Save to KV
    if (userId) {
      const kvGoal: FinancialGoal = {
        ...goal,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveGoal(kvGoal);
    }
    
    // Reset form and close modal
    setShowNewGoalModal(false);
    setNewGoal({ title: '', targetAmount: '', targetDate: '', currentAmount: '' });
  };
  
  const handleUpdateProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find and update the goal
    const updatedGoals = goals.map(goal => {
      if (goal.id === updateProgress.goalId) {
        return {
          ...goal,
          currentAmount: parseFloat(updateProgress.newAmount),
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    
    // Save to KV
    if (userId) {
      const goalToUpdate = updatedGoals.find(g => g.id === updateProgress.goalId);
      if (goalToUpdate) {
        await updateGoal(userId, goalToUpdate.id, {
          currentAmount: goalToUpdate.currentAmount,
        });
      }
    }
    
    // Reset form and close modal
    setShowUpdateProgressModal(false);
    setUpdateProgress({ goalId: 'emergency-fund', newAmount: '' });
  };
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold gradient-text">
              FinCoach
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">Welcome back!</span>
              <Link href="/profile" className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold transition-colors cursor-pointer">
                {userName.charAt(0).toUpperCase() || 'U'}
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mode Selector */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'goals'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              🎯 Goals
            </button>
            <Link
              href="/behavior"
              className="py-4 px-1 border-b-2 border-transparent text-neutral-500 hover:text-neutral-300 font-medium text-sm transition-colors"
            >
              📊 Behavior
            </Link>
            <Link
              href="/plan"
              className="py-4 px-1 border-b-2 border-transparent text-neutral-500 hover:text-neutral-300 font-medium text-sm transition-colors"
            >
              📋 Plan
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Financial Goals</h1>
          <p className="text-neutral-400">
            What do you want your money to help you achieve? Think big picture.
          </p>
        </div>

        {/* Goals Progress Overview Chart */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <span>📊</span> Goals Progress Overview
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={goals.map(goal => ({
                  name: goal.title.length > 20 ? goal.title.substring(0, 20) + '...' : goal.title,
                  Current: goal.currentAmount,
                  Target: goal.targetAmount,
                  Progress: ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1),
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="#78716c"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: '11px', fontFamily: 'serif' }}
                />
                <YAxis stroke="#78716c" style={{ fontSize: '12px', fontFamily: 'serif' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fafaf9',
                    border: '2px solid #d97706',
                    borderRadius: '8px',
                    fontFamily: 'serif',
                  }}
                  formatter={(value: number | string | undefined) => {
                    if (value === undefined || value === null) return '';
                    const numValue = typeof value === 'string' ? parseFloat(value) : value;
                    return `$${!isNaN(numValue) ? numValue.toLocaleString() : String(value)}`;
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'serif', fontSize: '14px' }} />
                <Bar dataKey="Current" fill="#d97706" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Target" fill="#78716c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass rounded-xl border border-emerald-500/30 p-4">
                <p className="text-sm text-neutral-400 mb-1">Total Saved</p>
                <p className="text-2xl font-bold text-emerald-500">
                  ${goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="glass rounded-xl border border-blue-500/30 p-4">
                <p className="text-sm text-neutral-400 mb-1">Total Target</p>
                <p className="text-2xl font-bold text-blue-500">
                  ${goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="glass rounded-xl border border-violet-500/30 p-4">
                <p className="text-sm text-neutral-400 mb-1">Average Progress</p>
                <p className="text-2xl font-bold text-violet-500">
                  {(goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount * 100), 0) / goals.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Goals List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Goals */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Active Goals</h2>
                <button 
                  onClick={() => setShowNewGoalModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  + Add Goal
                </button>
              </div>
              
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    {!moneyStyle ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="text-white font-medium mb-2">Complete Your Assessment First</p>
                        <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                          Take our 3-minute Money Style assessment to unlock personalized goal recommendations and coaching.
                        </p>
                        <Link
                          href="/onboarding/assessment"
                          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
                        >
                          Take Assessment Now
                          <span>→</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="text-neutral-400 mb-4">No goals yet. Create your first goal to get started!</p>
                        <button 
                          onClick={() => setShowNewGoalModal(true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        >
                          + Create First Goal
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  goals.map((goal) => {
                    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
                    const isOnTrack = progressPercent >= 50;
                    const targetDate = new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    
                    return (
                      <div 
                        key={goal.id}
                        className={`border ${
                          isOnTrack 
                            ? 'border-emerald-500/30 bg-white/5' 
                            : 'border-orange-500/30 bg-white/5'
                        } rounded-xl p-4 hover:bg-white/10 transition-all`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">
                              {goal.title}
                            </h3>
                            <p className="text-sm text-neutral-400">
                              Target: ${goal.targetAmount.toLocaleString()} by {targetDate}
                            </p>
                          </div>
                          <span className={`${
                            isOnTrack 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                              : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          } text-xs px-3 py-1 rounded-full border`}>
                            {isOnTrack ? 'On Track' : 'Needs Focus'}
                          </span>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-neutral-400">Progress</span>
                            <span className="font-medium text-white">
                              ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full rounded-full h-2.5 bg-white/5 border border-white/10">
                            <div 
                              className={`h-2.5 rounded-full ${
                                isOnTrack 
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                                  : 'bg-gradient-to-r from-orange-500 to-orange-400'
                              }`}
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {/* Empty State (commented out for demo) */}
                {/* <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="mb-4">No goals yet. Let&apos;s create your first one!</p>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
                    Create Goal
                  </button>
                </div> */}
              </div>
            </div>
            
            {/* Goal Insights */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Insights</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Your emergency fund is 65% complete
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      At your current pace, you&apos;ll reach your goal 2 months early!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-xl border border-orange-500/30">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      House down payment needs attention
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Consider increasing your monthly contribution to stay on track.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Money Style */}
            <div className="glass rounded-2xl border border-emerald-500/30 p-6 relative">
              <h3 className="text-lg font-semibold text-white mb-2">Your Money Style</h3>
              {moneyStyle ? (
                <>
                  <p className="text-2xl font-bold mb-3 text-emerald-500">{moneyStyle.type}</p>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {moneyStyle.moneyStyleDescription}
                  </p>
                </>
              ) : (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-neutral-300 font-medium">Assessment Not Complete</p>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                    Discover your personalized Money Style to unlock tailored financial coaching that speaks your language.
                  </p>
                  <Link 
                    href="/onboarding/assessment"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    Take 3-Min Assessment
                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowNewGoalModal(true)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm text-white"
                >
                  📝 Set New Goal
                </button>
                <button 
                  onClick={() => setShowUpdateProgressModal(true)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm text-white"
                >
                  📊 Update Progress
                </button>
                <button 
                  onClick={() => setShowSyncModal(true)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm text-white"
                >
                  🔗 Sync Bank Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl border border-white/20 p-8 max-w-md w-full">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Set New Financial Goal</h2>
              
              <form onSubmit={handleNewGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:outline-none text-white placeholder:text-neutral-500"
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Target Amount</label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:outline-none text-white placeholder:text-neutral-500"
                      placeholder="$10,000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Target Date</label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:outline-none text-white placeholder:text-neutral-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Current Amount (Optional)</label>
                  <input
                    type="number"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:outline-none text-white placeholder:text-neutral-500"
                    placeholder="$0"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewGoalModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Update Progress Modal */}
      {showUpdateProgressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl border border-white/20 p-8 max-w-md w-full">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Update Goal Progress</h2>
              
              <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Select Goal</label>
                  <select
                    value={updateProgress.goalId}
                    onChange={(e) => setUpdateProgress({ ...updateProgress, goalId: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:outline-none text-white"
                  >
                    {goals.map(goal => (
                      <option key={goal.id} value={goal.id} className="bg-neutral-900">{goal.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">New Amount</label>
                  <input
                    type="number"
                    value={updateProgress.newAmount}
                    onChange={(e) => setUpdateProgress({ ...updateProgress, newAmount: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 focus:border-emerald-500 focus:outline-none text-white placeholder:text-neutral-500"
                    placeholder="Enter current amount"
                    required
                  />
                </div>
                
                {(() => {
                  const selectedGoal = goals.find(g => g.id === updateProgress.goalId);
                  if (!selectedGoal) return null;
                  
                  return (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                      <p className="text-sm text-white">
                        <span className="font-semibold">Current: </span>
                        ${selectedGoal.currentAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-white mt-1">
                        <span className="font-semibold">Target: </span>
                        ${selectedGoal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  );
                })()}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpdateProgressModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Sync Accounts Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl border border-white/20 p-8 max-w-md w-full">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Sync Bank Accounts</h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Connect your financial institutions to automatically track your progress and spending patterns.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <div className="text-2xl">🏦</div>
                  <div>
                    <p className="font-semibold text-white text-sm">Secure Connection</p>
                    <p className="text-xs text-neutral-400">Bank-level encryption</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <div className="text-2xl">🔄</div>
                  <div>
                    <p className="font-semibold text-white text-sm">Auto-Update</p>
                    <p className="text-xs text-neutral-400">Daily transaction sync</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-violet-500/10 rounded-xl border border-violet-500/30">
                  <div className="text-2xl">📊</div>
                  <div>
                    <p className="font-semibold text-white text-sm">Smart Insights</p>
                    <p className="text-xs text-neutral-400">Personalized analysis</p>
                  </div>
                </div>
              </div>
              
              <PlaidLinkButton userId={userId || 'demo-user-123'} />
              
              <button
                onClick={() => setShowSyncModal(false)}
                className="mt-4 w-full px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
