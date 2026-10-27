import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'miqr_default_fallback_secret_must_be_32_characters!'
);

const PROTECTED_PREFIXES = ['/dashboard', '/qr', '/storage', '/settings'];
const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('miqr_session')?.value;

  let isValidSession = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY, { algorithms: ['HS256'] });
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // Jika mencoba akses halaman proteksi tanpa login
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !isValidSession) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mencoba akses login/register
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && isValidSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/qr/:path*', '/storage/:path*', '/settings/:path*', '/login', '/register'],
};
