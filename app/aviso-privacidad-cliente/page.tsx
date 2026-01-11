import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Aviso de Privacidad del Cliente | Tienda Voxa",
  description: "Aviso de privacidad para clientes de VOXA Herramientas de Mexico",
}

export default function AvisoPrivacidadClientePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Aviso de Privacidad del Cliente</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Última actualización: Enero 2026</CardTitle>
            <CardDescription>
              En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Responsable del Tratamiento</h2>
              <p className="text-muted-foreground mb-4">
                VOXA Herramientas de Mexico, con domicilio en México, es responsable del tratamiento de sus datos personales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Datos Personales que Recopilamos</h2>
              <p className="text-muted-foreground mb-4">
                Recopilamos los siguientes datos personales: nombre completo, dirección de correo electrónico, dirección postal, número de teléfono, información de pago (procesada de forma segura a través de Mercado Pago), y dirección de entrega.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Finalidad del Tratamiento</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos sus datos personales para los siguientes fines:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Procesar y completar sus pedidos</li>
                <li>Enviar productos a la dirección proporcionada</li>
                <li>Comunicarnos con usted sobre su cuenta y pedidos</li>
                <li>Enviar información sobre productos y promociones (con su consentimiento)</li>
                <li>Cumplir con obligaciones legales y fiscales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Derechos ARCO</h2>
              <p className="text-muted-foreground mb-4">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li><strong>Acceder</strong> a sus datos personales</li>
                <li><strong>Rectificar</strong> sus datos personales cuando sean inexactos o incompletos</li>
                <li><strong>Cancelar</strong> sus datos personales cuando considere que no están siendo utilizados conforme a los principios y deberes establecidos en la ley</li>
                <li><strong>Oponerse</strong> al tratamiento de sus datos personales para fines específicos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Transferencia de Datos</h2>
              <p className="text-muted-foreground mb-4">
                Sus datos personales pueden ser compartidos con proveedores de servicios de pago (Mercado Pago), empresas de envío, y autoridades gubernamentales cuando sea requerido por ley. No vendemos ni alquilamos sus datos personales a terceros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Seguridad</h2>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, pérdida o destrucción.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Consentimiento</h2>
              <p className="text-muted-foreground mb-4">
                Al utilizar nuestros servicios y proporcionar sus datos personales, usted consiente el tratamiento de sus datos según lo descrito en este aviso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
              <p className="text-muted-foreground mb-4">
                Para ejercer sus derechos ARCO o para cualquier consulta sobre este aviso de privacidad, puede contactarnos a través de nuestra página de{" "}
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

