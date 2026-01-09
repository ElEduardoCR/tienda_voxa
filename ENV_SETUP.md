# Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Database - Connection string de Neon PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secreto-seguro-aqui-minimo-32-caracteres"
```

## Instrucciones Detalladas

### DATABASE_URL

1. Ve a [Neon](https://neon.tech) y crea o selecciona tu proyecto
2. En el dashboard, copia la **Connection String**
3. Debe tener el formato: `postgresql://user:password@host/dbname?sslmode=require`
4. Pégalo directamente en `.env` como valor de `DATABASE_URL`

### NEXTAUTH_URL

- **Desarrollo local**: `http://localhost:3000`
- **Producción**: `https://tienda.voxa.mx` (tu dominio)

### NEXTAUTH_SECRET

Genera un secreto seguro (mínimo 32 caracteres):

**En Mac/Linux:**
```bash
openssl rand -base64 32
```

**En Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**O usa un generador online:**
- https://generate-secret.vercel.app/32

Copia el resultado y úsalo como valor de `NEXTAUTH_SECRET`.

## Variables para Vercel (Producción)

Las mismas variables deben configurarse en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las tres variables:
   - `DATABASE_URL` (la misma de Neon)
   - `NEXTAUTH_URL` → `https://tienda.voxa.mx`
   - `NEXTAUTH_SECRET` (puede ser el mismo o generar uno nuevo para producción)


