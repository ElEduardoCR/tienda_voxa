-- SQL para crear tabla de direcciones de entrega
-- Ejecuta este SQL en Neon SQL Editor

-- 1. Crear tabla delivery_addresses (solo si no existe)
CREATE TABLE IF NOT EXISTS "delivery_addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'México',
    "phone" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_addresses_pkey" PRIMARY KEY ("id")
);

-- 2. Crear índice para user_id (solo si no existe)
CREATE INDEX IF NOT EXISTS "delivery_addresses_user_id_idx" ON "delivery_addresses"("user_id");

-- 3. Crear foreign key (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'delivery_addresses_user_id_fkey'
    ) THEN
        ALTER TABLE "delivery_addresses"
            ADD CONSTRAINT "delivery_addresses_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Verificar que se creó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'delivery_addresses'
ORDER BY ordinal_position;

