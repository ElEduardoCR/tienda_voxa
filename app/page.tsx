import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Bienvenido a Tienda Voxa</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Tu tienda en línea con los mejores productos
        </p>
        <Link href="/catalogo">
          <Button size="lg">Ver Catálogo</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Catálogo Completo</CardTitle>
            <CardDescription>
              Explora nuestra amplia selección de productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/catalogo">
              <Button variant="outline" className="w-full">
                Ver Productos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registro Rápido</CardTitle>
            <CardDescription>
              Crea tu cuenta en segundos y comienza a comprar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/registro">
              <Button variant="outline" className="w-full">
                Registrarse
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mi Cuenta</CardTitle>
            <CardDescription>
              Gestiona tu perfil y revisa tus pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cuenta">
              <Button variant="outline" className="w-full">
                Acceder
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

