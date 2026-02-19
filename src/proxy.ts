import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/shared/lib/rate-limit";
import { ROUTES } from "@/shared/lib/routes";

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN;
if (!ALLOWED_DOMAIN) {
  throw new Error("ALLOWED_DOMAIN is not set");
}

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

const isPlatformRoute = createRouteMatcher([
  "/submissions(.*)",
  "/database(.*)",
  "/applicants(.*)",
  "/api/submissions(.*)",
  "/api/assets(.*)",
  "/api/live(.*)",
]);

const isCreatorRoute = createRouteMatcher(["/creator(.*)", "/submit(.*)"]);

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
      return NextResponse.redirect(new URL(ROUTES.signIn, req.url));
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress ?? "";

    // Non-admin trying to access platform routes gets redirected to creator portal
    if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
      return NextResponse.redirect(new URL(ROUTES.creatorHome, req.url));
    }
  }

  if (isCreatorRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL(ROUTES.signIn, req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
