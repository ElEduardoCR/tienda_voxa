import { getServerSession } from "@/lib/auth-helper"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Panel de Administración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido, {session.user.name || "Administrador"}</CardTitle>
          <CardDescription>
            Panel de administración de Tienda Voxa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La integración con Odoo para gestión de inventario, pedidos y productos
            estará disponible próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

