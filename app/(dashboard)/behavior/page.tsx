'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import type { AssessmentResult } from '@/types';

export default function BehaviorPage() {
  // Load money style from localStorage using lazy initializer (avoids double render)
  const [moneyStyle, setMoneyStyle] = useState<AssessmentResult | null>(() => {
    const saved = localStorage.getItem('moneyStyle');
    return saved ? JSON.parse(saved) : null;
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Sample spending data that changes based on time range (in real app, this would come from Plaid)
  const spendingDataByRange = {
    week: {
      categories: [
        { name: 'Housing', amount: 525, budget: 500, percent: 35, color: 'from-amber-700 to-amber-800', emoji: '🏠' },
        { name: 'Food & Dining', amount: 245, budget: 200, percent: 16, color: 'from-red-700 to-red-800', emoji: '🍽️' },
        { name: 'Transportation', amount: 95, budget: 125, percent: 6, color: 'from-orange-700 to-orange-800', emoji: '🚗' },
        { name: 'Entertainment', amount: 120, budget: 75, percent: 8, color: 'from-pink-700 to-pink-800', emoji: '🎭' },
        { name: 'Shopping', amount: 180, budget: 125, percent: 12, color: 'from-purple-700 to-purple-800', emoji: '🛍️' },
        { name: 'Utilities', amount: 70, budget: 75, percent: 5, color: 'from-blue-700 to-blue-800', emoji: '💡' },
        { name: 'Healthcare', amount: 45, budget: 50, percent: 3, color: 'from-green-700 to-green-800', emoji: '⚕️' },
        { name: 'Other', amount: 220, budget: 250, percent: 15, color: 'from-stone-700 to-stone-800', emoji: '📦' },
      ],
      contradictions: [
        {
          id: 1,
          type: 'spending-vs-goal',
          severity: 'medium',
          title: 'Food spending up 22% this week',
          description: 'You\'re on track to exceed your monthly food budget if this pace continues.',
          suggestion: 'Try meal prepping this weekend to reduce daily food costs.',
          emoji: '🍽️',
        },
        {
          id: 2,
          type: 'positive',
          severity: 'low',
          title: 'Transportation costs below average',
          description: 'You\'ve spent $30 less than usual on transportation this week.',
          suggestion: 'Great work! Keep tracking these savings.',
          emoji: '✨',
        },
      ],
    },
    month: {
      categories: [
        { name: 'Housing', amount: 2100, budget: 2000, percent: 35, color: 'from-amber-700 to-amber-800', emoji: '🏠' },
        { name: 'Food & Dining', amount: 950, budget: 800, percent: 16, color: 'from-red-700 to-red-800', emoji: '🍽️' },
        { name: 'Transportation', amount: 450, budget: 500, percent: 8, color: 'from-orange-700 to-orange-800', emoji: '🚗' },
        { name: 'Entertainment', amount: 380, budget: 300, percent: 6, color: 'from-pink-700 to-pink-800', emoji: '🎭' },
        { name: 'Shopping', amount: 720, budget: 500, percent: 12, color: 'from-purple-700 to-purple-800', emoji: '🛍️' },
        { name: 'Utilities', amount: 280, budget: 300, percent: 5, color: 'from-blue-700 to-blue-800', emoji: '💡' },
        { name: 'Healthcare', amount: 180, budget: 200, percent: 3, color: 'from-green-700 to-green-800', emoji: '⚕️' },
        { name: 'Other', amount: 940, budget: 1000, percent: 15, color: 'from-stone-700 to-stone-800', emoji: '📦' },
      ],
      contradictions: [
        {
          id: 1,
          type: 'spending-vs-goal',
          severity: 'high',
          title: 'Entertainment spending conflicts with savings goal',
          description: 'You\'re spending 27% over budget on entertainment while your Emergency Fund goal is falling behind.',
          suggestion: 'Consider reducing entertainment by $80/month to boost your emergency fund progress.',
          emoji: '⚠️',
        },
        {
          id: 2,
          type: 'pattern-change',
          severity: 'medium',
          title: 'Dining out increased 40% this month',
          description: 'Your restaurant spending jumped from $680 to $950 compared to last month.',
          suggestion: 'Was this intentional? If not, meal planning could save you ~$270/month.',
          emoji: '📈',
        },
        {
          id: 3,
          type: 'positive',
          severity: 'low',
          title: 'Great job staying under transportation budget!',
          description: 'You spent $50 less than budgeted on transportation this month.',
          suggestion: 'Keep it up! Consider redirecting these savings to your house down payment goal.',
          emoji: '✨',
        },
      ],
    },
    year: {
      categories: [
        { name: 'Housing', amount: 25200, budget: 24000, percent: 35, color: 'from-amber-700 to-amber-800', emoji: '🏠' },
        { name: 'Food & Dining', amount: 10800, budget: 9600, percent: 15, color: 'from-red-700 to-red-800', emoji: '🍽️' },
        { name: 'Transportation', amount: 5200, budget: 6000, percent: 7, color: 'from-orange-700 to-orange-800', emoji: '🚗' },
        { name: 'Entertainment', amount: 4800, budget: 3600, percent: 7, color: 'from-pink-700 to-pink-800', emoji: '🎭' },
        { name: 'Shopping', amount: 8400, budget: 6000, percent: 12, color: 'from-purple-700 to-purple-800', emoji: '🛍️' },
        { name: 'Utilities', amount: 3300, budget: 3600, percent: 5, color: 'from-blue-700 to-blue-800', emoji: '💡' },
        { name: 'Healthcare', amount: 2400, budget: 2400, percent: 3, color: 'from-green-700 to-green-800', emoji: '⚕️' },
        { name: 'Other', amount: 11500, budget: 12000, percent: 16, color: 'from-stone-700 to-stone-800', emoji: '📦' },
      ],
      contradictions: [
        {
          id: 1,
          type: 'spending-vs-goal',
          severity: 'high',
          title: 'Annual entertainment overspending: $1,200',
          description: 'Over the past year, you\'ve spent 33% more than budgeted on entertainment. That\'s money that could accelerate your house down payment by 4 months.',
          suggestion: 'Set up a dedicated entertainment account with a strict monthly transfer to create a hard limit.',
          emoji: '⚠️',
        },
        {
          id: 2,
          type: 'pattern-change',
          severity: 'medium',
          title: 'Shopping expenses trending upward',
          description: 'Shopping spending increased by 40% year-over-year, from $6,000 to $8,400.',
          suggestion: 'Implement a 24-hour rule: wait a day before any purchase over $50.',
          emoji: '📊',
        },
        {
          id: 3,
          type: 'positive',
          severity: 'low',
          title: 'Excellent transportation optimization!',
          description: 'You saved $800 on transportation this year vs budget. Carpooling and public transit are working.',
          suggestion: 'You\'re doing great! Continue this trend and consider investing these savings.',
          emoji: '🎉',
        },
        {
          id: 4,
          type: 'positive',
          severity: 'low',
          title: 'Healthcare spending exactly on target',
          description: 'Your healthcare spending matched your budget perfectly — showing great planning.',
          suggestion: 'This level of predictability is excellent for long-term financial planning.',
          emoji: '✨',
        },
      ],
    },
  };
  
  const spendingCategories = spendingDataByRange[timeRange].categories;
  const contradictions = spendingDataByRange[timeRange].contradictions;
  
  const totalSpent = spendingCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalBudget = spendingCategories.reduce((sum, cat) => sum + cat.budget, 0);
  
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
            <button className="py-4 px-1 border-b-2 border-amber-900 text-stone-900 font-serif font-medium text-sm">
              📊 Behavior
            </button>
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
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Your Spending Behavior</h1>
          <p className="text-stone-700 font-serif">
            Understanding where your money goes — and why — is the foundation of financial wellness.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-serif font-medium text-sm transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-amber-800 to-red-900 text-stone-50 shadow-md'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-300'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Spending Summary Card */}
        <div className="mb-8 bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-6 shadow-xl relative overflow-hidden">
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">Total Spent</p>
              <p className="text-3xl font-serif font-bold text-red-900">${totalSpent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">Total Budget</p>
              <p className="text-3xl font-serif font-bold text-stone-800">${totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-serif text-stone-600 mb-1">Difference</p>
              <p className={`text-3xl font-serif font-bold ${totalSpent > totalBudget ? 'text-red-800' : 'text-green-800'}`}>
                {totalSpent > totalBudget ? '+' : ''}${(totalSpent - totalBudget).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Spending Trends Chart */}
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
            <span>📈</span> Spending Trends
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={useMemo(() => {
                // Generate trend data based on time range
                if (timeRange === 'week') {
                  return [
                    { name: 'Mon', spending: 180, budget: 214 },
                    { name: 'Tue', spending: 220, budget: 214 },
                    { name: 'Wed', spending: 190, budget: 214 },
                    { name: 'Thu', spending: 250, budget: 214 },
                    { name: 'Fri', spending: 280, budget: 214 },
                    { name: 'Sat', spending: 310, budget: 214 },
                    { name: 'Sun', spending: 240, budget: 214 },
                  ];
                } else if (timeRange === 'month') {
                  return [
                    { name: 'Week 1', spending: 1350, budget: 1500 },
                    { name: 'Week 2', spending: 1550, budget: 1500 },
                    { name: 'Week 3', spending: 1450, budget: 1500 },
                    { name: 'Week 4', spending: 1650, budget: 1500 },
                  ];
                } else {
                  return [
                    { name: 'Jan', spending: 5600, budget: 6000 },
                    { name: 'Feb', spending: 5800, budget: 6000 },
                    { name: 'Mar', spending: 6200, budget: 6000 },
                    { name: 'Apr', spending: 5900, budget: 6000 },
                    { name: 'May', spending: 6300, budget: 6000 },
                    { name: 'Jun', spending: 6100, budget: 6000 },
                    { name: 'Jul', spending: 6400, budget: 6000 },
                    { name: 'Aug', spending: 5700, budget: 6000 },
                    { name: 'Sep', spending: 5900, budget: 6000 },
                    { name: 'Oct', spending: 6000, budget: 6000 },
                    { name: 'Nov', spending: 5800, budget: 6000 },
                    { name: 'Dec', spending: 5900, budget: 6000 },
                  ];
                }
              }, [timeRange])}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.3} />
              <XAxis dataKey="name" stroke="#78716c" style={{ fontSize: '12px', fontFamily: 'serif' }} />
              <YAxis stroke="#78716c" style={{ fontSize: '12px', fontFamily: 'serif' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fafaf9',
                  border: '2px solid #d97706',
                  borderRadius: '8px',
                  fontFamily: 'serif',
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'serif', fontSize: '14px' }} />
              <Line type="monotone" dataKey="spending" stroke="#b91c1c" strokeWidth={3} name="Actual Spending" />
              <Line type="monotone" dataKey="budget" stroke="#78716c" strokeWidth={2} strokeDasharray="5 5" name="Budget" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Charts Side by Side */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-6 shadow-xl relative overflow-hidden"
          >
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />
            
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
              <span>📊</span> Budget vs Actual
            </h2>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={spendingCategories.slice(0, 5).map(cat => ({
                  name: cat.emoji + ' ' + cat.name,
                  Budget: cat.budget,
                  Actual: cat.amount,
                }))}
                margin={{ top: 20, right: 10, left: -20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="#78716c"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: '10px', fontFamily: 'serif' }}
                />
                <YAxis stroke="#78716c" style={{ fontSize: '11px', fontFamily: 'serif' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fafaf9',
                    border: '2px solid #d97706',
                    borderRadius: '8px',
                    fontFamily: 'serif',
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'serif', fontSize: '13px' }} />
                <Bar dataKey="Budget" fill="#78716c" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Actual" fill="#b91c1c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Spending Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-4 border-double border-amber-800/40 p-6 shadow-xl relative overflow-hidden"
          >
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />
            
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
              <span>🥧</span> Spending Distribution
            </h2>
            
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={spendingCategories.map(cat => ({
                    name: cat.emoji + ' ' + cat.name,
                    value: cat.amount,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) => 
                    name && percent !== undefined ? `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spendingCategories.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[
                        '#d97706', '#b91c1c', '#ea580c', '#db2777',
                        '#9333ea', '#2563eb', '#059669', '#78716c',
                      ][index % 8]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fafaf9',
                    border: '2px solid #d97706',
                    borderRadius: '8px',
                    fontFamily: 'serif',
                  }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Spending Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span>◆</span> Spending by Category (Details)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spendingCategories.map((category) => {
              const percentOfBudget = (category.amount / category.budget) * 100;
              const isOverBudget = category.amount > category.budget;
              
              return (
                <div
                  key={category.name}
                  className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-2 border-amber-800/30 p-5 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.emoji}</span>
                      <div>
                        <h3 className="font-serif font-semibold text-stone-900">{category.name}</h3>
                        <p className="text-xs text-stone-600 font-serif">{category.percent}% of spending</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif font-bold text-stone-900">${category.amount.toLocaleString()}</p>
                      <p className="text-xs text-stone-600 font-serif">of ${category.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                      style={{ width: `${Math.min(percentOfBudget, 100)}%` }}
                    />
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs font-serif font-medium ${isOverBudget ? 'text-red-800' : 'text-green-800'}`}>
                      {isOverBudget ? (
                        <>+${(category.amount - category.budget).toLocaleString()} over</>
                      ) : (
                        <>${(category.budget - category.amount).toLocaleString()} under</>
                      )}
                    </span>
                    <span className="text-xs font-serif text-stone-600">
                      {percentOfBudget.toFixed(0)}% of budget
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contradictions & Insights */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2 flex items-center gap-2">
            <span>❖</span> Behavioral Insights & Contradictions
          </h2>
          <p className="text-stone-700 font-serif mb-2">
            We&apos;ve analyzed your spending patterns against your stated goals and Money Style preferences. 
            Here&apos;s where your actions and intentions diverge:
          </p>
          
          {/* Insight Summary Stats */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-lg border-2 border-red-800/30 p-4 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🚨</span>
                <p className="text-sm font-serif font-semibold text-stone-900">High Priority</p>
              </div>
              <p className="text-2xl font-serif font-bold text-red-900">
                {contradictions.filter(c => c.severity === 'high').length}
              </p>
              <p className="text-xs font-serif text-stone-700">Needs immediate attention</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-800/30 p-4 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📊</span>
                <p className="text-sm font-serif font-semibold text-stone-900">Watch Closely</p>
              </div>
              <p className="text-2xl font-serif font-bold text-amber-900">
                {contradictions.filter(c => c.severity === 'medium').length}
              </p>
              <p className="text-xs font-serif text-stone-700">Developing patterns</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-800/30 p-4 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">✨</span>
                <p className="text-sm font-serif font-semibold text-stone-900">Positive Trends</p>
              </div>
              <p className="text-2xl font-serif font-bold text-green-900">
                {contradictions.filter(c => c.severity === 'low').length}
              </p>
              <p className="text-xs font-serif text-stone-700">Good financial behaviors</p>
            </div>
          </div>
          
          <div className="space-y-5">
            {contradictions.map((contradiction) => {
              const severityColors: Record<'high' | 'medium' | 'low', string> = {
                high: 'from-red-800 to-red-900 border-red-900',
                medium: 'from-amber-700 to-amber-800 border-amber-900',
                low: 'from-green-700 to-green-800 border-green-900',
              };
              
              const bgColors: Record<'high' | 'medium' | 'low', string> = {
                high: 'from-red-50 to-amber-50',
                medium: 'from-amber-50 to-yellow-50',
                low: 'from-green-50 to-emerald-50',
              };

              const severityLabels: Record<'high' | 'medium' | 'low', string> = {
                high: 'URGENT',
                medium: 'MONITOR',
                low: 'CELEBRATE',
              };
              
              return (
                <div
                  key={contradiction.id}
                  className={`bg-gradient-to-br ${bgColors[contradiction.severity as 'high' | 'medium' | 'low']} rounded-lg border-4 border-double border-opacity-40 ${severityColors[contradiction.severity as 'high' | 'medium' | 'low']} p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-shadow`}
                >
                  {/* Corner Decorations */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-stone-800/20" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-stone-800/20" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-stone-800/20" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-stone-800/20" />
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="text-5xl mb-2">{contradiction.emoji}</div>
                      <div className={`text-xs font-serif font-bold px-2 py-1 rounded bg-gradient-to-r ${severityColors[contradiction.severity as 'high' | 'medium' | 'low']} text-stone-50 text-center`}>
                        {severityLabels[contradiction.severity as 'high' | 'medium' | 'low']}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="font-serif font-bold text-stone-900 text-xl mb-1">
                          {contradiction.title}
                        </h3>
                        <p className="text-xs font-serif text-stone-600 uppercase tracking-wide">
                          {contradiction.type.replace('-', ' ')}
                        </p>
                      </div>
                      
                      {/* The Contradiction */}
                      <div className="mb-4">
                        <p className="text-stone-800 font-serif leading-relaxed">
                          {contradiction.description}
                        </p>
                      </div>
                      
                      {/* Why This Matters */}
                      {contradiction.severity === 'high' && (
                        <div className="mb-4 bg-red-100/60 rounded-lg p-3 border border-red-300/50">
                          <p className="text-sm font-serif text-red-900">
                            <span className="font-bold">⚠️ Why this matters:</span> This pattern directly conflicts with your primary goal 
                            and could delay your house purchase by 6-12 months if it continues.
                          </p>
                        </div>
                      )}
                      
                      {contradiction.severity === 'medium' && (
                        <div className="mb-4 bg-amber-100/60 rounded-lg p-3 border border-amber-300/50">
                          <p className="text-sm font-serif text-amber-900">
                            <span className="font-bold">📊 Pattern detected:</span> This behavior has increased significantly. 
                            Early intervention now can prevent this from becoming a major issue.
                          </p>
                        </div>
                      )}
                      
                      {/* Action Suggestion */}
                      <div className="bg-stone-50/80 rounded-lg p-4 border-2 border-stone-300/50">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-lg">💡</span>
                          <p className="font-serif font-bold text-stone-900">Suggested Action</p>
                        </div>
                        <p className="text-sm font-serif text-stone-800 leading-relaxed">
                          {contradiction.suggestion}
                        </p>
                        
                        {/* Action Link */}
                        <div className="mt-3 pt-3 border-t border-stone-300/50">
                          <Link 
                            href="/plan" 
                            className="text-sm font-serif font-semibold text-amber-900 hover:text-amber-700 transition-colors flex items-center gap-1"
                          >
                            View detailed action plan <span className="text-xs">→</span>
                          </Link>
                        </div>
                      </div>
                      
                      {/* Positive Reinforcement for Low Severity */}
                      {contradiction.severity === 'low' && (
                        <div className="mt-3 bg-green-100/60 rounded-lg p-3 border border-green-300/50">
                          <p className="text-sm font-serif text-green-900">
                            <span className="font-bold">✨ Keep it up!</span> This behavior aligns perfectly with your Money Style and goals.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Insights Key / Legend */}
          <div className="mt-6 bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-2 border-stone-400/30 p-5 shadow-md">
            <h3 className="font-serif font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span>ℹ️</span> Understanding Contradictions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-serif text-stone-800">
              <div>
                <p className="font-semibold mb-1">What are contradictions?</p>
                <p className="text-stone-700">
                  Gaps between what you say you want (goals, values) and how you actually spend money. 
                  These aren&apos;t judgments — they&apos;re opportunities for growth.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">How to use these insights</p>
                <p className="text-stone-700">
                  Start with high-priority items. Small changes compound over time. 
                  Check the Plan mode for specific steps to address each contradiction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Money Style Personality Context (if available) */}
        {moneyStyle && (
          <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg border-4 border-double border-amber-800/40 p-6 shadow-xl relative overflow-hidden">
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
            
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span>⟡</span> Coaching Note for Your {moneyStyle.type} Style
            </h2>
            <p className="text-stone-800 font-serif">
              {moneyStyle.type.includes('I') ? (
                <>As an introvert, you process financial decisions internally. Take time to reflect on these insights privately before taking action.</>
              ) : (
                <>As an extrovert, discussing these patterns with a trusted friend or partner can help you process and act on them.</>
              )}
              {' '}
              {moneyStyle.type.includes('T') ? (
                <>Your thinking preference means you&apos;ll appreciate the data here — use these metrics to optimize your budget systematically.</>
              ) : (
                <>Your feeling preference means these contradictions may create emotional discomfort. That&apos;s okay — it&apos;s a sign of growth.</>
              )}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
