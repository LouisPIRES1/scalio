'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileSpreadsheet, Info, Layers } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { ReportPanel } from '@/components/workspace/report-panel'
import { ExportDialog } from '@/components/workspace/export-dialog'
import { Button } from '@/components/ui/button'
import { mockNetworkGroups } from '@/lib/mock-data'
import type { NetworkGroup } from '@/types'
import { NETWORK_META } from '@/types'

// SSR-safe Konva import
const PlanCanvas = dynamic(
  () => import('@/components/workspace/plan-canvas').then((m) => m.PlanCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Chargement du plan…</p>
        </div>
      </div>
    ),
  }
)

export default function WorkspacePage({ params }: { params: { id: string } }) {
  const [networks, setNetworks] = useState<NetworkGroup[]>(
    mockNetworkGroups.map((n) => ({ ...n }))
  )
  const [exportOpen, setExportOpen] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Measure canvas container
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
    setNetworks((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isSelected: !n.isSelected } : n))
    )
  }, [])

  const handleRemoveNetwork = useCallback((id: string) => {
    setNetworks((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isSelected: false } : n))
    )
  }, [])

  const handleUpdateItem = useCallback(
    (networkId: string, itemId: string, quantity: number) => {
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

  const selectedCount = networks.filter((n) => n.isSelected).length

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Workspace header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                Rénovation Gare du Nord
              </h1>
              <p className="text-xs text-slate-400">VINCI Construction · Plan EXE R+1 · Mars 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Network count */}
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">
                {selectedCount}/{networks.length} réseaux
              </span>
            </div>

            {/* Confidence indicator */}
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">Fiabilité 91%</span>
            </div>

            <Button
              onClick={() => setExportOpen(true)}
              disabled={selectedCount === 0}
              className="gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm h-8 px-4 rounded-lg shadow-sm disabled:opacity-40"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exporter DPGF
            </Button>
          </div>
        </div>

        {/* Main workspace: plan + report */}
        <div className="flex flex-1 overflow-hidden">
          {/* Plan viewer */}
          <div ref={containerRef} className="flex-1 overflow-hidden">
            <PlanCanvas
              networks={networks}
              onNetworkClick={handleNetworkClick}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          </div>

          {/* Report panel */}
          <ReportPanel
            networks={networks}
            onRemoveNetwork={handleRemoveNetwork}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onExport={() => setExportOpen(true)}
          />
        </div>
      </div>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        projectName="Rénovation Gare du Nord"
      />
    </AppShell>
  )
}
