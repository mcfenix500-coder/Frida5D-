'use client'

import { useMemo, useState } from 'react'
import { MapPin, Search, Compass, Star, Wallet, TrendingUp } from 'lucide-react'
import {
  therapists,
  geoOptions,
  formatMXN,
  CORPORATE_COMMISSION,
} from '@/lib/data'
import { Panel, SectionTitle, StatusPill, StatCard } from '@/components/frida-ui'
import { cn } from '@/lib/utils'

type GeoTab = 'cuadrantes' | 'turisticas' | 'pueblosMagicos'

const tabLabels: Record<GeoTab, string> = {
  cuadrantes: 'Cuadrantes',
  turisticas: 'Zonas Turísticas',
  pueblosMagicos: 'Pueblos Mágicos',
}

export function TherapistPanel() {
  const [tab, setTab] = useState<GeoTab>('cuadrantes')
  const [query, setQuery] = useState('')
  const [zone, setZone] = useState<string | null>(null)
  const [available, setAvailable] = useState(true)

  const zones = tab === 'pueblosMagicos' ? geoOptions.pueblosMagicos : geoOptions[tab]

  const filtered = useMemo(() => {
    return therapists.filter((t) => {
      const matchesQuery =
        !query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.zone.toLowerCase().includes(query.toLowerCase())
      const matchesZone = !zone || t.zone.includes(zone) || zone.includes(t.zone.split(' ').slice(-1)[0])
      return matchesQuery && matchesZone
    })
  }, [query, zone])

  // "Mis Comisiones": tomamos a la terapeuta destacada (Citlali) como usuaria activa.
  const me = therapists[3]
  const accrued = me.monthMXN * CORPORATE_COMMISSION

  return (
    <div className="space-y-10">
      <SectionTitle
        eyebrow="Turismo laboral"
        title="Encuentra tu próximo destino de trabajo"
      />

      {/* Mis comisiones + disponibilidad */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Ingresos del mes"
          value={formatMXN(me.monthMXN)}
          hint={`${me.services} servicios completados`}
          icon={<Wallet className="size-5" />}
        />
        <StatCard
          label="Comisión corporativa (10%)"
          value={formatMXN(accrued)}
          hint="Acumulado automático"
          icon={<TrendingUp className="size-5" />}
        />
        <Panel className="flex flex-col justify-between gap-3 p-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Estatus de disponibilidad
            </p>
            <div className="mt-3">
              <StatusPill active={available} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAvailable((v) => !v)}
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:border-accent/50"
          >
            {available ? 'Marcar como Inactiva' : 'Marcar como Activa'}
          </button>
        </Panel>
      </div>

      {/* Buscador geográfico */}
      <Panel className="space-y-5 p-6">
        <div className="flex items-center gap-2 text-accent">
          <Compass className="size-5" />
          <h3 className="text-lg font-bold text-foreground">Selector geográfico</h3>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por terapeuta o zona…"
            className="w-full rounded-xl border border-border bg-input/50 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(tabLabels) as GeoTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t)
                setZone(null)
              }}
              className={cn(
                'rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all',
                tab === t
                  ? 'bg-primary text-primary-foreground glow-border'
                  : 'border border-border bg-secondary/50 text-muted-foreground hover:text-foreground',
              )}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {zones.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setZone((cur) => (cur === z ? null : z))}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all',
                zone === z
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-card/50 text-muted-foreground hover:border-accent/40',
              )}
            >
              <MapPin className="size-3.5" />
              {z}
            </button>
          ))}
        </div>
      </Panel>

      {/* Resultados */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
          {filtered.length} terapeuta(s) en la red
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((t) => (
            <Panel key={t.id} className="flex items-center justify-between gap-4 p-5">
              <div className="space-y-1">
                <p className="font-bold text-foreground">{t.name}</p>
                <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" /> {t.zone}
                </p>
                <p className="inline-flex items-center gap-1 text-sm text-gold text-glow-gold">
                  <Star className="size-3.5 fill-current" /> {t.rating.toFixed(1)}
                </p>
              </div>
              <StatusPill active={t.active} />
            </Panel>
          ))}
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin coincidencias en esta zona.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
