'use client'

import { useState } from 'react'
import { Sparkles, User, HandHeart, Building2, LayoutDashboard, Menu, X, Flame } from 'lucide-react'
import { BinaryRain } from '@/components/binary-rain'
import { ClientPanel } from '@/components/panels/client-panel'
import { TherapistPanel } from '@/components/panels/therapist-panel'
import { BusinessPanel } from '@/components/panels/business-panel'
import { AdminPanel } from '@/components/panels/admin-panel'
import { RecruitPanel } from '@/components/panels/recruit-panel'
import { cn } from '@/lib/utils'

type PanelKey = 'cliente' | 'terapeuta' | 'negocio' | 'admin' | 'registro'

const navItems: { key: PanelKey; label: string; icon: typeof User }[] = [
  { key: 'cliente', label: 'Cliente', icon: User },
  { key: 'terapeuta', label: 'Terapeuta', icon: HandHeart },
  { key: 'negocio', label: 'Negocio Afiliado', icon: Building2 },
  { key: 'admin', label: 'Mi Telemetría', icon: LayoutDashboard },
]

export default function Page() {
  const [panel, setPanel] = useState<PanelKey>('cliente')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen binary-grid">
      <BinaryRain />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navegación superior */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <button
              type="button"
              onClick={() => setPanel('registro')}
              title="Registro de Terapeutas"
              className="flex items-center gap-2.5 rounded-lg text-left outline-none transition-opacity hover:opacity-80"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-accent glow-border">
                <Sparkles className="size-5" />
              </span>
              <div className="leading-tight">
                <p className="text-lg font-bold text-foreground">
                  Frida<span className="text-accent text-glow-accent">5D</span>
                </p>
                <p className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
                  Cyber-Mexicano
                </p>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPanel(key)}
                  aria-current={panel === key ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    panel === key
                      ? 'bg-accent/15 text-accent glow-border'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg border border-border p-2 text-foreground md:hidden"
              aria-label="Abrir menú de navegación"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {/* Mobile nav */}
          {menuOpen ? (
            <nav className="grid gap-1 border-t border-border px-4 py-3 md:hidden">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setPanel(key)
                    setMenuOpen(false)
                  }}
                  className={cn(
                    'inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                    panel === key
                      ? 'bg-accent/15 text-accent'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </nav>
          ) : null}
        </header>

        {/* Contenido del panel */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-12">
          {panel === 'cliente' ? <ClientPanel /> : null}
          {panel === 'terapeuta' ? <TherapistPanel /> : null}
          {panel === 'negocio' ? <BusinessPanel /> : null}
          {panel === 'admin' ? <AdminPanel /> : null}
          {panel === 'registro' ? <RecruitPanel /> : null}
        </main>

        <footer className="border-t border-border px-4 py-6 text-center md:px-6">
          <p className="font-mono text-xs text-muted-foreground">
            Frida5D · El toque que sabe a tu alma ·{' '}
            <span className="text-gold text-glow-gold">01000110 01110010 01101001 01100100 01100001</span>
          </p>
          <button
            type="button"
            onClick={() => setPanel('registro')}
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-accent/70 transition-colors hover:text-accent"
          >
            <Flame className="size-3" />
            ¿Eres terapeuta? Únete a la red
          </button>
        </footer>
      </div>
    </div>
  )
}
