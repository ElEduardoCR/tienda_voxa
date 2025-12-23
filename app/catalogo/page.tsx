"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string | null
  priceCents: number
  images: string[]
  isSoldOut: boolean
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/productos")
        if (!response.ok) {
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

    fetchProducts()
  }, [])

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
      <h1 className="text-4xl font-bold mb-8">Catálogo de Productos</h1>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No hay productos disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const price = product.priceCents / 100 // Convertir centavos a pesos
            const mainImage = product.images.length > 0 ? product.images[0] : null

            return (
              <Card key={product.id} className="flex flex-col relative">
                {product.isSoldOut && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      Agotado
                    </span>
                  </div>
                )}
                <div className="relative w-full h-48 bg-muted">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                  <CardDescription>SKU: {product.sku}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-2xl font-bold mb-2">
                      ${price.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <Link href={`/producto/${product.slug}`} className="mt-4">
                    <Button className="w-full" disabled={product.isSoldOut}>
                      {product.isSoldOut ? "Agotado" : "Ver Detalles"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
