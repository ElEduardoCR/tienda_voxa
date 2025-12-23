"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X } from "lucide-react"

interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string | null
  priceCents: number
  images: string[]
  isActive: boolean
  isSoldOut: boolean
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
  const [images, setImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isSoldOut, setIsSoldOut] = useState(false)

  useEffect(() => {
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
      setImages(data.images || [])
      setIsActive(data.isActive)
      setIsSoldOut(data.isSoldOut)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      try {
        new URL(newImageUrl)
        setImages([...images, newImageUrl.trim()])
        setNewImageUrl("")
      } catch {
        setError("URL de imagen inválida")
      }
    }
  }

  const handleRemoveImage = (index: number) => {
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

      const priceCents = Math.round(priceValue * 100)

      const response = await fetch(`/api/admin/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          priceCents,
          images,
          isActive,
          isSoldOut,
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
              <Label>Imágenes (URLs)</Label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddImage()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddImage}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {images.length > 0 && (
                <div className="space-y-2 mt-2">
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
                      <div className="flex-1 text-sm truncate">{url}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
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

