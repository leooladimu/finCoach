import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
// ...existing code...

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinCoach - Your Personal Financial Coach",
  description: "AI-powered financial coaching that adapts to your personality and goals",
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only use ClerkProvider if we have real Clerk keys
  const hasRealClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                           !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');
  
  const content = (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
  {/* PlaidScript removed to prevent double loading of Plaid Link script */}
      </body>
    </html>
  );

  if (hasRealClerkKeys) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }
  
  return content;
}
