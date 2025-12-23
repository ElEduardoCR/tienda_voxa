import { NextResponse } from "next/server"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/admin/categorias/select
 * 
 * Retorna solo categorías activas estructuradas para selects jerárquicos:
 * - Principales (parentId = null)
 * - Subcategorías agrupadas por padre
 */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden acceder")
    }

    const { prisma } = await import("@/lib/prisma")

    // Obtener solo categorías activas
    const allCategories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        children: {
          where: {
            isActive: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    })

    // Separar principales y subcategorías
    const principales = allCategories.filter((cat) => !cat.parentId)
    const subcategorias = allCategories.filter((cat) => cat.parentId)

    // Estructurar para selects
    const result = {
      principales: principales.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
      })),
      subcategorias: subcategorias.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        imageUrl: cat.imageUrl,
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching categories for select:", error)
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    )
  }
}

