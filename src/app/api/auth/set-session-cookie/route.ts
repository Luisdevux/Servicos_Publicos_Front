// src/app/api/auth/set-session-cookie/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Rota para configurar o cookie de sessão baseado em "lembrar de mim"
 * 
 * Se lembrarDeMim = false: Cookie sem maxAge (session cookie - expira ao fechar navegador)
 * Se lembrarDeMim = true: Cookie com maxAge de 30 dias
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lembrarDeMim } = body;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token') ||
      cookieStore.get('__Secure-next-auth.session-token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Configura o cookie baseado em lembrarDeMim
    const cookieName = process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

    interface CookieOptions {
      httpOnly: boolean;
      sameSite: 'lax' | 'strict' | 'none';
      path: string;
      secure: boolean;
      maxAge?: number;
    }

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    };

    // Se NÃO marcou lembrar de mim, não define maxAge (cookie de sessão)
    if (lembrarDeMim) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60; // 30 dias
    }
    // Se não definir maxAge, o cookie expira ao fechar o navegador

    response.cookies.set(cookieName, sessionToken.value, cookieOptions);

    console.log('[SetSessionCookie] Cookie configurado:', {
      lembrarDeMim,
      hasMaxAge: !!cookieOptions.maxAge,
      maxAge: cookieOptions.maxAge
    });

    return response;
  } catch (error) {
    console.error('[SetSessionCookie] Error:', error);
    return NextResponse.json(
      { error: 'Failed to set session cookie' },
      { status: 500 }
    );
  }
}
