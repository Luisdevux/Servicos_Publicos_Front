// src/lib/secureFetch.ts

type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface SecureFetchOptions<TBody = unknown> {
  endpoint: string;
  method?: FetchMethod;
  body?: TBody;
  bodyType?: 'json' | 'formData';
  formData?: {
    file: string | File;
    fileName?: string;
  };
}

export async function secureFetch<T, TBody = unknown>(options: SecureFetchOptions<TBody>): Promise<T> {
  const { endpoint, method = 'GET', body, bodyType, formData } = options;

  const response = await fetch('/api/auth/secure-fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify({
      endpoint,
      method,
      body,
      bodyType,
      formData
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    
    // Tratamento específico para rate limit (429)
    if (response.status === 429) {
      const errorMessage = error.message || 
                          'Muitas requisições. Por favor, aguarde alguns minutos e tente novamente.';
      const customError = new Error(errorMessage) as Error & { status: number; data: unknown };
      customError.status = 429;
      customError.data = error;
      throw customError;
    }
    
    const errorMessage = error.message || error.error || 'Request failed';
    const customError = new Error(errorMessage) as Error & { status: number; data: unknown };
    customError.status = response.status;
    customError.data = error;
    throw customError;
  }

  return response.json();
}
