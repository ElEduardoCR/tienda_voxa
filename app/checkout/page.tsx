"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

interface CartItem {
  id: string
  sku: string
  name: string
  price: number
  image: string
  quantity: number
}

interface DeliveryAddress {
  id: string
  name: string
  recipient: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string | null
  isDefault: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cart, setCart] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      // Cargar carrito desde localStorage
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setCart(cartData)
      } else {
        router.push("/carrito")
        return
      }

      // Cargar direcciones del usuario
      const addressesResponse = await fetch("/api/user/addresses")
      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json()
        setAddresses(addressesData)
        
        // Seleccionar dirección predeterminada
        const defaultAddress = addressesData.find((addr: DeliveryAddress) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
        } else if (addressesData.length > 0) {
          setSelectedAddress(addressesData[0])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      setError("Debes seleccionar una dirección de entrega")
      return
    }

    if (cart.length === 0) {
      setError("Tu carrito está vacío")
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          deliveryAddress: selectedAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la preferencia de pago")
      }

      // Redirigir a Mercado Pago
      if (data.initPoint) {
        window.location.href = data.initPoint
      } else {
        throw new Error("No se recibió la URL de pago de Mercado Pago")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago")
      setProcessing(false)
    }
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Tu carrito está vacío
            </p>
            <Link href="/carrito">
              <Button>Volver al Carrito</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (addresses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Necesitas agregar una dirección de entrega antes de continuar
            </p>
            <Link href="/cuenta">
              <Button style={{ backgroundColor: '#014495', color: 'white' }}>
                Agregar Dirección
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/carrito">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Carrito
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Resumen de productos */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                  <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.sku} | Cantidad: {item.quantity}
                    </p>
                    <p className="text-lg font-bold mt-2">
                      ${(item.price * item.quantity).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dirección de entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Dirección de Entrega</CardTitle>
              <CardDescription>
                Selecciona la dirección donde recibirás tu pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddress?.id === address.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedAddress(address)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{address.name}</h3>
                      <p className="text-sm text-muted-foreground">{address.recipient}</p>
                      <p className="text-sm mt-1">
                        {address.street}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                        <br />
                        {address.country}
                      </p>
                      {address.phone && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Tel: {address.phone}
                        </p>
                      )}
                    </div>
                    {selectedAddress?.id === address.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Link href="/cuenta">
                <Button variant="outline" className="w-full">
                  Gestionar Direcciones
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Resumen y botón de pago */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  ${subtotal.toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>
                    ${subtotal.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleProceedToPayment}
                disabled={!selectedAddress || processing}
                style={{ backgroundColor: '#014495', color: 'white' }}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {processing ? "Procesando..." : "Pagar con Mercado Pago"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Serás redirigido a una página segura de Mercado Pago para completar el pago
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

