'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ScanLine,
  FolderKanban,
  History,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/analyse', label: 'Nouvelle analyse', icon: ScanLine, highlight: true },
  { href: '/projets', label: 'Projets', icon: FolderKanban },
  { href: '/historique', label: 'Historique', icon: History },
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
                ? 'text-white'
                : highlight
                ? 'text-white hover:bg-white/6'
                : 'text-white hover:bg-white/6'
            )}
            style={active ? { background: 'rgba(104,154,175,0.18)' } : undefined}
          >
            {active && (
              <motion.div
                layoutId="navActive"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                style={{ background: '#689AAF' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active
                  ? 'text-white'
                  : highlight
                  ? 'text-white'
                  : 'text-white'
              )}
            />
            <span className="truncate">{label}</span>
            {highlight && !active && (
              <span
                className="ml-auto inline-flex h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: '#689AAF' }}
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

// ── User profile (à remplacer par auth réelle le moment venu) ─────────────────
const USER_NAME = 'Antonio Pires'
const USER_ID = 'ISOL2A92'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex h-screen w-[232px] shrink-0 flex-col select-none"
      style={{
        background: 'linear-gradient(180deg, #203957 0%, #182E48 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex h-20 items-center pl-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-white.png" alt="Constor" style={{ height: 52, width: 'auto' }} />
      </motion.div>


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
      <div
        className="px-3 pb-3 space-y-0.5 border-t pt-3"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
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
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          whileHover={{ backgroundColor: 'rgba(104,154,175,0.1)' }}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer group transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="user-avatar" data-initials="AP" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{USER_NAME}</p>
            <p className="label-xs truncate text-white/50">{USER_ID}</p>
          </div>
          <LogOut className="h-3.5 w-3.5 transition-colors shrink-0 text-white/50" />
        </motion.div>
      </div>
    </aside>
  )
}
