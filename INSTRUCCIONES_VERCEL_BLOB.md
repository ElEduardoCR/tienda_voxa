# Instrucciones para Configurar Vercel Blob Storage

Este documento contiene las instrucciones paso a paso para configurar Vercel Blob Storage y habilitar la subida de imágenes en la tienda.

## 📋 Prerrequisitos

- Proyecto desplegado en Vercel
- Acceso al Vercel Dashboard
- Permisos de administrador en el proyecto

## 🔧 Paso 1: Crear Vercel Blob Storage

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `tienda_voxa` (o el nombre de tu proyecto)
3. Ve a la pestaña **"Storage"** en el menú lateral
   - Si no ves "Storage", busca en el menú o ve a "Settings" → "Storage"
4. Si no tienes ningún storage creado:
   - Haz clic en **"Create Database"** o **"Add Storage"**
   - Selecciona **"Blob"** como tipo de storage
   - Dale un nombre (ej: "tienda-images" o simplemente "blob")
   - Haz clic en **"Create"** o **"Add"**
5. Espera a que se cree el storage (puede tomar unos segundos)

## 🔑 Paso 2: Obtener Token de Acceso

1. Una vez creado el Blob Storage, haz clic en él para abrirlo
2. Ve a la pestaña **"Settings"** del storage
3. Busca la sección **"Tokens"** o **"Access Tokens"**
4. Haz clic en **"Create Token"** o **"Generate New Token"**
5. Configura el token:
   - **Name:** Dale un nombre descriptivo (ej: "tienda-upload" o "product-images")
   - **Permissions:** Selecciona **"Read and Write"** (necesitas ambos para subir y leer)
   - **Expiration:** Opcional, déjalo vacío para que no expire
6. Haz clic en **"Create"** o **"Generate"**
7. **IMPORTANTE:** Copia el token inmediatamente (formato: `vercel_blob_rw_xxxxx...`)
   - ⚠️ **No podrás verlo de nuevo después de cerrar esta ventana**

## ⚙️ Paso 3: Configurar Variable de Entorno en Vercel

1. En Vercel Dashboard, ve a tu proyecto
2. Ve a **"Settings"** → **"Environment Variables"**
3. Haz clic en **"Add New"** o **"Add Variable"**
4. Completa el formulario:
   - **Key:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** Pega el token que copiaste en el paso anterior
   - **Environment:** Selecciona:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (opcional, pero recomendado para testing local)
5. Haz clic en **"Save"**

## 🖥️ Paso 4: Configurar Variable Local (Opcional para Desarrollo)

Si quieres probar la subida de imágenes en tu entorno local:

1. En la raíz del proyecto, abre o crea el archivo `.env.local`
2. Agrega la siguiente línea:
   ```env
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx..."
   ```
3. Reemplaza `vercel_blob_rw_xxxxx...` con el token que copiaste
4. Guarda el archivo
5. Reinicia tu servidor de desarrollo (`npm run dev`)

**Nota:** Esta variable es opcional para desarrollo local. Si no la configuras, la subida de imágenes solo funcionará en producción.

## 🚀 Paso 5: Redeploy

Después de configurar las variables de entorno, necesitas hacer un nuevo deploy:

### Opción A: Deploy Automático (Recomendado)
1. Haz commit y push de tus cambios al repositorio
2. Vercel automáticamente detectará los cambios y hará un nuevo deploy
3. Espera a que el deploy termine

### Opción B: Deploy Manual
1. En Vercel Dashboard, ve a tu proyecto
2. Ve a la pestaña **"Deployments"**
3. Haz clic en los tres puntos (⋯) del último deployment
4. Selecciona **"Redeploy"**
5. Confirma el redeploy

## ✅ Verificación

Para verificar que todo está configurado correctamente:

1. Ve a tu sitio en producción (o local si configuraste `.env.local`)
2. Inicia sesión como administrador
3. Ve a **"Admin"** → **"Gestión de Productos"** → **"Nuevo Producto"**
4. Intenta subir una imagen:
   - Haz clic en el área de "Haz clic para subir imágenes"
   - Selecciona una imagen (HEIC, PNG, JPEG, JPG)
   - La imagen debería subirse y mostrarse en el preview
5. Si funciona, ¡todo está configurado correctamente! 🎉

## ❌ Solución de Problemas

### Error: "BLOB_READ_WRITE_TOKEN no está configurado"
- **Causa:** La variable de entorno no está configurada
- **Solución:** Verifica que agregaste `BLOB_READ_WRITE_TOKEN` en Vercel Environment Variables y que hiciste redeploy

### Error: "Error al subir imagen"
- **Causa:** Token inválido o permisos incorrectos
- **Solución:** 
  - Verifica que el token tiene permisos "Read and Write"
  - Genera un nuevo token si es necesario
  - Asegúrate de copiar el token completo sin espacios

### Las imágenes no se muestran después de subirlas
- **Causa:** Problema con el dominio en `next.config.js` o imagen muy grande
- **Solución:**
  - Verifica que `next.config.js` incluye `*.public.blob.vercel-storage.com` en `remotePatterns`
  - Asegúrate de que las imágenes no exceden 5MB

### Error 403 al subir imágenes
- **Causa:** El usuario no es administrador
- **Solución:** Verifica que estás logueado como usuario con rol `ADMIN`

## 📝 Notas Adicionales

- **Límites del Plan Gratuito:** Vercel Blob ofrece 1GB de almacenamiento gratis. Después, $0.15/GB al mes.
- **Formato HEIC:** Las imágenes HEIC se almacenarán correctamente, pero algunos navegadores (Chrome/Firefox en Windows/Linux) pueden no mostrarlas. Safari y Chrome en macOS/iOS las soportan bien.
- **Tamaño Máximo:** El sistema limita las imágenes a 5MB por archivo. Si necesitas más, puedes ajustarlo en `app/api/admin/upload/route.ts` cambiando `MAX_FILE_SIZE`.
- **CDN:** Las imágenes se sirven automáticamente desde el CDN global de Vercel, por lo que se cargarán rápido desde cualquier ubicación.

## 🔗 Referencias

- [Vercel Blob Storage Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

