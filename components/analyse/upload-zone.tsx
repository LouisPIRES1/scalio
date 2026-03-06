'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClear: () => void
}

export function UploadZone({ onFileSelect, selectedFile, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      setError('Format non supporté. Déposez un fichier PDF uniquement.')
      return false
    }
    if (file.size > 200 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 200 Mo.')
      return false
    }
    setError(null)
    return true
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && validateFile(file)) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      onFileSelect(file)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  if (selectedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 rounded-xl border-2 border-[#ACCAD8] bg-[#EBF3F7] px-5 py-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm" style={{ background: 'linear-gradient(135deg, #203957 0%, #4A7A93 100%)' }}>
          <File className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{selectedFile.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{formatSize(selectedFile.size)} · PDF</p>
        </div>
        <button
          onClick={onClear}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    )
  }

  return (
    <div>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200',
          isDragging
            ? 'border-[#689AAF] bg-[#EBF3F7] scale-[1.01]'
            : 'border-slate-200 bg-slate-50/50 hover:border-[#88B5C8] hover:bg-[#EBF3F7]/40'
        )}
      >
        <input
          type="file"
          accept="application/pdf"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleInputChange}
        />

        <motion.div
          animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={cn(
            'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all',
            isDragging ? 'shadow-lg' : 'bg-white shadow-sm border border-slate-100 group-hover:border-[#ACCAD8]'
          )}
          style={isDragging ? { background: 'linear-gradient(135deg, #203957 0%, #4A7A93 100%)' } : undefined}
        >
          <Upload className={cn('h-6 w-6 transition-colors', isDragging ? 'text-white' : 'text-slate-400 group-hover:text-[#689AAF]')} />
        </motion.div>

        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <p className="text-base font-semibold text-blue-700">Déposez votre plan ici</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <p className="text-sm font-semibold text-slate-700">
                Glissez votre plan PDF ici
              </p>
              <p className="mt-1 text-xs text-slate-400">
                ou <span className="font-medium" style={{ color: '#4A7A93' }}>cliquez pour sélectionner</span> — PDF uniquement · jusqu'à 200 Mo
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center gap-4">
          <span className="text-[11px] font-medium text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
            PDF
          </span>
        </div>
      </label>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2"
          >
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs font-medium text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
