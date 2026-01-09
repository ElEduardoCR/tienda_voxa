-- SQL para agregar campos de envío a la tabla orders
-- Ejecuta este SQL en Neon SQL Editor

-- 1. Agregar columna shipping_status (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipping_status'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "shipping_status" TEXT NOT NULL DEFAULT 'pending';
    END IF;
END $$;

-- 2. Agregar columna tracking_number (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "tracking_number" TEXT;
    END IF;
END $$;

-- 3. Agregar columna shipping_carrier (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipping_carrier'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "shipping_carrier" TEXT;
    END IF;
END $$;

-- 4. Agregar columna shipped_at (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipped_at'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "shipped_at" TIMESTAMP(3);
    END IF;
END $$;

-- 5. Verificar que se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('shipping_status', 'tracking_number', 'shipping_carrier', 'shipped_at')
ORDER BY ordinal_position;

