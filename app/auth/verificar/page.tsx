"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function VerificarForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const token = searchParams.get("token")
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle")

  // Si hay un token en los query params, verificar automáticamente
  useEffect(() => {
    if (token && verificationStatus === "idle" && !verifying) {
      handleVerifyToken()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleVerifyToken = async () => {
    if (!token) return

    setVerifying(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch(`/api/auth/verificar?token=${encodeURIComponent(token)}`)
      const data = await response.json()

      if (response.ok) {
        setVerificationStatus("success")
        setMessage("¡Email verificado exitosamente! Ya puedes iniciar sesión.")
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/auth/login?verified=true")
        }, 3000)
      } else {
        setVerificationStatus("error")
        setError(data.error || "Error al verificar el email")
      }
    } catch (error) {
      setVerificationStatus("error")
      setError("Error al verificar el email. Intenta nuevamente.")
    } finally {
      setVerifying(false)
    }
  }

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

  // Si hay token, mostrar estado de verificación
  if (token) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              {verifying && "Verificando..."}
              {verificationStatus === "success" && "¡Verificado!"}
              {verificationStatus === "error" && "Error de verificación"}
              {!verifying && verificationStatus === "idle" && "Verificando..."}
            </CardTitle>
            <CardDescription>
              {verifying && "Por favor espera mientras verificamos tu correo..."}
              {verificationStatus === "success" && "Tu correo ha sido verificado correctamente"}
              {verificationStatus === "error" && "No se pudo verificar tu correo"}
              {!verifying && verificationStatus === "idle" && "Por favor espera..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verifying && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {verificationStatus === "success" && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">{message}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Serás redirigido al login en unos segundos...
                </p>
                <Link href="/auth/login">
                  <Button className="w-full">Ir al login</Button>
                </Link>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="space-y-2">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      Ir al login
                    </Button>
                  </Link>
                  {email && (
                    <Button
                      onClick={handleResend}
                      disabled={resending}
                      variant="link"
                      className="w-full"
                    >
                      {resending ? "Enviando..." : "Solicitar nuevo enlace"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
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

export default function VerificarPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Cargando...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Por favor espera...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerificarForm />
    </Suspense>
  )
}

