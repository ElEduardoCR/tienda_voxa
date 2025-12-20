# Resolver Migración Fallida en Producción

## Problema

Prisma detecta una migración marcada como "failed" en la tabla `_prisma_migrations`, aunque el SQL ya se ejecutó manualmente.

## Solución: Marcar la migración como aplicada

Tienes dos opciones:

### Opción 1: Usar Prisma CLI (Recomendado)

Ejecuta este comando localmente (asegúrate de tener `DATABASE_URL` apuntando a producción):

```bash
npx prisma migrate resolve --applied 20241220000000_add_email_verification
```

**Nota**: Solo funciona si tienes acceso a la base de datos de producción localmente.

### Opción 2: Ejecutar SQL directamente en Neon (Más fácil)

1. Ve a tu proyecto en Neon: https://console.neon.tech
2. Abre el **SQL Editor**
3. Ejecuta este SQL:

```sql
-- Marcar la migración como aplicada exitosamente
UPDATE "_prisma_migrations" 
SET "finished_at" = NOW(), 
    "rolled_back_at" = NULL 
WHERE "migration_name" = '20241220000000_add_email_verification';

-- Si la migración no existe en la tabla, insértala
INSERT INTO "_prisma_migrations" (
    "migration_name", 
    "checksum", 
    "finished_at", 
    "started_at"
)
SELECT 
    '20241220000000_add_email_verification',
    '',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations" 
    WHERE "migration_name" = '20241220000000_add_email_verification'
);
```

4. Click en **"Run"**

### Opción 3: Eliminar el registro fallido y dejar que Prisma la vuelva a aplicar

Si prefieres que Prisma la ejecute automáticamente (aunque ya esté aplicada manualmente):

```sql
-- Eliminar el registro de la migración fallida
DELETE FROM "_prisma_migrations" 
WHERE "migration_name" = '20241220000000_add_email_verification';
```

Como el SQL ya se ejecutó manualmente y usa `IF NOT EXISTS`, Prisma intentará ejecutarla pero no dará error porque las tablas/columnas ya existen.

## Verificar que funcionó

Después de ejecutar cualquiera de las opciones anteriores:

1. Hacer redeploy en Vercel
2. El build debería pasar sin errores de migración
3. La aplicación debería funcionar correctamente

## Nota

La migración usa `IF NOT EXISTS` y `ADD COLUMN IF NOT EXISTS`, por lo que es segura ejecutarla múltiples veces sin causar errores.

