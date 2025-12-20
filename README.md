# Tienda Voxa

Maqueta funcional de tienda en línea con registro e inicio de sesión de usuarios.

## 🚀 Stack Tecnológico

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **PostgreSQL** (Neon recomendado) + Prisma
- **Auth.js (NextAuth v5)** con Email/Password (bcrypt) y sesiones en DB
- **Deploy**: Vercel

## 📋 Prerrequisitos

- Node.js 18+ instalado
- Cuenta en [Neon](https://neon.tech) (PostgreSQL gratuito)
- Cuenta en [Vercel](https://vercel.com) para deploy
- Dominio configurado en tu DNS (tienda.voxa.mx)

## 🔧 Instalación Local

### 1. Clonar e instalar dependencias

```bash
cd "Tienda Voxa"
npm install
```

### 2. Crear base de datos en Neon

1. Ve a [https://neon.tech](https://neon.tech) y crea una cuenta o inicia sesión
2. Haz clic en "Create Project"
3. Elige un nombre para tu proyecto (ej: "tienda-voxa")
4. Selecciona la región más cercana a tu ubicación
5. Una vez creado, copia la **Connection String** que aparece (formato: `postgresql://usuario:password@host/dbname?sslmode=require`)

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` y agrega tus variables:

```env
DATABASE_URL="tu-connection-string-de-neon-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secreto-seguro-aqui-minimo-32-caracteres"
RESEND_API_KEY="tu-resend-api-key-aqui"
EMAIL_FROM="no-reply@voxa.mx"
```

**Nuevas variables (Verificación de correo y recuperación de contraseña con Gmail):**

- **SMTP_HOST**: `smtp.gmail.com`
- **SMTP_PORT**: `587`
- **SMTP_SECURE**: `false`
- **SMTP_USER**: Tu email de Gmail completo (ej: `tu-email@gmail.com`)
- **SMTP_PASSWORD**: Contraseña de aplicación de Gmail (generar en [Google App Passwords](https://myaccount.google.com/apppasswords))
- **EMAIL_FROM**: Tu email de Gmail (puede ser igual a `SMTP_USER`)

**Ver documentación completa en `EMAIL_SETUP.md`**

**Generar NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

O usa cualquier generador de strings aleatorios (mínimo 32 caracteres).

### 4. Configurar Prisma y ejecutar migraciones

```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones (crea las tablas en la DB)
npm run db:migrate

# Opcional: Ejecutar seed con productos demo y usuarios de prueba
npm run db:seed
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 👤 Usuarios de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

- **Admin:**
  - Email: `admin@voxa.mx`
  - Password: `admin123`

- **Usuario:**
  - Email: `usuario@voxa.mx`
  - Password: `usuario123`

## 📁 Estructura del Proyecto

```
Tienda Voxa/
├── app/                    # App Router de Next.js
│   ├── api/               # API routes
│   │   └── auth/          # NextAuth handlers
│   ├── auth/              # Páginas de autenticación
│   ├── catalogo/          # Catálogo de productos
│   ├── producto/          # Detalle de producto
│   ├── carrito/           # Carrito de compras
│   ├── cuenta/            # Perfil del usuario
│   └── admin/             # Panel de administración
├── components/            # Componentes React
│   ├── ui/                # Componentes shadcn/ui
│   └── navbar.tsx         # Barra de navegación
├── lib/                   # Utilidades y configuraciones
│   ├── auth.ts            # Configuración NextAuth
│   ├── prisma.ts          # Cliente Prisma
│   └── utils.ts           # Utilidades generales
├── prisma/                # Schema y migraciones Prisma
│   ├── schema.prisma      # Schema de la base de datos
│   └── seed.ts            # Datos iniciales
└── types/                 # Definiciones de tipos TypeScript
```

## 🚢 Deploy en Vercel

### 1. Preparar el repositorio

Asegúrate de tener todo commitado y push a tu repositorio Git:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin tu-repositorio-url
git push -u origin main
```

### 2. Crear proyecto en Vercel

1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New..." → "Project"
3. Importa tu repositorio Git
4. Vercel detectará automáticamente Next.js

### 3. Configurar variables de entorno en Vercel

En la sección "Environment Variables" del proyecto en Vercel, agrega:

- `DATABASE_URL`: Tu connection string de Neon (usar la misma de producción)
- `NEXTAUTH_URL`: `https://tienda.voxa.mx` (tu dominio de producción)
- `NEXTAUTH_SECRET`: El mismo secreto que generaste localmente (o uno nuevo para producción)

### 4. Configurar Build Settings

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (o `next build`)
- **Output Directory**: `.next`

### 5. Ejecutar migraciones en producción

Después del primer deploy, ejecuta las migraciones:

```bash
# Opción 1: Desde tu máquina local (usando DATABASE_URL de producción)
DATABASE_URL="tu-url-de-produccion" npm run db:migrate
DATABASE_URL="tu-url-de-produccion" npm run db:seed

# Opción 2: Usando Prisma Studio remoto
DATABASE_URL="tu-url-de-produccion" npx prisma studio
```

**Nota:** Para mayor seguridad, puedes usar el terminal integrado de Vercel o conectarte por SSH.

### 6. Configurar dominio personalizado (tienda.voxa.mx)

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a "Settings" → "Domains"
3. Agrega `tienda.voxa.mx`
4. Vercel te dará instrucciones para configurar DNS

#### Configuración DNS (Checklist)

Necesitas agregar estos registros en tu proveedor de DNS:

- **Tipo A** o **CNAME**: 
  - Nombre: `tienda` (o `tienda.voxa.mx` dependiendo de tu proveedor)
  - Valor: El valor que Vercel te proporcione (ej: `76.76.21.21` para A record, o `cname.vercel-dns.com` para CNAME)
  - TTL: `3600` (o el predeterminado)

**Pasos específicos por proveedor:**

- **Cloudflare**: DNS → Records → Add record → Tipo A/CNAME → Nombre: `tienda` → Valor: [valor de Vercel]
- **Namecheap**: Advanced DNS → Add New Record → A Record / CNAME Record
- **GoDaddy**: DNS Management → Add → A Record / CNAME Record

Espera 5-60 minutos para que los cambios de DNS se propaguen (DNS propagation).

## 📝 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Base de datos
npm run db:generate  # Genera cliente Prisma
npm run db:migrate   # Ejecuta migraciones
npm run db:push      # Sincroniza schema sin migraciones
npm run db:seed      # Ejecuta seed con datos demo
npm run db:studio    # Abre Prisma Studio (GUI)

# Producción
npm run build        # Build para producción
npm run start        # Inicia servidor de producción
```

## 🗄️ Migraciones y Base de Datos

### Primera Migración

Para crear las tablas en la base de datos por primera vez:

```bash
# 1. Generar Prisma Client
npx prisma generate

# 2. Crear migración inicial
npx prisma migrate dev --name init_users

# 3. (Opcional) Ejecutar seed con datos demo
npm run db:seed
```

### Probar Endpoints

Una vez que el servidor esté corriendo (`npm run dev`):

**Health Check de DB:**
```bash
curl http://localhost:3000/api/health/db
# Respuesta esperada: {"ok":true,"count":N}
```

**Registro de Usuario:**
```bash
curl -X POST http://localhost:3000/api/registro \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"contraseña123","name":"Nombre Usuario"}'
# Respuesta esperada: {"ok":true}
```

### Migraciones en Producción (Vercel)

Las migraciones deben ejecutarse manualmente después del deploy:

```bash
# Conectar a la DB de producción
DATABASE_URL="tu-connection-string-de-produccion" npx prisma migrate deploy

# O usar el CLI de Vercel
vercel env pull .env.local
npx prisma migrate deploy
```

## 🔐 Autenticación

El sistema usa **NextAuth v5 (Auth.js)** con:

- **Provider**: Credentials (Email/Password)
- **Hash**: bcryptjs (10 rounds)
- **Sesiones**: JWT almacenadas en cookies
- **Adaptador**: Prisma Adapter (para compatibilidad futura con otros providers)

### Rutas protegidas

- `/cuenta`: Requiere autenticación
- `/admin`: Requiere rol ADMIN

## 🛒 Carrito de Compras

El carrito usa **localStorage** del navegador (simulación). No persiste entre dispositivos.

## 🔮 Próximas Integraciones (No implementadas aún)

- ✅ Registro/Login funcional
- ✅ Catálogo de productos
- ✅ Carrito (localStorage)
- ⏳ Integración con Mercado Pago (placeholder del botón "Pagar")
- ⏳ Integración con Odoo (inventario, pedidos, sincronización)

## 📄 Licencia

Privado - Tienda Voxa

## 🆘 Solución de Problemas

### Error: "Invalid Prisma Client"

```bash
npm run db:generate
```

### Error: "Connection string is invalid"

- Verifica que tu `DATABASE_URL` esté correctamente formateada
- Asegúrate de incluir `?sslmode=require` al final
- Verifica que la base de datos en Neon esté activa

### Error: "NEXTAUTH_SECRET is not defined"

- Genera un secreto: `openssl rand -base64 32`
- Agrégalo a `.env` local y a las variables de entorno de Vercel

### Error al hacer deploy en Vercel

- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel
- Asegúrate de que el `package.json` tenga todos los scripts necesarios

## 📞 Soporte

Para problemas o preguntas, revisa la documentación de:
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth](https://next-auth.js.org)
- [Vercel](https://vercel.com/docs)

