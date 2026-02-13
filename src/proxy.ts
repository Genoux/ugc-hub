import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/shared/lib/rate-limit";

const isProtectedRoute = createRouteMatcher(["/campaigns(.*)", "/api/campaigns(.*)"]);

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

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
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
