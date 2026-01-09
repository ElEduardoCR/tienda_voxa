import { NextResponse } from "next/server"
import { auth } from "@/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/checkout/get-order?paymentId=xxx
 * Obtiene la orden asociada con un ID de pago de Mercado Pago
 */
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID requerido" },
        { status: 400 }
      )
    }

    const { prisma } = await import("@/lib/prisma")

    // Buscar orden por mercadoPagoId (preference_id o payment_id)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { mercadoPagoId: paymentId },
          { mercadoPagoId: { contains: paymentId } },
        ],
        user: {
          email: session.user.email,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalCents: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Error al obtener la orden" },
      { status: 500 }
    )
  }
}

