/**
 * Convierte un string a slug: minúsculas, sin acentos, espacios a guiones
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos (acentos)
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Reemplaza caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, "") // Elimina guiones al inicio y final
}

/**
 * Genera un slug único agregando sufijo numérico si es necesario
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  // Verificar si el slug base ya existe
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

