"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Package, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

interface Product {
  id: string
  sku: string
  name: string
  slug: string
  priceCents: number
  images: string[]
  stock: number
  isActive: boolean
  isSoldOut: boolean
  category: {
    id: string
    name: string
    slug: string
  }
}

interface InventoryStats {
  total: number
  active: number
  lowStock: number
  outOfStock: number
}

export default function InventarioPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isActive, setIsActive] = useState<string>("")
  const [lowStock, setLowStock] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchCategories()
    fetchInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, isActive, lowStock])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categorias/select")
      if (response.ok) {
        const data = await response.json()
        const allCategories = [...data.principales, ...data.subcategorias]
        setCategories(allCategories)
      }
    } catch (err) {
      console.error("Error cargando categorías:", err)
    }
  }

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (categoryId) params.append("categoryId", categoryId)
      if (isActive !== "") params.append("isActive", isActive)
      if (lowStock) params.append("lowStock", "true")

      const response = await fetch(`/api/admin/inventario?${params.toString()}`)
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error("Error al cargar inventario")
      }
      const data = await response.json()
      setProducts(data.products)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Sin existencias
        </Badge>
      )
    }
    if (stock <= 10) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 bg-orange-500">
          <AlertTriangle className="h-3 w-3" />
          Stock bajo ({stock})
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-green-500 text-white">
        <CheckCircle2 className="h-3 w-3" />
        En stock ({stock})
      </Badge>
    )
  }

  if (loading && !products.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando inventario...</p>
      </div>
    )
  }

  if (error && !products.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" style={{ backgroundColor: 'transparent' }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Inventario</h1>
        <p className="text-muted-foreground">
          Gestión de existencias de productos
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Productos</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Productos Activos</CardDescription>
              <CardTitle className="text-2xl">{stats.active}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Stock Bajo</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{stats.lowStock}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sin Existencias</CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.outOfStock}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre o SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Estado</Label>
              <select
                id="isActive"
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStock">Stock</Label>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="lowStock"
                  checked={lowStock}
                  onChange={(e) => setLowStock(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="lowStock" className="cursor-pointer">
                  Solo stock bajo (≤10)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron productos</p>
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
                          <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              SKU: {product.sku} | {product.category.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStockBadge(product.stock)}
                            {!product.isActive && (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Precio: </span>
                            <span className="font-semibold">
                              ${price.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Existencias: </span>
                            <span className="font-semibold">{product.stock}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/productos/${product.id}/editar`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          style={{ borderColor: '#014495', color: '#014495' }}
                        >
                          Editar
                        </Button>
                      </Link>
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


