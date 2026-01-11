import Link from "next/link"
import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: '#014495' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Logo size="lg" showTagline className="mb-6" />
        </div>
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-4">SUPPORT & POLICIES</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/contacto" className="text-white hover:underline">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/terminos-y-condiciones" className="text-white hover:underline">
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link href="/aviso-privacidad-cliente" className="text-white hover:underline">
                Aviso de Privacidad del Cliente
              </Link>
            </li>
            <li>
              <Link href="/aviso-privacidad-sitio" className="text-white hover:underline">
                Aviso de Privacidad del Sitio Web
              </Link>
            </li>
            <li>
              <Link href="/aviso-cookies" className="text-white hover:underline">
                Aviso de Cookies
              </Link>
            </li>
          </ul>
        </div>
        <div className="border-t border-white/20 pt-6">
          <p className="text-white text-sm">
            © 2026 VOXA Herramientas de Mexico. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

