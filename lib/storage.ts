import type { Project, Plan } from '@/types'
import { mockProjects, mockPlans } from './mock-data'

const PROJECTS_KEY = 'constor_projects'
const PLANS_KEY = 'constor_plans'

export function loadProjects(): Project[] {
  try {
    // One-time migration from old brand keys
    if (!localStorage.getItem(PROJECTS_KEY) && localStorage.getItem('scalio_projects')) {
      localStorage.setItem(PROJECTS_KEY, localStorage.getItem('scalio_projects')!)
      localStorage.removeItem('scalio_projects')
    }
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (raw) return JSON.parse(raw) as Project[]
  } catch {}
  return mockProjects
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  } catch {}
}

export function loadPlans(): Plan[] {
  try {
    // One-time migration from old brand keys
    if (!localStorage.getItem(PLANS_KEY) && localStorage.getItem('scalio_plans')) {
      localStorage.setItem(PLANS_KEY, localStorage.getItem('scalio_plans')!)
      localStorage.removeItem('scalio_plans')
    }
    const raw = localStorage.getItem(PLANS_KEY)
    if (raw) return JSON.parse(raw) as Plan[]
  } catch {}
  return mockPlans
}

export function savePlans(plans: Plan[]): void {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
  } catch {}
}
