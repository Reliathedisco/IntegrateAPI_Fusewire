import {
  effectiveClerkPublishableKey,
  effectiveClerkSecretKey,
} from "@/lib/clerk-keys";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    const pk = effectiveClerkPublishableKey();
    const sk = effectiveClerkSecretKey();
    if (!pk || !sk) {
      if (isProtectedRoute(req)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return;
    }
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  () => {
    const pk = effectiveClerkPublishableKey();
    const sk = effectiveClerkSecretKey();
    if (!pk || !sk) {
      return {};
    }
    return { publishableKey: pk, secretKey: sk };
  },
);

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
