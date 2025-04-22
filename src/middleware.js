import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/auth/login', "/"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const adminCookie = request.cookies.get('admincookie');

  if (!adminCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // protect all routes except Next internals
};