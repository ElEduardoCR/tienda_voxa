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
 * GET /api/checkout/webhook
 * Mercado Pago prueba el webhook con GET para verificar que está activo
 * También útil para verificar manualmente desde el navegador
 */
export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString()
  })
}

/**
 * HEAD /api/checkout/webhook
 * Mercado Pago también puede usar HEAD para verificar el endpoint
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

/**
 * POST /api/checkout/webhook
 * Webhook de Mercado Pago para recibir notificaciones de pago
 */
export async function POST(request: Request) {
  try {
    // Validar que el request viene de Mercado Pago (opcional pero recomendado)
    const signature = request.headers.get("x-signature")
    const requestId = request.headers.get("x-request-id")
    
    console.log("Webhook recibido de Mercado Pago:", {
      signature: signature ? "presente" : "ausente",
      requestId,
      timestamp: new Date().toISOString()
    })

    const body = await request.json()
    const { type, data } = body

    console.log("Webhook payload:", { type, data })

    // Solo procesar notificaciones de pago
    if (type !== "payment") {
      console.log(`Tipo de notificación ignorada: ${type}`)
      return NextResponse.json({ received: true })
    }

    const paymentId = data.id

    if (!paymentId) {
      console.error("Payment ID missing en webhook")
      return NextResponse.json({ error: "Payment ID missing" }, { status: 400 })
    }

    // Obtener información del pago desde Mercado Pago
    const mpPayment = await payment.get({ id: paymentId.toString() })

    if (!mpPayment || !mpPayment.external_reference) {
      console.error(`Pago ${paymentId} no encontrado o sin external_reference`)
      return NextResponse.json({ 
        error: "Payment or external_reference not found" 
      }, { status: 404 })
    }

    const orderId = mpPayment.external_reference as string

    const { prisma } = await import("@/lib/prisma")

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      console.error(`Orden ${orderId} no encontrada para pago ${paymentId}`)
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
      mercadoPagoPaymentId: paymentId.toString(), // Guardar el payment_id para reembolsos
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

    console.log(`Orden ${order.orderNumber} actualizada: ${orderStatus} (pago: ${paymentStatus})`)

    // IMPORTANTE: Siempre devolver 200 OK para evitar reintentos innecesarios
    return NextResponse.json({ 
      received: true, 
      orderId, 
      status: orderStatus,
      paymentStatus: orderPaymentStatus 
    })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    // IMPORTANTE: Devolver 200 OK incluso en error para evitar reintentos infinitos
    // Mercado Pago reintentará si recibe 4xx o 5xx
    return NextResponse.json(
      { 
        received: false,
        error: error.message || "Error processing webhook" 
      },
      { status: 200 } // Cambiar de 500 a 200 para evitar reintentos infinitos
    )
  }
}

