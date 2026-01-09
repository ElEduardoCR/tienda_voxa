import crypto from "crypto"

/**
 * Genera un token aleatorio seguro (32 bytes)
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Genera el hash SHA256 de un token para almacenarlo en la DB
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

/**
 * Verifica si un token coincide con su hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token)
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash),
    Buffer.from(hash)
  )
}


