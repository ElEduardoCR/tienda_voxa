-- SQL para validar que la tabla categories esté correctamente configurada
-- Ejecuta este SQL en Neon SQL Editor para verificar el estado

-- 1. Verificar que la tabla categories existe y tiene las columnas correctas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- 2. Verificar índices en categories
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'categories';

-- 3. Verificar que products tiene category_id
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'category_id';

-- 4. Verificar foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name = 'categories' OR tc.table_name = 'products');

-- 5. Verificar si existe la categoría "Todo"
SELECT * FROM "categories" WHERE "slug" = 'todo';

-- 6. Contar productos sin categoría
SELECT COUNT(*) as productos_sin_categoria
FROM "products"
WHERE "category_id" IS NULL;

