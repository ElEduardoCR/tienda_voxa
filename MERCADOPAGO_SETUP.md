# Configuración de Mercado Pago

## Variables de Entorno Necesarias

Agrega las siguientes variables de entorno en Vercel:

```env
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_mercado_pago
```

## Pasos para Configurar Mercado Pago

### 1. Crear una aplicación en Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.mx/developers)
2. Inicia sesión con tu cuenta de Mercado Pago
3. Ve a "Tus integraciones" > "Crear aplicación"
4. Elige el tipo de aplicación según tus necesidades
5. Copia el **Access Token** (Token de producción o de prueba)

### 2. Configurar el Webhook

1. En la configuración de tu aplicación de Mercado Pago
2. Ve a "Webhooks" o "Notificaciones"
3. Agrega la URL del webhook:
   ```
   https://tu-dominio.com/api/checkout/webhook
   ```
   Ejemplo:
   ```
   https://tienda.voxa.mx/api/checkout/webhook
   ```

### 3. Modo de Prueba vs Producción

#### Modo de Prueba (Test)
- Usa el **Access Token de prueba**
- Los pagos no son reales
- Puedes probar con tarjetas de prueba:
  - Visa: 4509 9535 6623 3704
  - Mastercard: 5031 7557 3453 0604
  - CVV: 123
  - Fecha: Cualquier fecha futura
  - Nombre: Cualquier nombre

#### Modo de Producción
- Usa el **Access Token de producción**
- Los pagos son reales
- Requiere verificación de cuenta

### 4. Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega:
   - **Name**: `MERCADOPAGO_ACCESS_TOKEN`
   - **Value**: Tu Access Token (sin comillas)
   - **Environment**: Production, Preview, Development

### 5. Verificar la Configuración

Una vez configurado, puedes verificar:
- Los logs en Vercel deberían mostrar las respuestas de Mercado Pago
- El webhook debería recibir notificaciones cuando se complete un pago
- Las órdenes se actualizarán automáticamente según el estado del pago

## Flujo de Pago

1. **Usuario en Checkout**: Selecciona productos y dirección de entrega
2. **Crear Preferencia**: Se crea una preferencia en Mercado Pago con los productos
3. **Redirección**: Usuario es redirigido a la página segura de Mercado Pago
4. **Pago**: Usuario completa el pago en Mercado Pago
5. **Retorno**: Usuario es redirigido de vuelta según el resultado:
   - `/checkout/success` - Pago aprobado
   - `/checkout/failure` - Pago rechazado
   - `/checkout/pending` - Pago pendiente
6. **Webhook**: Mercado Pago envía notificación al servidor
7. **Actualización**: El webhook actualiza el estado de la orden y reduce stock

## Seguridad

- ✅ **No almacenamos datos de tarjetas**: Todo el procesamiento es en Mercado Pago
- ✅ **HTTPS obligatorio**: Mercado Pago solo funciona con HTTPS
- ✅ **Webhook seguro**: Verificamos las notificaciones de Mercado Pago
- ✅ **Validación de stock**: Verificamos stock antes de crear la orden

## Troubleshooting

### Error: "Access Token no válido"
- Verifica que el token esté correcto en las variables de entorno
- Asegúrate de estar usando el token correcto (test vs producción)

### Error: "Webhook no recibido"
- Verifica que la URL del webhook sea accesible públicamente
- Asegúrate de que la URL use HTTPS
- Revisa los logs en Mercado Pago Developers

### Error: "Orden no encontrada"
- Verifica que el `external_reference` se esté pasando correctamente
- Revisa los logs del webhook para ver qué datos se están recibiendo

## Recursos

- [Documentación Mercado Pago](https://www.mercadopago.com.mx/developers/es/docs)
- [Checkout Pro](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/integration-configuration/integrate-checkout-pro)
- [Webhooks](https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks)

