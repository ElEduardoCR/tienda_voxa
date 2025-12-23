/**
 * Genera el próximo SKU único empezando desde 100000
 * Formato: 6 dígitos (100000, 100001, etc.)
 */
export async function generateNextSKU(
  getMaxSKU: () => Promise<number | null>
): Promise<string> {
  const maxSKU = await getMaxSKU()

  if (maxSKU === null || maxSKU < 100000) {
    // Si no hay productos o el máximo es menor a 100000, empezar desde 100000
    return "100000"
  }

  // Generar siguiente SKU (máximo + 1)
  const nextSKU = maxSKU + 1

  // Asegurar que tenga exactamente 6 dígitos (rellenar con ceros a la izquierda si es necesario)
  const skuString = nextSKU.toString().padStart(6, "0")
  
  // Asegurar que no exceda 999999
  if (nextSKU > 999999) {
    throw new Error("Se ha alcanzado el límite máximo de SKUs (999999)")
  }

  return skuString
}
