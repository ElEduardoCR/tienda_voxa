"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, FolderTree } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  parentId: string | null
  isActive: boolean
  parent?: Category | null
  children: Category[]
  productCount: number
}

export default function AdminCategoriasPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categorias")
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error("Error al cargar categorías")
      }
      const data = await response.json()
      // Filtrar solo categorías principales para el grid
      const principales = data.filter((cat: Category) => !cat.parentId)
      setCategories(principales)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres desactivar esta categoría? Esto también desactivará sus subcategorías.")) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/categorias/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar categoría")
      }

      await fetchCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar categoría")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando categorías...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Gestión de Categorías</h1>
          <p className="text-muted-foreground">
            Administra las categorías y subcategorías de la tienda
          </p>
        </div>
        <Link href="/admin/categorias/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay categorías registradas
            </p>
            <Link href="/admin/categorias/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Categoría
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="flex flex-col relative">
              {!category.isActive && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary">Inactiva</Badge>
                </div>
              )}
              <div className="relative w-full h-48 bg-muted">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sin imagen
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {category.productCount} producto{category.productCount !== 1 ? "s" : ""}
                  </p>
                  {category.children && category.children.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {category.children.length} subcategoría{category.children.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/admin/categorias/${category.id}/editar`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Desactivar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

