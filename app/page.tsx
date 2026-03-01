'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, ScanLine, Clock, Ruler, FolderOpen } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { MetricCard } from '@/components/dashboard/metric-card'
import { ProjectsTable } from '@/components/dashboard/projects-table'
import { Button } from '@/components/ui/button'
import { mockMetrics, mockProjects } from '@/lib/mock-data'

export default function DashboardPage() {
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
        <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Tableau de bord</h1>
              <p className="text-sm text-slate-400 capitalize">{date}</p>
            </div>
            <Link href="/analyse">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 text-white rounded-lg font-semibold text-sm px-4 py-2 h-9">
                <Plus className="h-4 w-4" />
                Nouvelle analyse
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Metrics band */}
          <section>
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                title="Plans analysés ce mois"
                value={mockMetrics.plansAnalysed}
                description="Mars 2026"
                icon={<ScanLine />}
                trend={18}
                color="blue"
              />
              <MetricCard
                title="Mètres linéaires extraits"
                value={mockMetrics.totalLinear}
                suffix="ml"
                description="Volume traité"
                icon={<Ruler />}
                trend={23}
                color="emerald"
              />
              <MetricCard
                title="Temps économisé"
                value={mockMetrics.timeSaved}
                suffix="h"
                description="vs métré manuel"
                icon={<Clock />}
                trend={12}
                color="amber"
              />
              <MetricCard
                title="Projets en cours"
                value={mockMetrics.activeProjects}
                description="Analyses actives"
                icon={<FolderOpen />}
                color="violet"
              />
            </div>
          </section>

          {/* ROI callout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-5 text-white shadow-lg shadow-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Ce mois-ci, Scalio vous a économisé</p>
                <p className="text-3xl font-bold mt-0.5">52 heures de métré manuel</p>
                <p className="text-sm text-blue-200 mt-1">
                  Soit 7 journées reinvesties dans votre développement commercial.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-6 text-right shrink-0">
                <div>
                  <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">Appels d&apos;offres</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <div className="h-8 w-px bg-blue-500" />
                <div>
                  <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">Économies</p>
                  <p className="text-2xl font-bold">2 600 €</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
            <div className="absolute -right-4 -bottom-8 h-28 w-28 rounded-full bg-white/5" />
          </motion.div>

          {/* Projects table */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Projets récents</h2>
                <p className="text-sm text-slate-400">{mockProjects.length} chantiers au total</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs font-medium text-slate-500 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                  Tous les statuts
                </button>
                <button className="text-xs font-medium text-slate-500 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                  Ce mois
                </button>
              </div>
            </div>
            <ProjectsTable projects={mockProjects} />
          </section>
        </div>
      </div>
    </AppShell>
  )
}
