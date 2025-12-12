import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// Define onboarding routes (for new users)
const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, redirectToSignIn } = await auth();

  // Allow public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Redirect to sign-in if not authenticated
  if (!userId && !isPublicRoute(request)) {
    return redirectToSignIn();
  }

  // Allow onboarding routes for authenticated users
  if (isOnboardingRoute(request)) {
    return;
  }

  // All other protected routes require authentication
  if (!userId) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
