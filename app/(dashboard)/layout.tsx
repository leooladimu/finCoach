"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";
import { getUserProfileAction } from "@/lib/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useUser();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    async function checkProfile() {
      if (!isLoaded) return;

      // If not signed in, redirect to sign-in
      if (!isSignedIn) {
        router.push("/sign-in");
        return;
      }

      // Check if user has completed the assessment
      if (userId) {
        try {
          const profile = await getUserProfileAction(userId);

          // If no profile or no money style, redirect to onboarding
          if (!profile || !profile.moneyStyle) {
            router.push("/onboarding");
            return;
          }

          setHasCompletedAssessment(true);
        } catch (error) {
          console.error("Error checking profile:", error);
          // If error, redirect to onboarding to be safe
          router.push("/onboarding");
          return;
        }
      }

      setIsCheckingProfile(false);
    }

    checkProfile();
  }, [userId, isLoaded, isSignedIn, router]);

  // Show loading state while checking authentication and profile
  if (!isLoaded || isCheckingProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin"></div>
          </div>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated or hasn't completed assessment
  if (!isSignedIn || !hasCompletedAssessment) {
    return null;
  }

  return <>{children}</>;
}
