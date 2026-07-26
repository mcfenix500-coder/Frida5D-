// Datos simulados para la plataforma Frida5D

export const CORPORATE_COMMISSION = 0.1 // 10% corporativo

export type Massage = {
  id: string
  name: string
  tagline: string
  duration: string
  priceMXN: number
  focus: string
}

export const massages: Massage[] = [
  {
    id: 'msg-obsidiana',
    name: 'Ritual Obsidiana',
    tagline: 'Piedras volcánicas y toque profundo',
    duration: '75 min',
    priceMXN: 1500,
    focus: 'Relajación profunda',
  },
  {
    id: 'msg-xochitl',
    name: 'Xóchitl Floral',
    tagline: 'Aromaterapia de cempasúchil y jazmín',
    duration: '80 min',
    priceMXN: 1750,
    focus: 'Equilibrio emocional',
  },
  {
    id: 'msg-quetzal',
    name: 'Vuelo Quetzal',
    tagline: 'Drenaje linfático y reflexología',
    duration: '90 min',
    priceMXN: 1950,
    focus: 'Desintoxicación',
  },
  {
    id: 'msg-5d',
    name: 'Inmersión 5D',
    tagline: 'Sonoterapia binaural + toque neuromodulado',
    duration: '110 min',
    priceMXN: 2200,
    focus: 'Experiencia total del alma',
  },
]

export type Therapist = {
  id: string
  name: string
  zone: string
  rating: number
  active: boolean
  monthMXN: number
  services: number
}

export const therapists: Therapist[] = [
  { id: 't1', name: 'Xicoténcatl Ruiz', zone: 'Cuadrante Norte', rating: 4.9, active: true, monthMXN: 38400, services: 21 },
  { id: 't2', name: 'Itzel Moreno', zone: 'Zona Turística Costera', rating: 4.8, active: true, monthMXN: 42500, services: 24 },
  { id: 't3', name: 'Rodrigo Palma', zone: 'Pueblo Mágico Tepoztlán', rating: 4.7, active: false, monthMXN: 19800, services: 11 },
  { id: 't4', name: 'Citlali Vega', zone: 'Cuadrante Centro', rating: 5.0, active: true, monthMXN: 51200, services: 29 },
]

export const geoOptions = {
  cuadrantes: ['Cuadrante Norte', 'Cuadrante Sur', 'Cuadrante Centro', 'Cuadrante Poniente'],
  turisticas: ['Zona Turística Costera', 'Corredor Hotelero', 'Malecón Digital', 'Distrito Spa'],
  pueblosMagicos: ['Tepoztlán', 'Valle de Bravo', 'San Miguel de Allende', 'Bacalar'],
}

export type ScanEvent = {
  id: string
  room: string
  type: 'NFC' | 'QR'
  therapist: string
  service: string
  status: 'En curso' | 'Completado' | 'Solicitado'
  amountMXN: number
  time: string
}

export const scanEvents: ScanEvent[] = [
  { id: 's1', room: 'Suite 1204', type: 'NFC', therapist: 'Citlali Vega', service: 'Inmersión 5D', status: 'En curso', amountMXN: 2200, time: '14:32' },
  { id: 's2', room: 'Hab. 812', type: 'QR', therapist: 'Itzel Moreno', service: 'Xóchitl Floral', status: 'Completado', amountMXN: 1750, time: '13:05' },
  { id: 's3', room: 'Cabaña Spa 03', type: 'NFC', therapist: 'Xicoténcatl Ruiz', service: 'Ritual Obsidiana', status: 'Completado', amountMXN: 1500, time: '11:48' },
  { id: 's4', room: 'Suite 1501', type: 'QR', therapist: 'Citlali Vega', service: 'Vuelo Quetzal', status: 'Solicitado', amountMXN: 1950, time: '15:10' },
  { id: 's5', room: 'Hab. 420', type: 'NFC', therapist: 'Rodrigo Palma', service: 'Ritual Obsidiana', status: 'Completado', amountMXN: 1500, time: '10:20' },
]

export const AFFILIATE_SHARE = 0.15 // 15% ganancias compartidas al negocio afiliado

// Ingresos por día (últimos 7 días) para el dashboard admin
export const revenueSeries = [
  { day: 'Lun', ingresos: 38200, servicios: 22 },
  { day: 'Mar', ingresos: 41500, servicios: 25 },
  { day: 'Mié', ingresos: 36900, servicios: 20 },
  { day: 'Jue', ingresos: 52400, servicios: 31 },
  { day: 'Vie', ingresos: 61800, servicios: 37 },
  { day: 'Sáb', ingresos: 74300, servicios: 44 },
  { day: 'Dom', ingresos: 58100, servicios: 33 },
]

// Mapa de calor: cuadrantes 4x4 con densidad de terapeutas activas (0-1)
export const heatmapCells = [
  0.2, 0.5, 0.8, 0.4,
  0.6, 0.95, 0.7, 0.3,
  0.4, 0.85, 0.6, 0.55,
  0.1, 0.35, 0.75, 0.9,
]

export function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)
}
