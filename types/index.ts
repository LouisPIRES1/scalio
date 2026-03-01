export type CorpsEtat = 'calorifuge' | 'flocage' | 'staff' | 'mixte'

export type NetworkType =
  | 'eau_chaude'
  | 'eau_froide'
  | 'flocage'
  | 'gaine_soufflage'
  | 'gaine_reprise'
  | 'ventilateurs'

export type ProjectStatus = 'termine' | 'en_cours' | 'en_attente'

export interface NetworkLineItem {
  id: string
  label: string
  quantity: number
  elbows?: number
  unit: 'ml' | 'u' | 'm2'
  isEdited?: boolean
  originalQuantity?: number
  isManual?: boolean
}

export interface NetworkGroup {
  id: string
  type: NetworkType
  isSelected: boolean
  confidence: number
  items: NetworkLineItem[]
  bbox: { x: number; y: number; width: number; height: number }
}

export interface Project {
  id: string
  name: string
  client: string
  status: ProjectStatus
  lastAnalysisAt: string
  plansCount: number
  totalLinear: number
  corpsEtat: CorpsEtat
}

export interface MonthlyMetrics {
  plansAnalysed: number
  totalLinear: number
  timeSaved: number
  activeProjects: number
}

export const NETWORK_META: Record<
  NetworkType,
  { label: string; color: string; bgColor: string; borderColor: string; textColor: string; dotColor: string }
> = {
  eau_chaude: {
    label: 'Eau Chaude',
    color: '#EF4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
  },
  eau_froide: {
    label: 'Eau Froide',
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  flocage: {
    label: 'Flocage',
    color: '#6B7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-500',
  },
  gaine_soufflage: {
    label: 'Gaine Soufflage',
    color: '#10B981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  gaine_reprise: {
    label: 'Gaine Reprise',
    color: '#EC4899',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    dotColor: 'bg-pink-500',
  },
  ventilateurs: {
    label: 'Ventilateurs',
    color: '#8B5CF6',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-700',
    dotColor: 'bg-violet-500',
  },
}
