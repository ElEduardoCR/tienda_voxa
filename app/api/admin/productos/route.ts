import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"
import { createSlug, generateUniqueSlug } from "@/lib/slug"
import { generateNextSKU } from "@/lib/sku"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Schema de validación para crear producto
const createProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  priceCents: z.number().int().min(0, "El precio debe ser mayor o igual a 0"),
  images: z.array(z.string().url("URL de imagen inválida")).default([]),
  isActive: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  categoryId: z.string().min(1, "La categoría es requerida"),
})

// GET: Listar todos los productos (admin)
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden acceder")
    }

    const { prisma } = await import("@/lib/prisma")
    
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
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

// POST: Crear nuevo producto
export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden crear productos")
    }

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    const { prisma } = await import("@/lib/prisma")

    // Generar SKU único
    const sku = await generateNextSKU(async () => {
      const maxProduct = await prisma.product.findFirst({
        orderBy: { sku: "desc" },
        select: { sku: true },
      })
      if (!maxProduct) return null
      const numericSKU = parseInt(maxProduct.sku, 10)
      // Solo retornar si es un número válido y >= 100000
      return isNaN(numericSKU) || numericSKU < 100000 ? null : numericSKU
    })

    // Verificar que SKU no exista (por si acaso)
    const existingSKU = await prisma.product.findUnique({
      where: { sku },
    })
    if (existingSKU) {
      return NextResponse.json(
        { error: "Error al generar SKU único" },
        { status: 500 }
      )
    }

    // Generar slug único
    const baseSlug = createSlug(validatedData.name)
    const slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
      const existing = await prisma.product.findUnique({
        where: { slug: testSlug },
      })
      return !!existing
    })

    // Verificar que la categoría existe y está activa
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    if (!category.isActive) {
      return NextResponse.json(
        { error: "No se puede asignar producto a una categoría inactiva" },
        { status: 400 }
      )
    }

    // Crear producto
    const product = await prisma.product.create({
      data: {
        sku,
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        priceCents: validatedData.priceCents,
        images: validatedData.images,
        isActive: validatedData.isActive,
        isSoldOut: validatedData.isSoldOut,
        categoryId: validatedData.categoryId,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    )
  }
}

