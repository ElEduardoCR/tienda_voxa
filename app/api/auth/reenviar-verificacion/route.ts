import { NextResponse } from "next/server"
import { z } from "zod"
import { generateToken, hashToken } from "@/lib/tokens"
import { resendVerificationEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const reenvioSchema = z.object({
  email: z.string().email("Email inválido"),
})

export async function POST(request: Request) {
  try {
    const body = await reenvioSchema.parse(await request.json())
    const { email } = body

    // Rate limiting: 3 requests por hora por email
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimitKey = `resend-verification:${email}:${ip}`
    
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
      // No revelamos si el email existe o no
      return NextResponse.json(
        { ok: true, message: "Si el email existe, se enviará un nuevo enlace de verificación" },
        { status: 200 }
      )
    }

    // Si ya está verificado, no enviar email
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "El email ya está verificado" },
        { status: 400 }
      )
    }

    // Eliminar tokens de verificación anteriores para este usuario
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: {
          lt: new Date(), // Solo eliminar expirados
        },
      },
    })

    // Generar nuevo token
    const verificationToken = generateToken()
    const tokenHash = hashToken(verificationToken)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Expira en 24 horas

    // Crear nuevo token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenHash,
        expiresAt,
        userId: user.id,
      },
    })

    // Enviar email
    try {
      await resendVerificationEmail(email, user.name, verificationToken)
    } catch (emailError) {
      console.error("Error enviando email de reenvío:", emailError)
      return NextResponse.json(
        { error: "Error al enviar email. Intenta más tarde." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ok: true, message: "Si el email existe, se enviará un nuevo enlace de verificación" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error reenviando verificación:", error)
    return NextResponse.json(
      { error: "Error al reenviar verificación" },
      { status: 500 }
    )
  }
}


