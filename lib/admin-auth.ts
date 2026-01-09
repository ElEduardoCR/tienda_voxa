import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * Verifica que el usuario esté autenticado y sea ADMIN
 * Retorna la sesión si es válida, o null si no lo es
 */
export async function requireAdmin() {
  const session = await auth()

  if (!session || !session.user) {
    return null
  }

  if (session.user.role !== "ADMIN") {
    return null
  }

  return session
}

/**
 * Helper para retornar error 401/403 en APIs protegidas
 */
export function adminErrorResponse(message: string = "No autorizado") {
  return NextResponse.json({ error: message }, { status: 403 })
}


