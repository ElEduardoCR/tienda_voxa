import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
      <p className="text-muted-foreground mb-8">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link href="/">
        <Button>Volver al Inicio</Button>
      </Link>
    </div>
  )
}

