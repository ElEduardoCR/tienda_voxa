import { NextResponse } from "next/server"
import { z } from "zod"
import { generateToken, hashToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const olvidoSchema = z.object({
  email: z.string().email("Email inválido"),
})

export async function POST(request: Request) {
  try {
    const body = await olvidoSchema.parse(await request.json())
    const { email } = body

    // Rate limiting: 3 requests por hora por email
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimitKey = `password-reset:${email}:${ip}`
    
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        { status: 429 }
      )
    }

    const { prisma } = await import("@/lib/prisma")

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Respuesta neutra: siempre decir que se envió el email si existe
    if (!user) {
      return NextResponse.json(
        { ok: true, message: "Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña" },
        { status: 200 }
      )
    }

    // Invalidar tokens de reset anteriores no usados
    await prisma.passwordResetToken.updateMany({
      where: {
        email,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(), // Marcar como usado para invalidar
      },
    })

    // Generar nuevo token
    const resetToken = generateToken()
    const tokenHash = hashToken(resetToken)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 60) // Expira en 1 hora

    // Crear token de reset
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: tokenHash,
        expiresAt,
        userId: user.id,
      },
    })

    // Enviar email
    try {
      await sendPasswordResetEmail(email, user.name, resetToken)
    } catch (emailError) {
      console.error("Error enviando email de recuperación:", emailError)
      return NextResponse.json(
        { error: "Error al enviar email. Intenta más tarde." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ok: true, message: "Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error en solicitud de reset:", error)
    return NextResponse.json(
      { error: "Error al procesar solicitud" },
      { status: 500 }
    )
  }
}


