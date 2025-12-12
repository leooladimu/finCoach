# Deployment Readiness Checklist

## ✅ Completed

### 1. Authentication (Clerk)
- ✅ Middleware created (`middleware.ts`)
  - Protects all dashboard routes
  - Redirects unauthenticated users to sign-in
  - Allows public access to landing page
- ✅ Sign-in page created (`/sign-in`)
- ✅ Sign-up page created (`/sign-up`)  
- ✅ ClerkProvider added to root layout
- ⚠️  **Required**: Add Clerk API keys to environment variables

### 2. Error Boundaries
- ✅ Global error page (`app/error.tsx`)
- ✅ 404 not-found page (`app/not-found.tsx`)
- ✅ Development mode shows detailed errors
- ✅ Production mode shows user-friendly messages

### 3. KV Storage
- ✅ Environment-aware KV setup
  - Uses Vercel KV when credentials provided
  - Falls back to Vercel's built-in mock for development
- ✅ `.env.local` created with all required variables
- ⚠️  **Required**: Configure Vercel KV in production

### 4. Contradiction Detection
- ✅ Enhanced algorithms implemented
- ✅ Connected to Behavior page
- ✅ Uses real KV storage
- ⚠️  **Pending**: Replace localStorage with KV + userId

---

## 🔴 CRITICAL - Must Complete Before Deploy

### 1. Environment Variables (Vercel Dashboard)
```bash
# Required for Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Required for Data Persistence
KV_REST_API_URL=https://...kv.vercel-storage.com
KV_REST_API_TOKEN=...

# Optional but Recommended
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox
```

**Steps:**
1. Create Clerk account: https://dashboard.clerk.com
2. Create new application → Copy API keys
3. In Vercel: Project Settings → Environment Variables → Add all keys
4. Create Vercel KV: Storage → Create KV Database → Copy credentials

### 2. Replace localStorage with KV + userId

**Files that still use localStorage:**
- `lib/hooks/useContradictions.ts` - Lines 22-23
- `app/(dashboard)/behavior/page.tsx` - Line 12-13
- `app/(dashboard)/goals/page.tsx` - Goals state
- `app/(dashboard)/plan/page.tsx` - Tasks state
- `app/(dashboard)/profile/page.tsx` - Profile state

**Migration Strategy:**
```typescript
// OLD: localStorage
const profile = localStorage.getItem('profile');

// NEW: KV with userId from Clerk
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();
const profile = await getUserProfile(userId);
```

### 3. Update Onboarding Flow
- Save user profile to KV instead of localStorage
- Associate data with Clerk userId
- Redirect to appropriate dashboard after completion

---

## 🟡 Important - Should Complete Soon

### 1. Loading States
- ✅ Contradiction detection has loading spinner
- ⚠️  Add loading states to:
  - Goals page (fetching from KV)
  - Profile page (loading user data)
  - Plan page (loading tasks)

### 2. Add Plaid Sandbox Testing
- Configure test credentials
- Test account linking flow
- Verify transaction data appears correctly

### 3. Mobile Responsiveness
- Test all dashboard pages on mobile
- Verify charts render correctly
- Test sign-in/sign-up flows on mobile

### 4. Build Verification
```bash
npm run build
# Fix any TypeScript/build errors
# Test locally with: npm start
```

---

## 🟢 Nice to Have - Can Do After Deploy

### 1. Performance Optimizations
- Lazy load Recharts components
- Add route-level loading.tsx files
- Implement React Server Components where possible
- Add next/image for any images

### 2. Analytics
- Add Vercel Analytics
- Set up PostHog or Mixpanel
- Track user behavior and contradictions

### 3. Security Headers
- Add CSP headers in next.config.ts
- Configure CORS for API routes
- Add rate limiting

### 4. SEO
- Add proper meta tags to all pages
- Create sitemap.xml
- Add robots.txt
- Implement Open Graph images

---

## 🚀 Deployment Steps

### Phase 1: Setup (30 min)
1. Create Clerk account → Get API keys
2. Create Vercel KV database → Get credentials
3. Add all environment variables to Vercel
4. (Optional) Add Plaid sandbox keys

### Phase 2: Code Updates (2-3 hours)
1. Create user context/hook for Clerk userId
2. Update all localStorage calls to KV + userId
3. Update onboarding to save to KV
4. Test locally with mock Clerk user

### Phase 3: Testing (1 hour)
1. Run `npm run build` → Fix any errors
2. Test sign-up → onboarding → dashboard flow
3. Verify data persists across sessions
4. Test on mobile device

### Phase 4: Deploy (15 min)
```bash
# From project root
vercel --prod

# Or push to main branch if GitHub integration is set up
git add .
git commit -m "feat: add authentication and KV storage"
git push origin main
```

### Phase 5: Post-Deploy (30 min)
1. Test production site
2. Verify environment variables are working
3. Test full user flow end-to-end
4. Monitor Vercel logs for errors

---

## 📋 Quick Reference

### Vercel KV Setup
```bash
# In Vercel dashboard:
1. Storage → Create Database → KV
2. Copy KV_REST_API_URL
3. Copy KV_REST_API_TOKEN
4. Add to Environment Variables
```

### Clerk Setup
```bash
# In Clerk dashboard:
1. Create Application
2. Copy NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
3. Copy CLERK_SECRET_KEY
4. Add to Environment Variables
5. Configure redirect URLs:
   - Sign-in: /sign-in
   - Sign-up: /sign-up
   - After sign-in: /onboarding
```

### Testing Locally
```bash
# Create .env.local with your keys
cp .env.local.example .env.local
# Edit .env.local with real values

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Test production build
npm start
```

---

## 🆘 Troubleshooting

### "Clerk keys not found"
- Check `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Restart dev server after adding env vars
- In production, check Vercel environment variables

### "KV connection error"
- Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
- Check Vercel KV database is active
- For development, mock will be used automatically

### "Build fails"
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all imports are correct
- Check Next.js version compatibility

### "Authentication redirect loop"
- Verify middleware.ts is configured correctly
- Check Clerk redirect URLs match your routes
- Clear cookies and try again

---

## 📊 Current Status

**Ready for Deploy:** 60%
- ✅ Authentication setup complete
- ✅ Error boundaries added
- ✅ KV storage configured
- ⚠️  Need to replace localStorage → KV
- ⚠️  Need to add environment variables

**Estimated Time to Production-Ready:** 3-4 hours
- 2-3 hours: localStorage → KV migration
- 1 hour: Testing and fixes

**Recommended Deploy Timeline:**
1. **Today**: Add env vars, deploy demo (data won't persist)
2. **This week**: Complete KV migration, deploy v1.0
3. **Next week**: Add Plaid, polish, optimize

