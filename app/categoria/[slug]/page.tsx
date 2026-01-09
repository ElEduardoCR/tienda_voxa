"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  parentId: string | null
  parent?: Category | null
  children: Category[]
}

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

interface CategoryData {
  category: Category
  productos: Product[]
  tipo: "principal" | "subcategoria"
}

export default function CategoriaPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/categoria/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Categoría no encontrada")
            return
          }
          throw new Error("Error al cargar categoría")
        }
        const data = await response.json()
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCategory()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando categoría...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-destructive">{error || "Categoría no encontrada"}</p>
        <div className="text-center mt-4">
          <Link href="/catalogo">
            <Button variant="outline">Volver al catálogo</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { category, productos, tipo } = data

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/catalogo">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al catálogo
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
        {category.parent && (
          <p className="text-muted-foreground">
            Categoría: <Link href={`/categoria/${category.parent.slug}`} className="text-primary hover:underline">{category.parent.name}</Link>
          </p>
        )}
      </div>

      {/* Si es categoría principal, mostrar subcategorías */}
      {tipo === "principal" && category.children.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Subcategorías</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.children.map((sub) => (
              <Link key={sub.id} href={`/categoria/${sub.slug}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative w-full h-32 bg-muted">
                    {sub.imageUrl ? (
                      <Image
                        src={sub.imageUrl}
                        alt={sub.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{sub.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mostrar productos */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Productos</h2>
        {productos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay productos disponibles en esta categoría.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((product) => {
              const price = product.priceCents / 100
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
    </div>
  )
}


