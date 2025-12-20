import { NextResponse } from "next/server"
import { hashToken } from "@/lib/tokens"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token no proporcionado" },
        { status: 400 }
      )
    }

    const { prisma } = await import("@/lib/prisma")

    // Buscar token de verificación (el token en DB ya es el hash)
    const tokenHash = hashToken(token)
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: tokenHash,
        expiresAt: {
          gt: new Date(), // No expirado
        },
      },
      include: {
        user: true,
      },
    })

    if (!verificationToken || !verificationToken.userId) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      )
    }

    // Marcar email como verificado
    await prisma.user.update({
      where: { id: verificationToken.userId! },
      data: {
        emailVerified: new Date(),
      },
    })

    // Eliminar token usado
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return NextResponse.json(
      { ok: true, message: "Email verificado exitosamente" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error verificando email:", error)
    return NextResponse.json(
      { error: "Error al verificar email" },
      { status: 500 }
    )
  }
}

