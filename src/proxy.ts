import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/shared/lib/rate-limit";

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN;
if (!ALLOWED_DOMAIN) {
  throw new Error("ALLOWED_DOMAIN is not set");
}

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/", "/unauthorized"]);

const isPlatformRoute = createRouteMatcher([
  "/submissions(.*)",
  "/database(.*)",
  "/applicants(.*)",
  "/api/submissions(.*)",
  "/api/assets(.*)",
  "/api/live(.*)",
]);

const isCreatorRoute = createRouteMatcher(["/creator(.*)"]);

const rateLimitedRoutes = [
  "/api/uploads/presign",
  "/api/uploads/part",
  "/api/uploads/complete",
  "/api/submissions/rollback",
];

export default clerkMiddleware(async (auth, req: NextRequest) => {
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

  if (isPublicRoute(req)) {
    return;
  }

  if (isPlatformRoute(req)) {
    await auth.protect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress ?? "";

    if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
      return NextResponse.redirect(new URL("/creator", req.url));
    }
  }

  if (isCreatorRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
