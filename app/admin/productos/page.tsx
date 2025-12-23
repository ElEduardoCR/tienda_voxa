"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"

interface Product {
  id: string
  sku: string
  name: string
  slug: string
  priceCents: number
  images: string[]
  isActive: boolean
  isSoldOut: boolean
  createdAt: string
}

export default function AdminProductosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/productos")
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error("Error al cargar productos")
      }
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres desactivar este producto?")) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/productos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar producto")
      }

      // Actualizar lista
      await fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar producto")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Gestión de Productos</h1>
          <p className="text-muted-foreground">
            Administra los productos de la tienda
          </p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay productos registrados
            </p>
            <Link href="/admin/productos/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Producto
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const price = product.priceCents / 100
            const mainImage = product.images.length > 0 ? product.images[0] : null

            return (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {mainImage && (
                        <div className="relative w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          </div>
                          <div className="flex gap-2">
                            {!product.isActive && (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                            {product.isSoldOut && (
                              <Badge variant="destructive">Agotado</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xl font-bold mb-2">
                          ${price.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Slug: /producto/{product.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/producto/${product.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/productos/${product.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

