-- Scripts SQL para cambiar el rol de un usuario
-- Ejecuta estos comandos en Neon SQL Editor

-- Opción 1: Cambiar rol de un usuario específico por email
UPDATE "users"
SET "role" = 'ADMIN'
WHERE "email" = 'usuario@ejemplo.com';

-- Opción 2: Cambiar rol de un usuario específico por ID
UPDATE "users"
SET "role" = 'ADMIN'
WHERE "id" = 'clxxxxxxxxxxxxxxxxxxxxxxx';

-- Opción 3: Cambiar rol de múltiples usuarios (usar con cuidado)
UPDATE "users"
SET "role" = 'ADMIN'
WHERE "email" IN ('admin1@voxa.mx', 'admin2@voxa.mx');

-- Opción 4: Cambiar todos los usuarios de vuelta a USER (usar con cuidado)
UPDATE "users"
SET "role" = 'USER';

-- Verificar el cambio
SELECT "id", "email", "name", "role" FROM "users" WHERE "email" = 'usuario@ejemplo.com';

