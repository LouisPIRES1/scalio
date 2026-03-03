'use client'

import { use, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, FileText, Ruler, CheckCircle2, Circle, AlertCircle,
  Plus, ChevronRight, Building2, Trash2, Hash, ChevronDown,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { mockProjects, mockPlans } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Plan } from '@/types'

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  termine:   { label: 'Analysé',    icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconCls: 'text-emerald-500' },
  en_cours:  { label: 'En cours',   icon: Circle,       cls: 'bg-blue-50 text-blue-700 border-blue-200',         iconCls: 'text-blue-500'    },
  en_attente:{ label: 'En attente', icon: AlertCircle,  cls: 'bg-slate-50 text-slate-500 border-slate-200',      iconCls: 'text-slate-400'   },
}

const PROJECT_STATUS = {
  termine:    { label: 'Terminé',    cls: 'bg-emerald-50 text-emerald-700' },
  en_cours:   { label: 'En cours',   cls: 'bg-blue-50 text-blue-700'       },
  en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700'     },
}

const FLOOR_OPTIONS = [
  { label: 'Sous-sol 3', order: -3 },
  { label: 'Sous-sol 2', order: -2 },
  { label: 'Sous-sol 1', order: -1 },
  { label: 'RDC',        order: 0  },
  { label: 'R+1',        order: 1  },
  { label: 'R+2',        order: 2  },
  { label: 'R+3',        order: 3  },
  { label: 'R+4',        order: 4  },
  { label: 'R+5',        order: 5  },
  { label: 'R+6',        order: 6  },
  { label: 'R+7',        order: 7  },
  { label: 'R+8',        order: 8  },
  { label: 'R+9',        order: 9  },
  { label: 'R+10',       order: 10 },
  { label: 'R+15',       order: 15 },
  { label: 'R+20',       order: 20 },
  { label: 'Toiture',    order: 999 },
]

// ── PlanCard ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  index,
  onDelete,
}: {
  plan: Plan
  index: number
  onDelete: (id: string) => void
}) {
  const cfg = STATUS_CONFIG[plan.status]
  const Icon = cfg.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.04 }}
      className="group relative"
    >
      {/* Delete button — top-right, appears on hover */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(plan.id) }}
        className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
        title="Supprimer ce plan"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      <Link href={`/analyse/${plan.id}`}>
        <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 transition-all border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 cursor-pointer">
          {/* Icon + arrow */}
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
              <FileText className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors mt-0.5" />
          </div>

          {/* Plan number */}
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <Hash className="h-3 w-3 text-slate-300 shrink-0" />
              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                {plan.name}
              </p>
            </div>
            {plan.totalLinear > 0 && (
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Ruler className="h-3 w-3" />
                {plan.totalLinear.toLocaleString('fr-FR')} ml
              </p>
            )}
          </div>

          {/* Status badge */}
          <span className={cn(
            'inline-flex items-center gap-1.5 self-start rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
            cfg.cls
          )}>
            <Icon className={cn('h-3 w-3', cfg.iconCls)} />
            {cfg.label}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

// ── FloorGroup ────────────────────────────────────────────────────────────────

function FloorGroup({
  floor,
  plans,
  groupIndex,
  onDeleteFloor,
  onDeletePlan,
}: {
  floor: string
  plans: Plan[]
  groupIndex: number
  onDeleteFloor: (floor: string) => void
  onDeletePlan: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const doneCount = plans.filter((p) => p.status === 'termine').length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay: groupIndex * 0.06 }}
      className="flex gap-6"
    >
      {/* Floor label + delete */}
      <div className="w-44 shrink-0 pt-1">
        <div className="group/floor flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">{floor}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {doneCount}/{plans.length} analysé{plans.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/floor:opacity-100 transition-all"
            title="Supprimer cet étage"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="flex flex-wrap gap-3 flex-1">
        <AnimatePresence mode="popLayout">
          {plans.map((plan, i) => (
            <div key={plan.id} className="w-36">
              <PlanCard plan={plan} index={i} onDelete={onDeletePlan} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete floor confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 mb-3">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Supprimer l&apos;étage {floor} ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 mt-1">
            Les <span className="font-semibold text-slate-700">{plans.length} plan{plans.length > 1 ? 's' : ''}</span> de cet étage seront supprimés. Cette action est irréversible.
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
              onClick={() => { setConfirmDelete(false); onDeleteFloor(floor) }}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ── Add Plan Dialog ───────────────────────────────────────────────────────────

function AddPlanDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (floor: string, floorOrder: number, planNumber: string) => void
}) {
  const [floor, setFloor] = useState('RDC')
  const [planNumber, setPlanNumber] = useState('')
  const [floorOpen, setFloorOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  const handleSubmit = () => {
    const num = planNumber.trim()
    if (!num) return
    const opt = FLOOR_OPTIONS.find((f) => f.label === floor) ?? { order: 0 }
    onAdd(floor, opt.order, num)
    setPlanNumber('')
    setFloor('RDC')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 mb-3">
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <DialogTitle className="text-base font-bold text-slate-900">
            Ajouter un plan
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-0.5">
            Renseignez l&apos;étage et le numéro de plan tel qu&apos;il figure sur le document.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Floor select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Étage
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFloorOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {floor}
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', floorOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {floorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute z-50 top-full mt-1 w-full rounded-xl border border-slate-100 bg-white shadow-xl overflow-hidden"
                  >
                    <div className="max-h-52 overflow-y-auto p-1">
                      {FLOOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => { setFloor(opt.label); setFloorOpen(false) }}
                          className={cn(
                            'w-full flex items-center rounded-lg px-3 py-2 text-sm text-left transition-colors',
                            opt.label === floor
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Plan number input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-blue-500" />
              Numéro de plan
              <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={planNumber}
              onChange={(e) => setPlanNumber(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              placeholder="ex : EXE-15, A-03, 3/12…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
            />
            <p className="text-[11px] text-slate-400">
              C&apos;est le numéro que vous utilisez pour identifier ce plan sur chantier.
            </p>
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
            disabled={!planNumber.trim()}
            onClick={handleSubmit}
            className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm disabled:opacity-40"
          >
            Ajouter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = mockProjects.find((p) => p.id === id)

  const [plans, setPlans] = useState<Plan[]>(() =>
    mockPlans.filter((p) => p.projectId === id)
  )
  const [showAdd, setShowAdd] = useState(false)

  // Group by floor, sorted by floorOrder
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

  const handleDeletePlan = useCallback((planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId))
  }, [])

  const handleDeleteFloor = useCallback((floor: string) => {
    setPlans((prev) => prev.filter((p) => p.floor !== floor))
  }, [])

  const handleAddPlan = useCallback(
    (floor: string, floorOrder: number, planNumber: string) => {
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        projectId: id,
        name: planNumber,
        floor,
        floorOrder,
        status: 'en_attente',
        totalLinear: 0,
        networkGroups: [],
      }
      setPlans((prev) => [...prev, newPlan])
    },
    [id]
  )

  if (!project) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-400">Projet introuvable.</p>
        </div>
      </AppShell>
    )
  }

  const projStatusCfg = PROJECT_STATUS[project.status]

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
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', projStatusCfg.cls)}>
                    {projStatusCfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{project.client}</p>
              </div>
            </div>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm shadow-blue-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ajouter un plan
            </button>
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
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-3">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Aucun plan pour ce projet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Ajoutez un premier plan pour commencer.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter un plan
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-1">Plans par étage</h2>
                <p className="text-xs text-slate-400">
                  Survolez un étage ou un plan pour afficher les options de suppression
                </p>
              </div>

              <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {floorGroups.map((group, i) => (
                    <motion.div key={group.floor} layout>
                      {i > 0 && <div className="border-t border-slate-100 mb-5" />}
                      <FloorGroup
                        floor={group.floor}
                        plans={group.plans}
                        groupIndex={i}
                        onDeleteFloor={handleDeleteFloor}
                        onDeletePlan={handleDeletePlan}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddPlanDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAddPlan}
      />
    </AppShell>
  )
}
