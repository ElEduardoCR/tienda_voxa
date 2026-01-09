"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle2, Clock, Search, XCircle, ExternalLink, RefreshCw } from "lucide-react"
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
  mercadoPagoId: string | null
  mercadoPagoPaymentId: string | null
  mercadoPagoStatus: string | null
  createdAt: string
  recipientName: string
  street: string
  city: string
  state: string
  postalCode: string
  cancelledAt: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
  items: OrderItem[]
}

export default function VentasPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("pending")
  
  // Estados para editar tracking
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingCarrier, setShippingCarrier] = useState("")
  const [saving, setSaving] = useState(false)
  const [refreshingOrderId, setRefreshingOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append("paymentStatus", "approved") // Filtrar por pago aprobado en lugar de status
      if (filterStatus !== "all") {
        params.append("shippingStatus", filterStatus)
      }

      const response = await fetch(`/api/admin/ventas?${params.toString()}`)
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error("Error al cargar ventas")
      }
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleEditTracking = (order: Order) => {
    setEditingOrder(order)
    setTrackingNumber(order.trackingNumber || "")
    setShippingCarrier(order.shippingCarrier || "")
  }

  const handleCancelEdit = () => {
    setEditingOrder(null)
    setTrackingNumber("")
    setShippingCarrier("")
  }

  const handleSaveTracking = async () => {
    if (!editingOrder) return

    if (!trackingNumber.trim() || !shippingCarrier.trim()) {
      setError("La clave de rastreo y la operadora son requeridas")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/ventas/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          shippingCarrier: shippingCarrier.trim(),
          shippingStatus: "shipped",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al guardar información de envío")
      }

      await fetchOrders()
      handleCancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta orden? Deberás procesar el reembolso manualmente en Mercado Pago.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/ventas/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al cancelar la orden")
      }

      await fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
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

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(search) ||
      order.user.email.toLowerCase().includes(search) ||
      (order.user.name && order.user.name.toLowerCase().includes(search)) ||
      order.recipientName.toLowerCase().includes(search)
    )
  })

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
            Pendiente
          </Badge>
        )
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando ventas...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            ← Volver al Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Ventas</h1>
        <p className="text-muted-foreground">
          Gestiona las ventas y envíos de pedidos
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Número de orden, email, nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterStatus">Estado de Envío</Label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendientes de envío</option>
                <option value="shipped">Enviados</option>
                <option value="delivered">Entregados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de órdenes */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== "all"
                ? "No se encontraron ventas con los filtros seleccionados"
                : "No hay ventas aprobadas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
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
                    {(order.mercadoPagoId || order.mercadoPagoPaymentId) && (
                      <div className="mt-2 space-y-1">
                        {order.mercadoPagoPaymentId && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              ID de Pago MP: <span className="font-mono bg-muted px-1 py-0.5 rounded">{order.mercadoPagoPaymentId}</span>
                            </p>
                            <a
                              href={`https://www.mercadopago.com.mx/activities/payments/${order.mercadoPagoPaymentId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                            >
                              Ver pago en Mercado Pago <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {order.mercadoPagoId && !order.mercadoPagoPaymentId && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              ID de Preferencia MP: <span className="font-mono bg-muted px-1 py-0.5 rounded">{order.mercadoPagoId}</span>
                            </p>
                          </div>
                        )}
                        {order.mercadoPagoStatus && (
                          <p className="text-xs text-muted-foreground">
                            Estado MP: <span className="font-semibold">{order.mercadoPagoStatus}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getShippingStatusBadge(order.shippingStatus)}
                    {order.status === "cancelled" && (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancelada
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información del cliente */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Cliente</h3>
                    <p className="text-sm">{order.user.name || order.user.email}</p>
                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Dirección de Entrega</h3>
                    <p className="text-sm">
                      {order.recipientName}
                      <br />
                      {order.street}
                      <br />
                      {order.city}, {order.state} {order.postalCode}
                    </p>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h3 className="font-semibold mb-2">Productos</h3>
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

                {/* Acciones de administración */}
                <div className="border-t pt-4 space-y-3">
                  {/* Información de envío */}
                  {editingOrder?.id === order.id ? (
                    <div className="bg-muted rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold">Agregar Información de Envío</h3>
                      <div className="space-y-2">
                        <Label htmlFor="carrier">Operadora de Envío *</Label>
                        <Input
                          id="carrier"
                          value={shippingCarrier}
                          onChange={(e) => setShippingCarrier(e.target.value)}
                          placeholder="Ej: DHL, FedEx, Estafeta, Correos de México"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tracking">Clave de Rastreo *</Label>
                        <Input
                          id="tracking"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Ej: 1234567890"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveTracking}
                          disabled={saving}
                          style={{ backgroundColor: '#014495', color: 'white' }}
                        >
                          {saving ? "Guardando..." : "Marcar como Enviado"}
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {order.shippingStatus === "pending" && order.status !== "cancelled" && (
                        <Button
                          onClick={() => handleEditTracking(order)}
                          style={{ backgroundColor: '#014495', color: 'white' }}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Agregar Información de Envío
                        </Button>
                      )}
                      
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
                      
                      {order.status !== "cancelled" && order.status !== "refunded" && (
                        <Button
                          variant="outline"
                          onClick={() => handleCancelOrder(order.id)}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar Orden
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Información de envío completa */}
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
                            {order.trackingNumber && (
                              <p>
                                <span className="font-semibold">Clave de Rastreo:</span>{' '}
                                <span className="font-mono bg-white px-2 py-1 rounded">{order.trackingNumber}</span>
                              </p>
                            )}
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

                  {/* Información de cancelación */}
                  {order.status === "cancelled" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 mb-2">Orden Cancelada</h4>
                          <p className="text-sm text-red-800 mb-2">
                            Esta orden ha sido cancelada. Si el pago ya fue aprobado, debes procesar el reembolso manualmente en Mercado Pago.
                          </p>
                          {order.mercadoPagoPaymentId && (
                            <p className="text-sm text-red-800 mb-2">
                              <strong>Referencia para reembolso:</strong> Usa el ID de Pago MP mostrado arriba para buscar el pago en Mercado Pago y procesar el reembolso.
                            </p>
                          )}
                          {order.cancelledAt && (
                            <p className="text-xs text-red-700">
                              Cancelada el {new Date(order.cancelledAt).toLocaleDateString("es-MX", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

