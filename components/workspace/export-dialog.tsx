'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, FileSpreadsheet, Download, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  projectName: string
}

export function ExportDialog({ open, onClose, projectName }: ExportDialogProps) {
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [affaire, setAffaire] = useState('2026-0312')
  const [moa, setMoa] = useState('VINCI Construction')
  const [metreur, setMetreur] = useState('Antonio Pires')

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      setDone(true)
    }, 1800)
  }

  const handleClose = () => {
    setDone(false)
    setExporting(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] shadow-sm">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Générer le DPGF</h2>
              <p className="text-xs text-slate-400">{projectName}</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-4"
              >
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </motion.div>
              <h3 className="text-base font-bold text-slate-900 mb-1">DPGF généré avec succès</h3>
              <p className="text-sm text-slate-500 mb-6">
                Votre fichier Excel est prêt au téléchargement.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  className="gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                  onClick={handleClose}
                >
                  <Download className="h-4 w-4" />
                  Télécharger DPGF_Gare_du_Nord.xlsx
                </Button>
                <Button
                  variant="ghost"
                  className="text-slate-500 text-sm"
                  onClick={handleClose}
                >
                  Fermer
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-400">
                <span>4 onglets</span>
                <span>·</span>
                <span>Format marchés publics FR</span>
                <span>·</span>
                <span>Excel 2016+</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 py-5 space-y-4"
            >
              <p className="text-xs text-slate-500">
                Ces informations apparaîtront dans l'en-tête du fichier Excel DPGF.
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    N° d'affaire <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={affaire}
                    onChange={(e) => setAffaire(e.target.value)}
                    className="h-9 text-sm border-slate-200"
                    placeholder="ex : 2026-0312"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Maître d'ouvrage
                  </Label>
                  <Input
                    value={moa}
                    onChange={(e) => setMoa(e.target.value)}
                    className="h-9 text-sm border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Métreur responsable
                  </Label>
                  <Input
                    value={metreur}
                    onChange={(e) => setMetreur(e.target.value)}
                    className="h-9 text-sm border-slate-200"
                  />
                </div>
              </div>

              {/* DPGF structure preview */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Structure du fichier
                </p>
                <div className="flex gap-1.5">
                  {['Tuyauteries', 'Pts singuliers', 'Surfaces', 'Récap.'].map((tab, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded"
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 text-sm text-slate-600 h-9 rounded-lg border-slate-200"
                  onClick={handleClose}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm h-9 rounded-lg"
                  onClick={handleExport}
                  disabled={exporting || !affaire.trim()}
                >
                  {exporting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Génération…
                    </span>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Générer
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
