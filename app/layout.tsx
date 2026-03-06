import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/lib/app-context'
import { ExtensionCleaner } from '@/components/layout/extension-cleaner'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Constor — Automatisation du Métré par IA',
  description: 'Transformez vos plans PDF en métrés complets en moins de 5 minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning data-1p-ignore data-lpignore="true">
      <head>
        <meta name="1password" content="off" />
      </head>
      <body className={`${plusJakarta.variable} ${dmMono.variable} font-sans`}>
        <ExtensionCleaner />
        <TooltipProvider delayDuration={300}>
          <AppProvider>
            {children}
          </AppProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
