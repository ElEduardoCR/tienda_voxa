// Estados y ciudades de México
export const estadosMexico = [
  { id: "AGU", name: "Aguascalientes" },
  { id: "BCN", name: "Baja California" },
  { id: "BCS", name: "Baja California Sur" },
  { id: "CAM", name: "Campeche" },
  { id: "CHP", name: "Chiapas" },
  { id: "CHH", name: "Chihuahua" },
  { id: "COA", name: "Coahuila" },
  { id: "COL", name: "Colima" },
  { id: "DIF", name: "Ciudad de México" },
  { id: "DUR", name: "Durango" },
  { id: "GUA", name: "Guanajuato" },
  { id: "GRO", name: "Guerrero" },
  { id: "HID", name: "Hidalgo" },
  { id: "JAL", name: "Jalisco" },
  { id: "MEX", name: "Estado de México" },
  { id: "MIC", name: "Michoacán" },
  { id: "MOR", name: "Morelos" },
  { id: "NAY", name: "Nayarit" },
  { id: "NLE", name: "Nuevo León" },
  { id: "OAX", name: "Oaxaca" },
  { id: "PUE", name: "Puebla" },
  { id: "QUE", name: "Querétaro" },
  { id: "ROO", name: "Quintana Roo" },
  { id: "SLP", name: "San Luis Potosí" },
  { id: "SIN", name: "Sinaloa" },
  { id: "SON", name: "Sonora" },
  { id: "TAB", name: "Tabasco" },
  { id: "TAM", name: "Tamaulipas" },
  { id: "TLA", name: "Tlaxcala" },
  { id: "VER", name: "Veracruz" },
  { id: "YUC", name: "Yucatán" },
  { id: "ZAC", name: "Zacatecas" },
]

export const ciudadesPorEstado: Record<string, string[]> = {
  AGU: ["Aguascalientes", "Asientos", "Calvillo", "Cosío", "Jesús María", "Pabellón de Arteaga", "Rincón de Romos", "San Francisco de los Romo", "San José de Gracia", "Tepezalá"],
  BCN: ["Tijuana", "Mexicali", "Ensenada", "Rosarito", "Tecate", "Playas de Rosarito"],
  BCS: ["La Paz", "Los Cabos", "Comondú", "Loreto", "Mulegé"],
  CAM: ["Campeche", "Ciudad del Carmen", "Champotón", "Escárcega", "Palizada"],
  CHP: ["Tuxtla Gutiérrez", "Tapachula", "San Cristóbal de las Casas", "Palenque", "Comitán", "Chiapa de Corzo", "Villahermosa"],
  CHH: ["Chihuahua", "Ciudad Juárez", "Delicias", "Cuauhtémoc", "Parral", "Nuevo Casas Grandes"],
  COA: ["Saltillo", "Torreón", "Monclova", "Piedras Negras", "Ramos Arizpe", "Sabinas"],
  COL: ["Colima", "Manzanillo", "Villa de Álvarez", "Tecomán", "Cuauhtémoc"],
  DIF: ["Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa", "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "Magdalena Contreras", "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"],
  DUR: ["Durango", "Gómez Palacio", "Lerdo", "Victoria de Durango"],
  GUA: ["León", "Irapuato", "Celaya", "Salamanca", "Guanajuato", "Silao", "San Miguel de Allende", "Dolores Hidalgo"],
  GRO: ["Acapulco", "Chilpancingo", "Iguala", "Taxco", "Zihuatanejo", "Pie de la Cuesta"],
  HID: ["Pachuca", "Tulancingo", "Tizayuca", "Mineral del Monte"],
  JAL: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta", "Tepatitlán", "Lagos de Moreno", "Ocotlán", "Chapala"],
  MEX: ["Toluca", "Naucalpan", "Ecatepec", "Nezahualcóyotl", "Tlalnepantla", "Cuautitlán", "Chimalhuacán", "Ixtapaluca", "Los Reyes", "Texcoco", "Huixquilucan"],
  MIC: ["Morelia", "Uruapan", "Zamora", "Lázaro Cárdenas", "Pátzcuaro", "Apatzingán"],
  MOR: ["Cuernavaca", "Cuautla", "Jiutepec", "Temixco", "Yautepec"],
  NAY: ["Tepic", "Bahía de Banderas", "Santiago Ixcuintla"],
  NLE: ["Monterrey", "San Pedro Garza García", "Guadalupe", "Apodaca", "San Nicolás de los Garza", "Santa Catarina", "Escobedo"],
  OAX: ["Oaxaca", "Salina Cruz", "Tuxtepec", "Puerto Escondido", "Huatulco", "Juchitán"],
  PUE: ["Puebla", "Cholula", "Tehuacán", "San Martín Texmelucan", "Atlixco"],
  QUE: ["Querétaro", "San Juan del Río", "Corregidora", "El Marqués"],
  ROO: ["Cancún", "Playa del Carmen", "Chetumal", "Tulum", "Cozumel", "Felipe Carrillo Puerto"],
  SLP: ["San Luis Potosí", "Soledad", "Ciudad Valles", "Matehuala"],
  SIN: ["Culiacán", "Mazatlán", "Los Mochis", "Guamúchil", "Navolato"],
  SON: ["Hermosillo", "Ciudad Obregón", "Nogales", "San Luis Río Colorado", "Puerto Peñasco", "Navojoa"],
  TAB: ["Villahermosa", "Cárdenas", "Comalcalco", "Paraíso"],
  TAM: ["Reynosa", "Matamoros", "Tampico", "Ciudad Victoria", "Nuevo Laredo", "Altamira"],
  TLA: ["Tlaxcala", "Apizaco", "Chiautempan", "Huamantla"],
  VER: ["Veracruz", "Xalapa", "Coatzacoalcos", "Poza Rica", "Córdoba", "Orizaba", "Minatitlán"],
  YUC: ["Mérida", "Valladolid", "Progreso", "Kanasín", "Motul"],
  ZAC: ["Zacatecas", "Fresnillo", "Guadalupe", "Jerez"],
}

// Obtener ciudades por estado ID
export function getCiudadesPorEstado(estadoId: string): string[] {
  return ciudadesPorEstado[estadoId] || []
}

// Obtener nombre del estado por ID
export function getEstadoName(estadoId: string): string {
  const estado = estadosMexico.find(e => e.id === estadoId)
  return estado?.name || estadoId
}

