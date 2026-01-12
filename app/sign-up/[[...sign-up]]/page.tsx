import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "glass border border-white/10",
            headerTitle: "text-white",
            headerSubtitle: "text-neutral-400",
            socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
            formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white",
            formFieldInput: "bg-white/5 border-white/10 text-white",
            footerActionLink: "text-emerald-500 hover:text-emerald-400",
          }
        }}
        fallbackRedirectUrl="/onboarding"
        signInUrl="/sign-in"
      />
    </div>
  );
}
