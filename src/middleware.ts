// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas públicas que não precisam de autenticação
const PUBLIC_PATHS = ['/', '/login', '/signup', '/recover-password', '/cadastro', '/esqueci-senha', '/nova-senha', '/verificar-email', '/aguardando-verificacao'] as const;

// Rotas que apenas usuários não autenticados podem acessar
const AUTH_ONLY_PATHS = ['/login', '/signup', '/cadastro'] as const;

// Definição de rotas por tipo de usuário
const ROLE_ROUTES = {
  // Rotas exclusivas de administrador
  admin: ['/admin'],
  // Rotas exclusivas de operador
  operador: ['/operador'],
  // Rotas exclusivas de secretário
  secretario: ['/secretaria'],
  // Rotas de munícipe (inclui rotas compartilhadas como perfil e demanda genérica)
  municipe: ['/demanda', '/pedidosMunicipe', '/perfil'],
} as const;

// Páginas padrão de redirecionamento por tipo de usuário
const DEFAULT_PAGES = {
  administrador: '/admin/dashboard',
  operador: '/operador',
  secretario: '/secretaria',
  municipe: '/',
} as const;

function getUserType(nivelAcesso: {
  municipe?: boolean;
  operador?: boolean;
  secretario?: boolean;
  administrador?: boolean;
}): 'administrador' | 'secretario' | 'operador' | 'municipe' {
  if (nivelAcesso?.administrador) return 'administrador';
  if (nivelAcesso?.secretario) return 'secretario';
  if (nivelAcesso?.operador) return 'operador';
  return 'municipe';
}

 // Verifica se o usuário tem permissão para acessar a rota
function canAccessRoute(
  pathname: string,
  userType: 'administrador' | 'secretario' | 'operador' | 'municipe'
): boolean {
  // Administrador só pode acessar rotas de admin
  if (userType === 'administrador') {
    return ROLE_ROUTES.admin.some(route => pathname.startsWith(route));
  }
  
  // Operador só pode acessar rotas de operador
  if (userType === 'operador') {
    return ROLE_ROUTES.operador.some(route => pathname.startsWith(route));
  }
  
  // Secretário só pode acessar rotas de secretaria
  if (userType === 'secretario') {
    return ROLE_ROUTES.secretario.some(route => pathname.startsWith(route));
  }
  
  // Munícipe só pode acessar rotas de munícipe (e home)
  if (userType === 'municipe') {
    if (pathname === '/') return true;
    return ROLE_ROUTES.municipe.some(route => pathname.startsWith(route));
  }
  
  return false;
}

  // Verifica se a rota é protegida (pertence a algum grupo específico)
function isProtectedRoute(pathname: string): boolean {
  const allProtectedRoutes = [
    ...ROLE_ROUTES.admin,
    ...ROLE_ROUTES.operador,
    ...ROLE_ROUTES.secretario,
    ...ROLE_ROUTES.municipe,
  ];
  
  return allProtectedRoutes.some(route => pathname.startsWith(route));
}

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
    const userType = getUserType(token.nivel_acesso);
    return NextResponse.redirect(new URL(DEFAULT_PAGES[userType], request.url));
  }

  // Verifica permissões de acesso por tipo de usuário
  if (token && isProtectedRoute(pathname)) {
    const userType = getUserType(token.nivel_acesso);
    
    if (!canAccessRoute(pathname, userType)) {
      console.log(`[Middleware] Acesso negado: ${userType} tentou acessar ${pathname}`);
      return NextResponse.redirect(new URL(DEFAULT_PAGES[userType], request.url));
    }
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
