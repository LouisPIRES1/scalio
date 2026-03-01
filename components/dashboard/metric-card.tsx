'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('fr-FR'))

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.4,
      ease: 'easeOut',
      delay: 0.2,
    })
    return controls.stop
  }, [value, count])

  return (
    <motion.span>{rounded}</motion.span>
  )
}

interface MetricCardProps {
  title: string
  value: number
  suffix?: string
  prefix?: string
  description?: string
  icon: ReactNode
  trend?: number
  color: 'blue' | 'emerald' | 'amber' | 'violet'
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-600',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    glow: 'shadow-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-600',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    glow: 'shadow-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-600',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    glow: 'shadow-amber-100',
  },
  violet: {
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-600',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    glow: 'shadow-violet-100',
  },
}

export function MetricCard({ title, value, suffix, prefix, description, icon, trend, color }: MetricCardProps) {
  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="relative overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg shadow-sm', c.iconBg)}>
          <div className="text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', c.badge)}>
            <TrendingUp className="h-3 w-3" />
            +{trend}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-2xl font-bold text-slate-900 tabular-nums">
          {prefix && <span className="text-lg mr-0.5">{prefix}</span>}
          <AnimatedNumber value={value} />
          {suffix && <span className="text-lg text-slate-500 ml-1 font-medium">{suffix}</span>}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      )}

      {/* Decorative corner */}
      <div className={cn('absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-6', c.bg)} />
    </motion.div>
  )
}
