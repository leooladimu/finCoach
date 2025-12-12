import { SignIn } from '@clerk/nextjs';

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
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-gradient-to-br from-stone-50 to-amber-50 border-4 border-double border-amber-800/40 shadow-2xl",
              }
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/onboarding"
          />
        </div>
      </div>
    </div>
  );
}
