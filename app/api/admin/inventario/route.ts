import { NextResponse } from "next/server"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/admin/inventario
 * 
 * Retorna lista de productos con filtros opcionales:
 * - search: buscar por nombre o SKU
 * - categoryId: filtrar por categoría
 * - isActive: filtrar por estado activo/inactivo
 * - lowStock: solo productos con stock bajo (stock <= 10)
 */
export async function GET(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden acceder")
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId") || ""
    const isActiveParam = searchParams.get("isActive")
    const lowStock = searchParams.get("lowStock") === "true"

    const { prisma } = await import("@/lib/prisma")

    // Construir filtros
    const where: any = {}

    // Búsqueda por nombre o SKU
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filtro por categoría
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Filtro por estado activo
    if (isActiveParam !== null && isActiveParam !== "") {
      where.isActive = isActiveParam === "true"
    }

    // Filtro de stock bajo
    if (lowStock) {
      where.stock = { lte: 10 }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    // Calcular estadísticas
    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({ where: { isActive: true } })
    const lowStockCount = await prisma.product.count({ where: { stock: { lte: 10 } } })
    const outOfStockCount = await prisma.product.count({ where: { stock: 0 } })

    return NextResponse.json({
      products,
      stats: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { error: "Error al obtener inventario" },
      { status: 500 }
    )
  }
}

