/**
 * Rate limiting simple en memoria
 * En producción, considerar usar Redis o similar
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

/**
 * Verifica si una acción está permitida según rate limit
 * @param key Clave única (ej: IP o email)
 * @param maxRequests Máximo de requests permitidos
 * @param windowMs Ventana de tiempo en milisegundos
 * @returns true si está permitido, false si excede el límite
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const record = store[key]

  // Si no existe registro o la ventana expiró, crear nuevo
  if (!record || now > record.resetAt) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    }
    return true
  }

  // Si ya alcanzó el límite, rechazar
  if (record.count >= maxRequests) {
    return false
  }

  // Incrementar contador
  record.count++
  return true
}

/**
 * Limpia registros expirados (ejecutar periódicamente)
 */
export function cleanExpiredRecords() {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key]
    }
  })
}

