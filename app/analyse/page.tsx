'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { UploadZone } from '@/components/analyse/upload-zone'
import { ProcessingModal } from '@/components/analyse/processing-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AnalysePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const canSubmit = file && projectName.trim() && clientName.trim()

  const handleSubmit = () => {
    if (!canSubmit || !file) return
    // Store uploaded file as an object URL so the workspace can display it
    const prevUrl = sessionStorage.getItem('scalio_plan_url')
    if (prevUrl) URL.revokeObjectURL(prevUrl)
    const objectUrl = URL.createObjectURL(file)
    sessionStorage.setItem('scalio_plan_url', objectUrl)
    sessionStorage.setItem('scalio_plan_mime', file.type)
    setIsProcessing(true)
  }

  const handleProcessingComplete = () => {
    router.push('/analyse/gare-du-nord')
  }

  return (
    <AppShell>
      <div className="min-h-full">
        {/* Page header */}
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
            {/* Step 1: Upload */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  1
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Déposer le plan
                </h2>
              </div>
              <UploadZone
                onFileSelect={setFile}
                selectedFile={file}
                onClear={() => setFile(null)}
              />
            </section>

            {/* Step 2: Configuration */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${file ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  2
                </div>
                <h2 className={`text-sm font-bold uppercase tracking-wide transition-colors ${file ? 'text-slate-900' : 'text-slate-400'}`}>
                  Informations du projet
                </h2>
              </div>

              <motion.div
                animate={{ opacity: file ? 1 : 0.4, pointerEvents: file ? 'auto' : 'none' }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-slate-100 bg-white shadow-sm p-6 space-y-5"
              >
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Nom du projet <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="ex : Rénovation Gare du Nord"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="h-9 text-sm border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Client <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="ex : VINCI Construction"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="h-9 text-sm border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Scalio analysera automatiquement les réseaux présents sur votre plan et les encadrera par type.
                    Vous pourrez ensuite sélectionner les réseaux à métrer en un clic.
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
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm px-5 h-9"
              >
                Lancer l'analyse
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <ProcessingModal open={isProcessing} onComplete={handleProcessingComplete} />
    </AppShell>
  )
}
