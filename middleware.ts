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
  "/api/quiz/leaderboard",
  "/api/cron(.*)", 
  "/api/user-stats",
  "/api/streak",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/quiz/check-played",
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
