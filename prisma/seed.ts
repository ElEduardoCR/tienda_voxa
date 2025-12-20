import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpiar datos existentes
  await prisma.product.deleteMany()
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

  // Crear 10 productos demo
  const products = [
    {
      sku: 'VOX-001',
      name: 'Laptop Dell XPS 13',
      description: 'Laptop ultradelgada con pantalla InfinityEdge de 13 pulgadas, procesador Intel Core i7, 16GB RAM, 512GB SSD.',
      price: 24999.00,
      image: 'https://via.placeholder.com/400x300?text=Laptop+Dell+XPS+13',
      stock: 15,
    },
    {
      sku: 'VOX-002',
      name: 'Mouse Logitech MX Master 3',
      description: 'Mouse inalámbrico ergonómico con sensor de alta precisión, batería recargable de larga duración.',
      price: 1299.00,
      image: 'https://via.placeholder.com/400x300?text=Mouse+Logitech+MX+Master+3',
      stock: 50,
    },
    {
      sku: 'VOX-003',
      name: 'Teclado Mecánico Keychron K2',
      description: 'Teclado mecánico inalámbrico con switches Gateron, retroiluminación RGB, compatible con Mac/Windows.',
      price: 2999.00,
      image: 'https://via.placeholder.com/400x300?text=Teclado+Mec%C3%A1nico+Keychron+K2',
      stock: 30,
    },
    {
      sku: 'VOX-004',
      name: 'Monitor Samsung 27" 4K',
      description: 'Monitor 4K UHD de 27 pulgadas, panel IPS, HDR10, puertos USB-C, HDMI y DisplayPort.',
      price: 8999.00,
      image: 'https://via.placeholder.com/400x300?text=Monitor+Samsung+27+4K',
      stock: 20,
    },
    {
      sku: 'VOX-005',
      name: 'Auriculares Sony WH-1000XM5',
      description: 'Auriculares inalámbricos con cancelación de ruido activa, sonido Hi-Res Audio, batería de 30 horas.',
      price: 5999.00,
      image: 'https://via.placeholder.com/400x300?text=Auriculares+Sony+WH-1000XM5',
      stock: 25,
    },
    {
      sku: 'VOX-006',
      name: 'Webcam Logitech C920 HD Pro',
      description: 'Webcam Full HD 1080p, autofoco, microfono estéreo dual, compatible con múltiples plataformas.',
      price: 1599.00,
      image: 'https://via.placeholder.com/400x300?text=Webcam+Logitech+C920',
      stock: 40,
    },
    {
      sku: 'VOX-007',
      name: 'Disco Duro Externo Seagate 2TB',
      description: 'Disco duro externo portátil de 2TB, USB 3.0, compatible con PC y Mac, diseño compacto.',
      price: 1299.00,
      image: 'https://via.placeholder.com/400x300?text=Disco+Duro+Externo+2TB',
      stock: 60,
    },
    {
      sku: 'VOX-008',
      name: 'Tablet iPad Air 10.9"',
      description: 'Tablet iPad Air con chip M1, pantalla Liquid Retina, 256GB almacenamiento, Wi-Fi + Celular.',
      price: 15999.00,
      image: 'https://via.placeholder.com/400x300?text=iPad+Air+10.9',
      stock: 12,
    },
    {
      sku: 'VOX-009',
      name: 'Cargador MagSafe Apple',
      description: 'Cargador inalámbrico MagSafe compatible con iPhone 12 y posteriores, potencia de 15W.',
      price: 899.00,
      image: 'https://via.placeholder.com/400x300?text=Cargador+MagSafe',
      stock: 80,
    },
    {
      sku: 'VOX-010',
      name: 'Stand de Escritorio para Laptop',
      description: 'Soporte ergonómico para laptop ajustable en altura, compatible con laptops de 10" a 17", aluminio.',
      price: 799.00,
      image: 'https://via.placeholder.com/400x300?text=Stand+para+Laptop',
      stock: 45,
    },
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log(`✅ ${products.length} productos creados exitosamente`)
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

