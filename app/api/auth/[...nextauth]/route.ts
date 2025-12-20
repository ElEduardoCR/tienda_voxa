import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export async function GET(
  request: Request,
  { params }: { params: { nextauth: string[] } }
) {
  return handler(request, { params })
}

export async function POST(
  request: Request,
  { params }: { params: { nextauth: string[] } }
) {
  return handler(request, { params })
}
