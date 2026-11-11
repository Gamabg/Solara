const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function handleCors(req, res) {
  const origin = req.headers.origin
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (origin && !allowedOrigins.includes(origin)) {
    res.status(403).json({ error: 'Origem não autorizada.' })
    return true
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }

  if (MUTATING_METHODS.has(req.method) && !origin) {
    res.status(403).json({ error: 'A origem da solicitação não foi informada.' })
    return true
  }

  return false
}

export function requireMethod(req, res, allowedMethods) {
  if (allowedMethods.includes(req.method)) return false
  res.setHeader('Allow', allowedMethods.join(', '))
  res.status(405).json({ error: 'Método não permitido.' })
  return true
}

export function getBody(req) {
  if (!req.headers['content-type']?.includes('application/json')) {
    const error = new Error('Envie os dados no formato JSON.')
    error.statusCode = 400
    throw error
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    const error = new Error('O corpo da solicitação é inválido.')
    error.statusCode = 400
    throw error
  }
  return req.body
}

export function reportError(context, error) {
  console.error(`[api] ${context}`, error)
  return error.statusCode === 400
    ? error.message
    : 'Ocorreu um erro interno. Tente novamente.'
}
