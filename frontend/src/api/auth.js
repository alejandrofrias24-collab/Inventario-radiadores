const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error('No se pudo conectar con la API. Comprueba que esté iniciada.');
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `La solicitud falló (${response.status}).`);
  return payload.data;
}

export const login = (credentials) => request('login', credentials);
export const register = (data) => request('register', data);
