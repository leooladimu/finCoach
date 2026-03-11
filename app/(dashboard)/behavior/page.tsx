"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/DashboardNav";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import type { AssessmentResult, SpendingCategory } from "@/types";
import { useContradictions } from "@/lib/hooks/useContradictions";
import { useUser } from "@/lib/hooks/useUser";
import { getUserProfileAction, getSpendingDataAction } from "@/lib/actions";
import { hydrateMoneyStyle } from "@/lib/assessment";

export default function BehaviorPage() {
  const { userId, isLoaded } = useUser();
  const [moneyStyle, setMoneyStyle] = useState<AssessmentResult | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([]);
  const [spendingLoading, setSpendingLoading] = useState(true);

  // Load money style from KV
  useEffect(() => {
    async function loadMoneyStyle() {
      if (!isLoaded || !userId) return;

      const profile = await getUserProfileAction(userId);
      if (profile?.moneyStyle) {
        // Convert profile moneyStyle to AssessmentResult format
        setMoneyStyle(hydrateMoneyStyle(profile.moneyStyle.type, profile.moneyStyle.scores));
      }

      // Set user name for avatar
      if (profile?.name) {
        setUserName(profile.name);
      }
    }

    loadMoneyStyle();
  }, [userId, isLoaded]);

  // Load spending data from KV (real Plaid data or mock)
  useEffect(() => {
    async function loadSpendingData() {
      if (!isLoaded || !userId) return;
      setSpendingLoading(true);
      try {
        const categories = await getSpendingDataAction(userId, timeRange);
        setSpendingCategories(categories);
      } catch (err) {
        console.error("Error loading spending data:", err);
        setSpendingCategories([]);
      } finally {
        setSpendingLoading(false);
      }
    }
    loadSpendingData();
  }, [userId, isLoaded, timeRange]);

  // Use real contradiction detection
  const {
    contradictions: detectedContradictions,
    loading: contradictionsLoading,
  } = useContradictions(timeRange);

  // Contradictions: use real detections, no mock fallback needed
  const contradictions = detectedContradictions;

  const totalSpent = spendingCategories.reduce(
    (sum, cat) => sum + cat.amount,
    0,
  );
  const totalBudget = spendingCategories.reduce(
    (sum, cat) => sum + cat.budget,
    0,
  );

  return (
    <div className="min-h-screen bg-black">
      <DashboardNav userName={userName} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Spending Behavior
          </h1>
          <p className="text-neutral-400">
            Understanding where your money goes — and why — is the foundation of
            financial wellness.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                timeRange === range
                  ? "bg-emerald-500 text-white"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/10"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Spending Summary Card */}
        {spendingLoading ? (
          <div className="mb-8 glass rounded-2xl border border-white/5 p-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><div className="h-4 w-20 bg-white/10 rounded mb-2" /><div className="h-8 w-28 bg-white/5 rounded" /></div>
              <div><div className="h-4 w-20 bg-white/10 rounded mb-2" /><div className="h-8 w-28 bg-white/5 rounded" /></div>
              <div><div className="h-4 w-20 bg-white/10 rounded mb-2" /><div className="h-8 w-28 bg-white/5 rounded" /></div>
            </div>
          </div>
        ) : spendingCategories.length === 0 ? (
          <div className="mb-8 glass rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-neutral-400">No spending data yet. Connect a bank account via Plaid to see your real spending.</p>
          </div>
        ) : (
        <div className="mb-8 glass rounded-2xl border border-white/10 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-red-400">
                ${totalSpent.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">Total Budget</p>
              <p className="text-3xl font-bold text-white">
                ${totalBudget.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">Difference</p>
              <p
                className={`text-3xl font-bold ${totalSpent > totalBudget ? "text-red-400" : "text-emerald-400"}`}
              >
                {totalSpent > totalBudget ? "+" : ""}$
                {(totalSpent - totalBudget).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Spending Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 glass rounded-2xl border border-white/10 p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📈</span> Spending Trends
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={useMemo(() => {
                // Generate trend data based on time range
                if (timeRange === "week") {
                  return [
                    { name: "Mon", spending: 180, budget: 214 },
                    { name: "Tue", spending: 220, budget: 214 },
                    { name: "Wed", spending: 190, budget: 214 },
                    { name: "Thu", spending: 250, budget: 214 },
                    { name: "Fri", spending: 280, budget: 214 },
                    { name: "Sat", spending: 310, budget: 214 },
                    { name: "Sun", spending: 240, budget: 214 },
                  ];
                } else if (timeRange === "month") {
                  return [
                    { name: "Week 1", spending: 1350, budget: 1500 },
                    { name: "Week 2", spending: 1550, budget: 1500 },
                    { name: "Week 3", spending: 1450, budget: 1500 },
                    { name: "Week 4", spending: 1650, budget: 1500 },
                  ];
                } else {
                  return [
                    { name: "Jan", spending: 5600, budget: 6000 },
                    { name: "Feb", spending: 5800, budget: 6000 },
                    { name: "Mar", spending: 6200, budget: 6000 },
                    { name: "Apr", spending: 5900, budget: 6000 },
                    { name: "May", spending: 6300, budget: 6000 },
                    { name: "Jun", spending: 6100, budget: 6000 },
                    { name: "Jul", spending: 6400, budget: 6000 },
                    { name: "Aug", spending: 5700, budget: 6000 },
                    { name: "Sep", spending: 5900, budget: 6000 },
                    { name: "Oct", spending: 6000, budget: 6000 },
                    { name: "Nov", spending: 5800, budget: 6000 },
                    { name: "Dec", spending: 5900, budget: 6000 },
                  ];
                }
              }, [timeRange])}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#525252"
                opacity={0.2}
              />
              <XAxis
                dataKey="name"
                stroke="#a3a3a3"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#a3a3a3" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#a3a3a3" }}
              />
              <Legend wrapperStyle={{ fontSize: "14px" }} />
              <Line
                type="monotone"
                dataKey="spending"
                stroke="#ef4444"
                strokeWidth={3}
                name="Actual Spending"
              />
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#a3a3a3"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Budget"
              />
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
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📊</span> Budget vs Actual
            </h2>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={spendingCategories.slice(0, 5).map((cat) => ({
                  name: cat.emoji + " " + cat.name,
                  Budget: cat.budget,
                  Actual: cat.amount,
                }))}
                margin={{ top: 20, right: 10, left: -20, bottom: 80 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#525252"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  stroke="#a3a3a3"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: "10px" }}
                />
                <YAxis stroke="#a3a3a3" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                  itemStyle={{ color: "#a3a3a3" }}
                />
                <Legend wrapperStyle={{ fontSize: "13px" }} />
                <Bar dataKey="Budget" fill="#a3a3a3" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Spending Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🥧</span> Spending Distribution
            </h2>

            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={spendingCategories.map((cat) => ({
                    name: cat.emoji + " " + cat.name,
                    value: cat.amount,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    name,
                    percent,
                  }: {
                    name?: string;
                    percent?: number;
                  }) =>
                    name && percent !== undefined
                      ? `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spendingCategories.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          "#d97706",
                          "#b91c1c",
                          "#ea580c",
                          "#db2777",
                          "#9333ea",
                          "#2563eb",
                          "#059669",
                          "#78716c",
                        ][index % 8]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fafaf9",
                    border: "2px solid #d97706",
                    borderRadius: "8px",
                    fontFamily: "serif",
                  }}
                  formatter={(value: number | undefined) =>
                    value ? `$${value.toLocaleString()}` : "$0"
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Spending Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Spending by Category (Details)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spendingCategories.map((category) => {
              const percentOfBudget = (category.amount / category.budget) * 100;
              const isOverBudget = category.amount > category.budget;

              return (
                <div
                  key={category.name}
                  className="glass rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-white">
                          {category.name}
                        </h3>
                        <p className="text-xs text-neutral-400">
                          {category.percent}% of spending
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        ${category.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400">
                        of ${category.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                      style={{ width: `${Math.min(percentOfBudget, 100)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {isOverBudget ? (
                        <>
                          +$
                          {(
                            category.amount - category.budget
                          ).toLocaleString()}{" "}
                          over
                        </>
                      ) : (
                        <>
                          $
                          {(category.budget - category.amount).toLocaleString()}{" "}
                          under
                        </>
                      )}
                    </span>
                    <span className="text-xs text-neutral-400">
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
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span>💡</span> Behavioral Insights & Contradictions
          </h2>
          <p className="text-neutral-400 mb-2">
            We&apos;ve analyzed your spending patterns against your stated goals
            and Money Style preferences. Here&apos;s where your actions and
            intentions diverge:
          </p>

          {/* Insight Summary Stats */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl border border-red-500/30 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🚨</span>
                <p className="text-sm font-semibold text-white">
                  High Priority
                </p>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {contradictions.filter((c) => c.severity === "high").length}
              </p>
              <p className="text-xs text-neutral-400">
                Needs immediate attention
              </p>
            </div>
            <div className="glass rounded-xl border border-orange-500/30 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📊</span>
                <p className="text-sm font-semibold text-white">
                  Watch Closely
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-400">
                {contradictions.filter((c) => c.severity === "medium").length}
              </p>
              <p className="text-xs text-neutral-400">Developing patterns</p>
            </div>
            <div className="glass rounded-xl border border-emerald-500/30 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">✨</span>
                <p className="text-sm font-semibold text-white">
                  Positive Trends
                </p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                {contradictions.filter((c) => c.severity === "low").length}
              </p>
              <p className="text-xs font-serif text-stone-700">
                Good financial behaviors
              </p>
            </div>
          </div>

          {/* Loading State */}
          {contradictionsLoading && (
            <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg border-2 border-amber-800/30 p-8 shadow-md text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-800 border-t-transparent mb-4"></div>
              <p className="text-stone-700 font-serif">
                Analyzing your spending patterns...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!contradictionsLoading && contradictions.length === 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-800/30 p-8 shadow-md text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                Looking Good!
              </h3>
              <p className="text-stone-700 font-serif">
                We haven&apos;t detected any contradictions between your goals
                and spending patterns. Keep up the great work!
              </p>
            </div>
          )}

          <div className="space-y-5">
            {!contradictionsLoading &&
              contradictions.map((contradiction) => {
                const severityColors: Record<
                  "high" | "medium" | "low",
                  string
                > = {
                  high: "from-red-800 to-red-900 border-red-900",
                  medium: "from-amber-700 to-amber-800 border-amber-900",
                  low: "from-green-700 to-green-800 border-green-900",
                };

                const bgColors: Record<"high" | "medium" | "low", string> = {
                  high: "from-red-50 to-amber-50",
                  medium: "from-amber-50 to-yellow-50",
                  low: "from-green-50 to-emerald-50",
                };

                const severityLabels: Record<
                  "high" | "medium" | "low",
                  string
                > = {
                  high: "URGENT",
                  medium: "MONITOR",
                  low: "CELEBRATE",
                };

                return (
                  <div
                    key={contradiction.id}
                    className={`bg-gradient-to-br ${bgColors[contradiction.severity as "high" | "medium" | "low"]} rounded-lg border-4 border-double border-opacity-40 ${severityColors[contradiction.severity as "high" | "medium" | "low"]} p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-shadow`}
                  >
                    {/* Corner Decorations */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-stone-800/20" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-stone-800/20" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-stone-800/20" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-stone-800/20" />

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="text-5xl mb-2">
                          {contradiction.emoji}
                        </div>
                        <div
                          className={`text-xs font-serif font-bold px-2 py-1 rounded bg-gradient-to-r ${severityColors[contradiction.severity as "high" | "medium" | "low"]} text-stone-50 text-center`}
                        >
                          {
                            severityLabels[
                              contradiction.severity as
                                | "high"
                                | "medium"
                                | "low"
                            ]
                          }
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className="font-serif font-bold text-stone-900 text-xl mb-1">
                            {contradiction.title}
                          </h3>
                          <p className="text-xs font-serif text-stone-600 uppercase tracking-wide">
                            {contradiction.type
                              .replace(/-/g, " ")
                              .replace(/_/g, " ")}
                          </p>
                        </div>

                        {/* The Contradiction */}
                        <div className="mb-4">
                          <p className="text-stone-800 font-serif leading-relaxed">
                            {contradiction.description}
                          </p>
                        </div>

                        {/* Why This Matters */}
                        {contradiction.severity === "high" && (
                          <div className="mb-4 bg-red-100/60 rounded-lg p-3 border border-red-300/50">
                            <p className="text-sm font-serif text-red-900">
                              <span className="font-bold">
                                ⚠️ Why this matters:
                              </span>{" "}
                              This pattern directly conflicts with your primary
                              goal and could delay your house purchase by 6-12
                              months if it continues.
                            </p>
                          </div>
                        )}

                        {contradiction.severity === "medium" && (
                          <div className="mb-4 bg-amber-100/60 rounded-lg p-3 border border-amber-300/50">
                            <p className="text-sm font-serif text-amber-900">
                              <span className="font-bold">
                                📊 Pattern detected:
                              </span>{" "}
                              This behavior has increased significantly. Early
                              intervention now can prevent this from becoming a
                              major issue.
                            </p>
                          </div>
                        )}

                        {/* Action Suggestion */}
                        <div className="bg-stone-50/80 rounded-lg p-4 border-2 border-stone-300/50">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-lg">💡</span>
                            <p className="font-serif font-bold text-stone-900">
                              Suggested Action
                            </p>
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
                              View detailed action plan{" "}
                              <span className="text-xs">→</span>
                            </Link>
                          </div>
                        </div>

                        {/* Positive Reinforcement for Low Severity */}
                        {contradiction.severity === "low" && (
                          <div className="mt-3 bg-green-100/60 rounded-lg p-3 border border-green-300/50">
                            <p className="text-sm font-serif text-green-900">
                              <span className="font-bold">✨ Keep it up!</span>{" "}
                              This behavior aligns perfectly with your Money
                              Style and goals.
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
                  Gaps between what you say you want (goals, values) and how you
                  actually spend money. These aren&apos;t judgments —
                  they&apos;re opportunities for growth.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">How to use these insights</p>
                <p className="text-stone-700">
                  Start with high-priority items. Small changes compound over
                  time. Check the Plan mode for specific steps to address each
                  contradiction.
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
              {moneyStyle.type.includes("I") ? (
                <>
                  As an introvert, you process financial decisions internally.
                  Take time to reflect on these insights privately before taking
                  action.
                </>
              ) : (
                <>
                  As an extrovert, discussing these patterns with a trusted
                  friend or partner can help you process and act on them.
                </>
              )}{" "}
              {moneyStyle.type.includes("T") ? (
                <>
                  Your thinking preference means you&apos;ll appreciate the data
                  here — use these metrics to optimize your budget
                  systematically.
                </>
              ) : (
                <>
                  Your feeling preference means these contradictions may create
                  emotional discomfort. That&apos;s okay — it&apos;s a sign of
                  growth.
                </>
              )}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
