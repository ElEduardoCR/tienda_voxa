# Checklist de Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Variables Requeridas

Para que la aplicación funcione correctamente, asegúrate de tener estas variables configuradas en Vercel:

### 1. DATABASE_URL
- **Valor**: Connection string completo de Neon PostgreSQL
- **Formato**: `postgresql://usuario:contraseña@host:5432/dbname?sslmode=require`
- **Ejemplo**: `postgresql://neondb_owner:password@ep-wild-field-ad64gyqv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`

### 2. NEXTAUTH_SECRET
- **Valor**: Secreto aleatorio seguro (mínimo 32 caracteres)
- **Generar**:
  ```bash
  openssl rand -base64 32
  ```
- **O usar**: https://generate-secret.vercel.app/32

### 3. NEXTAUTH_URL
- **Valor**: `https://tienda.voxa.mx`
- **Importante**: Debe coincidir con tu dominio de producción

### 4. SMTP_HOST
- **Valor**: `smtp.gmail.com` (para Gmail)
- **Otros ejemplos**: `smtp-mail.outlook.com` (Outlook), `smtp.sendgrid.net` (SendGrid)

### 5. SMTP_PORT
- **Valor**: `587` (para TLS)
- **Alternativa**: `465` (para SSL, requiere `SMTP_SECURE=true`)

### 6. SMTP_SECURE
- **Valor**: `false` (para puerto 587 con TLS)
- **Alternativa**: `true` (para puerto 465 con SSL)

### 7. SMTP_USER
- **Valor**: Tu email completo (ej: `tu-email@gmail.com`)
- **Para Gmail**: Debe ser tu email de Gmail completo

### 8. SMTP_PASSWORD
- **Valor**: Contraseña de aplicación (Gmail) o contraseña SMTP
- **Para Gmail**: 
  1. Habilita verificación en 2 pasos
  2. Genera contraseña de aplicación en: https://myaccount.google.com/apppasswords
  3. Copia la contraseña de 16 caracteres (formato: `abcd efgh ijkl mnop`)

### 9. EMAIL_FROM
- **Valor**: Dirección desde la que se enviarán los correos
- **Ejemplo**: `tu-email@gmail.com` (puede ser igual a `SMTP_USER`)

## 📝 Cómo Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `tienda_voxa`
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable:
   - Click en **Add New**
   - Ingresa el nombre de la variable
   - Ingresa el valor
   - Selecciona **Production**, **Preview**, y **Development** según corresponda
   - Click en **Save**

## ✅ Verificación

Después de configurar las variables:

1. **Redeploy** el proyecto:
   - Ve a **Deployments**
   - Click en los tres puntos del último deployment
   - Selecciona **Redeploy**

2. **Verifica los logs** del deploy para asegurar que:
   - Prisma Client se genera correctamente
   - Las migraciones se ejecutan (`prisma migrate deploy`)
   - El build completa exitosamente

3. **Prueba los endpoints**:
   - `GET https://tienda.voxa.mx/api/health/db` → Debe retornar `{"ok":true,"count":N}`
   - `GET https://tienda.voxa.mx/api/auth/session` → No debe dar error 500

## 🔍 Diagnóstico de Errores

### Error 500 en `/api/auth/session`
**Causa probable**: Falta `NEXTAUTH_SECRET` o está mal configurado

**Solución**:
1. Verifica que `NEXTAUTH_SECRET` esté en Environment Variables de Vercel
2. Asegúrate de que tenga al menos 32 caracteres
3. Redeploy después de agregar/actualizar la variable

### Error de conexión a DB
**Causa probable**: `DATABASE_URL` incorrecta o faltante

**Solución**:
1. Verifica la connection string en Neon
2. Asegúrate de incluir `?sslmode=require` al final
3. Verifica que la contraseña sea correcta (no "REDACTED")

## 📌 Notas

- Las variables de entorno **NO** se actualizan en deployments existentes
- Siempre debes hacer **Redeploy** después de agregar/modificar variables
- Para producción, configura las variables para **Production** environment
- Puedes usar el mismo `NEXTAUTH_SECRET` para todas las environments o generar uno diferente para producción

