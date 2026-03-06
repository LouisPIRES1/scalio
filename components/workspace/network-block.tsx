'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Trash2, Edit3, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NetworkGroup, NetworkLineItem } from '@/types'
import { NETWORK_META } from '@/types'

// ── Type scale (strict — no text-[Xpx] anywhere) ────────────────────────────
// text-sm  (14px) : primary data  — values, network name
// text-xs  (12px) : secondary data — designations, units, elbows, badges

interface NetworkBlockProps {
  network: NetworkGroup
  onRemove: () => void
  onUpdateItem: (itemId: string, quantity: number, elbows: number) => void
  onDeleteItem: (itemId: string) => void
  isReadOnly?: boolean
}


function LineItem({
  item,
  networkColor,
  onUpdate,
  onDelete,
  isReadOnly,
}: {
  item: NetworkLineItem
  networkColor: string
  onUpdate: (q: number, elbows: number) => void
  onDelete: () => void
  isReadOnly?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(item.quantity))
  const [draftElbows, setDraftElbows] = useState(String(item.elbows ?? 0))

  const handleSave = () => {
    const val = parseFloat(draft)
    const elb = parseInt(draftElbows, 10)
    if (!isNaN(val) && val >= 0) onUpdate(val, isNaN(elb) || elb < 0 ? 0 : elb)
    setEditing(false)
  }

  const hasElbows = item.elbows !== undefined

  return (
    <div className="group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
      {/* Color dot */}
      <div
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: networkColor, opacity: 0.5 }}
      />

      {/* Designation — primary identifier, bold */}
      <span className="flex-1 text-xs font-semibold text-slate-700 truncate">
        {item.label}
      </span>

      {/* Editing mode */}
      {editing ? (
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quantity input */}
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') setEditing(false)
            }}
            className="w-16 font-data text-sm font-medium text-slate-900 border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
          />
          <span className="text-xs text-slate-400">{item.unit}</span>

          {/* Elbows input — only for items that have elbows */}
          {hasElbows && (
            <>
              <span className="text-xs text-slate-300">·</span>
              <input
                value={draftElbows}
                onChange={(e) => setDraftElbows(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') setEditing(false)
                }}
                className="w-10 font-data text-sm font-medium text-slate-900 border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
              />
              <span className="text-xs text-slate-400">c</span>
            </>
          )}

          <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-700">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Value — fixed width, right-aligned */}
          <span className={cn(
            'font-data text-sm font-normal tabular-nums w-20 text-right shrink-0',
            item.isEdited ? 'text-blue-600' : 'text-slate-600'
          )}>
            {item.quantity.toFixed(1)} {item.unit}
          </span>

          {/* Elbows — fixed width, right-aligned */}
          <span className="font-data text-sm font-normal tabular-nums text-slate-500 w-8 text-right shrink-0">
            {item.elbows !== undefined && item.elbows > 0 ? `${item.elbows}c` : ''}
          </span>

          {/* Actions on hover */}
          {!isReadOnly && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="flex h-5 w-5 items-center justify-center rounded text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              <button
                onClick={onDelete}
                className="flex h-5 w-5 items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function NetworkBlock({
  network, onRemove, onUpdateItem, onDeleteItem, isReadOnly,
}: NetworkBlockProps) {
  const [expanded, setExpanded] = useState(true)
  const meta = NETWORK_META[network.type]

  const totalLinear = network.items
    .filter((i) => i.unit === 'ml')
    .reduce((acc, i) => acc + i.quantity, 0)

  const totalElbows = network.items.reduce((acc, i) => acc + (i.elbows ?? 0), 0)

  const totalUnits = network.items
    .filter((i) => i.unit === 'u')
    .reduce((acc, i) => acc + i.quantity, 0)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.99 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('rounded-xl border overflow-hidden shadow-sm', meta.borderColor, meta.bgColor)}
    >
      {/* ── Block header ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer hover:brightness-[0.98] transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />

        {/* Network name */}
        <span className={cn('text-sm font-semibold flex-1', meta.textColor)}>
          {meta.label}
        </span>

        {/* Header summary — same scale as line items */}
        <div className="flex items-center gap-2 shrink-0">
          {totalLinear > 0 && (
            <span className="font-data text-xs font-medium text-slate-600 tabular-nums">
              {totalLinear.toFixed(1)} ml
            </span>
          )}
          {totalElbows > 0 && (
            <span className="font-data text-xs font-medium text-slate-500 tabular-nums">
              {totalElbows}c
            </span>
          )}
          {totalUnits > 0 && (
            <span className="font-data text-xs font-medium text-slate-600 tabular-nums">
              {totalUnits} u
            </span>
          )}
        </div>

        {!isReadOnly && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <ChevronDown
          className={cn('h-3.5 w-3.5 text-slate-400 transition-transform shrink-0', expanded && 'rotate-180')}
        />
      </div>

      {/* ── Line items ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100/80 bg-white/60 py-1">
              {network.items.map((item) => (
                <LineItem
                  key={item.id}
                  item={item}
                  networkColor={meta.color}
                  onUpdate={(q, elbows) => onUpdateItem(item.id, q, elbows)}
                  onDelete={() => onDeleteItem(item.id)}
                  isReadOnly={isReadOnly}
                />
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
