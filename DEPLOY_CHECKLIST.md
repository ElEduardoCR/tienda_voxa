# Checklist de Deployment

## ✅ Pre-Deployment

- [ ] Repositorio Git inicializado y código commitado
- [ ] Variables de entorno configuradas localmente y funcionando
- [ ] Base de datos en Neon creada y migraciones ejecutadas
- [ ] Seed ejecutado (productos y usuarios de prueba creados)
- [ ] Aplicación funciona correctamente en local (`npm run dev`)

## ✅ Vercel Setup

- [ ] Cuenta en Vercel creada
- [ ] Proyecto creado en Vercel conectado al repositorio Git
- [ ] Variables de entorno configuradas en Vercel:
  - [ ] `DATABASE_URL` (connection string de Neon)
  - [ ] `NEXTAUTH_URL` → `https://tienda.voxa.mx`
  - [ ] `NEXTAUTH_SECRET` (secreto generado)
- [ ] Build exitoso en Vercel

## ✅ Base de Datos en Producción

- [ ] Migraciones ejecutadas en producción:
  ```bash
  DATABASE_URL="tu-url-de-produccion" npm run db:migrate
  ```
- [ ] Seed ejecutado en producción (opcional):
  ```bash
  DATABASE_URL="tu-url-de-produccion" npm run db:seed
  ```

## ✅ Dominio Personalizado

- [ ] Dominio `tienda.voxa.mx` agregado en Vercel (Settings → Domains)
- [ ] Registro DNS configurado en tu proveedor:
  - [ ] Tipo A o CNAME
  - [ ] Nombre: `tienda` (o `tienda.voxa.mx`)
  - [ ] Valor: [proporcionado por Vercel]
- [ ] Esperado 5-60 minutos para propagación DNS
- [ ] Dominio verificado en Vercel (debe aparecer como "Valid")

## ✅ Post-Deployment

- [ ] Sitio accesible en `https://tienda.voxa.mx`
- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Catálogo de productos visible
- [ ] Carrito funciona (localStorage)
- [ ] Rutas protegidas funcionan (`/cuenta`, `/admin`)
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs de Vercel

## 🔍 Testing

- [ ] Registrar nuevo usuario
- [ ] Iniciar sesión con usuario creado
- [ ] Iniciar sesión con usuario admin (admin@voxa.mx / admin123)
- [ ] Ver catálogo de productos
- [ ] Ver detalle de producto
- [ ] Agregar productos al carrito
- [ ] Ver carrito
- [ ] Acceder a `/cuenta` (debe requerir login)
- [ ] Acceder a `/admin` (debe requerir rol ADMIN)

## ⚠️ Problemas Comunes

Si encuentras problemas:

1. **Error de conexión a DB**: Verifica `DATABASE_URL` en Vercel
2. **Error de autenticación**: Verifica `NEXTAUTH_SECRET` y `NEXTAUTH_URL`
3. **404 en rutas**: Verifica que el build se completó exitosamente
4. **Dominio no funciona**: Verifica DNS y espera propagación

