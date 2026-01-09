"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, MapPin, Check } from "lucide-react"
import { estadosMexico, getCiudadesPorEstado, getEstadoName } from "@/lib/mexico-data"

interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
}

interface DeliveryAddress {
  id: string
  name: string
  recipient: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function CuentaPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para formulario de dirección
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    recipient: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  })
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchUser() {
    try {
      const response = await fetch("/api/cuenta")
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }
        throw new Error("Error al cargar datos del usuario")
      }
      const data = await response.json()
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  async function fetchAddresses() {
    try {
      const response = await fetch("/api/user/addresses")
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
      }
    } catch (err) {
      console.error("Error cargando direcciones:", err)
    }
  }

  const handleOpenForm = (address?: DeliveryAddress) => {
    if (address) {
      setEditingAddress(address)
      // Buscar el estado ID basado en el nombre almacenado en DB
      const estadoEncontrado = estadosMexico.find(e => e.name === address.state || e.id === address.state)
      const estadoId = estadoEncontrado?.id || ""
      const ciudades = estadoId ? getCiudadesPorEstado(estadoId) : []
      
      setFormData({
        name: address.name,
        recipient: address.recipient,
        street: address.street,
        city: address.city,
        state: estadoId,
        postalCode: address.postalCode,
        phone: address.phone || "",
        isDefault: address.isDefault,
      })
      setCiudadesDisponibles(ciudades)
    } else {
      setEditingAddress(null)
      setFormData({
        name: "",
        recipient: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
        isDefault: addresses.length === 0, // Primera dirección es predeterminada
      })
      setCiudadesDisponibles([])
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAddress(null)
    setFormData({
      name: "",
      recipient: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    })
    setCiudadesDisponibles([])
  }

  const handleEstadoChange = (estadoId: string) => {
    const ciudades = getCiudadesPorEstado(estadoId)
    setFormData({
      ...formData,
      state: estadoId,
      city: "", // Resetear ciudad al cambiar estado
    })
    setCiudadesDisponibles(ciudades)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editingAddress
        ? `/api/user/addresses/${editingAddress.id}`
        : "/api/user/addresses"
      
      const method = editingAddress ? "PUT" : "POST"

      // Convertir estado ID a nombre para guardar
      const estadoName = getEstadoName(formData.state)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          state: estadoName,
          postalCode: formData.postalCode,
          phone: formData.phone || null,
          country: "México", // Siempre México por defecto
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar dirección")
      }

      await fetchAddresses()
      handleCloseForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta dirección?")) {
      return
    }

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar dirección")
      }

      await fetchAddresses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const handleToggleDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar dirección predeterminada")
      }

      await fetchAddresses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-destructive">
          {error || "Error al cargar datos"}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mi Cuenta</h1>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Datos de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="text-lg font-semibold">{user.name || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de registro</p>
              <p className="text-lg font-semibold">
                {new Date(user.createdAt).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>Historial de tus compras</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              La integración con Odoo estará disponible próximamente.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Direcciones de Entrega */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Direcciones de Entrega</CardTitle>
              <CardDescription>
                Gestiona tus direcciones de envío (máximo 5)
              </CardDescription>
            </div>
            <Button
              onClick={() => handleOpenForm()}
              disabled={addresses.length >= 5}
              style={{ backgroundColor: '#014495', color: 'white' }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Dirección
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No tienes direcciones guardadas
              </p>
              <Button
                onClick={() => handleOpenForm()}
                style={{ backgroundColor: '#014495', color: 'white' }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primera Dirección
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border rounded-lg p-4 space-y-2 relative"
                >
                  {address.isDefault && (
                    <Badge className="absolute top-2 right-2" style={{ backgroundColor: '#014495', color: 'white' }}>
                      <Check className="mr-1 h-3 w-3" />
                      Predeterminada
                    </Badge>
                  )}
                  <div className="pr-20">
                    <h3 className="font-semibold text-lg">{address.name}</h3>
                    <p className="text-sm text-muted-foreground">{address.recipient}</p>
                    <p className="text-sm mt-2">
                      {address.street}
                      <br />
                      {address.city}, {address.state} {address.postalCode}
                      <br />
                      {address.country}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Tel: {address.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleDefault(address.id)}
                        className="flex-1"
                      >
                        Usar como predeterminada
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenForm(address)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {addresses.length >= 5 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Has alcanzado el límite de 5 direcciones. Elimina una para agregar otra.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal/Formulario de Dirección */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingAddress ? "Editar Dirección" : "Nueva Dirección"}
              </CardTitle>
              <CardDescription>
                {editingAddress
                  ? "Modifica los datos de tu dirección"
                  : "Agrega una nueva dirección de entrega"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la dirección *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Casa, Oficina"
                      required
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient">Nombre del destinatario *</Label>
                    <Input
                      id="recipient"
                      value={formData.recipient}
                      onChange={(e) =>
                        setFormData({ ...formData, recipient: e.target.value })
                      }
                      placeholder="Nombre completo"
                      required
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Calle y número *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    placeholder="Calle, número, colonia"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleEstadoChange(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecciona un estado</option>
                      {estadosMexico.map((estado) => (
                        <option key={estado.id} value={estado.id}>
                          {estado.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                      disabled={!formData.state || ciudadesDisponibles.length === 0}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        {!formData.state
                          ? "Primero selecciona un estado"
                          : ciudadesDisponibles.length === 0
                          ? "No hay ciudades disponibles"
                          : "Selecciona una ciudad"}
                      </option>
                      {ciudadesDisponibles.map((ciudad) => (
                        <option key={ciudad} value={ciudad}>
                          {ciudad}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    placeholder="00000"
                    required
                    minLength={5}
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="10 dígitos"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Usar como dirección predeterminada
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                    style={{ backgroundColor: '#014495', color: 'white' }}
                  >
                    {saving ? "Guardando..." : editingAddress ? "Actualizar" : "Guardar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
