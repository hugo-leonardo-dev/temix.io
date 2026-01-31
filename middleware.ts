import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  console.log("🚀 MIDDLEWARE RODANDO!", {
    pathname,
    isLoggedIn,
    auth: req.auth ? "✅ Session existe" : "❌ Session null",
  });

  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAuthRoute = pathname.startsWith("/api/auth");

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (isPublicPath) {
    if (isLoggedIn) {
      console.log(
        "🔄 Logado acessando login/register -> Redirecionando para /",
      );
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    console.log("🚫 NÃO LOGADO -> Redirecionando para /login");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log("✅ LOGADO -> Permitindo acesso");
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
