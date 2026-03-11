"use client";

import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import type { AssessmentResult, Task } from "@/types";
import { useUser } from "@/lib/hooks/useUser";
import { getTasksAction, updateTaskAction, saveTaskAction, getUserProfileAction } from "@/lib/actions";
import { hydrateMoneyStyle } from "@/lib/assessment";

const DEFAULT_ACTION_ITEMS = [
  {
    id: "reduce-entertainment",
    priority: "high" as const,
    category: "Spending",
    title: "Reduce entertainment spending by $80/month",
    description: "You're currently 27% over budget in entertainment. Start by identifying subscriptions you rarely use.",
    steps: ["Review all streaming subscriptions", "Cancel or pause unused services", "Set a monthly entertainment budget alert"],
    impact: "$960/year saved",
    timeframe: "This week",
    emoji: "🎬",
  },
  {
    id: "automate-savings",
    priority: "high" as const,
    category: "Savings",
    title: "Set up automatic transfers to savings",
    description: "Automate your house down payment savings to ensure consistent progress toward your goal.",
    steps: ["Open high-yield savings account (if needed)", "Set up automatic transfer for payday", "Start with $500/month, increase quarterly"],
    impact: "$6,000/year saved",
    timeframe: "This week",
    emoji: "💰",
  },
  {
    id: "meal-prep",
    priority: "medium" as const,
    category: "Spending",
    title: "Start meal prepping 2x per week",
    description: "Dining out increased 40% this month. Meal prep can help reduce food costs while maintaining quality.",
    steps: ["Plan meals for the week", "Grocery shop on Sundays", "Prep lunches Sunday & Wednesday evenings"],
    impact: "$200/month saved",
    timeframe: "Next 2 weeks",
    emoji: "🍱",
  },
  {
    id: "review-insurance",
    priority: "medium" as const,
    category: "Optimization",
    title: "Review and optimize insurance policies",
    description: "Insurance costs can often be reduced by bundling or shopping around for better rates.",
    steps: ["Gather all current insurance policies", "Get 3 quotes from other providers", "Compare coverage and pricing"],
    impact: "$300-500/year saved",
    timeframe: "Next month",
    emoji: "🛡️",
  },
  {
    id: "investment-review",
    priority: "low" as const,
    category: "Growth",
    title: "Review investment allocation",
    description: "Ensure your investment portfolio aligns with your timeline for buying a house.",
    steps: ["Check current asset allocation", "Adjust risk level if house purchase is <3 years", "Consider high-yield savings for down payment"],
    impact: "Risk optimization",
    timeframe: "Next quarter",
    emoji: "📈",
  },
  {
    id: "emergency-fund",
    priority: "low" as const,
    category: "Safety Net",
    title: "Build emergency fund to 6 months",
    description: "Strengthen your financial foundation before making major purchases.",
    steps: ["Calculate 6-month expense target", "Set up separate emergency account", "Allocate $200/month until target reached"],
    impact: "Financial security",
    timeframe: "Ongoing",
    emoji: "🚨",
  },
];

export default function PlanPage() {
  const { userId, isLoaded } = useUser();
  const [moneyStyle, setMoneyStyle] = useState<AssessmentResult | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<typeof DEFAULT_ACTION_ITEMS>([]);

  useEffect(() => {
    async function loadData() {
      if (!isLoaded || !userId) return;
      const profile = await getUserProfileAction(userId);
      if (profile?.moneyStyle) {
        setMoneyStyle(hydrateMoneyStyle(profile.moneyStyle.type, profile.moneyStyle.scores));
      }
      if (profile?.name) setUserName(profile.name);

      let savedTasks = await getTasksAction(userId);
      if (savedTasks.length === 0) {
        const now = new Date().toISOString();
        const seeded: Task[] = DEFAULT_ACTION_ITEMS.map((item) => ({
          id: item.id,
          userId,
          title: item.title,
          description: item.description,
          completed: false,
          priority: item.priority as Task["priority"],
          category: item.category,
          createdAt: now,
          updatedAt: now,
        }));
        await Promise.all(seeded.map((t) => saveTaskAction(t)));
        savedTasks = seeded;
      }

      const completed = savedTasks.filter((t) => t.completed).map((t) => t.id);
      setCompletedTasks(completed);
      setActionItems(DEFAULT_ACTION_ITEMS.map((item) => ({ ...item, completed: completed.includes(item.id) })));
    }
    loadData();
  }, [userId, isLoaded]);

  const quickWins = [
    { title: "Cancel unused subscriptions", impact: "$50/month", effort: "Low", emoji: "✂️" },
    { title: "Switch to cash for discretionary spending", impact: "15-20% reduction", effort: "Low", emoji: "💵" },
    { title: "Negotiate phone/internet bills", impact: "$30-60/month", effort: "Medium", emoji: "📞" },
    { title: "Use cashback credit card for recurring bills", impact: "2-5% back", effort: "Low", emoji: "💳" },
  ];

  const handleToggleTask = async (taskId: string) => {
    const nowCompleted = !completedTasks.includes(taskId);
    const updated = nowCompleted ? [...completedTasks, taskId] : completedTasks.filter((id) => id !== taskId);
    setCompletedTasks(updated);
    setActionItems((prev) => prev.map((item) => item.id === taskId ? { ...item, completed: nowCompleted } : item));
    if (userId) await updateTaskAction(userId, taskId, { completed: nowCompleted });
  };

  const priorityColors = {
    high: "from-red-500 to-red-400",
    medium: "from-orange-500 to-orange-400",
    low: "from-emerald-500 to-emerald-400",
  };
  const priorityBgColors = {
    high: "border-red-500/30 bg-red-500/10",
    medium: "border-orange-500/30 bg-orange-500/10",
    low: "border-emerald-500/30 bg-emerald-500/10",
  };

  return (
    <div className="min-h-screen bg-black">
      <DashboardNav userName={userName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Action Plan</h1>
          <p className="text-neutral-400">Concrete steps to close the gap between your current behavior and financial goals.</p>
        </div>

        <div className="mb-8 glass rounded-2xl border border-white/10 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div><p className="text-sm text-neutral-400 mb-1">Total Actions</p><p className="text-3xl font-bold text-white">{actionItems.length}</p></div>
            <div><p className="text-sm text-neutral-400 mb-1">Completed</p><p className="text-3xl font-bold text-emerald-400">{completedTasks.length}</p></div>
            <div><p className="text-sm text-neutral-400 mb-1">In Progress</p><p className="text-3xl font-bold text-orange-400">{actionItems.filter((i) => !completedTasks.includes(i.id)).length}</p></div>
            <div><p className="text-sm text-neutral-400 mb-1">Potential Savings</p><p className="text-3xl font-bold text-emerald-400">$8K+/year</p></div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">⚡ Quick Wins</h2>
          <p className="text-neutral-400 mb-4">Low-effort actions with immediate impact.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickWins.map((win, i) => (
              <div key={i} className="glass rounded-xl border border-emerald-500/30 p-4 hover:bg-white/10 transition-all">
                <div className="text-3xl mb-2">{win.emoji}</div>
                <h3 className="font-semibold text-white mb-2 text-sm">{win.title}</h3>
                <p className="text-xs text-neutral-400"><span className="font-semibold text-white">Impact:</span> {win.impact}</p>
                <p className="text-xs text-neutral-400"><span className="font-semibold text-white">Effort:</span> {win.effort}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">📋 Prioritized Actions</h2>
          <div className="space-y-4">
            {actionItems.map((item) => {
              const isCompleted = completedTasks.includes(item.id);
              return (
                <div key={item.id} className={`glass rounded-2xl border ${priorityBgColors[item.priority]} p-6 ${isCompleted ? "opacity-60" : ""} transition-all`}>
                  <div className="flex items-start gap-4">
                    <button onClick={() => handleToggleTask(item.id)} className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? "bg-emerald-500 border-emerald-600" : "bg-white/5 border-white/20 hover:border-emerald-500"}`}>
                      {isCompleted && <span className="text-white text-lg">✓</span>}
                    </button>
                    <span className="text-4xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className={`font-bold text-white text-lg ${isCompleted ? "line-through" : ""}`}>{item.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${priorityColors[item.priority]} text-white`}>{item.priority}</span>
                        <span className="text-xs text-neutral-400 bg-white/10 px-2 py-1 rounded-full">{item.category}</span>
                      </div>
                      <p className="text-neutral-300 mb-3">{item.description}</p>
                      {!isCompleted && (
                        <>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-3">
                            <p className="text-sm font-semibold text-white mb-2">Steps to complete:</p>
                            <ul className="space-y-1">
                              {item.steps.map((step, i) => (
                                <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                                  <span className="text-emerald-400">•</span><span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-emerald-400 font-semibold">💰 {item.impact}</span>
                            <span className="text-neutral-400">⏱️ {item.timeframe}</span>
                          </div>
                        </>
                      )}
                      {isCompleted && <p className="text-emerald-400 font-semibold text-sm">✅ Completed! Great work on this one.</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {moneyStyle && (
          <div className="glass rounded-2xl border border-violet-500/30 p-6">
            <h2 className="text-xl font-bold text-white mb-3">🧠 Planning Advice for Your {moneyStyle.type} Style</h2>
            <p className="text-neutral-300 leading-relaxed">
              {moneyStyle.type.includes("J")
                ? "As a Judger, you thrive on structure and completion. Use the checkboxes above to track your progress — checking off tasks will give you satisfaction and momentum."
                : "As a Perceiver, rigid plans can feel constraining. Treat these actions as flexible guidelines. Start with what feels most energizing."}{" "}
              {moneyStyle.type.includes("S")
                ? "Your Sensing preference means you value practical, concrete steps. Each action includes specific tasks you can complete today."
                : "Your Intuitive preference means you see the big picture. Focus on how each action connects to your long-term vision."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
