import { NextResponse } from "next/server"
import { z } from "zod"
import * as bcrypt from "bcryptjs"
import { hashToken } from "@/lib/tokens"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const resetSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export async function POST(request: Request) {
  try {
    const body = await resetSchema.parse(await request.json())
    const { token, password } = body

    const { prisma } = await import("@/lib/prisma")

    // Buscar token de reset (el token en DB ya es el hash)
    const tokenHash = hashToken(token)
    
    // Usar transacción para evitar race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Buscar token no usado con bloqueo (para prevenir uso concurrente)
      const resetToken = await tx.passwordResetToken.findFirst({
        where: {
          token: tokenHash,
          expiresAt: {
            gt: new Date(), // No expirado
          },
          usedAt: null, // No usado
        },
        include: {
          user: true,
        },
      })

      if (!resetToken || !resetToken.userId) {
        throw new Error("Token inválido, expirado o ya utilizado")
      }

      // Marcar token como usado INMEDIATAMENTE (antes de actualizar contraseña)
      // Esto previene que el mismo token se use dos veces
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          usedAt: new Date(),
        },
      })

      // Hash de la nueva contraseña
      const passwordHash = await bcrypt.hash(password, 10)

      // Actualizar contraseña del usuario
      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
        },
      })

      return { success: true }
    })

    return NextResponse.json(
      { ok: true, message: "Contraseña actualizada exitosamente" },
      { status: 200 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    // Si el error es de validación de token, retornar error específico
    if (error.message === "Token inválido, expirado o ya utilizado") {
      return NextResponse.json(
        { error: "Token inválido, expirado o ya utilizado" },
        { status: 400 }
      )
    }

    console.error("Error en reset de contraseña:", error)
    return NextResponse.json(
      { error: "Error al restablecer contraseña" },
      { status: 500 }
    )
  }
}

