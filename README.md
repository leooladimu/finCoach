# FinCoach

**Financial Coaching That Speaks Your Language**

A serverless financial coaching application that provides personalized guidance based on your unique "Money Style" (Myers-Briggs-informed approach). Built with Next.js 14, TypeScript, and Vercel serverless infrastructure.

## 🎯 Project Overview

FinCoach is a comprehensive financial coaching platform designed to:
- Assess your financial decision-making preferences through a 60-second "Money Style" quiz
- Provide three distinct coaching modes: Goals, Behavior, and Plan
- Detect contradictions between stated preferences and actual financial behavior
- Deliver personality-adapted guidance without explicitly mentioning psychological frameworks

## 🏗️ Architecture

**Frontend:**
- Next.js 14 (App Router)
- React with TypeScript
- Tailwind CSS
- Recharts (data visualization)
- Framer Motion (animations)

**Backend:**
- Vercel Edge Functions (serverless)
- Vercel KV (Redis key-value store)
- No traditional database - fully serverless

**External Integrations:**
- Clerk / NextAuth.js (authentication)
- Plaid API (financial data - sandbox mode)
- AWS Lambda (optional ML analysis)
- AWS S3 (document storage)

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The main entry point is `app/page.tsx` (landing page).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
