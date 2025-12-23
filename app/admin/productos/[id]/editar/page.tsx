"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X, Upload } from "lucide-react"

interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string | null
  priceCents: number
  images: string[]
  stock: number
  isActive: boolean
  isSoldOut: boolean
  categoryId: string
  category?: {
    id: string
    name: string
    parentId: string | null
  }
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  
  const [product, setProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("0")
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({})
  const [isActive, setIsActive] = useState(true)
  const [isSoldOut, setIsSoldOut] = useState(false)
  
  // Categorías
  const [categorias, setCategorias] = useState<{
    principales: Array<{ id: string; name: string }>
    subcategorias: Array<{ id: string; name: string; parentId: string }>
  }>({ principales: [], subcategorias: [] })
  const [categoriaPrincipalId, setCategoriaPrincipalId] = useState("")
  const [subcategoriaId, setSubcategoriaId] = useState("")
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  useEffect(() => {
    fetchCategorias()
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/admin/categorias/select")
      if (response.ok) {
        const data = await response.json()
        setCategorias(data)
      }
    } catch (err) {
      console.error("Error cargando categorías:", err)
    } finally {
      setLoadingCategorias(false)
    }
  }

  // Filtrar subcategorías según categoría principal seleccionada
  const subcategoriasFiltradas = categoriaPrincipalId
    ? categorias.subcategorias.filter((sub) => sub.parentId === categoriaPrincipalId)
    : []

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/productos/${id}`)
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error("Error al cargar producto")
      }
      const data = await response.json()
      setProduct(data)
      
      // Llenar formulario
      setName(data.name)
      setDescription(data.description || "")
      setPrice((data.priceCents / 100).toString())
      setStock((data.stock || 0).toString())
      setImages(data.images || [])
      setIsActive(data.isActive)
      setIsSoldOut(data.isSoldOut)
      
      // Determinar categoría principal y subcategoría
      if (data.category) {
        if (data.category.parentId) {
          // Es una subcategoría
          setCategoriaPrincipalId(data.category.parentId)
          setSubcategoriaId(data.categoryId)
        } else {
          // Es una categoría principal
          setCategoriaPrincipalId(data.categoryId)
          setSubcategoriaId("")
        }
      } else {
        // Cargar categoría desde la base de datos
        const categoryResponse = await fetch(`/api/admin/categorias/${data.categoryId}`)
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json()
          if (categoryData.parentId) {
            setCategoriaPrincipalId(categoryData.parentId)
            setSubcategoriaId(data.categoryId)
          } else {
            setCategoriaPrincipalId(data.categoryId)
            setSubcategoriaId("")
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError("")

    // Validar cada archivo antes de subir
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validar tipo
      const allowedTypes = ["image/heic", "image/png", "image/jpeg", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        setError(`El archivo "${file.name}" no es un formato válido. Formatos aceptados: HEIC, PNG, JPEG, JPG`)
        continue
      }

      // Validar tamaño (5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError(`El archivo "${file.name}" es muy grande. Tamaño máximo: 5MB`)
        continue
      }

      // Crear preview temporal
      const previewUrl = URL.createObjectURL(file)
      const tempIndex = images.length
      setImages([...images, previewUrl])
      setUploadingImages({ ...uploadingImages, [tempIndex]: true })

      try {
        // Subir archivo
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

        // Reemplazar preview temporal con URL real
        const newImages = [...images]
        newImages[tempIndex] = data.url
        setImages(newImages)
      } catch (err) {
        // Eliminar preview temporal en caso de error
        setImages(images.filter((_, idx) => idx !== tempIndex))
        setError(err instanceof Error ? err.message : "Error al subir imagen")
      } finally {
        setUploadingImages((prev) => {
          const updated = { ...prev }
          delete updated[tempIndex]
          return updated
        })
      }
    }

    // Limpiar input para permitir seleccionar el mismo archivo otra vez
    e.target.value = ""
  }

  const handleRemoveImage = (index: number) => {
    const urlToRemove = images[index]
    // Revocar URL de objeto si es una preview temporal
    if (urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove)
    }
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const priceValue = parseFloat(price)
      if (isNaN(priceValue) || priceValue < 0) {
        setError("El precio debe ser un número mayor o igual a 0")
        setSaving(false)
        return
      }

      // Validar categoría
      if (!categoriaPrincipalId) {
        setError("Debes seleccionar una categoría")
        setSaving(false)
        return
      }

      // Determinar categoryId: si hay subcategoría, usar esa, sino usar categoría principal
      const categoryId = subcategoriaId || categoriaPrincipalId

      const priceCents = Math.round(priceValue * 100)
      const stockValue = parseInt(stock) || 0

      const response = await fetch(`/api/admin/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          priceCents,
          stock: stockValue,
          images,
          isActive,
          isSoldOut,
          categoryId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al actualizar producto")
        return
      }

      router.push("/admin/productos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar producto")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando producto...</p>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-destructive">{error}</p>
        <div className="text-center mt-4">
          <Link href="/admin/productos">
            <Button variant="outline">Volver a Productos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/productos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Editar Producto</CardTitle>
          <CardDescription>
            SKU: {product?.sku} | Slug: /producto/{product?.slug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
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
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoriaPrincipal">Categoría Principal *</Label>
              <select
                id="categoriaPrincipal"
                value={categoriaPrincipalId}
                onChange={(e) => {
                  setCategoriaPrincipalId(e.target.value)
                  setSubcategoriaId("") // Resetear subcategoría al cambiar principal
                }}
                required
                disabled={loadingCategorias}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecciona una categoría...</option>
                {categorias.principales.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {categoriaPrincipalId && subcategoriasFiltradas.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategoria">Subcategoría (Opcional)</Label>
                <select
                  id="subcategoria"
                  value={subcategoriaId}
                  onChange={(e) => setSubcategoriaId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Ninguna (usar categoría principal)</option>
                  {subcategoriasFiltradas.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="price">Precio (MXN) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Existencias (Stock) *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Cantidad disponible en inventario
              </p>
            </div>

            <div className="space-y-2">
              <Label>Imágenes</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/heic,image/png,image/jpeg,image/jpg"
                  multiple
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
                      Haz clic para agregar imágenes
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      HEIC, PNG, JPEG, JPG (máximo 5MB por imagen)
                    </p>
                  </div>
                </label>
              </div>

              {images.length > 0 && (
                <div className="space-y-2 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23ddd' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EError%3C/text%3E%3C/svg%3E"
                        }}
                      />
                      <div className="flex-1 text-sm truncate">
                        {uploadingImages[index] ? (
                          <span className="text-muted-foreground">Subiendo...</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {url.startsWith("blob:") ? "Preparando..." : "Guardada"}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                        disabled={uploadingImages[index]}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Puedes agregar múltiples imágenes. La primera será la imagen principal.
              </p>
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
                  Producto activo (visible en tienda)
                </Label>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isSoldOut"
                  checked={isSoldOut}
                  onChange={(e) => setIsSoldOut(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isSoldOut" className="cursor-pointer">
                  Producto agotado
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
                onClick={() => router.push("/admin/productos")}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
