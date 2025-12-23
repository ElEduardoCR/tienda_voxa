import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, FolderTree, ShoppingBag, BarChart3 } from "lucide-react"

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Bienvenido, {session.user.name || "Administrador"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#014495', color: 'white' }}>
                <Package className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Inventario</CardTitle>
                <CardDescription>Gestión de existencias</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/inventario">
              <Button 
                className="w-full hover:opacity-90" 
                style={{ backgroundColor: '#014495', color: 'white' }}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Inventario
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#014495', color: 'white' }}>
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Productos</CardTitle>
                <CardDescription>Gestión de productos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/productos">
              <Button 
                className="w-full hover:opacity-90" 
                style={{ backgroundColor: '#014495', color: 'white' }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Gestionar Productos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#014495', color: 'white' }}>
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Categorías</CardTitle>
                <CardDescription>Gestión de categorías</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/categorias">
              <Button 
                className="w-full hover:opacity-90" 
                style={{ backgroundColor: '#014495', color: 'white' }}
              >
                <FolderTree className="mr-2 h-4 w-4" />
                Gestionar Categorías
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
