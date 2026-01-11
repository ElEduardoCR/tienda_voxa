import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Términos y Condiciones | Tienda Voxa",
  description: "Términos y condiciones de uso de VOXA Herramientas de Mexico",
}

export default function TerminosCondicionesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Última actualización: Enero 2026</CardTitle>
            <CardDescription>
              Por favor, lee cuidadosamente estos términos y condiciones antes de utilizar nuestros servicios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
              <p className="text-muted-foreground mb-4">
                Al acceder y utilizar este sitio web, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Uso del Sitio</h2>
              <p className="text-muted-foreground mb-4">
                Este sitio web es propiedad de VOXA Herramientas de Mexico. El contenido, diseño y funcionalidad de este sitio son exclusivamente para uso personal y no comercial, a menos que se otorgue permiso expreso por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Compras y Pagos</h2>
              <p className="text-muted-foreground mb-4">
                Todas las compras realizadas a través de este sitio están sujetas a disponibilidad. Los precios están en pesos mexicanos (MXN) y pueden cambiar sin previo aviso. Los pagos se procesan de forma segura a través de Mercado Pago.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Política de Devoluciones</h2>
              <p className="text-muted-foreground mb-4">
                Los productos pueden ser devueltos dentro de los 30 días posteriores a la compra, siempre que estén en su estado original y con su empaque. Para más información sobre devoluciones, consulta nuestra política de devoluciones o contacta a nuestro equipo de atención al cliente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Propiedad Intelectual</h2>
              <p className="text-muted-foreground mb-4">
                Todo el contenido de este sitio web, incluyendo textos, gráficos, logotipos, iconos, imágenes y software, es propiedad de VOXA Herramientas de Mexico y está protegido por las leyes de propiedad intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground mb-4">
                VOXA Herramientas de Mexico no será responsable por daños indirectos, incidentales o consecuentes que surjan del uso o la imposibilidad de uso de este sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Modificaciones</h2>
              <p className="text-muted-foreground mb-4">
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en este sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
              <p className="text-muted-foreground mb-4">
                Si tienes preguntas sobre estos términos y condiciones, por favor contáctanos a través de nuestra página de{" "}
                <Link href="/contacto" className="text-primary hover:underline">
                  contacto
                </Link>
                .
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="flex justify-start">
          <Link href="/">
            <Button variant="outline">Volver al Inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

