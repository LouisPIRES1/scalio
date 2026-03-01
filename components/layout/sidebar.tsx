'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ScanLine,
  FolderKanban,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  ChevronRight,
  Zap,
  LogOut,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  highlight?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href}>
          <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
              active
                ? 'bg-white/12 text-white'
                : highlight
                ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200'
                : 'text-slate-400 hover:bg-white/8 hover:text-white'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active ? 'text-white' : highlight ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'
              )}
            />
            <span className="truncate">{label}</span>
            {active && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
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
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-[#0F172A] select-none">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-4 border-b border-white/6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/50">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white">Scalio</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Plan Pro</span>
            <div className="h-1 w-1 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-3 space-y-1 border-t border-white/6 pt-3">
        {bottomItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href}
          />
        ))}
      </div>

      {/* User card */}
      <div className="p-3 border-t border-white/6">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/6 px-2.5 py-2 hover:bg-white/10 transition-colors cursor-pointer group">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-blue-600 text-[11px] font-semibold text-white">
              AP
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Antonio Pires</p>
            <p className="text-[10px] text-slate-500 truncate">ISOL2A92</p>
          </div>
          <LogOut className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
        </div>
      </div>
    </aside>
  )
}
