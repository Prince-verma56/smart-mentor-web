import { clerkMiddleware } from "@clerk/nextjs/server";

// We use resource-based auth checks as recommended by Clerk v7.
// The `app/(dashboard)/layout.tsx` calls `await auth.protect()` directly.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
