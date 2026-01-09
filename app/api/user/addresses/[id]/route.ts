import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Schema de validación para actualizar dirección
const updateAddressSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  recipient: z.string().min(1).max(100).optional(),
  street: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(5).max(10).optional(),
  country: z.string().optional(),
  phone: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
})

/**
 * PUT /api/user/addresses/[id]
 * Actualizar una dirección existente
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateAddressSchema.parse(body)

    const { prisma } = await import("@/lib/prisma")

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que la dirección pertenece al usuario
    const existingAddress = await prisma.deliveryAddress.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Dirección no encontrada" },
        { status: 404 }
      )
    }

    // Si se marca como predeterminada, desmarcar las demás
    if (validatedData.isDefault === true) {
      await prisma.deliveryAddress.updateMany({
        where: {
          userId: user.id,
          id: { not: params.id },
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    const address = await prisma.deliveryAddress.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.recipient && { recipient: validatedData.recipient }),
        ...(validatedData.street && { street: validatedData.street }),
        ...(validatedData.city && { city: validatedData.city }),
        ...(validatedData.state && { state: validatedData.state }),
        ...(validatedData.postalCode && { postalCode: validatedData.postalCode }),
        ...(validatedData.country && { country: validatedData.country }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.isDefault !== undefined && { isDefault: validatedData.isDefault }),
      },
    })

    return NextResponse.json(address)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating address:", error)
    return NextResponse.json(
      { error: "Error al actualizar dirección" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/addresses/[id]
 * Eliminar una dirección
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const { prisma } = await import("@/lib/prisma")

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que la dirección pertenece al usuario
    const existingAddress = await prisma.deliveryAddress.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Dirección no encontrada" },
        { status: 404 }
      )
    }

    await prisma.deliveryAddress.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { error: "Error al eliminar dirección" },
      { status: 500 }
    )
  }
}

