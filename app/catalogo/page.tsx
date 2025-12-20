import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Catálogo de Productos</h1>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No hay productos disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <div className="relative w-full h-48 bg-muted">
                {product.image ? (
                  <Image
                    src={product.image}
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
                    ${Number(product.price).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {product.description}
                    </p>
                  )}
                  <p className="text-sm">
                    Stock: <span className="font-semibold">{product.stock}</span>
                  </p>
                </div>
                <Link href={`/producto/${product.sku}`} className="mt-4">
                  <Button className="w-full">Ver Detalles</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

