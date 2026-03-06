'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, ScanLine, Clock, Ruler, FolderOpen } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { MetricCard } from '@/components/dashboard/metric-card'
import { ProjectsTable } from '@/components/dashboard/projects-table'
import { Button } from '@/components/ui/button'
import { mockMetrics } from '@/lib/mock-data'
import { useAppContext } from '@/lib/app-context'
import type { StatusFilter } from '@/components/dashboard/projects-table'

export default function DashboardPage() {
  const { projects, renameProject, deleteProject, changeProjectStatus } = useAppContext()
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')

  const date = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <AppShell>
      <div className="min-h-full">
        {/* Page header */}
        <div
          className="sticky top-0 z-20 px-8 py-4 border-b"
          style={{
            background: 'rgba(245,247,250,0.92)',
            backdropFilter: 'blur(12px)',
            borderColor: '#E8ECF2',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#0D1117', letterSpacing: '-0.02em' }}>
                Tableau de bord
              </h1>
              <p className="label-xs mt-0.5 capitalize" style={{ color: '#9BA3B5' }}>{date}</p>
            </div>
            <Link href="/analyse">
              <Button
                className="gap-2 text-white font-semibold text-sm px-4 py-2 h-9 rounded-xl shadow-md transition-all btn-brand"
              >
                <Plus className="h-4 w-4" />
                Nouvelle analyse
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-8 py-7 space-y-8">

          {/* Metrics band */}
          <section>
            <div className="grid grid-cols-4 gap-4">
              {[
                { title: 'Plans analysés ce mois', value: mockMetrics.plansAnalysed, description: 'Mars 2026', icon: <ScanLine />, trend: 18, color: 'blue' as const },
                { title: 'Mètres linéaires extraits', value: mockMetrics.totalLinear, suffix: 'ml', description: 'Volume traité', icon: <Ruler />, trend: 23, color: 'emerald' as const },
                { title: 'Temps économisé', value: mockMetrics.timeSaved, suffix: 'h', description: 'vs métré manuel', icon: <Clock />, trend: 12, color: 'amber' as const },
                { title: 'Projets en cours', value: mockMetrics.activeProjects, description: 'Analyses actives', icon: <FolderOpen />, color: 'violet' as const },
              ].map((card, i) => (
                <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                  <MetricCard {...card} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* ROI callout */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, #203957 0%, #2D4F6A 40%, #4A7A93 100%)',
              boxShadow: '0 8px 32px rgba(32,57,87,0.30)',
            }}
          >
            {/* Decorative light line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 70%, transparent 100%)' }}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="label-xs mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Gain mensuel calculé
                </p>
                <p className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
                  52 heures de métré économisées
                </p>
                <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Soit 7 journées entières réinvesties dans votre développement commercial.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-8 shrink-0">
                <div className="text-right">
                  <p className="label-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Appels d&apos;offres</p>
                  <p className="font-data text-2xl font-medium text-white">23</p>
                </div>
                <div className="h-10 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="text-right">
                  <p className="label-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Économies</p>
                  <p className="font-data text-2xl font-medium text-white">2 600 €</p>
                </div>
              </div>
            </div>

            {/* Decorative orbs */}
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </motion.div>

          {/* Projects table */}
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-between mb-4"
            >
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0D1117', letterSpacing: '-0.02em' }}>
                  Projets récents
                </h2>
                <p className="label-xs mt-0.5" style={{ color: '#9BA3B5' }}>
                  {projects.length} chantiers au total
                </p>
              </div>
            </motion.div>

            <ProjectsTable
              projects={projects}
              onRename={renameProject}
              onDelete={deleteProject}
              onStatusChange={changeProjectStatus}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              showFilters
            />
          </section>
        </div>
      </div>
    </AppShell>
  )
}
