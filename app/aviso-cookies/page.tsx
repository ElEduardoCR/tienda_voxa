import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Aviso de Cookies | Tienda Voxa",
  description: "Información sobre el uso de cookies en VOXA Herramientas de Mexico",
}

export default function AvisoCookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Aviso de Cookies</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Última actualización: Enero 2026</CardTitle>
            <CardDescription>
              Este aviso explica qué son las cookies, cómo las utilizamos en nuestro sitio web y cómo puedes gestionarlas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. ¿Qué son las Cookies?</h2>
              <p className="text-muted-foreground mb-4">
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (computadora, tablet o móvil) cuando visitas un sitio web. Las cookies permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo, por lo que no tienes que volver a configurarlas cada vez que regresas al sitio o navegas de una página a otra.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Tipos de Cookies que Utilizamos</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">Cookies Estrictamente Necesarias</h3>
              <p className="text-muted-foreground mb-4">
                Estas cookies son esenciales para que puedas navegar por el sitio web y utilizar sus funciones. Sin estas cookies, los servicios que has solicitado no pueden ser proporcionados.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">Cookies de Rendimiento</h3>
              <p className="text-muted-foreground mb-4">
                Estas cookies recopilan información sobre cómo utilizas nuestro sitio web, como qué páginas visitas con más frecuencia. Esta información nos ayuda a mejorar el funcionamiento del sitio web.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">Cookies de Funcionalidad</h3>
              <p className="text-muted-foreground mb-4">
                Estas cookies permiten que el sitio web recuerde las opciones que realizas (como tu nombre de usuario, idioma o región) y proporcionan características mejoradas y más personales.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">Cookies de Autenticación</h3>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies para mantener tu sesión activa cuando inicias sesión en tu cuenta, permitiéndote navegar por el sitio sin tener que iniciar sesión repetidamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Cookies de Terceros</h2>
              <p className="text-muted-foreground mb-4">
                Algunas cookies son colocadas por servicios de terceros que aparecen en nuestras páginas. Por ejemplo, utilizamos servicios de análisis y procesamiento de pagos que pueden establecer sus propias cookies. No tenemos control sobre estas cookies de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Gestión de Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Puedes controlar y/o eliminar las cookies como desees. Puedes eliminar todas las cookies que ya están en tu dispositivo y puedes configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si haces esto, es posible que tengas que ajustar manualmente algunas preferencias cada vez que visites un sitio y que algunos servicios y funcionalidades no funcionen.
              </p>
              <p className="text-muted-foreground mb-4">
                Para obtener más información sobre cómo gestionar las cookies en diferentes navegadores, consulta la configuración de tu navegador:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Consentimiento</h2>
              <p className="text-muted-foreground mb-4">
                Al continuar utilizando nuestro sitio web, aceptas nuestro uso de cookies según se describe en este aviso. Si no estás de acuerdo con el uso de cookies, puedes configurar tu navegador para rechazarlas, aunque esto puede afectar la funcionalidad del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Contacto</h2>
              <p className="text-muted-foreground mb-4">
                Si tienes preguntas sobre nuestro uso de cookies, por favor contáctanos a través de nuestra página de{" "}
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

