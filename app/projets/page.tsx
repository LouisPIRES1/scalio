'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Building2, ChevronDown } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { ProjectsTable } from '@/components/dashboard/projects-table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/lib/app-context'
import type { StatusFilter } from '@/components/dashboard/projects-table'
import type { Project } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: Project['status']; label: string; desc: string }[] = [
  { value: 'en_attente', label: 'En attente',  desc: 'Analyse pas encore démarrée' },
  { value: 'en_cours',   label: 'En cours',    desc: 'Analyse en progression'       },
  { value: 'termine',    label: 'Terminé',      desc: 'Tous les plans analysés'      },
]

function NewProjectDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, client: string, status: Project['status']) => void
}) {
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [status, setStatus] = useState<Project['status']>('en_attente')
  const [statusOpen, setStatusOpen] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => nameRef.current?.focus(), 80)
  }, [open])

  const canSubmit = name.trim() && client.trim()

  const handleSubmit = () => {
    if (!canSubmit) return
    onCreate(name.trim(), client.trim(), status)
    setName('')
    setClient('')
    setStatus('en_attente')
    onClose()
  }

  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status)!

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 rounded-t-2xl bg-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 mb-3">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <DialogTitle className="text-base font-bold text-slate-900">
            Nouveau projet
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-0.5">
            Renseignez les informations de base. Vous pourrez ajouter les plans ensuite.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Project name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Nom du projet <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              placeholder="ex : Rénovation Gare du Nord"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#689AAF]/30 focus:border-[#689AAF] transition-colors"
            />
          </div>

          {/* Client */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Client <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              placeholder="ex : VINCI Construction"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#689AAF]/30 focus:border-[#689AAF] transition-colors"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Statut initial
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <span>{selectedStatus.label}</span>
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', statusOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {statusOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute z-50 top-full mt-1 w-full rounded-xl border border-slate-100 bg-white shadow-xl overflow-hidden"
                  >
                    <div className="p-1">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setStatus(opt.value); setStatusOpen(false) }}
                          className={cn(
                            'w-full flex flex-col items-start rounded-lg px-3 py-2 text-left transition-colors',
                            opt.value === status
                              ? 'bg-[#EBF3F7] text-[#3D7A93]'
                              : 'text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          <span className="text-sm font-semibold">{opt.label}</span>
                          <span className="text-xs text-slate-400">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-9 rounded-lg border-slate-200 text-sm"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex-1 h-9 rounded-lg text-white font-semibold text-sm shadow-sm disabled:opacity-40 btn-brand"
          >
            Créer le projet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ProjetsPage() {
  const { projects, createProject, renameProject, deleteProject, changeProjectStatus } = useAppContext()
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')
  const [showNew, setShowNew] = useState(false)

  return (
    <AppShell>
      <div className="min-h-full">
        {/* Header */}
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
                Projets
              </h1>
              <p className="label-xs mt-0.5" style={{ color: '#9BA3B5' }}>
                {projects.length} chantier{projects.length !== 1 ? 's' : ''} au total
              </p>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 text-white font-semibold text-sm px-4 py-2 h-9 rounded-xl transition-all btn-brand"
            >
              <Plus className="h-4 w-4" />
              Nouveau projet
            </button>
          </div>
        </div>

        <div className="px-8 py-7">
          <ProjectsTable
            projects={projects}
            onRename={renameProject}
            onDelete={deleteProject}
            onStatusChange={changeProjectStatus}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            showFilters
          />
        </div>
      </div>

      <NewProjectDialog
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreate={createProject}
      />
    </AppShell>
  )
}
