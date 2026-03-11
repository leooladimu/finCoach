"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardNavProps {
  userName?: string;
}

const navItems = [
  { href: "/goals", label: "🎯 Goals" },
  { href: "/behavior", label: "📊 Behavior" },
  { href: "/plan", label: "📋 Plan" },
];

export function DashboardNav({ userName = "" }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <>
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
              <Link
                href="/profile"
                className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                {userName.charAt(0).toUpperCase() || "U"}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href;
              return isActive ? (
                <button
                  key={href}
                  className="py-4 px-1 border-b-2 border-emerald-500 text-white font-medium text-sm"
                >
                  {label}
                </button>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="py-4 px-1 border-b-2 border-transparent text-neutral-400 hover:text-white hover:border-emerald-500 font-medium text-sm transition-colors"
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
