# Migración: Verificación de Email y Recuperación de Contraseña

## 📋 Resumen de Cambios

Se han agregado las siguientes funcionalidades:

1. **Verificación de Email**: Los usuarios deben verificar su correo antes de poder iniciar sesión
2. **Reenvío de Verificación**: Los usuarios pueden solicitar un nuevo enlace de verificación
3. **Recuperación de Contraseña**: Los usuarios pueden restablecer su contraseña olvidada

## 🗄️ Cambios en la Base de Datos

### Schema de Prisma

1. **Campo `emailVerified` en User**: Campo opcional que almacena la fecha de verificación
2. **Nueva tabla `VerificationToken`**: Almacena tokens de verificación de email (con hash SHA256)
3. **Nueva tabla `PasswordResetToken`**: Almacena tokens de recuperación de contraseña (con hash SHA256)

### Ejecutar Migración

```bash
# Generar Prisma Client (ya hecho)
npx prisma generate

# Crear y aplicar migración
npx prisma migrate dev --name add_email_verification_and_password_reset

# En producción (Vercel)
# La migración se ejecutará automáticamente con el script vercel-build
```

## 🔑 Nuevas Variables de Entorno

Agregar a `.env.local` y Vercel:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="no-reply@voxa.mx"  # o "onboarding@resend.dev" para desarrollo
```

Ver documentación completa en `EMAIL_SETUP.md`.

## 📁 Archivos Nuevos

### Utilidades
- `lib/tokens.ts`: Generación y hashing de tokens
- `lib/email.ts`: Funciones para enviar emails (Resend)
- `lib/rate-limit.ts`: Rate limiting básico en memoria

### API Routes
- `app/api/auth/verificar/route.ts`: Verifica email con token
- `app/api/auth/reenviar-verificacion/route.ts`: Reenvía email de verificación
- `app/api/auth/olvido/route.ts`: Solicita reset de contraseña
- `app/api/auth/reset/route.ts`: Restablece contraseña con token

### Páginas UI
- `app/auth/verificar/page.tsx`: Página "Revisa tu correo"
- `app/auth/verificar/[token]/page.tsx`: Página de verificación con token
- `app/auth/olvido/page.tsx`: Formulario "¿Olvidaste tu contraseña?"
- `app/auth/reset/page.tsx`: Formulario para nueva contraseña

### Documentación
- `EMAIL_SETUP.md`: Guía completa de configuración de Resend

## 🔄 Archivos Modificados

1. **`prisma/schema.prisma`**: Agregado `emailVerified`, nuevas tablas
2. **`auth.ts`**: Rechaza login si `emailVerified` es null
3. **`app/api/registro/route.ts`**: Envía email de verificación al registrar
4. **`app/auth/login/page.tsx`**: Muestra error y botón "Reenviar verificación" si email no verificado
5. **`app/auth/registro/page.tsx`**: Redirige a página de verificación después del registro
6. **`package.json`**: Agregado `resend` como dependencia

## 🔒 Seguridad

- ✅ Tokens de 32 bytes aleatorios
- ✅ Tokens almacenados como hash SHA256 en DB
- ✅ Expiración: 24h para verificación, 1h para reset
- ✅ Rate limiting: 3 solicitudes/hora por email/IP
- ✅ Respuestas neutras en "olvido contraseña" (no revela si email existe)
- ✅ Tokens invalidados después de uso

## 🧪 Pruebas Manuales

### 1. Registro y Verificación

```bash
# 1. Registrar usuario
POST /api/registro
Body: { email, password, name }
→ Debe enviar email de verificación
→ Redirige a /auth/verificar?email=...

# 2. Verificar email
GET /api/auth/verificar?token=...
→ Marca emailVerified en DB
→ Elimina token usado
→ Redirige a /auth/login

# 3. Login exitoso
POST /auth/login con credenciales verificadas
→ Debe funcionar normalmente
```

### 2. Reenvío de Verificación

```bash
# Si el email no llega
POST /api/auth/reenviar-verificacion
Body: { email }
→ Envía nuevo email
→ Invalida tokens anteriores
```

### 3. Recuperación de Contraseña

```bash
# 1. Solicitar reset
POST /api/auth/olvido
Body: { email }
→ Envía email con token de reset

# 2. Restablecer contraseña
POST /api/auth/reset
Body: { token, password }
→ Actualiza contraseña (hash bcrypt)
→ Marca token como usado

# 3. Login con nueva contraseña
→ Debe funcionar con nueva contraseña
```

## ⚠️ Notas Importantes

1. **Migración de usuarios existentes**: Los usuarios creados antes de esta migración tendrán `emailVerified = null`. Deben verificar su email antes de poder iniciar sesión.

2. **Resend API Key**: Necesitas configurar Resend antes de que los emails funcionen. Ver `EMAIL_SETUP.md`.

3. **Dominio de email**: Para producción, verifica tu dominio en Resend. Para desarrollo, usa `onboarding@resend.dev`.

4. **Rate limiting**: Actualmente en memoria. Para producción con múltiples instancias, considera Redis.

## 📝 Checklist de Despliegue

- [ ] Configurar `RESEND_API_KEY` en Vercel
- [ ] Configurar `EMAIL_FROM` en Vercel
- [ ] Ejecutar migración local: `npx prisma migrate dev`
- [ ] Commit y push de `prisma/migrations/`
- [ ] Deploy en Vercel (la migración se ejecutará automáticamente)
- [ ] Probar registro y verificación en producción
- [ ] Probar recuperación de contraseña en producción

## 🔗 Rutas Disponibles

- `/auth/verificar` - Página "Revisa tu correo"
- `/auth/verificar/[token]` - Verificación automática con token
- `/auth/olvido` - Solicitar recuperación de contraseña
- `/auth/reset?token=...` - Restablecer contraseña
- `/auth/login` - Login (ahora valida email verificado)

