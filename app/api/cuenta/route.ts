import { NextResponse } from "next/server"
import { auth } from "@/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Validar que email existe en la sesión
    if (!session.user.email) {
      return NextResponse.json(
        { error: "Email no encontrado en la sesión" },
        { status: 400 }
      )
    }

    const { prisma } = await import("@/lib/prisma")

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Error al obtener datos del usuario" },
      { status: 500 }
    )
  }
}

