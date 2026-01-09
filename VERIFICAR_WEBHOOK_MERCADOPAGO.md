# 🔍 Guía para Verificar el Webhook de Mercado Pago

Esta guía te ayudará a verificar que el webhook de Mercado Pago está configurado correctamente y funcionando.

---

## 📋 Tabla de Contenidos

1. [Configuración del Webhook](#1-configuración-del-webhook)
2. [Verificar la URL del Webhook](#2-verificar-la-url-del-webhook)
3. [Probar el Webhook Manualmente](#3-probar-el-webhook-manualmente)
4. [Revisar los Logs](#4-revisar-los-logs)
5. [Solucionar Problemas](#5-solucionar-problemas)

---

## 1. Configuración del Webhook

### 1.1 URL del Webhook

El webhook debe estar configurado con la siguiente URL:

```
https://tu-dominio.vercel.app/api/checkout/webhook
```

**Reemplaza `tu-dominio.vercel.app` con tu dominio real** (por ejemplo: `tienda.voxa.mx`)

### 1.2 Configuración en Mercado Pago

1. **Inicia sesión en Mercado Pago**
   - Ve a: https://www.mercadopago.com.mx/developers/panel
   - Inicia sesión con tu cuenta

2. **Accede a la configuración de tu aplicación**
   - Selecciona tu aplicación
   - Ve a la sección **"Webhooks"** o **"Notificaciones IPN"**

3. **Configura el Webhook**
   - **URL del webhook**: `https://tu-dominio.vercel.app/api/checkout/webhook`
   - **Eventos a notificar**: Selecciona **"Pagos"** o **"payments"**
   - Guarda los cambios

### 1.3 Configuración Automática (Preferencia)

El webhook también se configura automáticamente cuando se crea una preferencia de pago. El código ya incluye:

```typescript
notification_url: `${baseUrl}/api/checkout/webhook`
```

Esto significa que cada vez que se crea un pago, Mercado Pago sabe dónde enviar las notificaciones.

---

## 2. Verificar la URL del Webhook

### 2.1 Verificar en el Código

Abre el archivo `app/api/checkout/create-preference/route.ts` y verifica que el `notification_url` está configurado correctamente:

```typescript
notification_url: `${baseUrl}/api/checkout/webhook`
```

### 2.2 Verificar Variables de Entorno

Asegúrate de que `NEXTAUTH_URL` esté configurado correctamente en Vercel:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Verifica que `NEXTAUTH_URL` esté configurado con tu dominio (ej: `https://tienda.voxa.mx`)

---

## 3. Probar el Webhook Manualmente

### 3.1 Usando la Herramienta de Mercado Pago

1. **En el panel de desarrolladores de Mercado Pago:**
   - Ve a **"Webhooks"** o **"Notificaciones IPN"**
   - Busca la opción **"Probar webhook"** o **"Test webhook"**
   - Ingresa el `payment_id` de un pago real
   - Haz clic en **"Enviar notificación"**

### 3.2 Usando cURL (Terminal)

Puedes simular una notificación de Mercado Pago usando cURL:

```bash
curl -X POST https://tu-dominio.vercel.app/api/checkout/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "TU_PAYMENT_ID_AQUI"
    }
  }'
```

**Nota**: Reemplaza `TU_PAYMENT_ID_AQUI` con un ID de pago real de Mercado Pago.

### 3.3 Probar con un Pago de Prueba

1. Realiza un pago de prueba en tu tienda
2. Usa las tarjetas de prueba de Mercado Pago:
   - **Aprobada**: `5031 7557 3453 0604`
   - **Rechazada**: `5031 4332 1540 6351`
3. Después del pago, verifica en los logs si se recibió la notificación

---

## 4. Revisar los Logs

### 4.1 Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Ve a la pestaña **"Logs"**
3. Busca mensajes que contengan:
   - `"Webhook recibido de Mercado Pago"`
   - `"Orden X actualizada"`
   - `"Error processing webhook"`

### 4.2 Logs Esperados

Si el webhook está funcionando correctamente, deberías ver logs como:

```
Webhook recibido de Mercado Pago: { type: 'payment', data: { id: '123456789' } }
Orden ORD-1234567890-ABC123 actualizada: approved
```

### 4.3 Logs de Error

Si hay problemas, verás logs como:

```
Error processing webhook: [detalles del error]
Orden X no encontrada
Payment ID missing
```

---

## 5. Solucionar Problemas

### 5.1 El Webhook No Se Ejecuta

**Problema**: No ves notificaciones en los logs después de un pago.

**Soluciones**:

1. **Verifica la URL del webhook en Mercado Pago**
   - Asegúrate de que la URL sea correcta
   - Verifica que no tenga espacios ni caracteres especiales

2. **Verifica que el endpoint esté accesible**
   - Abre en tu navegador: `https://tu-dominio.vercel.app/api/checkout/webhook`
   - Deberías recibir un error 405 (Method Not Allowed), lo cual es normal
   - Si recibes un 404, el endpoint no está configurado correctamente

3. **Verifica las variables de entorno**
   - Asegúrate de que `MERCADOPAGO_ACCESS_TOKEN` esté configurado
   - Verifica que `NEXTAUTH_URL` esté configurado correctamente

4. **Revisa el firewall de Vercel**
   - Asegúrate de que no haya reglas de firewall bloqueando las solicitudes de Mercado Pago

### 5.2 El Webhook Se Ejecuta Pero No Actualiza la Orden

**Problema**: Ves notificaciones en los logs pero las órdenes no se actualizan.

**Soluciones**:

1. **Verifica que el `external_reference` sea correcto**
   - El `external_reference` debe ser el `id` de la orden
   - Revisa en `create-preference/route.ts` que esté configurado:
     ```typescript
     external_reference: order.id
     ```

2. **Verifica los permisos de la base de datos**
   - Asegúrate de que Prisma pueda actualizar las órdenes
   - Verifica la conexión a la base de datos

3. **Revisa los logs de error**
   - Busca mensajes de error específicos en los logs
   - Verifica si hay problemas con la conexión a Mercado Pago

### 5.3 El Webhook Devuelve Errores 500

**Problema**: Mercado Pago recibe errores 500 al enviar notificaciones.

**Soluciones**:

1. **Verifica el código del webhook**
   - Asegúrate de que el archivo `app/api/checkout/webhook/route.ts` exista
   - Verifica que no haya errores de sintaxis

2. **Verifica las variables de entorno**
   - Asegúrate de que `MERCADOPAGO_ACCESS_TOKEN` esté configurado
   - Verifica que la base de datos esté accesible

3. **Revisa los logs de Vercel**
   - Busca el error específico que está causando el 500
   - Corrige el problema según el error

### 5.4 Mercado Pago Reintenta Enviar Notificaciones

**Comportamiento Normal**: Mercado Pago reintentará enviar notificaciones si no recibe una respuesta exitosa (200 OK).

**Qué Hacer**:

1. Asegúrate de que el webhook siempre devuelva `200 OK`
2. El código ya está configurado para devolver `200 OK` incluso si hay errores internos
3. Si ves múltiples intentos, verifica que el webhook esté funcionando correctamente

---

## 6. Verificación Final

### Checklist de Verificación

- [ ] El webhook está configurado en Mercado Pago con la URL correcta
- [ ] La URL del webhook es accesible públicamente
- [ ] Las variables de entorno están configuradas correctamente
- [ ] El endpoint del webhook existe y está funcionando
- [ ] Se reciben notificaciones en los logs después de un pago
- [ ] Las órdenes se actualizan correctamente después del webhook
- [ ] El stock se reduce cuando un pago es aprobado

### Prueba Completa

1. Realiza un pago de prueba con tarjeta aprobada
2. Verifica en los logs que se recibió la notificación
3. Verifica en la base de datos que la orden se actualizó a `status='approved'`
4. Verifica que el stock del producto se redujo correctamente
5. Verifica en el panel de admin que la orden aparece con estado "Aprobado"

---

## 7. Alternativa: Usar el Botón de Refrescar

Si el webhook no funciona correctamente, puedes usar el botón de "Verificar Pago" que está disponible tanto para usuarios como administradores. Este botón verifica manualmente el estado del pago con Mercado Pago.

**Ventajas del botón de refrescar**:
- ✅ No depende del webhook
- ✅ Verificación inmediata
- ✅ Disponible en cualquier momento

**Desventajas**:
- ❌ Requiere acción manual del usuario/admin
- ❌ No es automático

---

## 8. Recursos Adicionales

- **Documentación de Mercado Pago**: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
- **Panel de Desarrolladores**: https://www.mercadopago.com.mx/developers/panel
- **Logs de Vercel**: https://vercel.com/docs/monitoring/logs

---

## 📝 Notas Importantes

1. **El webhook puede tardar unos minutos en ejecutarse** después de un pago. Esto es normal.

2. **Mercado Pago reintentará enviar notificaciones** si no recibe una respuesta exitosa.

3. **El botón de "Verificar Pago" es un buen complemento** al webhook, pero no debería ser la única forma de actualizar las órdenes.

4. **En modo de prueba**, Mercado Pago también envía notificaciones. Asegúrate de estar usando el `ACCESS_TOKEN` correcto (test o producción).

---

## 🆘 Soporte

Si después de seguir esta guía sigues teniendo problemas, revisa:

1. Los logs de Vercel para errores específicos
2. El panel de desarrolladores de Mercado Pago para ver el estado de las notificaciones
3. La base de datos para verificar que las órdenes se están guardando correctamente

Para más ayuda, consulta la documentación oficial de Mercado Pago o abre un issue en el repositorio del proyecto.

