# FinCoach 💰

**AI-Powered Financial Coaching That Adapts to Your Personality**

A modern, serverless financial coaching platform that provides personalized guidance based on your unique "Money Style" — an MBTI-informed approach to understanding your financial decision-making patterns.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://fincoach.oleo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 🎯 **Personalized Money Style Assessment**
- 20-question MBTI-based assessment (~3 minutes)
- 16 unique Money Style profiles with detailed descriptions
- Tailored coaching approaches for each personality type
- **Full accessibility support** (WCAG 2.1 AA compliant)
- **Keyboard navigation** with arrow keys, number shortcuts, and screen reader support
- **Mobile-optimized** with touch interactions and responsive design

### 📊 **Comprehensive Financial Dashboard**
- **Goals Tab**: Track financial goals with visual progress indicators
- **Behavior Tab**: Analyze spending patterns and identify behavioral insights
- **Plan Tab**: Actionable task management with priority levels
- **Contradiction Detection**: AI-powered analysis identifies misalignments between stated goals and actual behavior

### 🔐 **Secure & Private**
- Clerk authentication with session management
- Plaid integration for secure bank connections (sandbox mode)
- All data stored in Vercel KV (serverless Redis)
- No traditional database — fully edge-optimized

### 🚀 **Performance & UX**
- Server-side rendering with Next.js App Router
- Glassmorphism UI with modern dark theme
- Smooth animations powered by Framer Motion
- Real-time data visualization with Recharts
- Progressive Web App (PWA) ready
- **Auto-save progress** — never lose assessment data on refresh
- **Rate limiting** to prevent spam and abuse
- **Comprehensive error handling** with user-friendly toast notifications

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  Next.js 16 + React + TypeScript + Tailwind CSS v4     │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Serverless Backend                      │
│  Vercel Edge Functions + API Routes                     │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Vercel KV   │  │   Plaid API  │  │ AWS Lambda   │
│  (Redis)     │  │  (Banking)   │  │ (Optional)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### **Tech Stack**

**Frontend:**
- [Next.js 16.1.1](https://nextjs.org/) - React framework with App Router
- [TypeScript 5.x](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Recharts](https://recharts.org/) - Data visualization

**Backend:**
- [Vercel Edge Functions](https://vercel.com/docs/functions) - Serverless compute
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) - Redis key-value store
- [Clerk](https://clerk.com/) - Authentication & user management

**External Services:**
- [Plaid](https://plaid.com/) - Bank account integration
- [AWS Lambda](https://aws.amazon.com/lambda/) - ML-powered contradiction detection (optional)

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm/yarn/pnpm
- Vercel account (for deployment)
- Clerk account (for authentication)
- Plaid account (for banking integration - sandbox mode works)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/leooladimu/fincoach.git
   cd fincoach
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Vercel KV (Redis)
   KV_REST_API_URL=your_kv_url
   KV_REST_API_TOKEN=your_kv_token
   
   # Plaid (Banking)
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox
   
   # AWS (Optional - for ML features)
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
fincoach/
├── app/
│   ├── (auth)/
│   │   ├── onboarding/           # Onboarding flow
│   │   │   ├── page.tsx           # User info collection
│   │   │   └── assessment/        # Money Style assessment
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── goals/                 # Goals dashboard
│   │   ├── behavior/              # Behavior analysis
│   │   ├── plan/                  # Action plan & tasks
│   │   ├── profile/               # User profile
│   │   └── layout.tsx
│   ├── api/
│   │   ├── assessment/            # Assessment scoring
│   │   ├── plaid/                 # Plaid integration
│   │   └── analyze/               # Contradiction detection
│   ├── globals.css                # Global styles + theme
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── lib/
│   ├── assessment.ts              # Assessment questions & scoring
│   ├── contradictions.ts          # Contradiction detection logic
│   ├── kv.ts                      # Vercel KV utilities
│   ├── plaid.ts                   # Plaid client setup
│   └── hooks/                     # React hooks
├── types/
│   └── index.ts                   # TypeScript type definitions
├── aws/
│   └── lambda/                    # AWS Lambda functions
└── public/                        # Static assets
```

---

## 🎨 Design System

### **Color Palette**
- **Background**: `#000000` (Pure black)
- **Primary Accent**: `#10b981` (Emerald-500 - growth/success)
- **Secondary Accent**: `#3b82f6` (Blue-500 - actions)
- **Tertiary Accent**: `#8b5cf6` (Violet-500 - highlights)
- **Danger**: `#ef4444` (Red-500 - warnings)

### **Typography**
- **Font**: Geist Sans & Geist Mono (Vercel's font family)
- **Scales**: Responsive text sizing (mobile-first)

### **Components**
- Glassmorphism effects (`backdrop-blur-xl` + `rgba(20,20,20,0.7)`)
- Gradient text for emphasis
- Custom scrollbars
- Smooth transitions with cubic-bezier easing

---

## 🧪 Features in Detail

### **Money Style Assessment**
- **Validation**: Frontend + backend validation of all answers
- **Rate Limiting**: 5 submissions per hour per user+IP
- **Progress Saving**: Auto-saves to localStorage
- **Accessibility**: 
  - Full keyboard navigation (arrow keys, Enter, Space, Backspace, 1-4)
  - ARIA labels and roles
  - Screen reader support
  - Focus management
- **Mobile**: Touch-optimized with active states and responsive layouts

### **Contradiction Detection**
- Compares stated goals vs. actual spending patterns
- Identifies behavioral misalignments
- Provides actionable insights
- Optional AWS Lambda integration for ML-powered analysis

### **Dashboard**
- Real-time data from Plaid (sandbox)
- Visual progress tracking with charts
- Priority-based task management
- Personalized insights based on Money Style

---

## 🔒 Security & Privacy

- **Authentication**: Secure session management with Clerk
- **Data Storage**: Encrypted at rest in Vercel KV
- **API Security**: Rate limiting on all endpoints
- **Input Validation**: Comprehensive frontend + backend validation
- **No PII Leakage**: Minimal personal data collection
- **HTTPS Only**: All connections encrypted

---

## 🚢 Deployment

### **Vercel (Recommended)**

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Configure KV Storage**
   - Create a Vercel KV database in your project
   - Copy the connection strings to your environment variables

### **Environment Variables**
Make sure to add all `.env.local` variables to your Vercel project settings.

---

## 📊 Data Models

### **User Profile**
```typescript
{
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  moneyStyle?: {
    type: MBTIType; // e.g., "ENFP"
    scores: MBTIScores;
    assessmentDate: string;
  };
  lifeContext?: {
    age?: number;
    employmentStatus?: string;
  };
  statedPreferences?: {
    priorityGoals: string[];
  };
}
```

### **Financial Goal**
```typescript
{
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  createdAt: string;
}
```

### **Contradiction**
```typescript
{
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: string;
  resolved: boolean;
}
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MBTI Framework** - For personality type methodology
- **Plaid** - For secure banking integration
- **Vercel** - For hosting and serverless infrastructure
- **Clerk** - For authentication
- **Next.js Team** - For the amazing framework

---

## 📧 Contact

**Leo Oladimu** - [@leooladimu](https://github.com/leooladimu)

**Live Demo**: [https://fincoach.oleo.dev](https://fincoach.oleo.dev)

---

## 🗺️ Roadmap

- [ ] Real Plaid integration (production)
- [ ] Additional Money Style profiles
- [ ] Advanced ML contradiction detection
- [ ] Bill tracking & reminders
- [ ] Investment portfolio analysis
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Social features (community goals)

---

<div align="center">
  <strong>Built with ❤️ using Next.js, TypeScript, and modern web technologies</strong>
</div>
