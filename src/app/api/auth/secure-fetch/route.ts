// src/app/api/auth/secure-fetch/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/*
 * Esta rota permite fazer requisições à API backend usando os tokens
 * armazenados de forma segura no JWT (cookie httpOnly), SEM expô-los ao cliente.
 */
export async function POST(request: NextRequest) {
  try {
    // Pega o token JWT diretamente do cookie (httpOnly)
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.accesstoken) {
      return NextResponse.json(
        { error: 'Unauthorized - No active session' },
        { status: 401 }
      );
    }

    const { endpoint, method = 'GET', body } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.API_URL_SERVER_SIDED || process.env.NEXT_PUBLIC_API_URL;
    const fullUrl = `${apiUrl}${endpoint}`;

    console.log('[SecureFetch] Fazendo requisição autenticada:', {
      endpoint,
      method,
      hasBody: !!body
    });

    // Faz a requisição usando os tokens do JWT (servidor)
    // Tokens NUNCA foram expostos ao cliente
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accesstoken}`
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.warn('[SecureFetch] Requisição falhou:', response.status);
      return NextResponse.json(
        data || { error: 'Request failed' },
        { status: response.status }
      );
    }

    console.log('[SecureFetch] Requisição bem-sucedida');
    return NextResponse.json(data);

  } catch (error) {
    console.error('[SecureFetch] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
