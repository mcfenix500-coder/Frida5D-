'use client'

import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, Radio, Send, Loader2, Check, Users, DollarSign, Grid3x3 } from 'lucide-react'
import {
  revenueSeries,
  heatmapCells,
  therapists,
  formatMXN,
  geoOptions,
} from '@/lib/data'
import { sendBroadcastWebhook, type WebhookResult } from '@/lib/webhook'
import { Panel, SectionTitle, StatCard } from '@/components/frida-ui'
import { cn } from '@/lib/utils'

const quadrantNames = geoOptions.cuadrantes

export function AdminPanel() {
  const totalRevenue = useMemo(() => revenueSeries.reduce((s, d) => s + d.ingresos, 0), [])
  const totalServices = useMemo(() => revenueSeries.reduce((s, d) => s + d.servicios, 0), [])
  const activeTherapists = therapists.filter((t) => t.active).length

  const [zone, setZone] = useState(quadrantNames[0])
  const [message, setMessage] = useState('Captación urgente de terapeutas: bono de bienvenida activo esta semana.')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [result, setResult] = useState<WebhookResult | null>(null)

  async function launchBroadcast() {
    setStatus('sending')
    setResult(null)
    const res = await sendBroadcastWebhook({
      channel: 'n8n',
      targetZone: zone,
      message,
      audience: 'terapeutas',
    })
    setResult(res)
    setStatus('sent')
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
          <Activity className="size-5" />
        </span>
        <SectionTitle eyebrow="Mi Telemetría" title="Dashboard de control central" />
      </div>

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingresos totales (7d)" value={formatMXN(totalRevenue)} hint="+18% vs semana previa" icon={<DollarSign className="size-5" />} />
        <StatCard label="Servicios completados" value={`${totalServices}`} hint="Red completa" icon={<Check className="size-5" />} />
        <StatCard label="Terapeutas activas" value={`${activeTherapists}/${therapists.length}`} hint="En tiempo real" icon={<Users className="size-5" />} />
        <StatCard label="Cuadrantes activos" value="9/16" hint="Cobertura de ciudad" icon={<Grid3x3 className="size-5" />} />
      </div>

      {/* Gráficas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-5">
          <h3 className="mb-4 text-lg font-bold text-foreground">Ingresos totales</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueSeries} margin={{ left: -10, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  color: 'var(--popover-foreground)',
                }}
                formatter={(v: number) => [formatMXN(v), 'Ingresos']}
              />
              <Area type="monotone" dataKey="ingresos" stroke="var(--chart-2)" strokeWidth={2} fill="url(#fillIngresos)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="p-5">
          <h3 className="mb-4 text-lg font-bold text-foreground">Servicios por día</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueSeries} margin={{ left: -18, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'var(--secondary)', opacity: 0.4 }}
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  color: 'var(--popover-foreground)',
                }}
                formatter={(v: number) => [`${v} servicios`, '']}
              />
              <Bar dataKey="servicios" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Mapa de calor + difusión */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-5">
          <h3 className="text-lg font-bold text-foreground">Mapa de calor · terapeutas activas</h3>
          <p className="mb-4 text-sm text-muted-foreground">Densidad por cuadrantes de la ciudad</p>
          <div className="grid grid-cols-4 gap-2">
            {heatmapCells.map((intensity, i) => (
              <div
                key={i}
                title={`Cuadrante ${i + 1} · ${Math.round(intensity * 100)}% densidad`}
                className="flex aspect-square items-center justify-center rounded-lg font-mono text-xs font-bold transition-transform hover:scale-105"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--accent) ${Math.round(intensity * 100)}%, var(--card))`,
                  color: intensity > 0.5 ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                  boxShadow: intensity > 0.7 ? '0 0 18px oklch(0.66 0.27 350 / 40%)' : 'none',
                }}
              >
                {Math.round(intensity * 100)}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span>Baja</span>
            <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-card via-accent/40 to-accent" />
            <span>Alta</span>
          </div>
        </Panel>

        <Panel className="flex flex-col p-5">
          <div className="flex items-center gap-2 text-accent">
            <Radio className="size-5" />
            <h3 className="text-lg font-bold text-foreground">Difusión Masiva Geográfica</h3>
          </div>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Lanza alertas de captación a terapeutas por zona mediante n8n
          </p>

          <label className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Zona objetivo</label>
          <div className="mb-4 flex flex-wrap gap-2">
            {quadrantNames.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZone(z)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs transition-all',
                  zone === z
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-card/50 text-muted-foreground hover:border-accent/40',
                )}
              >
                {z}
              </button>
            ))}
          </div>

          <label className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Mensaje de alerta</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="mb-4 w-full resize-none rounded-xl border border-border bg-input/50 p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
          />

          <button
            type="button"
            onClick={launchBroadcast}
            disabled={status === 'sending' || !message.trim()}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-bold text-primary-foreground transition-all glow-border hover:brightness-110 disabled:opacity-70"
          >
            {status === 'sending' ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
            {status === 'sending' ? 'Lanzando alerta…' : 'Lanzar alerta vía n8n'}
          </button>

          {result ? (
            <div
              className={cn(
                'mt-4 flex items-start gap-2 rounded-xl border p-3 font-mono text-xs',
                result.ok ? 'border-accent/40 bg-accent/10 text-accent' : 'border-destructive/40 bg-destructive/10 text-destructive',
              )}
            >
              <Check className="mt-0.5 size-4 shrink-0" />
              <div>
                <p>{result.message}</p>
                <p className="text-muted-foreground">
                  Zona: {zone} · id: {result.id} {result.simulated ? '· demo' : '· en vivo'}
                </p>
              </div>
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  )
}
