import { SignIn } from '@clerk/nextjs';
import dynamic from 'next/dynamic';

// Dynamically import PlaidLinkButton to avoid SSR issues with Plaid Link
const PlaidLinkButton = dynamic(
  () => import('@/components/PlaidLinkButton').then(mod => mod.PlaidLinkButton),
  { ssr: false, loading: () => <div className="h-12"></div> }
);

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💰</div>
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-red-900 to-amber-800">
              Fin
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-orange-900 to-red-900">
              Coach
            </span>
          </h1>
          <p className="text-stone-700 font-serif">
            Welcome back! Sign in to continue your financial journey.
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "bg-gradient-to-br from-stone-50 to-amber-50 border-4 border-double border-amber-800/40 shadow-2xl w-full",
                  footerActionLink: "text-amber-800 hover:text-amber-900",
                  formButtonPrimary: "bg-amber-700 hover:bg-amber-800",
                }
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              redirectUrl="/onboarding"
            />
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-800/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-amber-50 text-amber-900 font-medium">
                Or connect your bank account
              </span>
            </div>
          </div>

          <div className="px-4">
            <PlaidLinkButton 
              userId="demo-user" // In a real app, use the actual user ID after sign-in
            />
          </div>
        </div>
      </div>
    </div>
  );
}
