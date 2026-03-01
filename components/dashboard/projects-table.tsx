'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2,
  ChevronRight,
  FileText,
  Ruler,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types'

const statusConfig = {
  termine: {
    label: 'Terminé',
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
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    iconClass: 'text-amber-500',
  },
}

const corpsEtatLabel: Record<string, string> = {
  calorifuge: 'Calorifuge',
  flocage: 'Flocage',
  staff: 'Staff',
  mixte: 'Mixte',
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        config.className
      )}
    >
      <Icon className={cn('h-3 w-3', config.iconClass)} />
      {config.label}
    </span>
  )
}

export function ProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-[1fr_140px_100px_120px_100px_80px] gap-4 border-b border-slate-100 px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Projet</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Corps d'état</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plans</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Linéaires</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Statut</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Action</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Link href={`/analyse/${project.id}`}>
              <div className="group grid grid-cols-[1fr_140px_100px_120px_100px_80px] gap-4 items-center px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer">
                {/* Project name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                    <Building2 className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {project.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{project.client}</p>
                  </div>
                </div>

                {/* Corps d'état */}
                <div>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {corpsEtatLabel[project.corpsEtat]}
                  </span>
                </div>

                {/* Plans count */}
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {project.plansCount > 0 ? project.plansCount : '—'}
                  </span>
                </div>

                {/* Linear meters */}
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {project.totalLinear > 0
                      ? `${project.totalLinear.toLocaleString('fr-FR')} ml`
                      : '—'}
                  </span>
                </div>

                {/* Status */}
                <StatusBadge status={project.status} />

                {/* Action */}
                <div className="flex justify-end">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
