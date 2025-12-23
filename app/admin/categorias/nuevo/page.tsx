"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X } from "lucide-react"

function NuevaCategoriaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const parentId = searchParams.get("parentId")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [parentName, setParentName] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (parentId) {
      // Obtener nombre de la categoría padre
      fetch(`/api/admin/categorias/${parentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.name) {
            setParentName(data.name)
          }
        })
        .catch(() => {})
    }
  }, [parentId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploadingImage(true)

    // Validar tipo
    const allowedTypes = ["image/heic", "image/png", "image/jpeg", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      setError("Formato no válido. Formatos aceptados: HEIC, PNG, JPEG, JPG")
      setUploadingImage(false)
      return
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError("El archivo es muy grande. Tamaño máximo: 5MB")
      setUploadingImage(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al subir imagen")
      }

      setImageUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen")
    } finally {
      setUploadingImage(false)
      e.target.value = ""
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          imageUrl,
          parentId: parentId || null,
          isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear categoría")
        return
      }

      if (parentId) {
        router.push(`/admin/categorias/${parentId}/editar`)
      } else {
        router.push("/admin/categorias")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear categoría")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/categorias">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Categorías
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            {parentId ? "Nueva Subcategoría" : "Nueva Categoría"}
          </CardTitle>
          <CardDescription>
            {parentId 
              ? `Crea una nueva subcategoría${parentName ? ` en "${parentName}"` : ""}`
              : "Crea una nueva categoría principal"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Categoría *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej: Electrónica"
              />
              <p className="text-xs text-muted-foreground">
                El slug se generará automáticamente desde el nombre
              </p>
            </div>

            <div className="space-y-2">
              <Label>Imagen (Opcional)</Label>
              {!imageUrl ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/heic,image/png,image/jpeg,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-primary">
                        Haz clic para subir imagen
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        HEIC, PNG, JPEG, JPG (máximo 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Categoría activa (visible en tienda)
                </Label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/categorias")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || uploadingImage}>
                {loading ? "Creando..." : "Crear Categoría"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NuevaCategoriaPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando...</p>
      </div>
    }>
      <NuevaCategoriaForm />
    </Suspense>
  )
}
