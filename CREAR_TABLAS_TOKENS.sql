-- SQL para crear tablas de tokens de verificación y reset
-- Ejecuta este SQL en Neon SQL Editor

-- 1. Agregar columna email_verified a users (si no existe)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" TIMESTAMP(3);

-- 2. Crear tabla verification_tokens (eliminar primero si existe incorrectamente)
DROP TABLE IF EXISTS "verification_tokens" CASCADE;

CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- 3. Crear tabla password_reset_tokens (eliminar primero si existe incorrectamente)
DROP TABLE IF EXISTS "password_reset_tokens" CASCADE;

CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- 4. Crear índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" 
    ON "verification_tokens"("identifier", "token");
    
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_email_token_key" 
    ON "password_reset_tokens"("email", "token");

-- 5. Crear foreign keys
ALTER TABLE "verification_tokens" 
    ADD CONSTRAINT "verification_tokens_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "password_reset_tokens" 
    ADD CONSTRAINT "password_reset_tokens_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

