'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Project, Plan } from '@/types'
import { mockProjects, mockPlans } from './mock-data'
import { loadProjects, saveProjects, loadPlans, savePlans } from './storage'

interface AppContextValue {
  // State
  projects: Project[]
  plans: Plan[]

  // Project mutations
  createProject: (name: string, client: string, status: Project['status']) => Project
  deleteProject: (id: string) => void
  renameProject: (id: string, newName: string) => void
  changeProjectStatus: (id: string, status: Project['status']) => void

  // Plan mutations
  createPlan: (plan: Omit<Plan, 'id'>) => Plan
  deletePlan: (id: string) => void
  deletePlansByProject: (projectId: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  // SSR-safe defaults — match server render to avoid hydration mismatch
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [plans, setPlans] = useState<Plan[]>(mockPlans)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setProjects(loadProjects())
    setPlans(loadPlans())
    setHydrated(true)
  }, [])

  // Auto-save after hydration only (prevents overwriting on initial render)
  useEffect(() => {
    if (!hydrated) return
    saveProjects(projects)
  }, [projects, hydrated])

  useEffect(() => {
    if (!hydrated) return
    savePlans(plans)
  }, [plans, hydrated])

  // ── Project mutations ──────────────────────────────────────────────────────

  const createProject = useCallback((name: string, client: string, status: Project['status']): Project => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      client,
      status,
      lastAnalysisAt: new Date().toISOString(),
      plansCount: 0,
      totalLinear: 0,
    }
    setProjects((prev) => [newProject, ...prev])
    return newProject
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    // Clean up associated plans
    setPlans((prev) => prev.filter((p) => p.projectId !== id))
  }, [])

  const renameProject = useCallback((id: string, newName: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)))
  }, [])

  const changeProjectStatus = useCallback((id: string, status: Project['status']) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }, [])

  // ── Plan mutations ─────────────────────────────────────────────────────────

  const createPlan = useCallback((planData: Omit<Plan, 'id'>): Plan => {
    const newPlan: Plan = { id: `plan-${Date.now()}`, ...planData }
    setPlans((prev) => [newPlan, ...prev])
    return newPlan
  }, [])

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const deletePlansByProject = useCallback((projectId: string) => {
    setPlans((prev) => prev.filter((p) => p.projectId !== projectId))
  }, [])

  return (
    <AppContext.Provider value={{
      projects, plans,
      createProject, deleteProject, renameProject, changeProjectStatus,
      createPlan, deletePlan, deletePlansByProject,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
