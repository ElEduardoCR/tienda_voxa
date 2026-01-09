import { NextResponse } from "next/server"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/admin/ventas
 * Obtener todas las ventas (solo órdenes aprobadas)
 */
export async function GET(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden acceder")
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "approved" // Por defecto solo aprobadas
    const shippingStatus = searchParams.get("shippingStatus") // Filtrar por estado de envío

    const { prisma } = await import("@/lib/prisma")

    const where: any = {
      status: status,
    }

    if (shippingStatus) {
      where.shippingStatus = shippingStatus
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    )
  }
}

