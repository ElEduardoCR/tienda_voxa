# Gestión de Roles de Usuario

Este documento explica cómo configurar y cambiar el rol de los usuarios en Tienda Voxa.

## 📋 Roles Disponibles

El sistema soporta dos roles:

- **`USER`**: Usuario estándar (por defecto)
  - Puede ver productos, agregar al carrito, gestionar su cuenta
  - No puede acceder a `/admin`

- **`ADMIN`**: Administrador
  - Todos los permisos de USER
  - Acceso a `/admin` y todas las rutas admin
  - Puede gestionar productos

## 🔹 Configuración Actual del Sistema

### Registro de Usuarios

Por defecto, **todos los usuarios se registran con rol `USER`**. Esto está definido en `app/api/registro/route.ts`:

```typescript
const user = await prisma.user.create({
  data: {
    email,
    passwordHash,
    name,
    role: "USER", // Siempre se crea como USER
    emailVerified: null,
  },
})
```

**Nota:** Por seguridad, no se permite cambiar el rol durante el registro.

---

## 🔧 Métodos para Cambiar el Rol

### Método 1: SQL Directo en Neon (Recomendado para ahora)

1. Ve a [Neon Dashboard](https://console.neon.tech)
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Ejecuta el siguiente SQL:

```sql
-- Cambiar un usuario específico a ADMIN por email
UPDATE "users"
SET "role" = 'ADMIN'
WHERE "email" = 'usuario@ejemplo.com';

-- Verificar el cambio
SELECT "id", "email", "name", "role" FROM "users" WHERE "email" = 'usuario@ejemplo.com';
```

**Archivo de referencia:** Ver `CAMBIAR_ROL_USUARIO.sql` para más ejemplos.

---

### Método 2: Prisma Studio (GUI)

1. Ejecuta Prisma Studio localmente:
```bash
npm run db:studio
```

2. Se abrirá en `http://localhost:5555`
3. Selecciona la tabla `users`
4. Busca el usuario que quieres cambiar
5. Edita el campo `role` de `USER` a `ADMIN`
6. Guarda los cambios

**Nota:** Prisma Studio requiere que tengas `DATABASE_URL` configurada en `.env.local`

---

### Método 3: Script Node.js (Para automatización)

Crea un archivo `scripts/cambiar-rol.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cambiarRol(email: string, nuevoRol: 'USER' | 'ADMIN') {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: nuevoRol },
    })
    console.log(`✅ Rol de ${email} cambiado a ${nuevoRol}`)
    console.log('Usuario:', user)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
cambiarRol('usuario@ejemplo.com', 'ADMIN')
```

Ejecuta con:
```bash
npx tsx scripts/cambiar-rol.ts
```

---

## 🔒 Seguridad

### Por qué no se permite cambiar rol en el registro

1. **Seguridad:** Prevenir que cualquiera se registre como ADMIN
2. **Control:** Solo administradores existentes deben poder promover usuarios
3. **Auditoría:** Los cambios de rol deben ser manuales y rastreables

### Recomendaciones

- ✅ Cambiar roles solo desde la base de datos directamente (más seguro)
- ✅ Documentar quién tiene rol ADMIN y por qué
- ✅ Revisar periódicamente qué usuarios tienen rol ADMIN
- ❌ No permitir que usuarios promuevan otros usuarios a ADMIN sin control
- ❌ No compartir credenciales de administradores

---

## 🚀 Futuras Mejoras (Opcional)

### API para Cambiar Roles (Solo ADMIN)

Se podría crear una API protegida para que administradores cambien roles desde la UI:

```typescript
// app/api/admin/usuarios/[id]/role/route.ts
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) return adminErrorResponse()

  const { role } = await request.json()
  if (!['USER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
  })

  return NextResponse.json(user)
}
```

### Página de Administración de Usuarios

Se podría crear `/admin/usuarios` para:
- Listar todos los usuarios
- Ver sus roles
- Cambiar roles con un botón
- Filtrar por rol

---

## 📝 Ejemplos de Uso

### Convertir el primer usuario registrado en ADMIN

```sql
-- Obtener el primer usuario (más antiguo)
UPDATE "users"
SET "role" = 'ADMIN'
WHERE "id" = (
  SELECT "id" FROM "users" 
  ORDER BY "created_at" ASC 
  LIMIT 1
);
```

### Convertir todos los usuarios de un dominio a ADMIN

```sql
UPDATE "users"
SET "role" = 'ADMIN'
WHERE "email" LIKE '%@voxa.mx';
```

### Revisar todos los usuarios ADMIN

```sql
SELECT "id", "email", "name", "role", "created_at"
FROM "users"
WHERE "role" = 'ADMIN'
ORDER BY "created_at" DESC;
```

### Demover un ADMIN a USER

```sql
UPDATE "users"
SET "role" = 'USER'
WHERE "email" = 'usuario@ejemplo.com';
```

---

## ✅ Checklist

Cuando cambies un rol:

- [ ] Verificar que el email/usuario es correcto
- [ ] Confirmar que el rol nuevo es válido (`USER` o `ADMIN`)
- [ ] Verificar el cambio con un SELECT
- [ ] Probar que el usuario puede (o no puede) acceder a `/admin`
- [ ] Documentar el cambio si es necesario

---

## 🆘 Problemas Comunes

### "No puedo acceder a /admin después de cambiar el rol"

1. **Verifica en la DB:** Ejecuta `SELECT role FROM users WHERE email = 'tu-email@ejemplo.com'`
2. **Cierra sesión y vuelve a iniciar:** El rol se lee de la sesión JWT
3. **Limpia cookies/localStorage:** A veces la sesión se cachea

### "El rol no se guarda"

- Verifica que estás usando comillas simples en SQL: `'ADMIN'` no `"ADMIN"` (para el valor)
- Asegúrate de ejecutar el UPDATE correctamente
- Verifica que no haya errores en la consola de Neon

### "Necesito ver todos los ADMIN"

```sql
SELECT "email", "name", "created_at" 
FROM "users" 
WHERE "role" = 'ADMIN';
```

---

## 📚 Referencias

- [Prisma - Update Records](https://www.prisma.io/docs/concepts/components/prisma-client/crud#update)
- [SQL UPDATE Syntax](https://www.postgresql.org/docs/current/sql-update.html)

