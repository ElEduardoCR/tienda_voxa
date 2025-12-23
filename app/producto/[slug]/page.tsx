"use client"

import { useEffect, useState } from "react"
import { useParams, notFound, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/add-to-cart-button"
import Link from "next/link"

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

export default function ProductoPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/productos/${slug}`)
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

    if (slug) {
      fetchProduct()
    }
  }, [slug])

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
        <div className="text-center mt-4">
          <Link href="/catalogo">
            <Button variant="outline">Volver al catálogo</Button>
          </Link>
        </div>
      </div>
    )
  }

  const price = product.priceCents / 100 // Convertir centavos a pesos
  const mainImage = product.images.length > 0 ? product.images[selectedImageIndex] : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/catalogo">
          <Button variant="ghost" size="sm">← Volver al catálogo</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage}
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
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-full h-20 bg-muted rounded overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{product.name}</CardTitle>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
            {product.isSoldOut && (
              <span className="inline-block bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded mt-2">
                Agotado
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold">
                ${price.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            <AddToCartButton
              product={{
                id: product.id,
                sku: product.sku,
                name: product.name,
                price: price,
                image: mainImage || "",
              }}
              disabled={product.isSoldOut}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

