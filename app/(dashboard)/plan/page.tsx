'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AssessmentResult } from '@/types';
import { useUser } from '@/lib/hooks/useUser';
import { getTasks, updateTask, getUserProfile } from '@/lib/kv';

export default function PlanPage() {
  const { userId, isLoaded } = useUser();
  const [moneyStyle, setMoneyStyle] = useState<AssessmentResult | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Load money style and tasks from KV
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
      
      // Load tasks from KV
      const savedTasks = await getTasks(userId);
      const completed = savedTasks.filter(t => t.completed).map(t => t.id);
      setCompletedTasks(completed);
    }
    
    loadData();
  }, [userId, isLoaded]);

  // Action items based on behavioral insights
  const actionItems = [
    {
      id: 'reduce-entertainment',
      priority: 'high',
      category: 'Spending',
      title: 'Reduce entertainment spending by $80/month',
      description: 'You&apos;re currently 27% over budget in entertainment. Start by identifying subscriptions you rarely use.',
      steps: [
        'Review all streaming subscriptions',
        'Cancel or pause unused services',
        'Set a monthly entertainment budget alert',
      ],
      impact: '$960/year saved',
      timeframe: 'This week',
      emoji: '🎬',
    },
    {
      id: 'automate-savings',
      priority: 'high',
      category: 'Savings',
      title: 'Set up automatic transfers to savings',
      description: 'Automate your house down payment savings to ensure consistent progress toward your goal.',
      steps: [
        'Open high-yield savings account (if needed)',
        'Set up automatic transfer for payday',
        'Start with $500/month, increase quarterly',
      ],
      impact: '$6,000/year saved',
      timeframe: 'This week',
      emoji: '💰',
    },
    {
      id: 'meal-prep',
      priority: 'medium',
      category: 'Spending',
      title: 'Start meal prepping 2x per week',
      description: 'Dining out increased 40% this month. Meal prep can help reduce food costs while maintaining quality.',
      steps: [
        'Plan meals for the week',
        'Grocery shop on Sundays',
        'Prep lunches Sunday & Wednesday evenings',
      ],
      impact: '$200/month saved',
      timeframe: 'Next 2 weeks',
      emoji: '🍱',
    },
    {
      id: 'review-insurance',
      priority: 'medium',
      category: 'Optimization',
      title: 'Review and optimize insurance policies',
      description: 'Insurance costs can often be reduced by bundling or shopping around for better rates.',
      steps: [
        'Gather all current insurance policies',
        'Get 3 quotes from other providers',
        'Compare coverage and pricing',
      ],
      impact: '$300-500/year saved',
      timeframe: 'Next month',
      emoji: '🛡️',
    },
    {
      id: 'investment-review',
      priority: 'low',
      category: 'Growth',
      title: 'Review investment allocation',
      description: 'Ensure your investment portfolio aligns with your timeline for buying a house.',
      steps: [
        'Check current asset allocation',
        'Adjust risk level if house purchase is <3 years',
        'Consider high-yield savings for down payment',
      ],
      impact: 'Risk optimization',
      timeframe: 'Next quarter',
      emoji: '📈',
    },
    {
      id: 'emergency-fund',
      priority: 'low',
      category: 'Safety Net',
      title: 'Build emergency fund to 6 months',
      description: 'Strengthen your financial foundation before making major purchases.',
      steps: [
        'Calculate 6-month expense target',
        'Set up separate emergency account',
        'Allocate $200/month until target reached',
      ],
      impact: 'Financial security',
      timeframe: 'Ongoing',
      emoji: '🚨',
    },
  ];

  const quickWins = [
    {
      title: 'Cancel unused subscriptions',
      impact: '$50/month',
      effort: 'Low',
      emoji: '✂️',
    },
    {
      title: 'Switch to cash for discretionary spending',
      impact: '15-20% reduction',
      effort: 'Low',
      emoji: '💵',
    },
    {
      title: 'Negotiate phone/internet bills',
      impact: '$30-60/month',
      effort: 'Medium',
      emoji: '📞',
    },
    {
      title: 'Use cashback credit card for recurring bills',
      impact: '2-5% back',
      effort: 'Low',
      emoji: '💳',
    },
  ];

  const handleToggleTask = async (taskId: string) => {
    const updated = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
    setCompletedTasks(updated);
    
    // Save to KV
    if (userId) {
      await updateTask(userId, taskId, {
        completed: updated.includes(taskId),
      });
    }
  };

  const priorityColors = {
    high: 'from-red-500 to-red-400 border-red-500',
    medium: 'from-orange-500 to-orange-400 border-orange-500',
    low: 'from-emerald-500 to-emerald-400 border-emerald-500',
  };

  const priorityBgColors = {
    high: 'border-red-500/30 bg-red-500/10',
    medium: 'border-orange-500/30 bg-orange-500/10',
    low: 'border-emerald-500/30 bg-emerald-500/10',
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-2xl">💰</div>
              <span className="text-2xl font-bold tracking-tight gradient-text">
                FinCoach
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">Welcome back!</span>
              <Link href="/profile" className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold hover:bg-emerald-600 transition-colors cursor-pointer">
                {userName.charAt(0).toUpperCase() || 'U'}
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mode Selector */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <Link
              href="/goals"
              className="py-4 px-1 border-b-2 border-transparent text-neutral-400 hover:text-white hover:border-emerald-500 font-medium text-sm transition-colors"
            >
              🎯 Goals
            </Link>
            <Link
              href="/behavior"
              className="py-4 px-1 border-b-2 border-transparent text-neutral-400 hover:text-white hover:border-emerald-500 font-medium text-sm transition-colors"
            >
              📊 Behavior
            </Link>
            <button className="py-4 px-1 border-b-2 border-emerald-500 text-white font-medium text-sm">
              📋 Plan
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Action Plan</h1>
          <p className="text-neutral-400">
            Concrete steps to close the gap between your current behavior and financial goals.
          </p>
        </div>

        {/* Progress Summary */}
        <div className="mb-8 glass rounded-2xl border border-white/10 p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">Total Actions</p>
              <p className="text-3xl font-serif font-bold text-stone-900">{actionItems.length}</p>
            </div>
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-emerald-400">{completedTasks.length}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-orange-400">
                {actionItems.filter(item => !completedTasks.includes(item.id)).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">Potential Savings</p>
              <p className="text-3xl font-bold text-emerald-400">$8K+/year</p>
            </div>
          </div>
        </div>

        {/* Quick Wins Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Wins
          </h2>
          <p className="text-neutral-400 mb-4">
            Low-effort actions with immediate impact. Start here for momentum.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickWins.map((win, index) => (
              <div
                key={index}
                className="glass rounded-xl border border-emerald-500/30 p-4 hover:bg-white/10 transition-all"
              >
                <div className="text-3xl mb-2">{win.emoji}</div>
                <h3 className="font-semibold text-white mb-2 text-sm">{win.title}</h3>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-400">
                    <span className="font-semibold text-white">Impact:</span> {win.impact}
                  </p>
                  <p className="text-xs text-neutral-400">
                    <span className="font-semibold text-white">Effort:</span> {win.effort}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Prioritized Actions
          </h2>
          <div className="space-y-4">
            {actionItems.map((item) => {
              const isCompleted = completedTasks.includes(item.id);
              
              return (
                <div
                  key={item.id}
                  className={`glass rounded-2xl border ${priorityBgColors[item.priority as 'high' | 'medium' | 'low']} p-6 ${isCompleted ? 'opacity-60' : ''} transition-all`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleTask(item.id)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-600'
                          : 'bg-white/5 border-white/20 hover:border-emerald-500'
                      }`}
                    >
                      {isCompleted && <span className="text-white text-lg">✓</span>}
                    </button>
                    <span className="text-4xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className={`font-bold text-white text-lg ${isCompleted ? 'line-through' : ''}`}>
                          {item.title}
                        </h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${priorityColors[item.priority as 'high' | 'medium' | 'low']} text-white`}>
                          {item.priority}
                        </span>
                        <span className="text-xs font-serif text-stone-600 bg-stone-50/60 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-stone-800 font-serif mb-3">{item.description}</p>
                      
                      {!isCompleted && (
                        <>
                          <div className="bg-stone-50/60 rounded-lg p-4 border border-stone-300/50 mb-3">
                            <p className="text-sm font-serif font-semibold text-stone-900 mb-2">Steps to complete:</p>
                            <ul className="space-y-1">
                              {item.steps.map((step, index) => (
                                <li key={index} className="text-sm font-serif text-stone-800 flex items-start gap-2">
                                  <span className="text-amber-800">•</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-serif text-green-800 font-semibold">
                              💰 {item.impact}
                            </span>
                            <span className="font-serif text-stone-600">
                              ⏱️ {item.timeframe}
                            </span>
                          </div>
                        </>
                      )}
                      {isCompleted && (
                        <p className="text-green-800 font-serif font-semibold text-sm">
                          ✅ Completed! Great work on this one.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personality-Adapted Coaching */}
        {moneyStyle && (
          <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg border-4 border-double border-amber-800/40 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
            
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span>⟡</span> Planning Advice for Your {moneyStyle.type} Style
            </h2>
            <p className="text-stone-800 font-serif">
              {moneyStyle.type.includes('J') ? (
                <>As a Judger, you thrive on structure and completion. Use the checkboxes above to track your progress — checking off tasks will give you satisfaction and momentum.</>
              ) : (
                <>As a Perceiver, rigid plans can feel constraining. Treat these actions as flexible guidelines rather than strict requirements. Start with what feels most energizing.</>
              )}
              {' '}
              {moneyStyle.type.includes('S') ? (
                <>Your Sensing preference means you value practical, concrete steps. Each action includes specific tasks you can complete today.</>
              ) : (
                <>Your Intuitive preference means you see the big picture. Focus on how each action connects to your long-term vision for financial independence.</>
              )}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
