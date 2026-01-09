import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { auth } from "@/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Inicializar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
})

const payment = new Payment(client)

/**
 * POST /api/checkout/verify-order
 * Verifica el estado de un pago en Mercado Pago usando el orderId
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID requerido" },
        { status: 400 }
      )
    }

    const { prisma } = await import("@/lib/prisma")

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que el usuario sea el dueño de la orden o un admin
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    // Buscar el payment_id de Mercado Pago
    // Primero intentar con mercadoPagoPaymentId, luego con mercadoPagoId (preference_id)
    let mpPayment = null
    let paymentIdToCheck = null

    if (order.mercadoPagoPaymentId) {
      // Si tenemos el payment_id, usarlo directamente
      paymentIdToCheck = order.mercadoPagoPaymentId
      try {
        mpPayment = await payment.get({ id: paymentIdToCheck.toString() })
      } catch (error) {
        console.error("Error obteniendo pago con payment_id:", error)
      }
    }

    // Si no encontramos el pago con payment_id, intentar con preference_id
    if (!mpPayment && order.mercadoPagoId) {
      // Con preference_id necesitamos buscar los pagos asociados
      // Como no tenemos API directa, usaremos la información que ya tenemos
      // o intentaremos obtener el pago más reciente de esa preferencia
      paymentIdToCheck = order.mercadoPagoId
      
      // Si tenemos mercadoPagoStatus, actualizaremos con esa info
      // pero idealmente necesitaríamos buscar el payment_id real
      // Por ahora, si ya tenemos el status, lo respetamos
    }

    // Si no encontramos el pago en MP pero tenemos status guardado, devolver info actual
    if (!mpPayment) {
      return NextResponse.json({
        success: true,
        orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        mercadoPagoStatus: order.mercadoPagoStatus || "unknown",
        message: "No se pudo verificar con Mercado Pago. Usando estado guardado.",
      })
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

    // Si encontramos el payment_id, guardarlo
    if (mpPayment.id && mpPayment.id.toString() !== order.mercadoPagoPaymentId) {
      updateData.mercadoPagoPaymentId = mpPayment.id.toString()
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
    console.error("Error verificando orden:", error)
    return NextResponse.json(
      { error: error.message || "Error al verificar la orden" },
      { status: 500 }
    )
  }
}

