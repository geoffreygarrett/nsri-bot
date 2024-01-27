// import {NextRequest, NextResponse} from "next/server";
// import {createMiddlewareClient, createMiddlewareSupabaseClient} from "@supabase/auth-helpers-nextjs";
//
// export const config = {
//     matcher: [
//         /*
//          * Match all request paths except for the ones starting with:
//          * - api (API routes)
//          * - _next/static (static files)
//          * - _next/image (image optimization files)
//          * - favicon.ico (favicon file)
//          */
//         // "/((?!api|_next/static|_next/image|favicon.ico).*)",
//         "/api/wa/webhook",
//         "/api/wa/status_callback",
//     ],
// };
//
//
// export async function middleware(req: NextRequest) {
//     // Create a response object for the supabase client to modify response headers.
//     const res = NextResponse.next();
//
//     // Create an authenticated Supabase Client.
//     const supabase = createMiddlewareClient({req, res});
//
//     // Refresh session if expired - required for Server Components
//     await supabase.auth.getSession()
//
//     const basicAuth = req.headers.get("authorization");
//     const url = req.nextUrl;
//
//     if (basicAuth) {
//         const authValue = basicAuth.split(" ")[1];
//         const [user, pwd] = atob(authValue).split(":");
//
//         const validUser = process.env.TWILLIO_AUTH_USER;
//         const validPassWord = process.env.TWILLIO_AUTH_PASSWORD;
//
//         const authToken = await supabase.auth.signInWithPassword(
//             {
//                 phone: '+13334445555',
//                 password: 'some-password',
//             }
//         )
//
//         console.log("authToken", authToken);
//
//         console.log("user", user);
//         console.log("pwd", pwd);
//
//         if (user === validUser && pwd === validPassWord) {
//             return NextResponse.next();
//         }
//     }
//
//     // unauthorized
//     return new NextResponse("Unauthorized", {
//         status: 401,
//         headers: {
//             "WWW-Authenticate": 'Basic realm="Secure Area"',
//         },
//     });
//
//
//     // url.pathname = "/api/auth";
//     //
//     //
//     // return NextResponse({
//     //
//     // }
// }
import {createMiddlewareClient} from '@supabase/auth-helpers-nextjs'
import {NextResponse} from 'next/server'

import type {NextRequest} from 'next/server'
import type {Database} from '@/types/supabase'

// config.js
export const options = {
    protectedPaths: [
        '/profile',
        '/invite',
    ],
    protectedRedirect: '/sign-in',
    logInPaths: [
        '/sign-in',
        '/sign-up',
    ],
    logInRedirect: '/',
};

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient<Database>({req, res})

    // Refresh session if expired - required for Server Components
    const {
        data: {user},
    } = await supabase.auth.getUser();

    const isProtectedPath = options.protectedPaths.some(path => req.nextUrl.pathname.match(path) !== null);
    const isLogInPath = options.logInPaths.some(path => req.nextUrl.pathname.match(path) !== null);

    // // If authentication condition is not met, redirect to the login page.
    // const redirectUrl = req.nextUrl.clone();
    // redirectUrl.pathname = "/login";
    // redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    // return NextResponse.redirect(redirectUrl);

    if (!user && isProtectedPath) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = options.protectedRedirect;
        const capturedSearchParams = new URLSearchParams(Array.from(redirectUrl.searchParams.entries()));
        redirectUrl.searchParams.set("redirectTo", `${req.nextUrl.pathname}?${capturedSearchParams}`);
        return NextResponse.redirect(redirectUrl);
    }

    if (user && isLogInPath) {
        return NextResponse.redirect(new URL(options.logInRedirect, req.url));
    }
    return res
}

// Ensure the middleware is only called for relevant paths.
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
        '/profile',
        '/invite',
        '/auth',

    ],
}