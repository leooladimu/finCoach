import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function SignOutPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 border border-white/10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Sign Out</h1>
        <p className="text-neutral-400 mb-8">
          Are you sure you want to sign out of FinCoach?
        </p>

        <div className="flex flex-col gap-3">
          <SignOutButton>
            <button className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
              Yes, Sign Me Out
            </button>
          </SignOutButton>

          <Link
            href="/goals"
            className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-white/10"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
