import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/add-to-cart-button"

export const dynamic = 'force-dynamic'

export default async function ProductoPage({
  params,
}: {
  params: { sku: string }
}) {
  const product = await prisma.product.findUnique({
    where: { sku: params.sku },
  })

  if (!product) {
    notFound()
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

