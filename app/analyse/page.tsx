'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Info, ChevronDown, Plus, Check, X } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { UploadZone } from '@/components/analyse/upload-zone'
import { ProcessingModal } from '@/components/analyse/processing-modal'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/lib/app-context'
import { savePlanFile } from '@/lib/storage-files'
import type { Plan } from '@/types'
import { cn } from '@/lib/utils'

const FLOOR_OPTIONS = [
  { label: 'Sous-sol 3', order: -3  },
  { label: 'Sous-sol 2', order: -2  },
  { label: 'Sous-sol 1', order: -1  },
  { label: 'RDC',        order: 0   },
  { label: 'R+1',        order: 1   },
  { label: 'R+2',        order: 2   },
  { label: 'R+3',        order: 3   },
  { label: 'R+4',        order: 4   },
  { label: 'R+5',        order: 5   },
  { label: 'R+6',        order: 6   },
  { label: 'R+7',        order: 7   },
  { label: 'R+8',        order: 8   },
  { label: 'R+9',        order: 9   },
  { label: 'R+10',       order: 10  },
  { label: 'R+15',       order: 15  },
  { label: 'R+20',       order: 20  },
  { label: 'Toiture',    order: 999 },
]

type ProjectMode = 'existing' | 'new'

function AnalysePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedProjectId = searchParams.get('projectId') ?? ''

  // Step 1 — Plan
  const [file, setFile] = useState<File | null>(null)

  // Step 2 — Projet
  const [projectMode, setProjectMode] = useState<ProjectMode>('existing')
  const [selectedProjectId, setSelectedProjectId] = useState(preselectedProjectId)
  const [newProjectName, setNewProjectName] = useState('')
  const [newClientName, setNewClientName] = useState('')

  // Step 3 — Localisation
  const [floor, setFloor] = useState('')
  const [floorOpen, setFloorOpen] = useState(false)
  const [planNumber, setPlanNumber] = useState('')

  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingPlanId, setPendingPlanId] = useState<string>('')

  const { projects, createProject, createPlan } = useAppContext()

  const preselectedProject = preselectedProjectId
    ? projects.find((p) => p.id === preselectedProjectId) ?? null
    : null

  const projectOk =
    projectMode === 'existing'
      ? !!selectedProjectId
      : !!(newProjectName.trim() && newClientName.trim())

  const canSubmit = !!file && projectOk && !!floor && !!planNumber.trim()

  const handleSubmit = async () => {
    if (!canSubmit || !file) return

    // Resolve or create project
    let resolvedProjectId = selectedProjectId
    if (projectMode === 'new') {
      const newProject = createProject(newProjectName.trim(), newClientName.trim(), 'en_attente')
      resolvedProjectId = newProject.id
    }

    // Create plan via context (auto-saves)
    const floorOpt = FLOOR_OPTIONS.find((f) => f.label === floor) ?? { order: 0 }
    const newPlan: Plan = createPlan({
      projectId: resolvedProjectId,
      name: planNumber.trim(),
      floor,
      floorOrder: floorOpt.order,
      status: 'en_attente',
      totalLinear: 0,
      networkGroups: [],
    })

    // Persist the file in IndexedDB (survives browser close)
    await savePlanFile(newPlan.id, file, file.type)

    setPendingPlanId(newPlan.id)
    setIsProcessing(true)
  }

  const stepActive = (n: number) => {
    if (n === 1) return true
    if (n === 2) return !!file
    if (n === 3) return !!file && projectOk
    return false
  }

  const stepDone = (n: number) => {
    if (n === 1) return !!file
    if (n === 2) return !!file && projectOk
    return false
  }

  return (
    <AppShell>
      <div className="min-h-full">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Nouvelle analyse</h1>
              <p className="text-sm text-slate-400">Déposez votre plan et configurez l'analyse</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >

            {/* ── Step 1 : Upload ────────────────────────────────────────── */}
            <section>
              <StepHeader n={1} label="Déposer le plan" done={stepDone(1)} />
              <UploadZone
                onFileSelect={setFile}
                selectedFile={file}
                onClear={() => setFile(null)}
              />
            </section>

            {/* ── Step 2 : Projet ────────────────────────────────────────── */}
            <section>
              <StepHeader n={2} label="Projet" done={stepDone(2)} active={stepActive(2)} />
              <motion.div
                animate={{ opacity: stepActive(2) ? 1 : 0.35, pointerEvents: stepActive(2) ? 'auto' : 'none' }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden"
              >
                {/* Si projet pré-sélectionné depuis la page projet */}
                {preselectedProject ? (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{preselectedProject.name}</p>
                      <p className="text-xs text-slate-400 truncate">{preselectedProject.client}</p>
                    </div>
                    <Link
                      href="/analyse"
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                      Changer
                    </Link>
                  </div>
                ) : (
                <>
                {/* Mode toggle */}
                <div className="flex border-b border-slate-100">
                  <button
                    onClick={() => setProjectMode('existing')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
                      projectMode === 'existing'
                        ? 'text-[#203957] bg-[#EBF3F7] border-b-2 border-[#689AAF]'
                        : 'text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    Projet existant
                  </button>
                  <button
                    onClick={() => setProjectMode('new')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
                      projectMode === 'new'
                        ? 'text-[#203957] bg-[#EBF3F7] border-b-2 border-[#689AAF]'
                        : 'text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouveau projet
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {projectMode === 'existing' ? (
                    <motion.div
                      key="existing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="p-2 max-h-56 overflow-y-auto"
                    >
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProjectId(p.id)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                            selectedProjectId === p.id
                              ? 'bg-[#EBF3F7] ring-1 ring-[#ACCAD8]'
                              : 'hover:bg-slate-50'
                          )}
                        >
                          <div className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                            selectedProjectId === p.id
                              ? 'border-[#689AAF] bg-[#689AAF]'
                              : 'border-slate-300'
                          )}>
                            {selectedProjectId === p.id && (
                              <Check className="h-3 w-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                            <p className="text-xs text-slate-400 truncate">{p.client}</p>
                          </div>
                          <StatusBadge status={p.status} />
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="new"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="p-5 space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Nom du projet <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="ex : Rénovation Gare du Nord"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#689AAF]/30 focus:border-[#689AAF] transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Client <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            placeholder="ex : VINCI Construction"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#689AAF]/30 focus:border-[#689AAF] transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </>
              )}
              </motion.div>
            </section>

            {/* ── Step 3 : Localisation ──────────────────────────────────── */}
            <section>
              <StepHeader n={3} label="Localisation du plan" active={stepActive(3)} />
              <motion.div
                animate={{ opacity: stepActive(3) ? 1 : 0.35, pointerEvents: stepActive(3) ? 'auto' : 'none' }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-slate-100 bg-white shadow-sm p-5 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Floor dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Étage <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setFloorOpen((v) => !v)}
                        className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:border-[#689AAF] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <span className={floor ? 'text-slate-900' : 'text-slate-400'}>
                          {floor || 'Sélectionner un étage'}
                        </span>
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
                            <div className="p-1 max-h-52 overflow-y-auto">
                              {FLOOR_OPTIONS.map((opt) => (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => { setFloor(opt.label); setFloorOpen(false) }}
                                  className={cn(
                                    'w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                    opt.label === floor
                                      ? 'bg-blue-50 text-[#3D7A93] font-semibold'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  )}
                                >
                                  {opt.label}
                                  {opt.label === floor && <Check className="h-3.5 w-3.5" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Plan number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Numéro de plan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={planNumber}
                      onChange={(e) => setPlanNumber(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                      placeholder="ex : RDC-A, SS1-B, R2…"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#689AAF]/30 focus:border-[#689AAF] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-[#EBF3F7] border border-[#ACCAD8] p-3">
                  <Info className="h-4 w-4 text-[#689AAF] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#3D7A93]">
                    Constor analysera automatiquement les réseaux présents et les encadrera par type.
                    Vous pourrez sélectionner les réseaux à métrer en un clic.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link href="/">
                <Button variant="ghost" className="text-slate-500 hover:text-slate-700 text-sm">
                  Annuler
                </Button>
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="gap-2 text-white font-semibold rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-sm px-5 h-9 btn-brand"
              >
                Lancer l'analyse
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <ProcessingModal open={isProcessing} onComplete={() => router.push(`/analyse/${pendingPlanId}`)} />
    </AppShell>
  )
}

export default function AnalysePage() {
  return (
    <Suspense>
      <AnalysePageInner />
    </Suspense>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepHeader({ n, label, done, active }: { n: number; label: string; done?: boolean; active?: boolean }) {
  const isActive = active !== false
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
        done ? 'bg-emerald-500 text-white' : isActive ? 'bg-[#203957] text-white' : 'bg-slate-200 text-slate-400'
      )}>
        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
      </div>
      <h2 className={cn('text-sm font-bold uppercase tracking-wide transition-colors', isActive ? 'text-slate-900' : 'text-slate-400')}>
        {label}
      </h2>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    en_attente: { label: 'En attente', className: 'bg-slate-100 text-slate-500' },
    en_cours:   { label: 'En cours',   className: 'bg-[#EBF3F7] text-[#4A7A93]'   },
    termine:    { label: 'Terminé',    className: 'bg-emerald-50 text-emerald-700' },
  }
  const s = map[status] ?? map['en_attente']
  return (
    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', s.className)}>
      {s.label}
    </span>
  )
}
