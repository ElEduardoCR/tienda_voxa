import { NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { z } from "zod"

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

    // Crear usuario
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "USER",
      },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
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

