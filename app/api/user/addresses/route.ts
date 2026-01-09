import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Schema de validación para crear/actualizar dirección
const addressSchema = z.object({
  name: z.string().min(1, "El nombre de la dirección es requerido").max(50),
  recipient: z.string().min(1, "El nombre del destinatario es requerido").max(100),
  street: z.string().min(1, "La calle es requerida").max(200),
  city: z.string().min(1, "La ciudad es requerida").max(100),
  state: z.string().min(1, "El estado es requerido").max(100),
  postalCode: z.string().min(5, "El código postal debe tener al menos 5 caracteres").max(10),
  country: z.string().default("México"),
  phone: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
})

/**
 * GET /api/user/addresses
 * Obtener todas las direcciones del usuario autenticado
 */
export async function GET() {
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

    const addresses = await prisma.deliveryAddress.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: "desc" }, // Dirección predeterminada primero
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json(
      { error: "Error al obtener direcciones" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/addresses
 * Crear una nueva dirección (máximo 5 por usuario)
 */
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = addressSchema.parse(body)

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

    // Verificar que no tenga más de 5 direcciones
    const addressCount = await prisma.deliveryAddress.count({
      where: { userId: user.id },
    })

    if (addressCount >= 5) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de 5 direcciones. Elimina una antes de agregar otra." },
        { status: 400 }
      )
    }

    // Si esta es la dirección predeterminada, desmarcar las demás
    if (validatedData.isDefault) {
      await prisma.deliveryAddress.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.deliveryAddress.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        recipient: validatedData.recipient,
        street: validatedData.street,
        city: validatedData.city,
        state: validatedData.state,
        postalCode: validatedData.postalCode,
        country: validatedData.country,
        phone: validatedData.phone || null,
        isDefault: validatedData.isDefault,
      },
    })

    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating address:", error)
    return NextResponse.json(
      { error: "Error al crear dirección" },
      { status: 500 }
    )
  }
}

