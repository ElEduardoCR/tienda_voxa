# Configuración de Migraciones

## Preparación Local

Asegúrate de que `.env.local` tenga tu DATABASE_URL de Neon:

```env
DATABASE_URL="postgresql://usuario:contraseña@host:5432/dbname?sslmode=require"
```

## Ejecutar Migración Inicial

Una vez que tengas DATABASE_URL configurada en `.env.local`:

```bash
# Opción 1: Usar dotenv-cli (si está instalado)
npx dotenv-cli -e .env.local -- npx prisma migrate dev --name init

# Opción 2: Cargar manualmente (en terminal)
export $(cat .env.local | grep -v '^#' | xargs)
npx prisma migrate dev --name init

# Opción 3: Prisma CLI lee automáticamente .env.local en algunos casos
npx prisma migrate dev --name init
```

## Después de la Migración

1. **Commit de migraciones:**
   ```bash
   git add prisma/migrations/
   git commit -m "Add: Migración inicial de base de datos"
   git push
   ```

2. **Verificar build local:**
   ```bash
   npm run build
   ```

3. **Probar endpoints localmente:**
   ```bash
   npm run dev
   
   # En otra terminal:
   curl http://localhost:3000/api/health/db
   curl -X POST http://localhost:3000/api/registro \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"123456","name":"Test User"}'
   ```

## Deploy en Vercel

Vercel usará automáticamente el script `vercel-build` que:
1. Genera Prisma Client (`prisma generate`)
2. Ejecuta migraciones (`prisma migrate deploy`)
3. Construye la app (`next build`)

**Asegúrate de que DATABASE_URL esté configurada en Vercel:**
- Settings → Environment Variables
- Agregar `DATABASE_URL` con el connection string de Neon

Después del deploy, prueba:
- `https://tu-dominio.vercel.app/api/health/db`
- `POST https://tu-dominio.vercel.app/api/registro`

