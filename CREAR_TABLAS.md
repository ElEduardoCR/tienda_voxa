# Crear Tablas en la Base de Datos

## Problema
Las tablas no existen en la base de datos de producción. Necesitas ejecutar las migraciones.

## Solución Rápida (Recomendada)

### Opción 1: Usando Prisma Migrate (Recomendado)

**Desde tu máquina local con DATABASE_URL de producción:**

1. **Obtén tu DATABASE_URL de Neon:**
   - Ve a tu proyecto en Neon
   - Copia la connection string completa

2. **Ejecuta la migración:**
   ```bash
   # Usando la DATABASE_URL de producción directamente
   DATABASE_URL="postgresql://usuario:contraseña@host/dbname?sslmode=require" npx prisma migrate deploy
   
   # O exporta la variable primero
   export DATABASE_URL="postgresql://usuario:contraseña@host/dbname?sslmode=require"
   npx prisma migrate deploy
   ```

3. **Si no hay migraciones, crea una primero:**
   ```bash
   # Con DATABASE_URL de producción
   DATABASE_URL="tu-connection-string-de-produccion" npx prisma migrate dev --name init
   ```

### Opción 2: Usando Prisma Studio (GUI)

```bash
# Conectar a la DB de producción
DATABASE_URL="tu-connection-string-de-produccion" npx prisma studio
```

Luego ve a la pestaña "Migration" y ejecuta las migraciones pendientes.

### Opción 3: Desde Vercel (Post-deploy)

Si configuraste `vercel-build` correctamente, Vercel debería ejecutar `prisma migrate deploy` automáticamente. Si no funcionó:

1. Ve a tu proyecto en Vercel
2. Settings → Functions
3. Busca la función de build
4. Verifica los logs para ver si se ejecutaron las migraciones

## Crear Migración Inicial

Si no tienes migraciones creadas:

```bash
# 1. Asegúrate de tener DATABASE_URL en .env.local (o exportarla)
export $(cat .env.local | grep DATABASE_URL | xargs)

# 2. Crear migración
npx prisma migrate dev --name init

# 3. Esto creará:
#    - prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql
#    - Ejecutará la migración en tu DB

# 4. Commit y push
git add prisma/migrations/
git commit -m "Add: Migración inicial de base de datos"
git push
```

## SQL Directo (Alternativa)

Si prefieres ejecutar SQL directamente en Neon:

1. Ve a tu proyecto en Neon
2. Click en "SQL Editor"
3. Ejecuta este SQL (generado desde tu schema):

```sql
-- Crear tabla users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Crear índice único para email
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Crear tabla accounts (para NextAuth)
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts"("user_id");

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Crear tabla sessions (para NextAuth)
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sessions_session_token_key" ON "sessions"("session_token");

CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Crear tabla verification_tokens (para NextAuth)
CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");

CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- Crear tabla products
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "image" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_key" ON "products"("sku");
```

## Verificación

Después de ejecutar las migraciones:

```bash
# Verificar conexión
curl https://tienda.voxa.mx/api/health/db
# Debe retornar: {"ok":true,"count":0} (0 usuarios al inicio)

# Probar registro
curl -X POST https://tienda.voxa.mx/api/registro \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test"}'
# Debe retornar: {"ok":true}
```

