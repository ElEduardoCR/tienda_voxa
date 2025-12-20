import { getServerSession } from "@/lib/auth-helper"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function CuentaPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/auth/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mi Cuenta</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Datos de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="text-lg font-semibold">{user.name || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="text-lg font-semibold">
                {user.role === "ADMIN" ? "Administrador" : "Usuario"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de registro</p>
              <p className="text-lg font-semibold">
                {new Date(user.createdAt).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>Historial de tus compras</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              La integración con Odoo estará disponible próximamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

