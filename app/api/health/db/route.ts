import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma")
    const count = await prisma.user.count()
    
    return NextResponse.json({ ok: true, count })
  } catch (error) {
    console.error("Error en health check DB:", error)
    return NextResponse.json(
      { ok: false, error: "Error de conexión a la base de datos" },
      { status: 500 }
    )
  }
}


