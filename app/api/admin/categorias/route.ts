import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"
import { createSlug } from "@/lib/slug"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Schema de validación para crear categoría
const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  imageUrl: z.string().url("URL de imagen inválida").optional().nullable(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

// GET: Listar todas las categorías con jerarquía (árbol completo)
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden acceder")
    }

    const { prisma } = await import("@/lib/prisma")

    // Obtener todas las categorías con sus relaciones
    const allCategories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
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
      orderBy: [
        { parentId: "asc" }, // Primero las principales (parentId null)
        { name: "asc" },
      ],
    })

    // Contar productos incluyendo subcategorías (recursivo)
    const categoriesWithProductCount = await Promise.all(
      allCategories.map(async (category) => {
        let productCount = category._count.products

        // Si es categoría principal, contar productos de todas sus subcategorías
        if (!category.parentId) {
          const subcategoryIds = category.children.map((c) => c.id)
          if (subcategoryIds.length > 0) {
            const subcategoryProducts = await prisma.product.count({
              where: {
                categoryId: { in: subcategoryIds },
                isActive: true,
              },
            })
            productCount += subcategoryProducts
          }
        }

        return {
          ...category,
          productCount,
        }
      })
    )

    return NextResponse.json(categoriesWithProductCount)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    )
  }
}

// POST: Crear nueva categoría (principal o subcategoría)
export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden crear categorías")
    }

    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    const { prisma } = await import("@/lib/prisma")

    // Si hay parentId, verificar que existe y está activo
    if (validatedData.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      })

      if (!parent) {
        return NextResponse.json(
          { error: "Categoría padre no encontrada" },
          { status: 404 }
        )
      }

      if (!parent.isActive) {
        return NextResponse.json(
          { error: "No se puede crear subcategoría en una categoría inactiva" },
          { status: 400 }
        )
      }
    }

    // Generar slug único
    const baseSlug = createSlug(validatedData.name)
    let slug = baseSlug
    let counter = 1
    
    while (true) {
      const existing = await prisma.category.findUnique({
        where: { slug },
        select: { id: true },
      })
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Crear categoría
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug,
        imageUrl: validatedData.imageUrl || null,
        parentId: validatedData.parentId || null,
        isActive: validatedData.isActive,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 }
    )
  }
}

