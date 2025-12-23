-- SQL para crear tabla categories y agregar categoryId a products
-- Ejecuta este SQL en Neon SQL Editor

-- 1. Crear tabla categories (solo si no existe)
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

-- 2. Crear índice único para slug (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'categories' AND indexname = 'categories_slug_key'
    ) THEN
        CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
    END IF;
END $$;

-- 3. Crear índice para parent_id (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'categories' AND indexname = 'categories_parent_id_idx'
    ) THEN
        CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");
    END IF;
END $$;

-- 4. Crear foreign key para self-reference (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categories_parent_id_fkey'
    ) THEN
        ALTER TABLE "categories" 
        ADD CONSTRAINT "categories_parent_id_fkey" 
        FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

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

-- 6. Crear índice para category_id en products (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'products' AND indexname = 'products_category_id_idx'
    ) THEN
        CREATE INDEX "products_category_id_idx" ON "products"("category_id");
    END IF;
END $$;

-- 7. Crear foreign key de products.category_id -> categories.id (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_category_id_fkey'
    ) THEN
        ALTER TABLE "products" 
        ADD CONSTRAINT "products_category_id_fkey" 
        FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- 8. Crear categoría por defecto "Todo" (si no existe)
INSERT INTO "categories" ("id", "name", "slug", "is_active", "created_at", "updated_at")
SELECT 
    gen_random_uuid()::TEXT as "id",
    'Todo' as "name",
    'todo' as "slug",
    true as "is_active",
    NOW() as "created_at",
    NOW() as "updated_at"
WHERE NOT EXISTS (
    SELECT 1 FROM "categories" WHERE "slug" = 'todo'
);

-- 9. Actualizar productos existentes para asignarles la categoría "Todo"
UPDATE "products" 
SET "category_id" = (SELECT "id" FROM "categories" WHERE "slug" = 'todo' LIMIT 1)
WHERE "category_id" IS NULL;

-- 10. Hacer category_id obligatorio (descomenta solo después de asegurar que todos los productos tienen categoría)
-- ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;

