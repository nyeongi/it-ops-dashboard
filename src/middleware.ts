import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');
    const url = req.nextUrl;

    // Only protect the dashboard and API routes, allow static assets to load
    if (!url.pathname.startsWith('/_next') && !url.pathname.startsWith('/favicon.ico')) {
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const decoded = atob(authValue);
            const [user, pwd] = decoded.split(':');

            // Strip potential quotes from env vars
            const expectedUser = (process.env.AUTH_USER || '').replace(/['"]/g, '');
            const expectedPwd = (process.env.AUTH_PASS || '').replace(/['"]/g, '');

            console.log('Auth attempt:', { 
                user, 
                expectedUser, 
                userMatches: user === expectedUser,
                pwdMatches: pwd === expectedPwd
            });

            if (user === expectedUser && pwd === expectedPwd) {
                return NextResponse.next();
            }
        }

        return new NextResponse('Auth Required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    return NextResponse.next();
}
