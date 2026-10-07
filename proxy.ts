import { NextRequest } from "next/server";

import { auth } from "@/lib/auth/server";

const authMiddleware = auth.middleware({
  loginUrl: "/login",
});

export default function proxy(request: NextRequest) {
  if (request.headers.has("Next-Action")) {
    return;
  }
  request.headers.set("x-pathname", request.nextUrl.pathname);
  return authMiddleware(request);
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/admin/:path*", "/complete-profile"],
};
