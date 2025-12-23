"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, Edit, Trash2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  parentId: string | null
  isActive: boolean
  parent?: Category | null
  children: Category[]
  _count: {
    products: number
  }
}

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null)
  
  const [category, setCategory] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchCategory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categorias/${id}`)
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error("Error al cargar categoría")
      }
      const data = await response.json()
      setCategory(data)
      
      setName(data.name)
      setImageUrl(data.imageUrl)
      setIsActive(data.isActive)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploadingImage(true)

    const allowedTypes = ["image/heic", "image/png", "image/jpeg", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      setError("Formato no válido. Formatos aceptados: HEIC, PNG, JPEG, JPG")
      setUploadingImage(false)
      return
    }

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

  const handleDeleteSubcategory = async (subId: string) => {
    if (!confirm("¿Estás seguro de que quieres desactivar esta subcategoría?")) {
      return
    }

    setDeletingSubId(subId)
    try {
      const response = await fetch(`/api/admin/categorias/${subId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar subcategoría")
      }

      await fetchCategory()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar subcategoría")
    } finally {
      setDeletingSubId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          imageUrl,
          isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al actualizar categoría")
        return
      }

      router.push("/admin/categorias")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar categoría")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando categoría...</p>
      </div>
    )
  }

  if (error && !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-destructive">{error}</p>
        <div className="text-center mt-4">
          <Link href="/admin/categorias">
            <Button variant="outline">Volver a Categorías</Button>
          </Link>
        </div>
      </div>
    )
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario de edición */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Categoría</CardTitle>
            <CardDescription>
              Slug: /categoria/{category?.slug}
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
                />
                <p className="text-xs text-muted-foreground">
                  Si cambias el nombre, el slug se regenerará automáticamente
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
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || uploadingImage}>
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de subcategorías */}
        {category && !category.parentId && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Subcategorías</CardTitle>
                  <CardDescription>
                    {category.children.length} subcategoría{category.children.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Link href={`/admin/categorias/nuevo?parentId=${id}`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {category.children.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay subcategorías
                </p>
              ) : (
                <div className="space-y-2">
                  {category.children.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {sub.imageUrl && (
                          <div className="relative w-12 h-12 bg-muted rounded overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sub.imageUrl}
                              alt={sub.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.isActive ? "Activa" : "Inactiva"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/categorias/${sub.id}/editar`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSubcategory(sub.id)}
                          disabled={deletingSubId === sub.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

