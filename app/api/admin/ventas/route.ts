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
    const paymentStatus = searchParams.get("paymentStatus") // Filtrar por estado de pago
    const shippingStatus = searchParams.get("shippingStatus") // Filtrar por estado de envío

    const { prisma } = await import("@/lib/prisma")

    const where: any = {}

    // Si se especifica status, usar ese
    if (status && status !== "all") {
      where.status = status
    }

    // Si se especifica paymentStatus, usar ese (tiene prioridad sobre status para pagos aprobados)
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus
    } else if (status === "approved") {
      // Por defecto mostrar órdenes con pago aprobado (aunque el status pueda estar en pending si el webhook falló)
      where.paymentStatus = "approved"
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

