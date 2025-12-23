import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  if (!session.user.role || session.user.role !== "ADMIN") {
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
          <div className="space-y-4">
            <Link href="/admin/productos">
              <Button variant="outline" className="w-full justify-start">
                Gestión de Productos
              </Button>
            </Link>
            <p className="text-muted-foreground mt-4 text-sm">
              Panel de administración de Tienda Voxa
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
