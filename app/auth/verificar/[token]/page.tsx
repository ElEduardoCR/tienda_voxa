"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VerificarTokenPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token no proporcionado")
      return
    }

    async function verifyEmail() {
      try {
        const response = await fetch(`/api/auth/verificar?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("¡Email verificado exitosamente! Ya puedes iniciar sesión.")
          // Redirigir después de 3 segundos
          setTimeout(() => {
            router.push("/auth/login?verified=true")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Error al verificar el email")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Error al verificar el email. Intenta nuevamente.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verificando..."}
            {status === "success" && "¡Verificado!"}
            {status === "error" && "Error de verificación"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Por favor espera mientras verificamos tu correo..."}
            {status === "success" && "Tu correo ha sido verificado correctamente"}
            {status === "error" && "No se pudo verificar tu correo"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {status === "success" && (
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

          {status === "error" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{message}</p>
              </div>
              <div className="space-y-2">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Ir al login
                  </Button>
                </Link>
                <Link href="/auth/verificar">
                  <Button variant="link" className="w-full">
                    Solicitar nuevo enlace
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

