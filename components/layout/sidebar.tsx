'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ScanLine,
  FolderKanban,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Zap,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/analyse', label: 'Nouvelle analyse', icon: ScanLine, highlight: true },
  { href: '/projets', label: 'Projets', icon: FolderKanban },
  { href: '/exports', label: 'Exports', icon: FileSpreadsheet },
]

const bottomItems = [
  { href: '/parametres', label: 'Paramètres', icon: Settings },
  { href: '/aide', label: 'Aide & support', icon: HelpCircle },
]

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  highlight,
  index,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  highlight?: boolean
  index: number
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href}>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-white/10 text-white'
                : highlight
                ? 'text-[#7B9CFF] hover:bg-white/8 hover:text-[#A0B8FF]'
                : 'text-slate-400 hover:bg-white/6 hover:text-slate-100'
            )}
          >
            {active && (
              <motion.div
                layoutId="navActive"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[#4B6EFF]"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active
                  ? 'text-white'
                  : highlight
                  ? 'text-[#7B9CFF]'
                  : 'text-slate-500 group-hover:text-slate-200'
              )}
            />
            <span className="truncate tracking-wide">{label}</span>
            {highlight && !active && (
              <span className="ml-auto inline-flex h-1.5 w-1.5 rounded-full bg-[#4B6EFF] animate-pulse" />
            )}
          </motion.div>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex h-screen w-[232px] shrink-0 flex-col select-none"
      style={{ background: '#131929' }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex h-16 items-center gap-3 px-4 border-b border-white/5"
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', boxShadow: '0 4px 12px rgba(29,78,216,0.4)' }}
        >
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <span
            className="text-base font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Scalio
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="label-xs text-slate-500">Plan Pro</span>
            <div className="h-1 w-1 rounded-full bg-emerald-400" />
          </div>
        </div>
      </motion.div>

      {/* Decorative thin line accent */}
      <div className="mx-4 mt-4 mb-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(75,110,255,0.4), transparent)' }} />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item, i) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
            index={i}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-3 space-y-0.5 border-t border-white/5 pt-3">
        {bottomItems.map((item, i) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href}
            index={i}
          />
        ))}
      </div>

      {/* User card */}
      <div className="p-3 border-t border-white/5">
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer group transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback
              className="text-[11px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
            >
              AP
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-100 truncate tracking-wide">Antonio Pires</p>
            <p className="label-xs text-slate-600 truncate">ISOL2A92</p>
          </div>
          <LogOut className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
        </motion.div>
      </div>
    </aside>
  )
}
