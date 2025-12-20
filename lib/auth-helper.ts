import { cookies, headers } from "next/headers"
import { getToken } from "next-auth/jwt"

export async function getServerSession() {
  try {
    const cookieStore = await cookies()
    const headersList = await headers()
    
    // Construir el string de cookies para el request
    const cookieString = cookieStore
      .getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Crear un request mock para getToken
    const req = {
      headers: {
        cookie: cookieString,
        ...Object.fromEntries(headersList.entries()),
      },
    } as any

    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return null
    }

    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string | null,
        role: token.role as string,
      },
      expires: new Date((token.exp as number) * 1000).toISOString(),
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}
