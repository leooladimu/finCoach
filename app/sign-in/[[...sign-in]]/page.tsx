'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-black to-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to home link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-neutral-800/50 backdrop-blur-xl border border-neutral-700",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-neutral-300",
              socialButtonsBlockButton: "bg-white/10 border border-neutral-600 text-white hover:bg-white/20",
              formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold",
              formFieldInput: "bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-400",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
              formFieldLabel: "text-neutral-200 font-medium",
              identityPreviewText: "text-white",
              formResendCodeLink: "text-emerald-400 hover:text-emerald-300",
              otpCodeFieldInput: "bg-neutral-700/50 border-neutral-600 text-white text-lg",
              formFieldInputShowPasswordButton: "text-neutral-300 hover:text-white",
              alertText: "text-white",
              identityPreviewEditButton: "text-emerald-400 hover:text-emerald-300",
              formHeaderTitle: "text-white text-xl font-semibold",
              formHeaderSubtitle: "text-neutral-200",
              main: "text-white",
              cardBox: "text-white",
              footer: "text-neutral-300",
              formFieldRow: "text-white",
              formFieldAction: "text-emerald-400 hover:text-emerald-300",
            },
            layout: {
              termsPageUrl: undefined,
              privacyPageUrl: undefined,
            }
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/goals"
        />
        
        <p className="text-center text-xs text-neutral-400 mt-4">
          Need help? <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">Go back to home</Link>
        </p>
      </div>
    </div>
  );
}

/* 
// When Clerk is ready, replace the above with:
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "glass border border-white/10",
          }
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/goals"
      />
    </div>
  );
}
*/
