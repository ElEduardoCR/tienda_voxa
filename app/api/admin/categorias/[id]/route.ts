import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"
import { createSlug } from "@/lib/slug"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Schema de validación para actualizar categoría
const updateCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  imageUrl: z.string().url("URL de imagen inválida").optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET: Obtener categoría por ID con subcategorías
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

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        children: {
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Error al obtener categoría" },
      { status: 500 }
    )
  }
}

// PUT: Actualizar categoría
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden actualizar categorías")
    }

    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    const { prisma } = await import("@/lib/prisma")

    // Verificar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    // Si se actualiza el nombre, regenerar slug
    let slug = existingCategory.slug
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const baseSlug = createSlug(validatedData.name)
      slug = baseSlug
      let counter = 1
      
      while (true) {
        const existing = await prisma.category.findFirst({
          where: {
            slug,
            id: { not: params.id },
          },
          select: { id: true },
        })
        if (!existing) break
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Si se desactiva una categoría principal, desactivar también sus subcategorías
    if (validatedData.isActive === false && !existingCategory.parentId) {
      await prisma.category.updateMany({
        where: {
          parentId: params.id,
        },
        data: {
          isActive: false,
        },
      })
    }

    // Actualizar categoría
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.imageUrl !== undefined && { imageUrl: validatedData.imageUrl }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        ...(slug !== existingCategory.slug && { slug }),
      },
      include: {
        parent: true,
        children: {
          orderBy: { name: "asc" },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Error al actualizar categoría" },
      { status: 500 }
    )
  }
}

// DELETE: Soft delete (marcar como inactiva)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden eliminar categorías")
    }

    const { prisma } = await import("@/lib/prisma")

    // Verificar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    // Si es categoría principal, desactivar también sus subcategorías
    if (!existingCategory.parentId) {
      await prisma.category.updateMany({
        where: {
          parentId: params.id,
        },
        data: {
          isActive: false,
        },
      })
    }

    // Soft delete: marcar como inactiva
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({ ok: true, category })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 }
    )
  }
}

