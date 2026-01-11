import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { MercadoPagoConfig, Preference } from "mercadopago"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Inicializar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
  options: {
    timeout: 5000,
    idempotencyKey: "abc",
  },
})

const preference = new Preference(client)

/**
 * POST /api/checkout/create-preference
 * Crea una preferencia de pago en Mercado Pago y una orden en la base de datos
 */
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, deliveryAddress } = body

    // Validar que hay items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      )
    }

    // Validar dirección de entrega
    if (!deliveryAddress) {
      return NextResponse.json(
        { error: "Debes seleccionar una dirección de entrega" },
        { status: 400 }
      )
    }

    const { prisma } = await import("@/lib/prisma")

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar productos y calcular total
    let totalCents = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { id: true, sku: true, name: true, priceCents: true, stock: true },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.name} no encontrado` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` },
          { status: 400 }
        )
      }

      const itemTotal = product.priceCents * item.quantity
      totalCents += itemTotal

      orderItems.push({
        productId: product.id,
        productSku: product.sku,
        productName: product.name,
        quantity: item.quantity,
        priceCents: product.priceCents,
        totalCents: itemTotal,
      })
    }

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Crear orden en la base de datos (pendiente)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "pending",
        paymentStatus: "pending",
        totalCents,
        currency: "MXN",
        deliveryAddressId: deliveryAddress.id || null,
        recipientName: deliveryAddress.recipient,
        recipientPhone: deliveryAddress.phone || null,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postalCode: deliveryAddress.postalCode,
        country: deliveryAddress.country || "México",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    })

    // Preparar items para Mercado Pago
    // NOTA: Mercado Pago espera el precio en la moneda base (pesos), NO en centavos
    // El item.price ya viene en pesos desde el carrito (convertido desde priceCents en el frontend)
    const mpItems = items.map((item: any) => ({
      id: item.id,
      title: item.name,
      description: item.name.substring(0, 200), // MP limita a 255 caracteres
      quantity: item.quantity,
      currency_id: "MXN",
      unit_price: Number(item.price.toFixed(2)), // Precio en pesos (Mercado Pago acepta decimales)
    }))

    // URL base de la aplicación
    // Priorizar NEXTAUTH_URL (dominio real) sobre VERCEL_URL (dominio temporal)
    let baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://tienda.voxa.mx"
    
    // Si la URL no tiene protocolo, agregarlo
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      baseUrl = `https://${baseUrl}`
    }

    // Crear preferencia en Mercado Pago
    const preferenceData = {
      items: mpItems,
      payer: {
        name: user.name || undefined,
        email: user.email,
        phone: deliveryAddress.phone ? {
          area_code: "",
          number: deliveryAddress.phone,
        } : undefined,
      },
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      },
      auto_return: "approved" as const,
      external_reference: order.id, // ID de nuestra orden para identificar el pago
      notification_url: `${baseUrl}/api/checkout/webhook`,
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        user_id: user.id,
      },
    }

    const mpPreference = await preference.create({ body: preferenceData })

    // Actualizar orden con el ID de Mercado Pago
    await prisma.order.update({
      where: { id: order.id },
      data: {
        mercadoPagoId: mpPreference.id,
      },
    })

    return NextResponse.json({
      preferenceId: mpPreference.id,
      initPoint: mpPreference.init_point, // URL de redirección a Mercado Pago
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error: any) {
    console.error("Error creating Mercado Pago preference:", error)
    
    // Si es error de Mercado Pago, devolver mensaje más claro
    if (error.message) {
      return NextResponse.json(
        { error: `Error de Mercado Pago: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Error al crear la preferencia de pago" },
      { status: 500 }
    )
  }
}

