import { NextResponse } from "next/server"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Schema de validación para actualizar tracking o cancelar orden
const updateTrackingSchema = z.object({
  trackingNumber: z.string().min(1, "La clave de rastreo es requerida").optional(),
  shippingCarrier: z.string().min(1, "La operadora es requerida").optional(),
  shippingStatus: z.enum(["pending", "shipped", "delivered"]).optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled", "refunded"]).optional(),
})

/**
 * PUT /api/admin/ventas/[id]
 * Actualizar información de envío de una orden
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden acceder")
    }

    const body = await request.json()
    const validatedData = updateTrackingSchema.parse(body)

    const { prisma } = await import("@/lib/prisma")

    // Verificar que la orden existe
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {}

    if (validatedData.trackingNumber !== undefined) {
      updateData.trackingNumber = validatedData.trackingNumber
    }

    if (validatedData.shippingCarrier !== undefined) {
      updateData.shippingCarrier = validatedData.shippingCarrier
    }

    if (validatedData.shippingStatus !== undefined) {
      updateData.shippingStatus = validatedData.shippingStatus
      
      // Si se marca como enviado, establecer fecha de envío
      if (validatedData.shippingStatus === "shipped" && !order.shippedAt) {
        updateData.shippedAt = new Date()
      }
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      updateData.paymentStatus = validatedData.status
      
      // Si se cancela, establecer fecha de cancelación
      if (validatedData.status === "cancelled" && !order.cancelledAt) {
        updateData.cancelledAt = new Date()
      }

      // Si se reembolsa, marcar como refunded
      if (validatedData.status === "refunded") {
        updateData.status = "refunded"
        updateData.paymentStatus = "refunded"
      }
    }

    // Actualizar orden
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating order tracking:", error)
    return NextResponse.json(
      { error: "Error al actualizar información de envío" },
      { status: 500 }
    )
  }
}

