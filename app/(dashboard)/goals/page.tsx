'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePlaidLink } from 'react-plaid-link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { AssessmentResult } from '@/types';

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState<'goals' | 'behavior' | 'plan'>('goals');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showUpdateProgressModal, setShowUpdateProgressModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [moneyStyle, setMoneyStyle] = useState<AssessmentResult | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  
  // Goals state with sample data
  const [goals, setGoals] = useState([
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
  ]);
  
  // Load money style and goals from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moneyStyle');
    if (saved) {
      setMoneyStyle(JSON.parse(saved));
    }
    
    const savedGoals = localStorage.getItem('financialGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);
  
  // Fetch Plaid link token when sync modal opens
  useEffect(() => {
    if (showSyncModal && !linkToken) {
      fetchLinkToken();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSyncModal]);
  
  const fetchLinkToken = async () => {
    setIsLoadingLink(true);
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user-123' }),
      });
      
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
      alert('Failed to initialize bank connection. Please try again.');
    } finally {
      setIsLoadingLink(false);
    }
  };
  
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
  
  const handleNewGoalSubmit = (e: React.FormEvent) => {
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
    
    // Save to localStorage
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));
    
    // Reset form and close modal
    setShowNewGoalModal(false);
    setNewGoal({ title: '', targetAmount: '', targetDate: '', currentAmount: '' });
  };
  
  const handleUpdateProgressSubmit = (e: React.FormEvent) => {
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
    
    // Save to localStorage
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));
    
    // Reset form and close modal
    setShowUpdateProgressModal(false);
    setUpdateProgress({ goalId: 'emergency-fund', newAmount: '' });
  };
  
  // Plaid Link success callback
  const onPlaidSuccess = useCallback(async (publicToken: string) => {
    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicToken,
          userId: 'demo-user-123',
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const accountsList = data.accounts.map((acc: { name: string; balances?: { current?: number } }) => 
          `- ${acc.name}: $${acc.balances?.current || 0}`
        ).join('\n');
        alert(`Successfully connected ${data.institution?.name || 'your bank'}!\n\nAccounts:\n${accountsList}`);
        setShowSyncModal(false);
        setLinkToken(null);
      } else {
        alert('Failed to connect bank account. Please try again.');
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
      alert('Failed to connect bank account. Please try again.');
    }
  }, []);
  
  // Initialize Plaid Link (provide token or null string as fallback)
  const { open: openPlaidLink, ready: plaidReady } = usePlaidLink({
    token: linkToken || null,
    onSuccess: onPlaidSuccess,
  });
  
  const handleSyncAccounts = () => {
    if (plaidReady && linkToken) {
      openPlaidLink();
    } else if (!linkToken) {
      alert('Initializing bank connection. Please wait a moment and try again...');
    } else {
      alert('Please wait while we initialize the connection...');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-50/95 to-amber-50/95 backdrop-blur-sm shadow-md border-b-2 border-amber-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-serif font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-red-900 to-amber-800">
                Fin<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-orange-900 to-red-900">Coach</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-800 font-serif italic">Welcome back!</span>
              <Link href="/profile" className="w-10 h-10 bg-gradient-to-br from-amber-800 to-red-900 rounded-full flex items-center justify-center text-stone-50 font-serif font-semibold border-2 border-amber-900/40 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                U
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mode Selector */}
      <div className="bg-gradient-to-r from-stone-50/80 to-amber-50/80 backdrop-blur-sm border-b-2 border-amber-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-serif font-medium text-sm transition-colors ${
                activeTab === 'goals'
                  ? 'border-amber-900 text-stone-900'
                  : 'border-transparent text-stone-700/70 hover:text-stone-900 hover:border-amber-700'
              }`}
            >
              🎯 Goals
            </button>
            <Link
              href="/behavior"
              className="py-4 px-1 border-b-2 border-transparent text-stone-700/70 hover:text-stone-900 hover:border-amber-700 font-serif font-medium text-sm"
            >
              📊 Behavior
            </Link>
            <Link
              href="/plan"
              className="py-4 px-1 border-b-2 border-transparent text-stone-700/70 hover:text-stone-900 hover:border-amber-700 font-serif font-medium text-sm"
            >
              📋 Plan
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Your Financial Goals</h1>
          <p className="text-stone-800/80 font-light">
            What do you want your money to help you achieve? Think big picture.
          </p>
        </div>

        {/* Goals Progress Overview Chart */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-6 shadow-xl relative overflow-hidden"
          >
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />
            
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
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
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontFamily: 'serif', fontSize: '14px' }} />
                <Bar dataKey="Current" fill="#d97706" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Target" fill="#78716c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-800/30 p-4 shadow-md">
                <p className="text-sm font-serif text-stone-900 mb-1">Total Saved</p>
                <p className="text-2xl font-serif font-bold text-green-900">
                  ${goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-800/30 p-4 shadow-md">
                <p className="text-sm font-serif text-stone-900 mb-1">Total Target</p>
                <p className="text-2xl font-serif font-bold text-amber-900">
                  ${goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-800/30 p-4 shadow-md">
                <p className="text-sm font-serif text-stone-900 mb-1">Average Progress</p>
                <p className="text-2xl font-serif font-bold text-blue-900">
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
            <div className="bg-gradient-to-br from-stone-50/95 to-amber-50/90 backdrop-blur-sm rounded-lg shadow-xl border-4 border-double border-amber-800/40 p-6 relative">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-amber-800/30 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-amber-800/30 rounded-tr-lg" />
              
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="text-xl font-serif font-semibold text-stone-900">Active Goals</h2>
                <button 
                  onClick={() => setShowNewGoalModal(true)}
                  className="bg-gradient-to-r from-amber-900 to-red-900 text-stone-50 px-4 py-2 rounded-lg text-sm font-serif font-medium hover:from-amber-950 hover:to-red-950 shadow-md border-2 border-amber-950/40"
                >
                  + Add Goal
                </button>
              </div>
              
              <div className="space-y-4 relative z-10">
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-stone-700/70 font-serif italic mb-4">No goals yet. Create your first goal to get started!</p>
                    <button 
                      onClick={() => setShowNewGoalModal(true)}
                      className="bg-gradient-to-r from-amber-900 to-red-900 text-stone-50 px-6 py-3 rounded-lg font-serif font-medium hover:from-amber-950 hover:to-red-950 shadow-md border-2 border-amber-950/40"
                    >
                      + Create First Goal
                    </button>
                  </div>
                ) : (
                  goals.map((goal) => {
                    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
                    const isOnTrack = progressPercent >= 50;
                    const targetDate = new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    
                    return (
                      <div 
                        key={goal.id}
                        className={`border-2 ${
                          isOnTrack 
                            ? 'border-amber-700/40 bg-gradient-to-r from-amber-100/70 to-stone-100/60' 
                            : 'border-red-800/40 bg-gradient-to-r from-red-100/60 to-amber-100/60'
                        } rounded-lg p-4 hover:border-amber-800/70 transition-all hover:shadow-md relative`}
                      >
                        <div className="absolute top-2 right-2 text-xs text-amber-800/30">❖</div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className={`font-serif font-semibold ${isOnTrack ? 'text-stone-900' : 'text-red-950'}`}>
                              {goal.title}
                            </h3>
                            <p className={`text-sm font-light ${isOnTrack ? 'text-stone-700/80' : 'text-red-900/80'}`}>
                              Target: ${goal.targetAmount.toLocaleString()} by {targetDate}
                            </p>
                          </div>
                          <span className={`${
                            isOnTrack 
                              ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-900 border-green-800/30' 
                              : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-900 border-amber-800/30'
                          } text-xs px-3 py-1 rounded-full font-serif border-2`}>
                            {isOnTrack ? 'On Track' : 'Needs Focus'}
                          </span>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={`font-light ${isOnTrack ? 'text-stone-700/70' : 'text-red-900/70'}`}>Progress</span>
                            <span className={`font-serif font-medium ${isOnTrack ? 'text-stone-900' : 'text-red-950'}`}>
                              ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className={`w-full rounded-full h-2.5 border ${
                            isOnTrack ? 'bg-stone-200/40 border-amber-800/30' : 'bg-red-200/30 border-red-800/30'
                          }`}>
                            <div 
                              className={`h-2.5 rounded-full ${
                                isOnTrack 
                                  ? 'bg-gradient-to-r from-amber-700 to-amber-800' 
                                  : 'bg-gradient-to-r from-red-700 to-red-800'
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
            <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-sm rounded-lg shadow-xl border border-amber-200/50 p-6">
              <h2 className="text-xl font-serif font-semibold text-amber-900 mb-4">Insights</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50/80 to-cyan-50/70 rounded-lg border border-blue-200/30">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="text-sm text-blue-900 font-serif font-medium">
                      Your emergency fund is 65% complete
                    </p>
                    <p className="text-xs text-blue-800/70 mt-1 font-light">
                      At your current pace, you&apos;ll reach your goal 2 months early!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50/80 to-yellow-50/70 rounded-lg border border-amber-200/30">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="text-sm text-amber-900 font-serif font-medium">
                      House down payment needs attention
                    </p>
                    <p className="text-xs text-amber-800/70 mt-1 font-light">
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
            <div className="bg-gradient-to-br from-amber-900 via-red-900 to-amber-950 rounded-lg shadow-xl border-4 border-double border-amber-950/50 p-6 text-stone-50 relative">
              <div className="absolute top-2 right-2 text-amber-400/30 text-sm">◆</div>
              <h3 className="text-lg font-serif font-semibold mb-2">Your Money Style</h3>
              {moneyStyle ? (
                <>
                  <p className="text-2xl font-serif font-bold mb-3 tracking-wide">{moneyStyle.type}</p>
                  <p className="text-sm opacity-90 font-light leading-relaxed">
                    {moneyStyle.moneyStyleDescription}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-serif font-bold mb-3 tracking-wide">INTJ</p>
                  <p className="text-sm opacity-90 font-light leading-relaxed">
                    The Architect - You design comprehensive financial systems and trust data-driven planning.
                  </p>
                  <Link 
                    href="/onboarding/assessment"
                    className="mt-3 inline-block text-xs text-amber-200 hover:text-amber-100 underline"
                  >
                    Take Assessment →
                  </Link>
                </>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-stone-50/95 to-amber-50/90 backdrop-blur-sm rounded-lg shadow-xl border-4 border-double border-amber-800/40 p-6 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-800/30 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-800/30 rounded-tr-lg" />
              
              <h3 className="font-serif font-semibold text-stone-900 mb-4 relative z-10">Quick Actions</h3>
              <div className="space-y-2 relative z-10">
                <button 
                  onClick={() => setShowNewGoalModal(true)}
                  className="w-full text-left px-4 py-3 rounded-lg border-2 border-amber-700/40 hover:border-amber-800/70 hover:bg-gradient-to-r hover:from-amber-100/70 hover:to-stone-100/60 transition-all text-sm font-light text-stone-900"
                >
                  📝 Set New Goal
                </button>
                <button 
                  onClick={() => setShowUpdateProgressModal(true)}
                  className="w-full text-left px-4 py-3 rounded-lg border-2 border-amber-700/40 hover:border-amber-800/70 hover:bg-gradient-to-r hover:from-amber-100/70 hover:to-stone-100/60 transition-all text-sm font-light text-stone-900"
                >
                  📊 Update Progress
                </button>
                <button 
                  onClick={() => setShowSyncModal(true)}
                  className="w-full text-left px-4 py-3 rounded-lg border-2 border-amber-700/40 hover:border-amber-800/70 hover:bg-gradient-to-r hover:from-amber-100/70 hover:to-stone-100/60 transition-all text-sm font-light text-stone-900"
                >
                  🔄 Sync Bank Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-stone-50/98 to-amber-50/95 rounded-lg shadow-2xl border-4 border-double border-amber-800/40 p-8 max-w-md w-full relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-amber-800/30 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-amber-800/30 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-amber-800/30 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-amber-800/30 rounded-br-lg" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Set New Financial Goal</h2>
              
              <form onSubmit={handleNewGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-serif text-stone-800 mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-amber-700/40 bg-stone-50 focus:border-amber-800 focus:outline-none font-light text-stone-900 placeholder:text-stone-400"
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-serif text-stone-800 mb-2">Target Amount</label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-amber-700/40 bg-stone-50 focus:border-amber-800 focus:outline-none font-light text-stone-900 placeholder:text-stone-400"
                      placeholder="$10,000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-serif text-stone-800 mb-2">Target Date</label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-amber-700/40 bg-stone-50 focus:border-amber-800 focus:outline-none font-light text-stone-900 placeholder:text-stone-400"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-serif text-stone-800 mb-2">Current Amount (Optional)</label>
                  <input
                    type="number"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-amber-700/40 bg-stone-50 focus:border-amber-800 focus:outline-none font-light text-stone-900 placeholder:text-stone-400"
                    placeholder="$0"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewGoalModal(false)}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-stone-400 text-stone-700 font-serif hover:bg-stone-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-900 to-red-900 text-stone-50 font-serif font-semibold hover:from-amber-950 hover:to-red-950 transition-all border-2 border-amber-950/40"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-stone-50/98 to-amber-50/95 rounded-lg shadow-2xl border-4 border-double border-amber-800/40 p-8 max-w-md w-full relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-amber-800/30 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-amber-800/30 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-amber-800/30 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-amber-800/30 rounded-br-lg" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Update Goal Progress</h2>
              
              <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-serif text-stone-800 mb-2">Select Goal</label>
                  <select
                    value={updateProgress.goalId}
                    onChange={(e) => setUpdateProgress({ ...updateProgress, goalId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-amber-700/40 bg-stone-50 focus:border-amber-800 focus:outline-none font-light text-stone-900"
                  >
                    {goals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-serif text-stone-800 mb-2">New Amount</label>
                  <input
                    type="number"
                    value={updateProgress.newAmount}
                    onChange={(e) => setUpdateProgress({ ...updateProgress, newAmount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-amber-700/40 bg-stone-50 focus:border-amber-800 focus:outline-none font-light text-stone-900 placeholder:text-stone-400"
                    placeholder="Enter current amount"
                    required
                  />
                </div>
                
                {(() => {
                  const selectedGoal = goals.find(g => g.id === updateProgress.goalId);
                  if (!selectedGoal) return null;
                  
                  return (
                    <div className="bg-amber-100/50 border-2 border-amber-700/30 rounded-lg p-4">
                      <p className="text-sm text-stone-800 font-light">
                        <span className="font-serif font-semibold">Current: </span>
                        ${selectedGoal.currentAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-stone-800 font-light mt-1">
                        <span className="font-serif font-semibold">Target: </span>
                        ${selectedGoal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  );
                })()}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpdateProgressModal(false)}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-stone-400 text-stone-700 font-serif hover:bg-stone-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-900 to-red-900 text-stone-50 font-serif font-semibold hover:from-amber-950 hover:to-red-950 transition-all border-2 border-amber-950/40"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-stone-50/98 to-amber-50/95 rounded-lg shadow-2xl border-4 border-double border-amber-800/40 p-8 max-w-md w-full relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-amber-800/30 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-amber-800/30 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-amber-800/30 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-amber-800/30 rounded-br-lg" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Sync Bank Accounts</h2>
              <p className="text-stone-700 font-light mb-6 leading-relaxed">
                Connect your financial institutions to automatically track your progress and spending patterns.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-100/70 to-stone-100/60 rounded-lg border-2 border-amber-700/30">
                  <div className="text-2xl">🏦</div>
                  <div>
                    <p className="font-serif font-semibold text-stone-900 text-sm">Secure Connection</p>
                    <p className="text-xs text-stone-700 font-light">Bank-level encryption</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-100/70 to-stone-100/60 rounded-lg border-2 border-amber-700/30">
                  <div className="text-2xl">🔄</div>
                  <div>
                    <p className="font-serif font-semibold text-stone-900 text-sm">Auto-Update</p>
                    <p className="text-xs text-stone-700 font-light">Daily transaction sync</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-100/70 to-stone-100/60 rounded-lg border-2 border-amber-700/30">
                  <div className="text-2xl">📊</div>
                  <div>
                    <p className="font-serif font-semibold text-stone-900 text-sm">Smart Insights</p>
                    <p className="text-xs text-stone-700 font-light">Personalized analysis</p>
                  </div>
                </div>
              </div>
              
              {isLoadingLink ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSyncModal(false);
                      setLinkToken(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-stone-400 text-stone-700 font-serif hover:bg-stone-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSyncAccounts}
                    disabled={!plaidReady}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-900 to-red-900 text-stone-50 font-serif font-semibold hover:from-amber-950 hover:to-red-950 transition-all border-2 border-amber-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {plaidReady ? 'Connect Now' : 'Initializing...'}
                  </button>
                </div>
              )}
              
              <p className="text-center text-xs text-stone-600 mt-4 font-light italic">
                Powered by Plaid • Read-only access • Sandbox mode
              </p>
              <p className="text-center text-xs text-stone-500 mt-2 font-light">
                In demo mode: Use any credentials to test the connection
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
