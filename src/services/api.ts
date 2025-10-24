// src/services/api.ts
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Variável para controlar tentativa de refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = Cookies.get('refresh_token');
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Falha ao renovar token');
    }

    const data = await response.json();
    const newAccessToken = data.data?.user?.accessToken;
    const newRefreshToken = data.data?.user?.refreshtoken;

    if (newAccessToken && newRefreshToken) {
      // Configurações de cookie
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      const isProduction = process.env.NODE_ENV === 'production';
      
      const cookieOptions = {
        secure: isProduction,
        sameSite: 'strict' as const,
        ...(rememberMe ? { expires: 30 } : {}),
      };
      
      Cookies.set('access_token', newAccessToken, { 
        ...cookieOptions,
        expires: rememberMe ? 7 : undefined,
      });
      
      Cookies.set('refresh_token', newRefreshToken, cookieOptions);
      
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    // Remove tokens inválidos
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('user_data');
    return null;
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
  headers?: HeadersInit;
}

/**
 * Função para fazer requisições HTTP
 * 
 * @param url - Endpoint da API (ex: '/demandas' ou '/tipoDemanda')
 * @param options - Opções da requisição (method, token, body, headers)
 * @returns Promise com os dados tipados
 */
export async function fetchData<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    token,
    body,
    headers: customHeaders = {}
  } = options;

  // Monta os headers
  const headers: HeadersInit = {
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  };

  // Monta as opções da requisição
  const requestOptions: RequestInit = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    const response = await fetch(`${API_URL}${url}`, requestOptions);

    // Tenta parsear o JSON
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      // Se não conseguir parsear, retorna erro genérico
      throw new ApiError(
        'Erro ao processar resposta da API',
        response.status
      );
    }

    // Se token expirou (401), tenta renovar
    if (response.status === 401 && token && !url.includes('/refresh') && !url.includes('/login')) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);
          // Refaz a requisição com o novo token
          return fetchData<T>(url, { ...options, token: newToken });
        } else {
          // Se falhou o refresh, redireciona para login
          if (typeof window !== 'undefined') {
            window.location.href = '/login/municipe';
          }
          throw new ApiError('Sessão expirada. Faça login novamente.', 401);
        }
      } else {
        // Se já está renovando, aguarda
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            fetchData<T>(url, { ...options, token: newToken })
              .then(resolve)
              .catch(reject);
          });
        });
      }
    }

    // Se a resposta não for OK, lança erro
    if (!response.ok) {
      const errorMessage = (json as { message?: string })?.message || 
                          `Erro ${response.status}: ${response.statusText}`;
      
      throw new ApiError(errorMessage, response.status, json);
    }

    return json as T;
  } catch (error) {
    // Se já é um ApiError, repassa
    if (error instanceof ApiError) {
      throw error;
    }

    // Erros de rede ou outros
    if (error instanceof Error) {
      throw new ApiError(
        error.message || 'Erro de conexão com a API',
        undefined,
        error
      );
    }

    // Erro desconhecido
    throw new ApiError('Erro desconhecido ao fazer requisição');
  }
}

/**
 * Helper para requisições GET
 */
export async function get<T>(url: string, token?: string | null): Promise<T> {
  return fetchData<T>(url, { method: 'GET', token });
}

/**
 * Helper para requisições POST
 */
export async function post<T>(
  url: string,
  body: unknown,
  token?: string | null
): Promise<T> {
  return fetchData<T>(url, { method: 'POST', body, token });
}

/**
 * Helper para requisições PATCH
 */
export async function patch<T>(
  url: string,
  body: unknown,
  token?: string | null
): Promise<T> {
  return fetchData<T>(url, { method: 'PATCH', body, token });
}

/**
 * Helper para requisições DELETE
 */
export async function del<T>(
  url: string,
  token?: string | null
): Promise<T> {
  return fetchData<T>(url, { method: 'DELETE', token });
}
