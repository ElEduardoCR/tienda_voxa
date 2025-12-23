# Variables de Entorno - Tienda Voxa

Este documento lista todas las variables de entorno necesarias para que la aplicación funcione correctamente.

## 📋 Variables Requeridas

### 🔹 Base de Datos (PostgreSQL - Neon)

```env
DATABASE_URL="postgresql://usuario:password@host/dbname?sslmode=require"
```

**Descripción:** Connection string de tu base de datos PostgreSQL en Neon.

**Cómo obtenerla:**
1. Ve a [Neon Dashboard](https://console.neon.tech)
2. Selecciona tu proyecto
3. Ve a "Connection Details"
4. Copia la "Connection String" (formato: `postgresql://usuario:password@host/dbname?sslmode=require`)

**Ejemplo:**
```env
DATABASE_URL="postgresql://neondb_owner:abc123@ep-wild-field-ad64gyqv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

### 🔹 Autenticación (NextAuth)

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secreto-seguro-aqui-minimo-32-caracteres"
```

**Descripción:**
- `NEXTAUTH_URL`: URL base de tu aplicación
  - **Local:** `http://localhost:3000`
  - **Producción (Vercel):** `https://tienda.voxa.mx`
- `NEXTAUTH_SECRET`: Secret seguro para firmar tokens JWT (mínimo 32 caracteres)

**Cómo generar NEXTAUTH_SECRET:**

En macOS/Linux:
```bash
openssl rand -base64 32
```

En Windows (PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

O usa cualquier generador de strings aleatorios online (mínimo 32 caracteres).

**Nota:** También puedes usar `AUTH_SECRET` en lugar de `NEXTAUTH_SECRET` (ambos son aceptados).

---

### 🔹 Email (Gmail SMTP con Nodemailer)

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-contraseña-de-aplicacion-de-gmail"
EMAIL_FROM="tu-email@gmail.com"
```

---

### 🔹 Almacenamiento de Imágenes (Vercel Blob Storage)

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx..."
```

**Descripción:** Token de acceso para subir imágenes a Vercel Blob Storage.

**Cómo obtenerla:**
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la pestaña **"Storage"** (o busca "Blob" en el menú)
4. Si no existe, haz clic en **"Create Database"** o **"Add Storage"**
5. Selecciona **"Blob"** como tipo de storage
6. Una vez creado, ve a **"Settings"** del storage
7. Busca la sección **"Tokens"** o **"Access Tokens"**
8. Haz clic en **"Create Token"**
9. Nómbralo (ej: "tienda-upload")
10. Selecciona permisos: **"Read and Write"**
11. Copia el token generado (formato: `vercel_blob_rw_xxxxx...`)

**Nota:** Este token es necesario para que los administradores puedan subir imágenes de productos desde el panel de administración.

**Descripción:**
- `SMTP_HOST`: Servidor SMTP (Gmail: `smtp.gmail.com`)
- `SMTP_PORT`: Puerto SMTP (Gmail: `587` para TLS)
- `SMTP_SECURE`: Usar SSL/TLS (`false` para TLS, `true` para SSL puerto 465)
- `SMTP_USER`: Tu email de Gmail completo
- `SMTP_PASSWORD`: **Contraseña de aplicación** de Gmail (NO tu contraseña normal)
- `EMAIL_FROM`: Email desde el que se envían los correos (puede ser igual a `SMTP_USER`)

**Cómo configurar contraseña de aplicación en Gmail:**

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Ve a "Seguridad"
3. Habilita "Verificación en 2 pasos" (si no la tienes activada)
4. Ve a "Contraseñas de aplicaciones" (o busca "App Passwords")
5. Selecciona "Correo" y "Otro (nombre personalizado)"
6. Escribe "Tienda Voxa" o cualquier nombre
7. Copia la contraseña de 16 caracteres generada
8. Usa esta contraseña en `SMTP_PASSWORD`

**Importante:** NO uses tu contraseña normal de Gmail. Debes usar una "Contraseña de aplicación".

---

## 📝 Archivo .env.local (Desarrollo Local)

Crea un archivo `.env.local` en la raíz del proyecto con todas las variables:

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:password@host/dbname?sslmode=require"

# Autenticación
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-generado-aqui"

# Email (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-contraseña-de-aplicacion"
EMAIL_FROM="tu-email@gmail.com"

# Almacenamiento de Imágenes (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx..."
```

---

## ☁️ Variables en Vercel (Producción)

Para configurar las variables en Vercel:

### Opción 1: Desde el Dashboard

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a "Settings" → "Environment Variables"
3. Agrega cada variable una por una:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
   - Environment: `Production`, `Preview`, `Development` (selecciona todas o solo Production)
4. Repite para todas las variables

### Opción 2: Desde Vercel CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Linkear proyecto (si no está linkeado)
vercel link

# Agregar variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_SECURE production
vercel env add SMTP_USER production
vercel env add SMTP_PASSWORD production
vercel env add EMAIL_FROM production
```

**Nota:** En producción, `NEXTAUTH_URL` debe ser `https://tienda.voxa.mx` (tu dominio real).

---

## ✅ Checklist de Variables

Asegúrate de tener configuradas todas estas variables:

### Desarrollo Local (.env.local)
- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_URL` = `http://localhost:3000`
- [ ] `NEXTAUTH_SECRET`
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_SECURE`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASSWORD`
- [ ] `EMAIL_FROM`
- [ ] `BLOB_READ_WRITE_TOKEN` (opcional para desarrollo local)

### Producción (Vercel)
- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_URL` = `https://tienda.voxa.mx`
- [ ] `NEXTAUTH_SECRET`
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_SECURE`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASSWORD`
- [ ] `EMAIL_FROM`
- [ ] `BLOB_READ_WRITE_TOKEN`

---

## 🔍 Verificar Variables

Para verificar que las variables estén correctamente configuradas:

### Local
```bash
# Las variables de .env.local se cargan automáticamente
npm run dev
```

### Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Ve a "Settings" → "Environment Variables"
3. Verifica que todas las variables estén presentes
4. Asegúrate de que `NEXTAUTH_URL` en producción sea `https://tienda.voxa.mx`

---

## 🆘 Problemas Comunes

### Error: "NEXTAUTH_SECRET o AUTH_SECRET debe estar configurado"
- **Solución:** Agrega `NEXTAUTH_SECRET` o `AUTH_SECRET` en tus variables de entorno

### Error: "Failed to connect to database"
- **Solución:** Verifica que `DATABASE_URL` esté correcta y que tu base de datos Neon esté activa

### Error: "Invalid login" al enviar emails
- **Solución:** Asegúrate de usar una **Contraseña de aplicación** de Gmail, no tu contraseña normal

### Emails no se envían en producción
- **Solución:** Verifica que todas las variables de email estén configuradas en Vercel (Production environment)

---

## 📚 Referencias

- [NextAuth.js - Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)
- [Nodemailer - Gmail Setup](https://nodemailer.com/usage/using-gmail/)
- [Neon - Connection Strings](https://neon.tech/docs/connect/connect-from-any-app)
- [Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

