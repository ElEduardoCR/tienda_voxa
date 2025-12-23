import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/categoria/[slug]
 * 
 * Retorna categoría por slug con sus productos o subcategorías según el tipo
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { prisma } = await import("@/lib/prisma")

    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        children: {
          where: {
            isActive: true,
          },
          orderBy: { name: "asc" },
        },
        parent: true,
      },
    })

    if (!category || !category.isActive) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    // Si es categoría principal
    if (!category.parentId) {
      // Obtener IDs de todas las subcategorías
      const subcategoriaIds = category.children.map((sub) => sub.id)

      // Obtener productos de la categoría principal y sus subcategorías
      const productos = await prisma.product.findMany({
        where: {
          OR: [
            { categoryId: category.id },
            ...(subcategoriaIds.length > 0
              ? [{ categoryId: { in: subcategoriaIds } }]
              : []),
          ],
          isActive: true,
        },
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          description: true,
          priceCents: true,
          images: true,
          isSoldOut: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return NextResponse.json({
        category,
        productos,
        tipo: "principal" as const,
      })
    } else {
      // Si es subcategoría, solo productos de esa subcategoría
      const productos = await prisma.product.findMany({
        where: {
          categoryId: category.id,
          isActive: true,
        },
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          description: true,
          priceCents: true,
          images: true,
          isSoldOut: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return NextResponse.json({
        category,
        productos,
        tipo: "subcategoria" as const,
      })
    }
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Error al obtener categoría" },
      { status: 500 }
    )
  }
}

