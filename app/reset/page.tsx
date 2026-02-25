"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("Cleaning up...");

  useEffect(() => {
    async function cleanup() {
      try {
        // Step 1: Delete profile from database
        setStatus("Deleting profile from database...");
        try {
          await fetch("/api/profile", { method: "DELETE" });
          setStatus("Profile deleted ✓");
        } catch (e) {
          console.error("Profile delete error:", e);
          setStatus("Profile delete failed (continuing...)");
        }

        // Step 2: Clear ALL localStorage
        setStatus("Clearing browser storage...");
        localStorage.clear();
        sessionStorage.clear();

        setStatus("Storage cleared ✓");

        setStatus("Redirecting to sign out...");

        // Wait a moment then redirect to sign out
        setTimeout(() => {
          window.location.href = "/sign-out";
        }, 1000);
      } catch (error) {
        console.error("Cleanup error:", error);
        setStatus("Error during cleanup. Redirecting anyway...");
        setTimeout(() => {
          window.location.href = "/sign-out";
        }, 1500);
      }
    }

    cleanup();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 border border-white/10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔄</div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Resetting Everything
        </h1>
        <p className="text-neutral-400 mb-4">{status}</p>
        <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-500 h-2 animate-pulse w-full"></div>
        </div>
        <p className="text-xs text-neutral-600 mt-4">
          After signing out, you can start fresh with a clean slate.
        </p>
      </div>
    </div>
  );
}
