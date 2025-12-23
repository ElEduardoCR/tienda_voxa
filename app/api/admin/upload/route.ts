import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAdmin, adminErrorResponse } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Tamaño máximo de archivo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB en bytes

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = [
  "image/heic",
  "image/png",
  "image/jpeg",
  "image/jpg",
]

/**
 * POST /api/admin/upload
 * 
 * Endpoint para subir imágenes de productos a Vercel Blob Storage.
 */
export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return adminErrorResponse("Solo administradores pueden subir imágenes")
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Archivo requerido" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Formato no permitido. Formatos aceptados: HEIC, PNG, JPEG, JPG`,
        },
        { status: 400 }
      )
    }

    // Validar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `El archivo es muy grande. Tamaño máximo: 5MB`,
        },
        { status: 400 }
      )
    }

    // Verificar que BLOB_READ_WRITE_TOKEN esté configurado
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN no está configurado")
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      )
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_") // Sanitizar nombre
    const blobName = `productos/${timestamp}-${fileName}`

    try {
      // Subir archivo a Vercel Blob Storage
      const blob = await put(blobName, file, {
        access: "public",
        contentType: file.type,
      })

      return NextResponse.json({
        url: blob.url,
        message: "Imagen subida correctamente",
      })
    } catch (blobError: any) {
      console.error("Error subiendo archivo a Vercel Blob:", blobError)
      return NextResponse.json(
        { error: "Error al subir imagen. Intenta nuevamente." },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
