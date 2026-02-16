import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/shared/lib/rate-limit";

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN;
if (!ALLOWED_DOMAIN) {
  throw new Error("ALLOWED_DOMAIN is not set");
}

// ALL platform routes require @inbeat.agency email
const isPlatformRoute = createRouteMatcher([
  "/submissions(.*)",
  "/database(.*)",
  "/api/submissions(.*)",
  "/api/assets(.*)",
  "/api/live(.*)",
]);

const rateLimitedRoutes = [
  "/api/uploads/presign",
  "/api/uploads/part",
  "/api/uploads/complete",
  "/api/submissions/rollback",
];

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Apply rate limiting to specific API routes
  if (rateLimitedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const { success, limit, reset, remaining } = rateLimit(ip, { limit: 10, windowMs: 10000 });

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": new Date(reset).toISOString(),
          },
        },
      );
    }
  }

  // Protect platform routes with domain restriction
  if (isPlatformRoute(req)) {
    await auth.protect();

    // Domain check - ONLY @inbeat.agency
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress ?? "";

    if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
      // Wrong domain - redirect to access denied page (not in isPlatformRoute, so no loop)
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
