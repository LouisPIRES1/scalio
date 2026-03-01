import type { NetworkGroup, Project, MonthlyMetrics } from '@/types'

export const mockMetrics: MonthlyMetrics = {
  plansAnalysed: 23,
  totalLinear: 847,
  timeSaved: 52,
  activeProjects: 4,
}

export const mockProjects: Project[] = [
  {
    id: 'gare-du-nord',
    name: 'Rénovation Gare du Nord',
    client: 'VINCI Construction',
    status: 'en_cours',
    lastAnalysisAt: 'il y a 2 jours',
    plansCount: 14,
    totalLinear: 847,
    corpsEtat: 'calorifuge',
  },
  {
    id: 'hopital-lariboisiere',
    name: 'Extension Hôpital Lariboisière',
    client: 'AP-HP',
    status: 'termine',
    lastAnalysisAt: 'il y a 5 jours',
    plansCount: 28,
    totalLinear: 1423,
    corpsEtat: 'flocage',
  },
  {
    id: 'tour-montparnasse',
    name: 'Réhabilitation Tour Montparnasse',
    client: 'Altarea Cogedim',
    status: 'en_cours',
    lastAnalysisAt: 'il y a 1 jour',
    plansCount: 6,
    totalLinear: 312,
    corpsEtat: 'mixte',
  },
  {
    id: 'usine-saint-nazaire',
    name: 'Usine Naval Groupe St-Nazaire',
    client: 'Naval Groupe',
    status: 'en_attente',
    lastAnalysisAt: 'il y a 8 jours',
    plansCount: 0,
    totalLinear: 0,
    corpsEtat: 'calorifuge',
  },
  {
    id: 'metro-ligne-15',
    name: 'Grand Paris Express — Ligne 15',
    client: 'Société du Grand Paris',
    status: 'termine',
    lastAnalysisAt: 'il y a 12 jours',
    plansCount: 42,
    totalLinear: 2840,
    corpsEtat: 'calorifuge',
  },
  {
    id: 'data-center-saclay',
    name: 'Data Center Paris-Saclay',
    client: 'Equinix France',
    status: 'en_cours',
    lastAnalysisAt: "aujourd'hui",
    plansCount: 9,
    totalLinear: 498,
    corpsEtat: 'mixte',
  },
]

export const mockNetworkGroups: NetworkGroup[] = [
  {
    id: 'ec',
    type: 'eau_chaude',
    isSelected: false,
    confidence: 0.94,
    items: [
      { id: 'ec-1', label: 'DN 25', quantity: 47.2, elbows: 11, unit: 'ml' },
      { id: 'ec-2', label: 'DN 40', quantity: 31.5, elbows: 5, unit: 'ml' },
      { id: 'ec-3', label: 'DN 50', quantity: 18.3, elbows: 4, unit: 'ml' },
    ],
    bbox: { x: 0.04, y: 0.04, width: 0.66, height: 0.78 },
  },
  {
    id: 'ef',
    type: 'eau_froide',
    isSelected: false,
    confidence: 0.91,
    items: [
      { id: 'ef-1', label: 'DN 25', quantity: 47.2, elbows: 8, unit: 'ml' },
      { id: 'ef-2', label: 'DN 40', quantity: 31.5, elbows: 5, unit: 'ml' },
    ],
    bbox: { x: 0.06, y: 0.06, width: 0.62, height: 0.74 },
  },
  {
    id: 'flocage',
    type: 'flocage',
    isSelected: false,
    confidence: 0.87,
    items: [
      { id: 'fl-1', label: 'DN 50', quantity: 34.2, elbows: 7, unit: 'ml' },
      { id: 'fl-2', label: 'DN 80', quantity: 21.0, elbows: 3, unit: 'ml' },
    ],
    bbox: { x: 0.30, y: 0.04, width: 0.14, height: 0.82 },
  },
  {
    id: 'gs',
    type: 'gaine_soufflage',
    isSelected: false,
    confidence: 0.96,
    items: [
      { id: 'gs-1', label: '400×300', quantity: 22.8, elbows: 3, unit: 'ml' },
      { id: 'gs-2', label: '600×400', quantity: 14.2, elbows: 2, unit: 'ml' },
    ],
    bbox: { x: 0.38, y: 0.04, width: 0.58, height: 0.36 },
  },
  {
    id: 'gr',
    type: 'gaine_reprise',
    isSelected: false,
    confidence: 0.89,
    items: [
      { id: 'gr-1', label: '500×350', quantity: 17.4, elbows: 2, unit: 'ml' },
    ],
    bbox: { x: 0.38, y: 0.42, width: 0.58, height: 0.36 },
  },
  {
    id: 'ventilos',
    type: 'ventilateurs',
    isSelected: false,
    confidence: 0.99,
    items: [
      { id: 'v-1', label: 'Unité', quantity: 4, unit: 'u' },
    ],
    bbox: { x: 0.68, y: 0.62, width: 0.28, height: 0.26 },
  },
]

export const PROCESSING_STEPS = [
  { label: 'Conversion du PDF en images haute résolution', duration: 800 },
  { label: "Détection de l'échelle dans le cartouche", duration: 600 },
  { label: "Analyse Computer Vision — réseaux EC/EF", duration: 1200 },
  { label: "Détection des gaines et systèmes CVC", duration: 1000 },
  { label: 'Comptage des équipements et ventilateurs', duration: 700 },
  { label: 'Calcul des métrés linéaires par diamètre', duration: 500 },
  { label: 'Génération du rapport de confiance', duration: 400 },
]
