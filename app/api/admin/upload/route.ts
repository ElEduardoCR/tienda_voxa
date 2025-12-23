import { NextResponse } from "next/server"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/admin/upload
 * 
 * Endpoint para subir imágenes de productos.
 * Por ahora acepta URLs directamente (para integración futura con storage).
 * 
 * En el futuro se puede integrar con:
 * - Cloudinary
 * - AWS S3
 * - Vercel Blob Storage
 * - Otro servicio de storage
 */
export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden subir imágenes")
    }

    const formData = await request.formData()
    const imageUrl = formData.get("url") as string

    // Por ahora, aceptamos URLs directamente
    // TODO: Implementar upload real a storage externo
    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL de imagen requerida" },
        { status: 400 }
      )
    }

    // Validar que sea una URL válida
    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json(
        { error: "URL inválida" },
        { status: 400 }
      )
    }

    // Retornar la URL (en el futuro retornar URL del storage)
    return NextResponse.json({
      url: imageUrl,
      message: "Imagen subida correctamente (usando URL directa por ahora)",
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    )
  }
}

