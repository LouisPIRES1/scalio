'use client'
import { AppShell } from '@/components/layout/app-shell'
import { mockProjects } from '@/lib/mock-data'
import { ProjectsTable } from '@/components/dashboard/projects-table'

export default function ProjetsPage() {
  return (
    <AppShell>
      <div className="px-8 py-6">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Tous les projets</h1>
        <ProjectsTable projects={mockProjects} />
      </div>
    </AppShell>
  )
}
