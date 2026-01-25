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
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const session = await auth();
    session.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
