"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, Package } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const paymentIdParam = searchParams.get("payment_id")
    const statusParam = searchParams.get("status")
    const preferenceIdParam = searchParams.get("preference_id")

    if (paymentIdParam) {
      setPaymentId(paymentIdParam)
      // Buscar la orden asociada con este pago
      fetchOrderByPaymentId(paymentIdParam)
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const fetchOrderByPaymentId = async (mpPaymentId: string) => {
    try {
      const response = await fetch(`/api/checkout/get-order?paymentId=${mpPaymentId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.orderNumber) {
          setOrderNumber(data.orderNumber)
        }
      }
    } catch (err) {
      console.error("Error fetching order:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Limpiar carrito al completar el pago
    localStorage.removeItem("cart")
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">¡Pago Aprobado!</h1>
                <p className="text-muted-foreground">
                  Tu pago ha sido procesado exitosamente
                </p>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando información del pedido...</p>
              ) : orderNumber ? (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Número de Orden</p>
                  <p className="text-2xl font-bold">{orderNumber}</p>
                </div>
              ) : paymentId ? (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">ID de Pago</p>
                  <p className="text-lg font-mono">{paymentId}</p>
                </div>
              ) : null}

              <div className="space-y-4 pt-6">
                <p className="text-sm text-muted-foreground">
                  Recibirás un correo electrónico con los detalles de tu pedido.
                  También puedes ver el estado de tu pedido en la sección &quot;Mi Cuenta&quot;.
                </p>

                <div className="flex gap-4 justify-center">
                  <Link href="/">
                    <Button variant="outline">
                      <Home className="mr-2 h-4 w-4" />
                      Volver al Inicio
                    </Button>
                  </Link>
                  <Link href="/cuenta">
                    <Button style={{ backgroundColor: '#014495', color: 'white' }}>
                      <Package className="mr-2 h-4 w-4" />
                      Ver Mis Pedidos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Cargando...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

