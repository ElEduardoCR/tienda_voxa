"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ShoppingCart } from "lucide-react"

interface Product {
  id: string
  sku: string
  name: string
  price: number
  image: string
}

interface AddToCartButtonProps {
  product: Product
  disabled?: boolean
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    
    // Obtener carrito actual de localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(
      (item: any) => item.id === product.id
    )

    if (existingItemIndex >= 0) {
      // Si existe, incrementar cantidad
      cart[existingItemIndex].quantity += 1
    } else {
      // Si no existe, agregar nuevo item
      cart.push({
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
    }

    // Guardar en localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Feedback visual
    setTimeout(() => {
      setIsAdding(false)
      // Opcional: mostrar notificación toast
    }, 300)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className="w-full"
      size="lg"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {isAdding ? "Agregando..." : "Agregar al Carrito"}
    </Button>
  )
}

