'use client'

import { Nfc, QrCode, DoorClosed, Handshake, Building2 } from 'lucide-react'
import { scanEvents, formatMXN, AFFILIATE_SHARE, type ScanEvent } from '@/lib/data'
import { Panel, SectionTitle, StatCard } from '@/components/frida-ui'
import { cn } from '@/lib/utils'

const statusStyle: Record<ScanEvent['status'], string> = {
  'En curso': 'border-accent/50 bg-accent/10 text-accent',
  Completado: 'border-chart-4/50 bg-chart-4/10 text-chart-4',
  Solicitado: 'border-gold/50 bg-gold/10 text-gold',
}

export function BusinessPanel() {
  const totalRevenue = scanEvents.reduce((s, e) => s + e.amountMXN, 0)
  const affiliateEarnings = totalRevenue * AFFILIATE_SHARE
  const liveCount = scanEvents.filter((e) => e.status === 'En curso').length

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionTitle eyebrow="Negocio afiliado" title="Hotel Boutique Neón · Alianza Comercial" />
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary">
          <Building2 className="size-3.5" /> ID: AFF-5D-0091
        </span>
      </div>

      {/* Métricas de alianza */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Volumen generado"
          value={formatMXN(totalRevenue)}
          hint={`${scanEvents.length} escaneos hoy`}
          icon={<QrCode className="size-5" />}
        />
        <StatCard
          label="Ganancias compartidas (15%)"
          value={formatMXN(affiliateEarnings)}
          hint="Acumulado por alianza"
          icon={<Handshake className="size-5" />}
        />
        <StatCard
          label="Servicios en tiempo real"
          value={`${liveCount} en curso`}
          hint="Actualización en vivo"
          icon={<Nfc className="size-5" />}
        />
      </div>

      {/* Historial de escaneos */}
      <Panel className="overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="text-lg font-bold text-foreground">Historial de escaneos QR / Tags NFC</h3>
          <p className="text-sm text-muted-foreground">Por habitación · estatus en tiempo real</p>
        </div>

        {/* Tabla responsiva */}
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Origen</th>
                <th className="p-4">Método</th>
                <th className="p-4">Terapeuta</th>
                <th className="p-4">Servicio</th>
                <th className="p-4">Estatus</th>
                <th className="p-4 text-right">Monto</th>
                <th className="p-4 text-right">Tu 15%</th>
              </tr>
            </thead>
            <tbody>
              {scanEvents.map((e) => (
                <tr key={e.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 font-medium text-foreground">
                      <DoorClosed className="size-4 text-muted-foreground" />
                      {e.room}
                    </span>
                    <span className="ml-6 block font-mono text-xs text-muted-foreground">{e.time}</span>
                  </td>
                  <td className="p-4">
                    <MethodTag type={e.type} />
                  </td>
                  <td className="p-4 text-muted-foreground">{e.therapist}</td>
                  <td className="p-4 text-muted-foreground">{e.service}</td>
                  <td className="p-4">
                    <span className={cn('rounded-full border px-2.5 py-1 font-mono text-xs', statusStyle[e.status])}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium text-foreground">{formatMXN(e.amountMXN)}</td>
                  <td className="p-4 text-right font-bold text-gold text-glow-gold">
                    {formatMXN(e.amountMXN * AFFILIATE_SHARE)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards para móvil */}
        <div className="divide-y divide-border/50 md:hidden">
          {scanEvents.map((e) => (
            <div key={e.id} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <DoorClosed className="size-4 text-muted-foreground" />
                  {e.room}
                </span>
                <MethodTag type={e.type} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{e.therapist}</span>
                <span className="font-mono text-xs">{e.time}</span>
              </div>
              <p className="text-sm text-muted-foreground">{e.service}</p>
              <div className="flex items-center justify-between">
                <span className={cn('rounded-full border px-2.5 py-1 font-mono text-xs', statusStyle[e.status])}>
                  {e.status}
                </span>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatMXN(e.amountMXN)}</p>
                  <p className="text-xs font-bold text-gold text-glow-gold">
                    +{formatMXN(e.amountMXN * AFFILIATE_SHARE)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function MethodTag({ type }: { type: ScanEvent['type'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs',
        type === 'NFC'
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-primary/40 bg-primary/10 text-primary',
      )}
    >
      {type === 'NFC' ? <Nfc className="size-3.5" /> : <QrCode className="size-3.5" />}
      {type}
    </span>
  )
}
