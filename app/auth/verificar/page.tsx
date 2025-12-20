"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VerificarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleResend = async () => {
    if (!email) return
    
    setResending(true)
    setError("")
    setMessage("")
    
    try {
      const response = await fetch("/api/auth/reenviar-verificacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      
      if (response.ok) {
        setMessage("Se ha enviado un nuevo enlace de verificación a tu correo.")
      } else {
        setError(data.error || "Error al reenviar verificación")
      }
    } catch (error) {
      setError("Error al reenviar verificación. Intenta más tarde.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verifica tu correo</CardTitle>
          <CardDescription>
            Hemos enviado un enlace de verificación a tu correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> {email}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación que te enviamos.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Importante:</strong> El enlace expirará en 24 horas.
            </p>
          </div>

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {email && (
            <Button
              onClick={handleResend}
              disabled={resending}
              variant="outline"
              className="w-full"
            >
              {resending ? "Enviando..." : "Reenviar enlace de verificación"}
            </Button>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              ¿Ya verificaste tu correo?
            </p>
            <Link href="/auth/login">
              <Button variant="link" className="p-0 h-auto">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

