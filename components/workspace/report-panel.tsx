'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileSpreadsheet,
  MousePointerClick,
  Calculator,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NetworkGroup } from '@/types'
import { NETWORK_META } from '@/types'
import { NetworkBlock } from './network-block'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ReportPanelProps {
  networks: NetworkGroup[]
  onRemoveNetwork: (id: string) => void
  onUpdateItem: (networkId: string, itemId: string, quantity: number) => void
  onDeleteItem: (networkId: string, itemId: string) => void
  onExport: () => void
}

export function ReportPanel({
  networks,
  onRemoveNetwork,
  onUpdateItem,
  onDeleteItem,
  onExport,
}: ReportPanelProps) {
  const selectedNetworks = networks.filter((n) => n.isSelected)

  const totalLinear = selectedNetworks
    .flatMap((n) => n.items)
    .filter((i) => i.unit === 'ml')
    .reduce((acc, i) => acc + i.quantity, 0)

  const totalUnits = selectedNetworks
    .flatMap((n) => n.items)
    .filter((i) => i.unit === 'u')
    .reduce((acc, i) => acc + i.quantity, 0)

  const totalElbows = selectedNetworks
    .flatMap((n) => n.items)
    .reduce((acc, i) => acc + (i.elbows ?? 0), 0)

  return (
    <div className="flex h-full flex-col border-l border-slate-100 bg-white" style={{ width: 340, minWidth: 340 }}>
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Rapport de métré</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedNetworks.length === 0
              ? 'Aucun réseau sélectionné'
              : `${selectedNetworks.length} réseau${selectedNetworks.length > 1 ? 'x' : ''} sélectionné${selectedNetworks.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {selectedNetworks.length > 0 && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
            {selectedNetworks.length}
          </div>
        )}
      </div>

      {/* Network availability chips */}
      <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-slate-50">
        {networks.map((n) => {
          const meta = NETWORK_META[n.type]
          return (
            <div
              key={n.id}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition-all',
                n.isSelected
                  ? [meta.bgColor, meta.textColor, meta.borderColor]
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              )}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: n.isSelected ? meta.color : '#CBD5E1' }}
              />
              {meta.label}
            </div>
          )
        })}
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3">
          <AnimatePresence mode="popLayout">
            {selectedNetworks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
                  <MousePointerClick className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  Aucun réseau sélectionné
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-48">
                  Cliquez sur un encadrement coloré dans le plan pour ajouter le réseau au rapport.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2.5">
                {selectedNetworks.map((network) => (
                  <NetworkBlock
                    key={network.id}
                    network={network}
                    onRemove={() => onRemoveNetwork(network.id)}
                    onUpdateItem={(itemId, quantity) =>
                      onUpdateItem(network.id, itemId, quantity)
                    }
                    onDeleteItem={(itemId) => onDeleteItem(network.id, itemId)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Totals + Export */}
      <AnimatePresence>
        {selectedNetworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 space-y-3"
          >
            {/* Total summary */}
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5" />
                  Total linéaires
                </span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {totalLinear.toFixed(1)} ml
                </span>
              </div>
              {totalElbows > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total coudes</span>
                  <span className="text-xs font-semibold text-slate-700">{totalElbows} pièces</span>
                </div>
              )}
              {totalUnits > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Équipements</span>
                  <span className="text-xs font-semibold text-slate-700">{totalUnits} unités</span>
                </div>
              )}
            </div>

            {/* Export button */}
            <Button
              onClick={onExport}
              className="w-full gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm h-9 rounded-lg shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Générer le DPGF
            </Button>

            <p className="text-[10px] text-center text-slate-400">
              Export Excel · 4 onglets · Format marchés publics FR
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
