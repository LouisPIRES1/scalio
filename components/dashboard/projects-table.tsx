'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Building2,
  FileText,
  Ruler,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

export type StatusFilter = 'all' | Project['status']

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


function StatusBadge({ status }: { status: Project['status'] }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap', config.className)}>
      <Icon className={cn('h-3 w-3', config.iconClass)} />
      {config.label}
    </span>
  )
}

function StatusSelect({
  project,
  onStatusChange,
}: {
  project: Project
  onStatusChange: (id: string, status: Project['status']) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1 group/status focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <StatusBadge status={project.status} />
          <ChevronDown className="h-3 w-3 text-slate-300 opacity-0 group-hover/status:opacity-100 transition-opacity -ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40 rounded-xl border-slate-100 shadow-lg p-1">
        {(Object.keys(statusConfig) as Project['status'][]).map((s) => {
          const cfg = statusConfig[s]
          const Icon = cfg.icon
          return (
            <DropdownMenuItem
              key={s}
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(project.id, s)
              }}
              className={cn(
                'gap-2.5 text-sm cursor-pointer rounded-lg',
                s === project.status && 'bg-slate-50 font-semibold'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', cfg.iconClass)} />
              {cfg.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ProjectRowProps {
  project: Project
  index: number
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Project['status']) => void
}

function ProjectRow({ project, index, onRename, onDelete, onStatusChange }: ProjectRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(project.name)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleRenameStart = () => {
    setDraft(project.name)
    setEditing(true)
  }

  const handleRenameConfirm = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== project.name) onRename(project.id, trimmed)
    setEditing(false)
  }

  const handleRenameCancel = () => {
    setDraft(project.name)
    setEditing(false)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    handleRenameStart()
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8, transition: { duration: 0.2 } }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        onContextMenu={handleContextMenu}
        className="group grid grid-cols-[1fr_100px_120px_100px_48px] gap-4 items-center px-6 py-4 hover:bg-[#F5F7FA] transition-colors border-b border-[#E8ECF2]/60 last:border-0 cursor-default"
      >
        {/* Project name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 group-hover:bg-blue-50 transition-colors">
            <Building2 className="h-4 w-4 text-stone-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameConfirm()
                    if (e.key === 'Escape') handleRenameCancel()
                  }}
                  className="flex-1 min-w-0 text-sm font-semibold text-[#0D1117] border border-blue-400 rounded-md px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                />
                <button
                  onClick={handleRenameConfirm}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleRenameCancel}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link href={`/projets/${project.id}`}>
                <p className="text-sm font-semibold text-[#0D1117] truncate group-hover:text-blue-700 transition-colors">
                  {project.name}
                </p>
                <p className="text-xs text-stone-400 truncate">{project.client}</p>
              </Link>
            )}
          </div>
        </div>

        {/* Plans count */}
        <Link href={`/projets/${project.id}`} className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-stone-400" />
          <span className="font-data text-sm font-medium text-stone-700">
            {project.plansCount > 0 ? project.plansCount : '—'}
          </span>
        </Link>

        {/* Linear meters */}
        <Link href={`/projets/${project.id}`} className="flex items-center gap-1.5">
          <Ruler className="h-3.5 w-3.5 text-stone-400" />
          <span className="font-data text-sm font-medium text-stone-700">
            {project.totalLinear > 0 ? `${project.totalLinear.toLocaleString('fr-FR')} ml` : '—'}
          </span>
        </Link>

        {/* Status — clickable to change */}
        <div onClick={(e) => e.stopPropagation()}>
          <StatusSelect project={project} onStatusChange={onStatusChange} />
        </div>

        {/* Actions menu */}
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-300 hover:text-stone-700 hover:bg-stone-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-100 shadow-lg">
              <DropdownMenuItem
                onClick={handleRenameStart}
                className="gap-2.5 text-sm cursor-pointer rounded-lg"
              >
                <Pencil className="h-3.5 w-3.5 text-slate-400" />
                Renommer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDelete(true)}
                className="gap-2.5 text-sm text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 mb-3">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Supprimer ce projet ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">« {project.name} »</span> sera
            définitivement supprimé. Cette action est irréversible.
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1 h-9 rounded-lg border-slate-200 text-sm"
              onClick={() => setConfirmDelete(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm"
              onClick={() => {
                setConfirmDelete(false)
                onDelete(project.id)
              }}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ProjectsTableProps {
  projects: Project[]
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Project['status']) => void
  filterStatus?: StatusFilter
  onFilterChange?: (status: StatusFilter) => void
  showFilters?: boolean
}

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
  { value: 'en_attente', label: 'En attente' },
]

export function ProjectsTable({
  projects,
  onRename,
  onDelete,
  onStatusChange,
  filterStatus = 'all',
  onFilterChange,
  showFilters = false,
}: ProjectsTableProps) {
  const filtered = filterStatus === 'all'
    ? projects
    : projects.filter((p) => p.status === filterStatus)

  return (
    <div className="space-y-3">
      {showFilters && onFilterChange && (
        <div className="flex items-center gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={cn(
                'label-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap',
                filterStatus === opt.value
                  ? 'bg-[#2F54EB] text-white border-[#2F54EB] shadow-sm'
                  : 'text-slate-500 bg-white border-[#E8ECF2] hover:border-slate-300 hover:text-slate-700'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: '#E8ECF2', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}>
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_120px_100px_48px] gap-4 border-b px-6 py-3" style={{ borderColor: '#E8ECF2' }}>
          <span className="label-xs text-slate-400">Projet</span>
          <span className="label-xs text-slate-400">Plans</span>
          <span className="label-xs text-slate-400">Linéaires</span>
          <span className="label-xs text-slate-400">Statut</span>
          <span />
        </div>

        {/* Rows */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 mb-3">
                <Building2 className="h-5 w-5 text-stone-400" />
              </div>
              <p className="text-sm font-semibold text-stone-600">Aucun projet</p>
              <p className="text-xs text-stone-400 mt-1">
                {filterStatus === 'all'
                  ? 'Lancez votre première analyse pour créer un projet.'
                  : 'Aucun projet avec ce statut.'}
              </p>
            </motion.div>
          ) : (
            filtered.map((project, i) => (
              <ProjectRow
                key={project.id}
                project={project}
                index={i}
                onRename={onRename}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
