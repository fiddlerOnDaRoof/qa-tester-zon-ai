import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let the auth callback through so Supabase can exchange the code for a session
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  // Build a response we can attach refreshed cookies to
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto both the outgoing request (so Server Components
          // see the refreshed token) and onto the response (so the browser keeps it).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() refreshes the session when the access token is stale
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAppRoute = pathname.startsWith("/home") || pathname.startsWith("/projects");
  const isAuthRoute = pathname === "/" || pathname === "/login";

  if (!user && isAppRoute) {
    // Unauthenticated user trying to reach a protected page → /login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthRoute) {
    // Already-authenticated user hitting root or login → /home
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public files  (manifest, icons, etc.)
     * - api routes    (handled by their own auth checks)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt)$|api/).*)",
  ],
};
