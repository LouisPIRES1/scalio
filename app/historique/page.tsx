'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { History, CheckCircle2, Circle, AlertCircle, Trash2, ArrowRight, Clock } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { getHistory, clearHistory } from '@/lib/history'
import type { HistoryEntry } from '@/lib/history'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  termine:    { label: 'Analysé',    icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconCls: 'text-emerald-500' },
  en_cours:   { label: 'En cours',   icon: Circle,       cls: 'bg-[#EBF3F7] text-[#3D7A93] border-[#ACCAD8]',     iconCls: 'text-[#689AAF]'  },
  en_attente: { label: 'En attente', icon: AlertCircle,  cls: 'bg-slate-50 text-slate-500 border-slate-200',       iconCls: 'text-slate-400'  },
}

type DateGroup = "Aujourd'hui" | 'Hier' | 'Cette semaine' | 'Plus ancien'

function getDateGroup(isoString: string): DateGroup {
  const now = new Date()
  const date = new Date(isoString)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfToday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - 6)
  if (date >= startOfToday) return "Aujourd'hui"
  if (date >= startOfYesterday) return 'Hier'
  if (date >= startOfWeek) return 'Cette semaine'
  return 'Plus ancien'
}

const GROUP_ORDER: DateGroup[] = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien']

function groupEntries(entries: HistoryEntry[]) {
  const map = new Map<DateGroup, HistoryEntry[]>()
  for (const entry of entries) {
    const g = getDateGroup(entry.visitedAt)
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push(entry)
  }
  return GROUP_ORDER
    .filter((g) => map.has(g))
    .map((g) => ({ group: g, entries: map.get(g)! }))
}

function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  return `il y a ${diffD} j`
}

function HistoryRow({ entry, index }: { entry: HistoryEntry; index: number }) {
  const cfg = STATUS_CONFIG[entry.status]
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/analyse/${entry.planId}`}>
        <div className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-3.5 hover:border-[#88B5C8] hover:shadow-md transition-all cursor-pointer">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              {entry.projectName}
            </p>
            <p className="text-sm font-bold text-slate-900 group-hover:text-[#203957] transition-colors truncate">
              {entry.floor} — {entry.planName}
            </p>
          </div>

          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0',
            cfg.cls
          )}>
            <Icon className={cn('h-3 w-3', cfg.iconCls)} />
            {cfg.label}
          </span>

          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 w-24 justify-end">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(entry.visitedAt)}
          </div>

          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#689AAF] group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function HistoriquePage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setEntries(getHistory())
    setHydrated(true)
  }, [])

  const groups = groupEntries(entries)

  const handleClear = () => {
    clearHistory()
    setEntries([])
  }

  return (
    <AppShell>
      <div className="min-h-full">
        {/* Header */}
        <div
          className="sticky top-0 z-20 px-8 py-4 border-b"
          style={{ background: 'rgba(238,243,246,0.95)', backdropFilter: 'blur(12px)', borderColor: '#E2EAF0' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
                Historique
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {hydrated ? `${entries.length} plan${entries.length !== 1 ? 's' : ''} consulté${entries.length !== 1 ? 's' : ''}` : '…'}
              </p>
            </div>
            {entries.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Effacer l'historique
              </button>
            )}
          </div>
        </div>

        <div className="px-8 py-7">
          <AnimatePresence mode="wait">
            {!hydrated ? null : entries.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                  style={{ background: 'rgba(32,57,87,0.07)' }}
                >
                  <History className="h-6 w-6" style={{ color: '#203957' }} />
                </div>
                <p className="text-sm font-bold text-slate-700">Aucun plan consulté pour l'instant</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Ouvrez un plan dans votre espace de travail pour le retrouver ici.
                </p>
                <Link href="/projets" className="mt-5">
                  <button className="btn-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
                    Aller aux projets
                  </button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {groups.map(({ group, entries: groupEntries }) => (
                  <section key={group}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {group}
                      </h2>
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-xs text-slate-300">{groupEntries.length}</span>
                    </div>
                    <div className="space-y-2">
                      {groupEntries.map((entry, i) => (
                        <HistoryRow key={entry.planId} entry={entry} index={i} />
                      ))}
                    </div>
                  </section>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  )
}
