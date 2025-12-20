"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar si viene de registro exitoso
    const params = new URLSearchParams(window.location.search)
    if (params.get("registered") === "true") {
      setSuccess("¡Registro exitoso! Ya puedes iniciar sesión.")
    }
  }, [])

  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [resending, setResending] = useState(false)

  const handleResendVerification = async () => {
    setResending(true)
    try {
      const response = await fetch("/api/auth/reenviar-verificacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess("Se ha enviado un nuevo enlace de verificación a tu correo.")
        setNeedsVerification(false)
      } else {
        setError(data.error || "Error al reenviar verificación")
      }
    } catch (error) {
      setError("Error al reenviar verificación. Intenta más tarde.")
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setNeedsVerification(false)
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Verificar si es error de email no verificado
        if (result.error === "EMAIL_NOT_VERIFIED" || result.error.includes("EMAIL_NOT_VERIFIED")) {
          setNeedsVerification(true)
          setVerificationEmail(email)
          setError("Debes verificar tu correo electrónico antes de iniciar sesión.")
        } else {
          setError("Email o contraseña incorrectos")
        }
      } else {
        router.push("/cuenta")
        router.refresh()
      }
    } catch (error: any) {
      // NextAuth puede lanzar el error como string en algunos casos
      if (error?.message?.includes("EMAIL_NOT_VERIFIED") || error?.message === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true)
        setVerificationEmail(email)
        setError("Debes verificar tu correo electrónico antes de iniciar sesión.")
      } else {
        setError("Error al iniciar sesión. Intenta nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {success && (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>
            )}
            {error && (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{error}</p>
                {needsVerification && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800 mb-2">
                      ¿No recibiste el correo de verificación?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="w-full"
                    >
                      {resending ? "Enviando..." : "Reenviar verificación"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link href="/auth/registro" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/auth/olvido" className="text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Credenciales de prueba:</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Admin: admin@voxa.mx / admin123
            </p>
            <p className="text-xs text-muted-foreground">
              Usuario: usuario@voxa.mx / usuario123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

