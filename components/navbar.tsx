"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Logo } from "@/components/logo"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: '#014495' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-4">
            <Link href="/catalogo">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                Catálogo
              </Button>
            </Link>

            {session ? (
              <>
                <Link href="/carrito">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/cuenta">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    Mi Cuenta
                  </Button>
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#014495]">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="border-white text-white hover:bg-white hover:text-[#014495]"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/registro">
                  <Button className="bg-white text-[#014495] hover:bg-white/90">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}


