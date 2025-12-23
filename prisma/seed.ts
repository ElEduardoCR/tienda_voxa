import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { createSlug, generateUniqueSlug } from '../lib/slug'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpiar datos existentes
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Crear usuario admin de ejemplo
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@voxa.mx',
      passwordHash: adminPasswordHash,
      name: 'Admin Voxa',
      role: 'ADMIN',
    },
  })
  console.log('✅ Usuario admin creado:', adminUser.email)

  // Crear usuario de prueba
  const userPasswordHash = await bcrypt.hash('usuario123', 10)
  const testUser = await prisma.user.create({
    data: {
      email: 'usuario@voxa.mx',
      passwordHash: userPasswordHash,
      name: 'Usuario Prueba',
      role: 'USER',
    },
  })
  console.log('✅ Usuario de prueba creado:', testUser.email)

  // Crear categoría por defecto "Todo"
  const categoriaDefault = await prisma.category.create({
    data: {
      name: "Todo",
      slug: "todo",
      isActive: true,
    },
  })
  console.log('✅ Categoría por defecto creada:', categoriaDefault.name)

  // Crear 10 productos demo
  const productData = [
    {
      name: 'Laptop Dell XPS 13',
      description: 'Laptop ultradelgada con pantalla InfinityEdge de 13 pulgadas, procesador Intel Core i7, 16GB RAM, 512GB SSD.',
      price: 24999.00,
      image: 'https://via.placeholder.com/400x300?text=Laptop+Dell+XPS+13',
    },
    {
      name: 'Mouse Logitech MX Master 3',
      description: 'Mouse inalámbrico ergonómico con sensor de alta precisión, batería recargable de larga duración.',
      price: 1299.00,
      image: 'https://via.placeholder.com/400x300?text=Mouse+Logitech+MX+Master+3',
    },
    {
      name: 'Teclado Mecánico Keychron K2',
      description: 'Teclado mecánico inalámbrico con switches Gateron, retroiluminación RGB, compatible con Mac/Windows.',
      price: 2999.00,
      image: 'https://via.placeholder.com/400x300?text=Teclado+Mec%C3%A1nico+Keychron+K2',
    },
    {
      name: 'Monitor Samsung 27" 4K',
      description: 'Monitor 4K UHD de 27 pulgadas, panel IPS, HDR10, puertos USB-C, HDMI y DisplayPort.',
      price: 8999.00,
      image: 'https://via.placeholder.com/400x300?text=Monitor+Samsung+27+4K',
    },
    {
      name: 'Auriculares Sony WH-1000XM5',
      description: 'Auriculares inalámbricos con cancelación de ruido activa, sonido Hi-Res Audio, batería de 30 horas.',
      price: 5999.00,
      image: 'https://via.placeholder.com/400x300?text=Auriculares+Sony+WH-1000XM5',
    },
    {
      name: 'Webcam Logitech C920 HD Pro',
      description: 'Webcam Full HD 1080p, autofoco, microfono estéreo dual, compatible con múltiples plataformas.',
      price: 1599.00,
      image: 'https://via.placeholder.com/400x300?text=Webcam+Logitech+C920',
    },
    {
      name: 'Disco Duro Externo Seagate 2TB',
      description: 'Disco duro externo portátil de 2TB, USB 3.0, compatible con PC y Mac, diseño compacto.',
      price: 1299.00,
      image: 'https://via.placeholder.com/400x300?text=Disco+Duro+Externo+2TB',
    },
    {
      name: 'Tablet iPad Air 10.9"',
      description: 'Tablet iPad Air con chip M1, pantalla Liquid Retina, 256GB almacenamiento, Wi-Fi + Celular.',
      price: 15999.00,
      image: 'https://via.placeholder.com/400x300?text=iPad+Air+10.9',
    },
    {
      name: 'Cargador MagSafe Apple',
      description: 'Cargador inalámbrico MagSafe compatible con iPhone 12 y posteriores, potencia de 15W.',
      price: 899.00,
      image: 'https://via.placeholder.com/400x300?text=Cargador+MagSafe',
    },
    {
      name: 'Stand de Escritorio para Laptop',
      description: 'Soporte ergonómico para laptop ajustable en altura, compatible con laptops de 10" a 17", aluminio.',
      price: 799.00,
      image: 'https://via.placeholder.com/400x300?text=Stand+para+Laptop',
    },
  ]

  let skuCounter = 100000

  for (const product of productData) {
    // Generar slug único
    const baseSlug = createSlug(product.name)
    const slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
      const existing = await prisma.product.findUnique({
        where: { slug: testSlug },
      })
      return !!existing
    })

    // Crear producto con nueva estructura
    await prisma.product.create({
      data: {
        sku: skuCounter.toString().padStart(6, '0'),
        name: product.name,
        slug,
        description: product.description,
        priceCents: Math.round(product.price * 100), // Convertir a centavos
        images: [product.image],
        isActive: true,
        isSoldOut: false,
        categoryId: categoriaDefault.id,
      },
    })

    skuCounter++
  }

  console.log(`✅ ${productData.length} productos creados exitosamente`)
  console.log('🎉 Seed completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

