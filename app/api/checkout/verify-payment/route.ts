import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Inicializar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
})

const payment = new Payment(client)

/**
 * POST /api/checkout/verify-payment
 * Verifica el estado de un pago en Mercado Pago y actualiza la orden
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID requerido" },
        { status: 400 }
      )
    }

    // Obtener información del pago desde Mercado Pago
    const mpPayment = await payment.get({ id: paymentId.toString() })

    if (!mpPayment || !mpPayment.external_reference) {
      return NextResponse.json(
        { error: "Pago o referencia externa no encontrada" },
        { status: 404 }
      )
    }

    const orderId = mpPayment.external_reference as string

    const { prisma } = await import("@/lib/prisma")

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      )
    }

    // Determinar el estado del pago
    const paymentStatus = mpPayment.status
    let orderStatus = order.status
    let orderPaymentStatus = order.paymentStatus

    // Mapear estados de Mercado Pago a nuestros estados
    switch (paymentStatus) {
      case "approved":
        orderStatus = "approved"
        orderPaymentStatus = "approved"
        break
      case "rejected":
        orderStatus = "rejected"
        orderPaymentStatus = "rejected"
        break
      case "cancelled":
        orderStatus = "cancelled"
        orderPaymentStatus = "cancelled"
        break
      case "refunded":
        orderStatus = "refunded"
        orderPaymentStatus = "refunded"
        break
      case "pending":
      case "in_process":
      case "in_mediation":
        orderStatus = "pending"
        orderPaymentStatus = "pending"
        break
      default:
        orderStatus = "pending"
        orderPaymentStatus = "pending"
    }

    // Actualizar la orden
    const updateData: any = {
      mercadoPagoStatus: paymentStatus,
      mercadoPagoPaymentId: paymentId.toString(),
      status: orderStatus,
      paymentStatus: orderPaymentStatus,
    }

    // Si el pago fue aprobado, marcar fecha de pago y reducir stock
    if (paymentStatus === "approved" && !order.paidAt) {
      updateData.paidAt = new Date()
      
      // Reducir stock de productos solo si no se ha hecho antes
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }
    }

    // Si fue cancelado, marcar fecha de cancelación
    if ((paymentStatus === "cancelled" || paymentStatus === "rejected") && !order.cancelledAt) {
      updateData.cancelledAt = new Date()
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      orderId,
      status: orderStatus,
      paymentStatus: orderPaymentStatus,
      mercadoPagoStatus: paymentStatus,
    })
  } catch (error: any) {
    console.error("Error verificando pago:", error)
    return NextResponse.json(
      { error: error.message || "Error al verificar el pago" },
      { status: 500 }
    )
  }
}

