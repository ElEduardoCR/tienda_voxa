import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/categorias
 * 
 * Retorna solo categorías principales activas que tengan productos activos
 * (directamente o en sus subcategorías)
 */
export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma")

    // Obtener todas las categorías principales activas con sus subcategorías
    const categoriasPrincipales = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    // Filtrar solo las que tienen productos activos (directamente o en subcategorías)
    const categoriasConProductos = await Promise.all(
      categoriasPrincipales.map(async (categoria) => {
        // Contar productos en la categoría principal
        const productosDirectos = await prisma.product.count({
          where: {
            categoryId: categoria.id,
            isActive: true,
          },
        })

        // Contar productos en subcategorías
        const subcategoriaIds = categoria.children.map((sub) => sub.id)
        const productosSubcategorias = subcategoriaIds.length > 0
          ? await prisma.product.count({
              where: {
                categoryId: { in: subcategoriaIds },
                isActive: true,
              },
            })
          : 0

        const totalProductos = productosDirectos + productosSubcategorias

        return {
          ...categoria,
          productCount: totalProductos,
        }
      })
    )

    // Filtrar solo las que tienen al menos un producto
    const categoriasActivas = categoriasConProductos.filter(
      (cat) => cat.productCount > 0
    )

    return NextResponse.json(categoriasActivas)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    )
  }
}


