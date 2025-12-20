"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/add-to-cart-button"

interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  image: string | null
  stock: number
}

export default function ProductoPage() {
  const params = useParams()
  const sku = params.sku as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/productos/${sku}`)
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
            return
          }
          throw new Error("Error al cargar producto")
        }
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (sku) {
      fetchProduct()
    }
  }, [sku])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando producto...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-destructive">
          {error || "Producto no encontrado"}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{product.name}</CardTitle>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold">
                ${Number(product.price).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Disponibilidad</p>
              <p className="font-semibold">
                {product.stock > 0
                  ? `${product.stock} unidades en stock`
                  : "Agotado"}
              </p>
            </div>

            <AddToCartButton
              product={{
                id: product.id,
                sku: product.sku,
                name: product.name,
                price: Number(product.price),
                image: product.image || "",
              }}
              disabled={product.stock === 0}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
