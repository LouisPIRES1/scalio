'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'

function ConstruIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 5H10C7.2 5 5 7.2 5 10V22C5 24.8 7.2 27 10 27H20" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M27 6V20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
      <rect x="21.5" y="21.5" width="4.2" height="4.2" rx="1.2" fill="white"/>
      <rect x="26.8" y="21.5" width="4.2" height="4.2" rx="1.2" fill="white" fillOpacity="0.7"/>
      <rect x="21.5" y="26.8" width="4.2" height="4.2" rx="1.2" fill="white" fillOpacity="0.45"/>
    </svg>
  )
}
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { PROCESSING_STEPS } from '@/lib/mock-data'

interface ProcessingModalProps {
  open: boolean
  onComplete: () => void
}

export function ProcessingModal({ open, onComplete }: ProcessingModalProps) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!open) {
      setCurrentStep(-1)
      setCompletedSteps([])
      setProgress(0)
      return
    }

    let stepIndex = 0
    let totalDuration = PROCESSING_STEPS.reduce((a, s) => a + s.duration, 0)
    let elapsed = 0

    const runStep = () => {
      if (stepIndex >= PROCESSING_STEPS.length) {
        setProgress(100)
        setTimeout(onComplete, 600)
        return
      }

      setCurrentStep(stepIndex)
      const step = PROCESSING_STEPS[stepIndex]

      setTimeout(() => {
        elapsed += step.duration
        setProgress(Math.round((elapsed / totalDuration) * 100))
        setCompletedSteps((prev) => [...prev, stepIndex])
        stepIndex++
        runStep()
      }, step.duration)
    }

    const startTimeout = setTimeout(runStep, 400)
    return () => clearTimeout(startTimeout)
  }, [open, onComplete])

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md border-0 shadow-2xl rounded-2xl p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden><DialogTitle>Analyse en cours</DialogTitle></VisuallyHidden>
        {/* Header */}
        <div className="px-6 py-5 text-white" style={{ background: 'linear-gradient(135deg, #203957 0%, #4A7A93 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <ConstruIcon />
            </div>
            <div>
              <p className="text-sm font-bold">Analyse en cours</p>
              <p className="text-xs text-[#ACCAD8]">Pipeline IA Constor v1.0</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#ACCAD8] font-medium">Progression</span>
              <span className="text-xs font-bold text-white">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-white"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Steps list */}
        <div className="px-6 py-4 space-y-2 max-h-72 overflow-y-auto">
          {PROCESSING_STEPS.map((step, i) => {
            const isCompleted = completedSteps.includes(i)
            const isActive = currentStep === i && !isCompleted
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: isCompleted || isActive ? 1 : 0.35,
                }}
                className="flex items-center gap-3 py-1.5"
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 text-[#689AAF] animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isActive
                      ? 'text-[#3D7A93]'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50">
          <p className="text-xs text-slate-400 text-center">
            Ne fermez pas cette fenêtre · Traitement estimé : 2–5 minutes
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
