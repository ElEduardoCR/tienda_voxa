import { NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { z } from "zod"
import { generateToken, hashToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const registroSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
})

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma")
    const body = await request.json()
    const { email, password, name } = registroSchema.parse(body)

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      )
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Generar token de verificación
    const verificationToken = generateToken()
    const tokenHash = hashToken(verificationToken)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Expira en 24 horas

    // Crear usuario (emailVerified será null)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "USER",
        emailVerified: null,
      },
    })

    // Crear token de verificación
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenHash,
        expiresAt,
        userId: user.id,
      },
    })

    // Enviar email de verificación (no bloquea la respuesta si falla)
    try {
      await sendVerificationEmail(email, name, verificationToken)
    } catch (emailError) {
      console.error("Error enviando email de verificación:", emailError)
      // No fallamos el registro si el email falla, pero logueamos el error
    }

    return NextResponse.json(
      { ok: true, message: "Usuario registrado. Por favor verifica tu correo electrónico." },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    )
  }
}

