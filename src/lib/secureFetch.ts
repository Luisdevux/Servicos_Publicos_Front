// src/lib/secureFetch.ts

type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface SecureFetchOptions {
  endpoint: string;
  method?: FetchMethod;
  body?: unknown;
}

export async function secureFetch<T>(options: SecureFetchOptions): Promise<T> {
  const { endpoint, method = 'GET', body } = options;

  const response = await fetch('/api/auth/secure-fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint,
      method,
      body
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    const errorMessage = error.message || error.error || 'Request failed';
    const customError = new Error(errorMessage);
    // Add status to error object so we can check it
    (customError as any).status = response.status;
    (customError as any).data = error;
    throw customError;
  }

  return response.json();
}
