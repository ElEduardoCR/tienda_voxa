import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Contacto | Tienda Voxa",
  description: "Póngase en contacto con VOXA Herramientas de Mexico",
}

export default function ContactoPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Contacto</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>
              Estamos aquí para ayudarte. Ponte en contacto con nosotros a través de los siguientes medios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground">
                Para consultas generales, por favor envíanos un correo electrónico a:{" "}
                <a href="mailto:contacto@voxa.mx" className="text-primary hover:underline">
                  contacto@voxa.mx
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Horario de Atención</h3>
              <p className="text-muted-foreground">
                Lunes a Viernes: 9:00 AM - 6:00 PM (Hora de México)
                <br />
                Sábados: 9:00 AM - 2:00 PM
                <br />
                Domingos: Cerrado
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Soporte</h3>
              <p className="text-muted-foreground">
                Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta o problema que tengas con nuestros productos o servicios.
              </p>
            </div>
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

