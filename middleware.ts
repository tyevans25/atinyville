import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

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
  "/api/daily-goal"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
