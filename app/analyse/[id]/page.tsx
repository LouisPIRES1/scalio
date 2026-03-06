'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileDown, Layers, Lock, Pencil } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { PlanCanvas } from '@/components/workspace/plan-canvas'
import { ReportPanel } from '@/components/workspace/report-panel'
import { Button } from '@/components/ui/button'
import { mockNetworkGroups, mockPlans, mockProjects } from '@/lib/mock-data'
import { useAppContext } from '@/lib/app-context'
import { loadPlanFile } from '@/lib/storage-files'
import { exportMetrePdf } from '@/lib/export-pdf'
import { savePlanVisit } from '@/lib/history'
import type { NetworkGroup, Plan, Project } from '@/types'

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { plans: allPlans, projects } = useAppContext()

  // Try mock data first (SSR-safe), then context on client
  const mockPlan = mockPlans.find((p) => p.id === id)
  const mockProject = mockPlan ? mockProjects.find((p) => p.id === mockPlan.projectId) : null

  const [plan, setPlan] = useState<Plan | null>(mockPlan ?? null)
  const [project, setProject] = useState<Project | null>(mockProject ?? null)

  const [networks, setNetworks] = useState<NetworkGroup[]>(() => {
    const p = mockPlan
    const analysed = p?.status === 'termine'
    return (p?.networkGroups?.length ? p.networkGroups : mockNetworkGroups).map((n) => ({
      ...n,
      isSelected: analysed ? true : n.isSelected,
    }))
  })
  const [isReadOnly, setIsReadOnly] = useState(mockPlan?.status === 'termine' || false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [imageMime, setImageMime] = useState<string | undefined>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Load plan/project from context if not a mock plan
  useEffect(() => {
    if (mockPlan) return
    const storedPlan = allPlans.find((p) => p.id === id)
    if (!storedPlan) return
    setPlan(storedPlan)
    const storedProject = projects.find((p) => p.id === storedPlan.projectId)
    setProject(storedProject ?? null)
    const analysed = storedPlan.status === 'termine'
    setNetworks(
      (storedPlan.networkGroups?.length ? storedPlan.networkGroups : mockNetworkGroups).map((n) => ({
        ...n,
        isSelected: analysed ? true : n.isSelected,
      }))
    )
    setIsReadOnly(analysed)
  }, [id, mockPlan, allPlans, projects])

  // Save to history when plan + project are known
  useEffect(() => {
    if (!plan || !project) return
    savePlanVisit({
      planId: plan.id,
      planName: plan.name,
      floor: plan.floor,
      projectId: project.id,
      projectName: project.name,
      visitedAt: new Date().toISOString(),
      status: plan.status,
    })
  }, [plan, project])

  // Load plan file from IndexedDB (persists across sessions)
  useEffect(() => {
    let blobUrl: string | null = null
    loadPlanFile(id).then((result) => {
      if (result) {
        blobUrl = result.url
        setImageUrl(result.url)
        setImageMime(result.mime)
      }
    })
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [id])

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleNetworkClick = useCallback((id: string) => {
    if (isReadOnly) return
    setNetworks((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isSelected: !n.isSelected } : n))
    )
  }, [isReadOnly])

  const handleRemoveNetwork = useCallback((id: string) => {
    setNetworks((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isSelected: false } : n))
    )
  }, [])

  const handleUpdateItem = useCallback(
    (networkId: string, itemId: string, quantity: number, elbows: number) => {
      setNetworks((prev) =>
        prev.map((n) =>
          n.id === networkId
            ? {
                ...n,
                items: n.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        quantity,
                        elbows: item.elbows !== undefined ? elbows : item.elbows,
                        isEdited: true,
                        originalQuantity: item.originalQuantity ?? item.quantity,
                      }
                    : item
                ),
              }
            : n
        )
      )
    },
    []
  )

  const handleDeleteItem = useCallback((networkId: string, itemId: string) => {
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === networkId
          ? { ...n, items: n.items.filter((item) => item.id !== itemId) }
          : n
      )
    )
  }, [])

  const handleUpload = useCallback((url: string, mime: string) => {
    setImageUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return url
    })
    setImageMime(mime)
  }, [])

  const handleExportPdf = useCallback(() => {
    if (!plan || !project) return
    exportMetrePdf(networks, plan, project)
  }, [networks, plan, project])

  const selectedCount = networks.filter((n) => n.isSelected).length

  const backHref = project ? `/projets/${project.id}` : '/projets'
  const planLabel = plan ? `${plan.floor} — ${plan.name}` : 'Plan'
  const projectName = project?.name ?? 'Projet'
  const clientName = project?.client ?? ''

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Workspace header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <Link href={backHref}>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h1 className="text-sm font-bold text-slate-900">{projectName}</h1>
              <p className="text-xs text-slate-400">{clientName} · {planLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isReadOnly ? (
              <>
                {/* Read-only badge */}
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">Lecture seule</span>
                </div>

                {/* Modifier button */}
                <Button
                  onClick={() => setIsReadOnly(false)}
                  variant="outline"
                  className="gap-2 border-[#C8DCEA] text-[#203957] hover:border-[#689AAF] hover:text-[#4A7A93] font-semibold text-sm h-8 px-4 rounded-lg"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </Button>
              </>
            ) : (
              <>
                {/* Network count */}
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-600">
                    {selectedCount}/{networks.length} réseaux
                  </span>
                </div>

              </>
            )}

            <Button
              onClick={handleExportPdf}
              disabled={selectedCount === 0}
              className="gap-2 text-white font-semibold text-sm h-8 px-4 rounded-lg shadow-sm disabled:opacity-40 btn-brand"
            >
              <FileDown className="h-4 w-4" />
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* Main workspace: plan + report */}
        <div className="flex flex-1 overflow-hidden">
          <div ref={containerRef} className="flex-1 overflow-hidden">
            <PlanCanvas
              networks={networks}
              onNetworkClick={handleNetworkClick}
              width={canvasSize.width}
              height={canvasSize.height}
              imageUrl={imageUrl}
              imageMime={imageMime}
              onUpload={handleUpload}
              planId={id}
            />
          </div>

          <ReportPanel
            networks={networks}
            onRemoveNetwork={handleRemoveNetwork}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onExport={handleExportPdf}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>
    </AppShell>
  )
}
