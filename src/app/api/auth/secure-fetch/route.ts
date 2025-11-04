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

    const body = await request.json();
    const { endpoint, method = 'GET', body: requestBody, bodyType, formData } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.API_URL_SERVER_SIDED;
    if (!apiUrl) {
      console.error('[SecureFetch] API_URL_SERVER_SIDED não configurada!');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const fullUrl = `${apiUrl}${endpoint}`;

    console.log('[SecureFetch] Fazendo requisição autenticada:', {
      endpoint,
      method,
      url: fullUrl,
      hasBody: !!requestBody || !!formData,
      bodyType
    });

    // Prepara headers e body baseado no tipo
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token.accesstoken}`
    };
    let finalBody: string | FormData | undefined;

    if (bodyType === 'formData' && formData) {
      // Para FormData, cria um novo FormData e adiciona os arquivos
      const form = new FormData();
      if (formData.file) {
        // Converte base64 de volta para File se necessário
        if (typeof formData.file === 'string' && formData.file.startsWith('data:')) {
          const blob = await fetch(formData.file).then(r => r.blob());
          const file = new File([blob], 'upload.jpg', { type: blob.type });
          form.append('file', file);
        }

      }
      finalBody = form;
      // Não define Content-Type para FormData - deixa o browser definir
    } else {
      headers['Content-Type'] = 'application/json';
      finalBody = requestBody ? JSON.stringify(requestBody) : undefined;
    }

    // Faz a requisição usando os tokens do JWT (servidor)
    // Tokens NUNCA foram expostos ao cliente
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: finalBody,
    });

    if (!response.ok) {
      // Tenta ler como JSON primeiro, depois como texto
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() || 'Request failed' };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Verifica se é uma resposta binária (imagem, arquivo, etc.)
    const contentType = response.headers.get('content-type');
    if (contentType && (
      contentType.startsWith('image/') ||
      contentType.startsWith('application/octet-stream') ||
      contentType.includes('application/pdf') ||
      !contentType.includes('application/json')
    )) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Content-Length': blob.size.toString(),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        },
      });
    }

    // Para respostas JSON, parseia normalmente
    const data = await response.json().catch(() => null);
    return NextResponse.json(data);

  } catch (error) {
    console.error('[SecureFetch] Erro na requisição:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

