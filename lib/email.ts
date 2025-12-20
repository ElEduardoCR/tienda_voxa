import nodemailer from "nodemailer"

const APP_URL = process.env.NEXTAUTH_URL || "https://tienda.voxa.mx"

// Configurar transporter de SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const EMAIL_FROM = process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@voxa.mx"

/**
 * Envía email de verificación de cuenta
 */
export async function sendVerificationEmail(
  email: string,
  name: string | null,
  token: string
) {
  const verificationUrl = `${APP_URL}/auth/verificar?token=${token}`

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "Verifica tu correo electrónico - Tienda Voxa",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu correo</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; font-size: 28px; margin: 0;">VOXA</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Tienda en línea</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000; margin-top: 0;">¡Bienvenido${name ? ` ${name}` : ""}!</h2>
            <p>Gracias por registrarte en Tienda Voxa. Para completar tu registro, necesitamos verificar tu dirección de correo electrónico.</p>
            <p>Haz clic en el botón siguiente para verificar tu cuenta:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar correo</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${verificationUrl}</p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;"><strong>Importante:</strong> Este enlace expirará en 24 horas.</p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
            <p>Si no creaste una cuenta en Tienda Voxa, puedes ignorar este correo.</p>
            <p>&copy; ${new Date().getFullYear()} Tienda Voxa. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error("Error enviando email de verificación:", error)
    throw error
  }
}

/**
 * Envía email para reenvío de verificación
 */
export async function resendVerificationEmail(
  email: string,
  name: string | null,
  token: string
) {
  const verificationUrl = `${APP_URL}/auth/verificar?token=${token}`

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "Nuevo enlace de verificación - Tienda Voxa",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu correo</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; font-size: 28px; margin: 0;">VOXA</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Tienda en línea</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000; margin-top: 0;">Nuevo enlace de verificación</h2>
            <p>Hemos recibido tu solicitud para un nuevo enlace de verificación.</p>
            <p>Haz clic en el botón siguiente para verificar tu cuenta:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar correo</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${verificationUrl}</p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;"><strong>Importante:</strong> Este enlace expirará en 24 horas.</p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
            <p>Si no solicitaste este enlace, puedes ignorar este correo.</p>
            <p>&copy; ${new Date().getFullYear()} Tienda Voxa. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error("Error enviando email de reenvío:", error)
    throw error
  }
}

/**
 * Envía email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  token: string
) {
  const resetUrl = `${APP_URL}/auth/reset?token=${token}`

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "Recupera tu contraseña - Tienda Voxa",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperar contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; font-size: 28px; margin: 0;">VOXA</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Tienda en línea</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000; margin-top: 0;">Recuperación de contraseña</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta${name ? ` ${name}` : ""}.</p>
            <p>Haz clic en el botón siguiente para crear una nueva contraseña:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer contraseña</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${resetUrl}</p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;"><strong>Importante:</strong> Este enlace expirará en 1 hora.</p>
            <p style="font-size: 14px; color: #d32f2f; margin-top: 15px;"><strong>¿No solicitaste este cambio?</strong> Si no fuiste tú, puedes ignorar este correo de forma segura. Tu contraseña no será cambiada.</p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
            <p>&copy; ${new Date().getFullYear()} Tienda Voxa. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error("Error enviando email de recuperación:", error)
    throw error
  }
}
