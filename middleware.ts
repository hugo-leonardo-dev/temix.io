import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/api/users") && !req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
});

export const config = { matcher: ["/api/users/:path*"] };
