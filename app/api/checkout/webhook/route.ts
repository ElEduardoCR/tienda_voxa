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
 * POST /api/checkout/webhook
 * Webhook de Mercado Pago para recibir notificaciones de pago
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    console.log("Webhook recibido de Mercado Pago:", { type, data })

    // Solo procesar notificaciones de pago
    if (type !== "payment") {
      return NextResponse.json({ received: true })
    }

    const paymentId = data.id

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID missing" }, { status: 400 })
    }

    // Obtener información del pago desde Mercado Pago
    const mpPayment = await payment.get({ id: paymentId.toString() })

    if (!mpPayment || !mpPayment.external_reference) {
      return NextResponse.json({ error: "Payment or external_reference not found" }, { status: 404 })
    }

    const orderId = mpPayment.external_reference as string

    const { prisma } = await import("@/lib/prisma")

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      console.error(`Orden ${orderId} no encontrada`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
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
      status: orderStatus,
      paymentStatus: orderPaymentStatus,
    }

    // Si el pago fue aprobado, marcar fecha de pago
    if (paymentStatus === "approved" && !order.paidAt) {
      updateData.paidAt = new Date()
      
      // Reducir stock de productos
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

    console.log(`Orden ${order.orderNumber} actualizada: ${orderStatus}`)

    return NextResponse.json({ received: true, orderId, status: orderStatus })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: error.message || "Error processing webhook" },
      { status: 500 }
    )
  }
}

