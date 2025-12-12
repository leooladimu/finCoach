'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AssessmentResult } from '@/types';

export default function PlanPage() {
  // Load money style from localStorage using lazy initializer (avoids double render)
  const [moneyStyle, setMoneyStyle] = useState<AssessmentResult | null>(() => {
    const saved = localStorage.getItem('moneyStyle');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Load completed tasks from localStorage using lazy initializer
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    const savedTasks = localStorage.getItem('completedTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

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

  const handleToggleTask = (taskId: string) => {
    const updated = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
    setCompletedTasks(updated);
    localStorage.setItem('completedTasks', JSON.stringify(updated));
  };

  const priorityColors = {
    high: 'from-red-700 to-red-800 border-red-900',
    medium: 'from-amber-700 to-amber-800 border-amber-900',
    low: 'from-green-700 to-green-800 border-green-900',
  };

  const priorityBgColors = {
    high: 'from-red-50 to-amber-50',
    medium: 'from-amber-50 to-yellow-50',
    low: 'from-green-50 to-emerald-50',
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
            <Link
              href="/goals"
              className="py-4 px-1 border-b-2 border-transparent text-stone-700/70 hover:text-stone-900 hover:border-amber-700 font-serif font-medium text-sm"
            >
              🎯 Goals
            </Link>
            <Link
              href="/behavior"
              className="py-4 px-1 border-b-2 border-transparent text-stone-700/70 hover:text-stone-900 hover:border-amber-700 font-serif font-medium text-sm"
            >
              📊 Behavior
            </Link>
            <button className="py-4 px-1 border-b-2 border-amber-900 text-stone-900 font-serif font-medium text-sm">
              📋 Plan
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Your Action Plan</h1>
          <p className="text-stone-700 font-serif">
            Concrete steps to close the gap between your current behavior and financial goals.
          </p>
        </div>

        {/* Progress Summary */}
        <div className="mb-8 bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">Total Actions</p>
              <p className="text-3xl font-serif font-bold text-stone-900">{actionItems.length}</p>
            </div>
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">Completed</p>
              <p className="text-3xl font-serif font-bold text-green-800">{completedTasks.length}</p>
            </div>
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">In Progress</p>
              <p className="text-3xl font-serif font-bold text-amber-800">
                {actionItems.filter(item => !completedTasks.includes(item.id)).length}
              </p>
            </div>
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">Potential Savings</p>
              <p className="text-3xl font-serif font-bold text-green-800">$8K+/year</p>
            </div>
          </div>
        </div>

        {/* Quick Wins Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Wins
          </h2>
          <p className="text-stone-700 font-serif mb-4">
            Low-effort actions with immediate impact. Start here for momentum.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickWins.map((win, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-800/30 p-4 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl mb-2">{win.emoji}</div>
                <h3 className="font-serif font-semibold text-stone-900 mb-2 text-sm">{win.title}</h3>
                <div className="space-y-1">
                  <p className="text-xs text-stone-700 font-serif">
                    <span className="font-semibold">Impact:</span> {win.impact}
                  </p>
                  <p className="text-xs text-stone-700 font-serif">
                    <span className="font-semibold">Effort:</span> {win.effort}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span>◆</span> Prioritized Actions
          </h2>
          <div className="space-y-4">
            {actionItems.map((item) => {
              const isCompleted = completedTasks.includes(item.id);
              
              return (
                <div
                  key={item.id}
                  className={`bg-gradient-to-br ${priorityBgColors[item.priority as 'high' | 'medium' | 'low']} rounded-lg border-4 border-double ${isCompleted ? 'border-green-800/40 opacity-60' : 'border-opacity-40 ' + priorityColors[item.priority as 'high' | 'medium' | 'low']} p-6 shadow-xl relative overflow-hidden transition-all`}
                >
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-stone-800/20" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-stone-800/20" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-stone-800/20" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-stone-800/20" />
                  
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleTask(item.id)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-800 border-green-900'
                          : 'bg-stone-50 border-stone-400 hover:border-amber-800'
                      }`}
                    >
                      {isCompleted && <span className="text-stone-50 text-lg">✓</span>}
                    </button>
                    <span className="text-4xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className={`font-serif font-bold text-stone-900 text-lg ${isCompleted ? 'line-through' : ''}`}>
                          {item.title}
                        </h3>
                        <span className={`text-xs font-serif font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${priorityColors[item.priority as 'high' | 'medium' | 'low']} text-stone-50`}>
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
