'use client'
import { AppShell } from '@/components/layout/app-shell'
export default function ExportsPage() {
  return (
    <AppShell>
      <div className="px-8 py-6">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Exports</h1>
        <p className="text-slate-500">Historique de vos exports DPGF.</p>
      </div>
    </AppShell>
  )
}
