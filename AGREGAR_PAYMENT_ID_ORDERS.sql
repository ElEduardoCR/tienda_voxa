-- SQL para agregar columna mercado_pago_payment_id a orders
-- Ejecuta este SQL en Neon SQL Editor

-- Agregar columna mercado_pago_payment_id (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'mercado_pago_payment_id'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "mercado_pago_payment_id" TEXT;
    END IF;
END $$;

-- Crear índice para mercado_pago_payment_id (solo si no existe)
CREATE INDEX IF NOT EXISTS "orders_mercado_pago_payment_id_idx" ON "orders"("mercado_pago_payment_id");

-- Verificar que se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'mercado_pago_payment_id';

