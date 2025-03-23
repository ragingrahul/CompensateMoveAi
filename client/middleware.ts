import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Skip middleware for login routes to avoid redirect loops
  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.includes("_next") ||
    request.nextUrl.pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Create a response object to modify and return
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client specifically for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Apply cookies to the request and response
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check if the request is for a protected route
  if (
    request.nextUrl.pathname.startsWith("/(employer)") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname === "/profile"
  ) {
    try {
      // Log the cookie names we have
      console.log(
        "Middleware cookies:",
        request.cookies.getAll().map((cookie) => cookie.name)
      );

      // Get the session using the middleware-configured Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (!session) {
        console.log("No session found, redirecting to login");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Valid session, continue
      console.log("Valid session found for user:", session.user.email);
      return response;
    } catch (error) {
      console.error("Middleware error:", error);
      // On any error, redirect to login for safety
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};
