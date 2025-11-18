// src/app/api/auth/check-rate-limit/route.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota dedicada para verificar rate limit no login.
 * Faz a mesma requisição que o NextAuth faria, mas retorna apenas o status de rate limit.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identificador, senha } = body;

    if (!identificador || !senha) {
      return NextResponse.json({ rateLimited: false });
    }

    // Faz a requisição de login para verificar rate limit
    const res = await fetch(`${process.env.API_URL_SERVER_SIDED}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identificador, senha }),
    });

    // Se for rate limit (429), retorna imediatamente
    if (res.status === 429) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { 
          rateLimited: true, 
          message: errorData?.message || 'Muitas tentativas. Aguarde alguns minutos.' 
        },
        { status: 429 }
      );
    }

    // Para outros status, retorna OK (NextAuth vai processar o login depois)
    return NextResponse.json({ rateLimited: false });
  } catch (error) {
    console.error('[check-rate-limit] Erro:', error);
    // Em caso de erro, permite prosseguir (fail open)
    return NextResponse.json({ rateLimited: false });
  }
}
