const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
export const isApiConfigured = Boolean(apiBaseUrl || import.meta.env.PROD)

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const responseText = await response.text()
  let payload
  try {
    payload = responseText ? JSON.parse(responseText) : {}
  } catch {
    throw new ApiError('A API retornou uma resposta inválida.', response.status)
  }
  if (!response.ok) {
    throw new ApiError(payload.error || 'Não foi possível concluir a solicitação.', response.status)
  }
  return payload
}

export const storeApi = {
  getProducts: () => request('/products'),
  getAdminProducts: () => request('/products?all=true'),
  createProduct: (product) => request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  updateProduct: (id, product) => request(`/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  deleteProduct: (id) => request(`/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),
  getContent: () => request('/store-content'),
  saveContent: (content) => request('/store-content', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  }),
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getAdmin: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  updateProfile: (profile) => request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  }),
}
