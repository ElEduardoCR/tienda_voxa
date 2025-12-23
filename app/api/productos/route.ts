import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma")
    
    // Solo productos activos para la tienda pública
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
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
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    )
  }
}

