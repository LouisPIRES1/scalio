'use client'

import { useState, useCallback } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { mockProjects } from '@/lib/mock-data'
import { ProjectsTable } from '@/components/dashboard/projects-table'
import type { StatusFilter } from '@/components/dashboard/projects-table'
import type { Project } from '@/types'

export default function ProjetsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')

  const handleRename = useCallback((id: string, newName: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)))
  }, [])

  const handleDelete = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const handleStatusChange = useCallback((id: string, status: Project['status']) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }, [])

  return (
    <AppShell>
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-900">Tous les projets</h1>
          <p className="text-sm text-slate-400">{projects.length} chantiers au total</p>
        </div>
        <ProjectsTable
          projects={projects}
          onRename={handleRename}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          showFilters
        />
      </div>
    </AppShell>
  )
}
