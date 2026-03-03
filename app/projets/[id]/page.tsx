'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Ruler,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  ChevronRight,
  Building2,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { mockProjects, mockPlans } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Plan, Project } from '@/types'

const statusConfig = {
  termine: {
    label: 'Analysé',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconClass: 'text-emerald-500',
  },
  en_cours: {
    label: 'En cours',
    icon: Circle,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    iconClass: 'text-blue-500',
  },
  en_attente: {
    label: 'En attente',
    icon: AlertCircle,
    className: 'bg-slate-50 text-slate-500 border-slate-200',
    iconClass: 'text-slate-400',
  },
}

const projectStatusConfig = {
  termine: { label: 'Terminé', className: 'bg-emerald-50 text-emerald-700' },
  en_cours: { label: 'En cours', className: 'bg-blue-50 text-blue-700' },
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700' },
}


function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const cfg = statusConfig[plan.status]
  const Icon = cfg.icon
  return (
    <Link href={`/analyse/${plan.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="group relative flex flex-col gap-3 rounded-xl border bg-white p-4 transition-all border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 cursor-pointer"
      >
        {/* Icon + name */}
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
            <FileText className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors mt-0.5" />
        </div>

        {/* Plan name */}
        <div>
          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
            {plan.name}
          </p>
          {plan.totalLinear > 0 && (
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Ruler className="h-3 w-3" />
              {plan.totalLinear.toLocaleString('fr-FR')} ml
            </p>
          )}
        </div>

        {/* Status badge */}
        <span className={cn(
          'inline-flex items-center gap-1.5 self-start rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
          cfg.className
        )}>
          <Icon className={cn('h-3 w-3', cfg.iconClass)} />
          {cfg.label}
        </span>
      </motion.div>
    </Link>
  )
}

interface FloorGroupProps {
  floor: string
  plans: Plan[]
  groupIndex: number
}

function FloorGroup({ floor, plans, groupIndex }: FloorGroupProps) {
  const doneCount = plans.filter((p) => p.status === 'termine').length

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: groupIndex * 0.06 }}
      className="flex gap-6"
    >
      {/* Floor / section label */}
      <div className="w-44 shrink-0 pt-1">
        <p className="text-sm font-bold text-slate-800">{floor}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {doneCount}/{plans.length} analysé{plans.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Plan cards */}
      <div className="flex flex-wrap gap-3 flex-1">
        {plans.map((plan, i) => (
          <div key={plan.id} className="w-36">
            <PlanCard plan={plan} index={i} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = mockProjects.find((p) => p.id === id)
  const plans = mockPlans.filter((p) => p.projectId === id)

  // Group plans by floor, sorted by floorOrder
  const floorGroups = useMemo(() => {
    const map = new Map<string, { plans: Plan[]; order: number }>()
    for (const plan of plans) {
      if (!map.has(plan.floor)) {
        map.set(plan.floor, { plans: [], order: plan.floorOrder })
      }
      map.get(plan.floor)!.plans.push(plan)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].order - b[1].order)
      .map(([floor, { plans }]) => ({ floor, plans }))
  }, [plans])

  const analyzedCount = plans.filter((p) => p.status === 'termine').length
  const totalLinear = plans.reduce((sum, p) => sum + p.totalLinear, 0)

  if (!project) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-400">Projet introuvable.</p>
        </div>
      </AppShell>
    )
  }

  const projStatusCfg = projectStatusConfig[project.status]

  return (
    <AppShell>
      <div className="min-h-full">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/projets">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </Link>
              <div className="h-5 w-px bg-slate-200" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900">{project.name}</h1>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', projStatusCfg.className)}>
                    {projStatusCfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{project.client}</p>
              </div>
            </div>

            <Link href="/analyse">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm shadow-blue-200 transition-colors">
                <Plus className="h-4 w-4" />
                Ajouter un plan
              </button>
            </Link>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Plans total</p>
              <p className="text-2xl font-bold text-slate-900">{plans.length}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Plans analysés</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-slate-900">{analyzedCount}</p>
                <p className="text-sm text-slate-400 mb-0.5">/ {plans.length}</p>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all"
                  style={{ width: plans.length > 0 ? `${(analyzedCount / plans.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Métrés extraits</p>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold text-slate-900">{totalLinear.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-slate-400 mb-0.5">ml</p>
              </div>
            </div>
          </div>

          {/* Plans by floor */}
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-3">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Aucun plan pour ce projet</p>
              <p className="text-xs text-slate-400 mt-1">Ajoutez un premier plan pour commencer l&apos;analyse.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-1">Plans par étage</h2>
                <p className="text-xs text-slate-400">Cliquez sur un plan analysé pour ouvrir l&apos;espace de travail</p>
              </div>

              <div className="space-y-5">
                {floorGroups.map((group, i) => (
                  <div key={group.floor}>
                    {i > 0 && <div className="border-t border-slate-100 mb-5" />}
                    <FloorGroup floor={group.floor} plans={group.plans} groupIndex={i} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
