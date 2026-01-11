import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Aviso de Privacidad del Sitio Web | Tienda Voxa",
  description: "Aviso de privacidad del sitio web de VOXA Herramientas de Mexico",
}

export default function AvisoPrivacidadSitioPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Aviso de Privacidad del Sitio Web</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Última actualización: Enero 2026</CardTitle>
            <CardDescription>
              Este aviso describe cómo recopilamos, utilizamos y protegemos la información cuando visitas nuestro sitio web.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
              <p className="text-muted-foreground mb-4">
                Cuando visitas nuestro sitio web, recopilamos automáticamente cierta información técnica, incluyendo:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Dirección IP</li>
                <li>Tipo de navegador y versión</li>
                <li>Páginas visitadas y tiempo de permanencia</li>
                <li>Fecha y hora de acceso</li>
                <li>Referrer (sitio web desde el cual llegaste)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Cookies y Tecnologías Similares</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web. Para más información sobre el uso de cookies, consulta nuestro{" "}
                <Link href="/aviso-cookies" className="text-primary hover:underline">
                  Aviso de Cookies
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Uso de la Información</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Mejorar y optimizar nuestro sitio web</li>
                <li>Analizar patrones de uso y comportamiento</li>
                <li>Garantizar la seguridad y prevenir fraudes</li>
                <li>Personalizar tu experiencia en el sitio</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Compartir Información</h2>
              <p className="text-muted-foreground mb-4">
                No vendemos, alquilamos ni compartimos información personal identificable con terceros para fines comerciales. Podemos compartir información agregada y anonimizada con proveedores de servicios de análisis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Enlaces a Sitios de Terceros</h2>
              <p className="text-muted-foreground mb-4">
                Nuestro sitio web puede contener enlaces a sitios de terceros. No somos responsables de las prácticas de privacidad de estos sitios. Te recomendamos leer las políticas de privacidad de cualquier sitio que visites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Seguridad</h2>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas de seguridad para proteger la información contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cambios a este Aviso</h2>
              <p className="text-muted-foreground mb-4">
                Nos reservamos el derecho de actualizar este aviso de privacidad en cualquier momento. La fecha de la última actualización se indica en la parte superior de este documento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
              <p className="text-muted-foreground mb-4">
                Si tienes preguntas sobre este aviso de privacidad, por favor contáctanos a través de nuestra página de{" "}
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

