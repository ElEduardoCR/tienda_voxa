-- SQL para agregar columna stock a products
-- Ejecuta este SQL en Neon SQL Editor

-- 1. Agregar columna stock si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock'
    ) THEN
        ALTER TABLE "products" ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 2. Verificar que se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'stock';


