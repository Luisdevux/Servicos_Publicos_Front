// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Pega o token do NextAuth
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Rotas públicas que não precisam de autenticação
  const publicPaths = ['/', '/login', '/signup', '/recover-password', '/cadastro'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );

  // Se não estiver autenticado e tentar acessar rota protegida
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login/municipe', request.url));
  }

  // Se tem token e está tentando acessar login/cadastro, redireciona para home
  const authOnlyPaths = ['/login', '/signup', '/cadastro'];
  const isAuthOnlyPath = authOnlyPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (token && isAuthOnlyPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
