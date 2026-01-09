"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Home, Package } from "lucide-react"
import Link from "next/link"

function PendingContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("payment_id")
  const preferenceId = searchParams.get("preference_id")

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-12 w-12 text-yellow-600 animate-pulse" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">Pago Pendiente</h1>
                <p className="text-muted-foreground">
                  Estamos procesando tu pago. Recibirás una notificación cuando se complete.
                </p>
              </div>

              {paymentId && (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">ID de Pago</p>
                  <p className="text-lg font-mono">{paymentId}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-800">
                  <strong>¿Qué significa esto?</strong>
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Algunos métodos de pago pueden tardar unos minutos en procesarse. 
                  Te enviaremos un correo electrónico cuando el pago sea confirmado.
                  También puedes verificar el estado de tu pedido en &quot;Mi Cuenta&quot;.
                </p>
              </div>

              <div className="flex gap-4 justify-center pt-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Cargando...</p>
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}

