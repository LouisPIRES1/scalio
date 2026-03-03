'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('fr-FR'))

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.3,
    })
    return controls.stop
  }, [value, count])

  return <motion.span>{rounded}</motion.span>
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
  blue:    { accent: '#1D4ED8', light: '#EEF2FF', text: '#1D4ED8', border: '#BFDBFE' },
  emerald: { accent: '#059669', light: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  amber:   { accent: '#D97706', light: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  violet:  { accent: '#7C3AED', light: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
}

export function MetricCard({ title, value, suffix, prefix, description, icon, trend, color }: MetricCardProps) {
  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: '#FDFAF4',
        border: `1px solid ${c.border}`,
        boxShadow: `0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: c.light, color: c.accent }}
        >
          <div className="[&>svg]:h-5 [&>svg]:w-5">{icon}</div>
        </div>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: c.light, color: c.text }}
          >
            <TrendingUp className="h-3 w-3" />
            +{trend}%
          </div>
        )}
      </div>

      {/* Value — DM Mono for precision feel */}
      <div className="mb-1.5">
        <span className="font-data text-3xl font-medium" style={{ color: '#1A1714', letterSpacing: '-0.04em' }}>
          {prefix && <span className="text-xl mr-0.5 opacity-60">{prefix}</span>}
          <AnimatedNumber value={value} />
          {suffix && (
            <span className="text-xl ml-1 font-normal" style={{ color: c.accent }}>
              {suffix}
            </span>
          )}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold" style={{ color: '#57534E', letterSpacing: '0' }}>
        {title}
      </p>
      {description && (
        <p className="label-xs mt-1" style={{ color: '#9BA3B5' }}>{description}</p>
      )}

      {/* Accent line bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, ${c.accent}40, ${c.accent}80, ${c.accent}40)` }}
      />
    </motion.div>
  )
}
