import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"
import { createSlug, generateUniqueSlug } from "@/lib/slug"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Schema de validación para actualizar producto
const updateProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional().nullable(),
  priceCents: z.number().int().min(0, "El precio debe ser mayor o igual a 0").optional(),
  images: z.array(z.string().url("URL de imagen inválida")).optional(),
  isActive: z.boolean().optional(),
  isSoldOut: z.boolean().optional(),
})

// GET: Obtener producto por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden acceder")
    }

    const { prisma } = await import("@/lib/prisma")
    
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    )
  }
}

// PUT: Actualizar producto
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden actualizar productos")
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    const { prisma } = await import("@/lib/prisma")

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Si se actualiza el nombre, regenerar slug
    let slug = existingProduct.slug
    if (validatedData.name && validatedData.name !== existingProduct.name) {
      const baseSlug = createSlug(validatedData.name)
      slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
        // Ignorar el producto actual al verificar unicidad
        const existing = await prisma.product.findFirst({
          where: {
            slug: testSlug,
            id: { not: params.id },
          },
        })
        return !!existing
      })
    }

    // Actualizar producto
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.priceCents !== undefined && { priceCents: validatedData.priceCents }),
        ...(validatedData.images !== undefined && { images: validatedData.images }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        ...(validatedData.isSoldOut !== undefined && { isSoldOut: validatedData.isSoldOut }),
        ...(slug !== existingProduct.slug && { slug }),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    )
  }
}

// DELETE: Soft delete (marcar como inactivo)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden eliminar productos")
    }

    const { prisma } = await import("@/lib/prisma")

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Soft delete: marcar como inactivo
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({ ok: true, product })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    )
  }
}

