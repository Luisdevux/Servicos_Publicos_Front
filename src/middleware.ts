// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas públicas que não precisam de autenticação
const PUBLIC_PATHS = ['/', '/login', '/signup', '/recover-password', '/cadastro', '/esqueci-senha', '/nova-senha', '/verificar-email', '/aguardando-verificacao'] as const;

// Rotas que apenas usuários não autenticados podem acessar
const AUTH_ONLY_PATHS = ['/login', '/signup', '/cadastro'] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pega o token do NextAuth JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Verifica se é rota pública
  const isPublicPath = PUBLIC_PATHS.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!token && !isPublicPath) {
    const url = new URL('/login/municipe', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  const isAuthOnlyPath = AUTH_ONLY_PATHS.some(path =>
    pathname.startsWith(path)
  );

  if (token && isAuthOnlyPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  if (token) {
    response.headers.set('x-user-id', token.id || '');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
