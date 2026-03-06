import type { PlanStatus } from '@/types'

const HISTORY_KEY = 'constor_history'
const MAX_ENTRIES = 20

export interface HistoryEntry {
  planId: string
  planName: string
  floor: string
  projectId: string
  projectName: string
  visitedAt: string // ISO 8601
  status: PlanStatus
}

export function savePlanVisit(entry: HistoryEntry): void {
  try {
    const current = getHistory()
    const filtered = current.filter((e) => e.planId !== entry.planId)
    const updated = [entry, ...filtered].slice(0, MAX_ENTRIES)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch {}
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) return JSON.parse(raw) as HistoryEntry[]
  } catch {}
  return []
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {}
}
