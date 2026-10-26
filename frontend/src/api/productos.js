const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  const session = JSON.parse(localStorage.getItem('radiadores-session') || 'null');
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error('No se pudo conectar con la API. Comprueba que esté iniciada en el puerto 3000.');
  }

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && session?.token) {
      localStorage.removeItem('radiadores-session');
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new Error(payload?.error?.message || `La solicitud falló (${response.status}).`);
  }
  return payload;
}

export function getHealth() {
  return request('/health');
}

export function getProductos({ page = 1, limit = 8, search = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search.trim()) params.set('search', search.trim());
  return request(`/productos?${params.toString()}`);
}

export async function createProducto(producto) {
  const result = await request('/productos', {
    method: 'POST',
    body: JSON.stringify(producto)
  });
  return result.data;
}

export async function updateProducto({ id, producto }) {
  const result = await request(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto)
  });
  return result.data;
}

export function deleteProducto(id) {
  return request(`/productos/${id}`, { method: 'DELETE' });
}
