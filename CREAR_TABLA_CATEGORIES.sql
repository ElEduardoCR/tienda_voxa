-- SQL para crear tabla categories y agregar categoryId a products
-- Ejecuta este SQL en Neon SQL Editor

-- 1. Crear tabla categories
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image_url" TEXT,
    "parent_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- 2. Crear índice único para slug
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

-- 3. Crear índice para parent_id (para búsquedas de subcategorías)
CREATE INDEX IF NOT EXISTS "categories_parent_id_idx" ON "categories"("parent_id");

-- 4. Crear foreign key para self-reference (parent_id -> categories.id)
ALTER TABLE "categories" 
    ADD CONSTRAINT "categories_parent_id_fkey" 
    FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Agregar columna category_id a products (si no existe)
-- Primero verificar si existe y agregar si no
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE "products" ADD COLUMN "category_id" TEXT;
    END IF;
END $$;

-- 6. Crear índice para category_id en products
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products"("category_id");

-- 7. Crear foreign key de products.category_id -> categories.id
-- Primero eliminar constraint si existe para evitar errores
ALTER TABLE "products" 
    DROP CONSTRAINT IF EXISTS "products_category_id_fkey";

ALTER TABLE "products" 
    ADD CONSTRAINT "products_category_id_fkey" 
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 8. Crear categoría por defecto "General" (si no existe)
INSERT INTO "categories" ("id", "name", "slug", "is_active", "created_at", "updated_at")
SELECT 
    gen_random_uuid()::TEXT as "id",
    'General' as "name",
    'general' as "slug",
    true as "is_active",
    NOW() as "created_at",
    NOW() as "updated_at"
WHERE NOT EXISTS (
    SELECT 1 FROM "categories" WHERE "slug" = 'general'
);

-- 9. Actualizar productos existentes para asignarles la categoría "General"
UPDATE "products" 
SET "category_id" = (SELECT "id" FROM "categories" WHERE "slug" = 'general' LIMIT 1)
WHERE "category_id" IS NULL;

-- 10. Hacer category_id obligatorio (descomenta solo después de asegurar que todos los productos tienen categoría)
-- ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;

