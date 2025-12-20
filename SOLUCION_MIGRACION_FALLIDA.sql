-- Solución para migración fallida en Prisma
-- Ejecuta este SQL en Neon SQL Editor

-- Opción 1: Marcar la migración como aplicada exitosamente
UPDATE "_prisma_migrations" 
SET "finished_at" = NOW(), 
    "rolled_back_at" = NULL,
    "started_at" = COALESCE("started_at", NOW())
WHERE "migration_name" = '20241220000000_add_email_verification';

-- Si no existe el registro, créalo como aplicado
INSERT INTO "_prisma_migrations" (
    "id",
    "checksum",
    "finished_at",
    "migration_name",
    "logs",
    "rolled_back_at",
    "started_at",
    "applied_steps_count"
)
SELECT 
    gen_random_uuid()::text,
    '',
    NOW(),
    '20241220000000_add_email_verification',
    NULL,
    NULL,
    NOW(),
    1
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations" 
    WHERE "migration_name" = '20241220000000_add_email_verification'
);

