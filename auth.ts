import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Validar que el secret esté configurado
const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

if (!authSecret) {
  throw new Error(
    "NEXTAUTH_SECRET o AUTH_SECRET debe estar configurado en las variables de entorno"
  )
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: authSecret,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Import dinámico de Prisma para evitar ejecución en build-time
        const { prisma } = await import("@/lib/prisma")

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        // Verificar que el email esté verificado
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // role viene del usuario desde Prisma (tiene default "USER")
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        if (typeof token.role === "string") {
          session.user.role = token.role
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
})
