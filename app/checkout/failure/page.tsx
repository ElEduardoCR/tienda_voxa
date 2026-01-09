"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

function FailureContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const paymentId = searchParams.get("payment_id")

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">Pago Rechazado</h1>
                <p className="text-muted-foreground">
                  No pudimos procesar tu pago. Por favor, intenta nuevamente.
                </p>
              </div>

              {paymentId && (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">ID de Pago</p>
                  <p className="text-lg font-mono">{paymentId}</p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  Posibles razones:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Fondos insuficientes</li>
                  <li>Datos de tarjeta incorrectos</li>
                  <li>Tarjeta vencida o bloqueada</li>
                  <li>Límite de transacción excedido</li>
                  <li>Problemas con el banco emisor</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center pt-6">
                <Link href="/carrito">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Carrito
                  </Button>
                </Link>
                <Link href="/">
                  <Button style={{ backgroundColor: '#014495', color: 'white' }}>
                    <Home className="mr-2 h-4 w-4" />
                    Volver al Inicio
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

export default function FailurePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Cargando...</p>
      </div>
    }>
      <FailureContent />
    </Suspense>
  )
}

