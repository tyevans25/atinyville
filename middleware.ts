import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/leaderboard",
  "/streaming",
  "/shop",
  "/lore",
  "/variety",
  "/wordle",
  "/api/quiz/leaderboard",
  "/api/cron(.*)", 
  "/api/user-stats",
  "/api/streak",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/quiz/check-played",
  "/variety",
  "/api/variety-videos",
  "/api/manual-refresh",
  "/api/youtube-tracker",
  "/api/calendar-events",
  "/api/daily-missions",
  "/api/community-daily-goal",
  "/api/community-weekly-goal",
  "/api/mission-progress",
  "/api/daily-goal",
  "/api/focus-mv",
  "/api/stationhead-live",
  "/api/admin/auth",   // login/logout endpoint must be public
  "/admin/login",      // login page must be public
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Admin routes: only require ADMIN_PASSWORD cookie, not Clerk auth
  if (isAdminRoute(req)) {
    if (isPublicRoute(req)) return; // /admin/login passes through
    const cookie = req.cookies.get("admin_session");
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || cookie?.value !== expected) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return; // valid admin session — no Clerk required
  }

  if (isPublicRoute(req)) return;

  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
