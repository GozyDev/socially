import { clerkMiddleware } from '@clerk/nextjs/server';

    export default clerkMiddleware();

    export const config = {
      matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/image (image optimization files)
         * - _next/static (static files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        '/((?!_next/image|_next/static|favicon.ico|public).*)',
        '/',
      ],
    };