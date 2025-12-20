# Configuración de Email (Gmail con SMTP)

Este proyecto usa **Nodemailer** con **SMTP** para enviar emails de verificación y recuperación de contraseña usando Gmail.

## 📧 Configuración con Gmail

### Paso 1: Habilitar Verificación en 2 Pasos

1. Ve a tu cuenta de Google: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Busca **"Verificación en 2 pasos"**
3. Actívala si no está activada
4. Sigue las instrucciones para configurarla (puede requerir tu número de teléfono)

### Paso 2: Generar Contraseña de Aplicación

1. Ve a: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Si te pide verificar tu identidad, ingresa tu contraseña de Google
3. En "Seleccionar app", elige **"Correo"**
4. En "Seleccionar dispositivo", elige **"Otra (nombre personalizado)"**
5. Escribe: `Tienda Voxa`
6. Click en **"Generar"**
7. **Copia la contraseña de 16 caracteres** que aparece (formato: `abcd efgh ijkl mnop`)
   - ⚠️ **Importante**: Esta contraseña solo se muestra una vez. Guárdala en un lugar seguro.

### Paso 3: Configurar Variables de Entorno

Crea o actualiza tu archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="tu-connection-string-de-neon"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aqui"

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=tu-email@gmail.com
```

**Ejemplo completo:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=micorreo@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=micorreo@gmail.com
```

### Paso 4: Configurar en Vercel (Producción)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables (mismas que en `.env.local`):
   - `SMTP_HOST` → `smtp.gmail.com`
   - `SMTP_PORT` → `587`
   - `SMTP_SECURE` → `false`
   - `SMTP_USER` → `tu-email@gmail.com`
   - `SMTP_PASSWORD` → `tu-contraseña-de-aplicación`
   - `EMAIL_FROM` → `tu-email@gmail.com`
5. Selecciona **Production** (y Preview/Development si aplica)
6. Click en **Save**
7. **Redeploy** el proyecto

## 📨 Tipos de Emails Enviados

### 1. Verificación de Email
- **Cuándo**: Al registrarse un nuevo usuario
- **Destino**: Email del usuario registrado
- **Expiración**: 24 horas
- **Endpoint**: `/api/auth/verificar`

### 2. Reenvío de Verificación
- **Cuándo**: Usuario solicita nuevo enlace de verificación
- **Destino**: Email del usuario
- **Expiración**: 24 horas
- **Endpoint**: `/api/auth/reenviar-verificacion`
- **Rate Limit**: 3 solicitudes por hora por email

### 3. Recuperación de Contraseña
- **Cuándo**: Usuario olvida su contraseña
- **Destino**: Email del usuario
- **Expiración**: 1 hora
- **Endpoint**: `/api/auth/reset`
- **Rate Limit**: 3 solicitudes por hora por email

## 🧪 Probar Localmente

1. Configura las variables en `.env.local` (ver Paso 3)
2. Inicia el servidor:
   ```bash
   npm run dev
   ```
3. Registra un usuario con tu email real
4. Revisa tu bandeja de entrada (y spam)
5. Haz click en el enlace de verificación

## ✅ Verificación

Después de configurar:

1. **Local**: 
   ```bash
   npm run dev
   ```
   - Registra un usuario
   - Revisa tu email (puede estar en spam inicialmente)

2. **Producción**:
   - Verifica que todas las variables SMTP estén en Vercel
   - Registra un usuario en producción
   - Revisa tu email

## 🔍 Solución de Problemas

### Error: "Invalid login"
- Verifica que `SMTP_USER` sea tu email completo de Gmail
- Verifica que `SMTP_PASSWORD` sea la contraseña de aplicación (16 caracteres con espacios)
- Asegúrate de haber habilitado la verificación en 2 pasos antes de generar la contraseña de aplicación

### Error: "Connection timeout"
- Verifica que `SMTP_PORT` sea `587` (no `465`)
- Verifica que `SMTP_SECURE` sea `false` (para puerto 587)
- Verifica tu conexión a internet

### Emails no llegan
- Revisa la carpeta de **spam** en Gmail
- Verifica que el email de destino sea válido
- Revisa los logs del servidor para ver si hay errores
- Verifica que las variables de entorno estén correctamente configuradas

### Error: "Less secure app access"
- **No necesitas** habilitar "Acceso de aplicaciones menos seguras"
- Usa **Contraseñas de aplicación** (App Passwords) en su lugar
- Si ves este error, significa que estás usando tu contraseña normal en lugar de una contraseña de aplicación

## 📝 Notas Importantes

- **Contraseña de aplicación vs contraseña normal**: 
  - ❌ NO uses tu contraseña normal de Gmail
  - ✅ Usa una contraseña de aplicación generada específicamente
  
- **Límites de Gmail**:
  - Gmail permite hasta 500 emails por día con cuenta gratuita
  - Para producción con muchos usuarios, considera usar un servicio de email transaccional (SendGrid, Mailgun, etc.)

- **Seguridad**:
  - Nunca subas `.env.local` a git
  - Las contraseñas de aplicación son específicas por aplicación, puedes generar múltiples

## 🔄 Cambiar a Otro Proveedor SMTP

Si quieres usar otro proveedor (Outlook, SendGrid, etc.), solo cambia las variables:

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@outlook.com
SMTP_PASSWORD=tu-contraseña
EMAIL_FROM=tu-email@outlook.com
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=tu-api-key-de-sendgrid
EMAIL_FROM=tu-email-verificado@sendgrid.com
```

## 📚 Referencias

- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
