import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET: Obtener producto por slug (público, solo activos)
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { prisma } = await import("@/lib/prisma")
    
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        priceCents: true,
        images: true,
        isSoldOut: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Si no existe o no está activo, retornar 404
    if (!product || !product.isActive) {
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


