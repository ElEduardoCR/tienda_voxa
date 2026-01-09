"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  productName: string
  productSku: string
  quantity: number
  priceCents: number
  totalCents: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalCents: number
  shippingStatus: string
  trackingNumber: string | null
  shippingCarrier: string | null
  shippedAt: string | null
  createdAt: string
  paidAt: string | null
  items: OrderItem[]
}

function PedidosContent() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshingOrderId, setRefreshingOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/user/orders")
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }
        throw new Error("Error al cargar pedidos")
      }
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshOrder = async (orderId: string) => {
    setRefreshingOrderId(orderId)
    setError(null)

    try {
      const response = await fetch("/api/checkout/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al verificar el pago")
      }

      // Esperar un momento y recargar las órdenes
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar el pago")
    } finally {
      setRefreshingOrderId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Aprobado
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )
      case "rejected":
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            {status === "rejected" ? "Rechazado" : "Cancelado"}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getShippingStatusBadge = (status: string) => {
    switch (status) {
      case "shipped":
        return (
          <Badge className="bg-blue-500 text-white">
            <Truck className="mr-1 h-3 w-3" />
            Enviado
          </Badge>
        )
      case "delivered":
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Entregado
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente de envío
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando pedidos...</p>
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
      <div className="mb-6">
        <Link href="/cuenta">
          <Button variant="ghost" size="sm">
            ← Volver a Mi Cuenta
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">Historial de Compras</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No tienes pedidos aún
            </p>
            <Link href="/catalogo">
              <Button style={{ backgroundColor: '#014495', color: 'white' }}>
                Ver Catálogo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Orden {order.orderNumber}</CardTitle>
                    <CardDescription>
                      {new Date(order.createdAt).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      {getStatusBadge(order.paymentStatus)}
                      {getShippingStatusBadge(order.shippingStatus)}
                    </div>
                    {order.paymentStatus === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshOrder(order.id)}
                        disabled={refreshingOrderId === order.id}
                        style={{ borderColor: '#014495', color: '#014495' }}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshingOrderId === order.id ? 'animate-spin' : ''}`} />
                        {refreshingOrderId === order.id ? "Verificando..." : "Verificar Pago"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Productos */}
                <div>
                  <h3 className="font-semibold mb-2">Productos:</h3>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm flex justify-between">
                        <span>
                          {item.productName} (SKU: {item.productSku}) x{item.quantity}
                        </span>
                        <span className="font-semibold">
                          ${(item.totalCents / 100).toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      ${(order.totalCents / 100).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Información de envío */}
                {order.shippingStatus === "shipped" && order.trackingNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-2">Información de Envío</h4>
                        <div className="space-y-1 text-sm">
                          {order.shippingCarrier && (
                            <p>
                              <span className="font-semibold">Operadora:</span> {order.shippingCarrier}
                            </p>
                          )}
                          <p>
                            <span className="font-semibold">Clave de Rastreo:</span>{' '}
                            <span className="font-mono bg-white px-2 py-1 rounded">{order.trackingNumber}</span>
                          </p>
                          {order.shippedAt && (
                            <p className="text-muted-foreground">
                              Enviado el {new Date(order.shippedAt).toLocaleDateString("es-MX", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {order.shippingStatus === "pending" && order.paymentStatus === "approved" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Tu pedido está siendo preparado para envío. Te notificaremos cuando sea enviado.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PedidosPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando...</p>
      </div>
    }>
      <PedidosContent />
    </Suspense>
  )
}

