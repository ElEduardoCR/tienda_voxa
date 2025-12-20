# Configuración de Base de Datos Neon

## Paso 1: Configurar DATABASE_URL

**IMPORTANTE**: Reemplaza `REDACTED` con tu contraseña real de Neon.

Edita `.env.local` y asegúrate de que tenga:
```env
DATABASE_URL="postgresql://neondb_owner:TU_CONTRASEÑA_REAL@ep-wild-field-ad64gyqv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Para desarrollo local, también puedes crear un `.env` (Prisma CLI lo lee):
```bash
cp .env.local .env
```

## Paso 2: Ejecutar Migraciones

```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migración inicial
npx prisma migrate dev --name init

# (Opcional) Ejecutar seed con datos demo
npm run db:seed
```

## Paso 3: Verificar Build Local

```bash
npm run build
```

Debe pasar sin errores.

## Paso 4: Configurar en Vercel

```bash
# Conectar proyecto (si no está conectado)
vercel link

# Agregar variable de entorno
vercel env add DATABASE_URL production

# Pega el mismo connection string (con contraseña real)

# Deploy
vercel --prod
```

O desde el dashboard de Vercel:
1. Settings → Environment Variables
2. Agregar `DATABASE_URL` con el connection string completo
3. Redeploy

## Notas

- Las páginas con consultas Prisma tienen `export const dynamic = 'force-dynamic'` para evitar pre-renderizado
- Las rutas API (`/api/registro` y `/api/auth/[...nextauth]`) están correctamente configuradas
- `lib/prisma.ts` tiene el singleton correcto para evitar múltiples instancias

