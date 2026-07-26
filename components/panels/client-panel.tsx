'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Nfc, QrCode, Clock, Sparkles, Check, Loader2, Heart } from 'lucide-react'
import { massages, formatMXN, type Massage } from '@/lib/data'
import { sendBookingWebhook, type WebhookResult } from '@/lib/webhook'
import { Panel, SectionTitle } from '@/components/frida-ui'
import { cn } from '@/lib/utils'

export function ClientPanel() {
  const [selected, setSelected] = useState<Massage>(massages[3])
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [result, setResult] = useState<WebhookResult | null>(null)

  async function handleReserve() {
    setStatus('sending')
    setResult(null)
    const res = await sendBookingWebhook({
      massageId: selected.id,
      massage: selected.name,
      priceMXN: selected.priceMXN,
      channel: 'NFC/QR',
    })
    setResult(res)
    setStatus('sent')
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <div className="space-y-10">
      {/* Hero de bienvenida */}
      <Panel className="relative overflow-hidden">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-5 p-6 md:p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent">
              <Sparkles className="size-3.5" /> Frida5D · Cyber-Mexicano
            </span>
            <h1 className="text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl">
              El toque que{' '}
              <span className="text-accent text-glow-accent">sabe a tu alma</span>
            </h1>
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
              Masajes terapéuticos de lujo llevados a tu habitación con un solo acercamiento
              NFC o escaneo QR. Bienvenida a la experiencia sensorial 5D.
            </p>
            <div className="flex flex-wrap gap-4 font-mono text-xs text-muted-foreground">
              <span className="text-glow-gold text-gold">01001000</span>
              <span>Terapeutas certificadas</span>
              <span className="text-glow-gold text-gold">01101001</span>
              <span>Reserva instantánea</span>
            </div>
          </div>
          <div className="relative min-h-64 md:min-h-full">
            <Image
              src="/frida-cyber.png"
              alt="Retrato de una Frida Kahlo cibernética con corona floral de neón"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/20 to-transparent" />
          </div>
        </div>
      </Panel>

      {/* Catálogo */}
      <div className="space-y-6">
        <SectionTitle eyebrow="Catálogo de lujo" title="Elige tu ritual terapéutico" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {massages.map((m) => {
            const isSelected = selected.id === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m)}
                aria-pressed={isSelected}
                className={cn(
                  'group flex flex-col rounded-2xl border bg-card/70 p-5 text-left transition-all',
                  isSelected
                    ? 'border-accent glow-border-strong'
                    : 'border-border hover:border-accent/50 hover:glow-border',
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {m.focus}
                  </span>
                  {isSelected ? (
                    <span className="rounded-full bg-accent/15 p-1 text-accent">
                      <Check className="size-4" />
                    </span>
                  ) : (
                    <Heart className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </div>
                <h3 className="mt-3 text-lg font-bold text-foreground">{m.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{m.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {m.duration}
                  </span>
                  <span className="text-lg font-bold text-primary text-glow-primary">
                    {formatMXN(m.priceMXN)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reserva NFC/QR */}
      <Panel className="p-6 md:p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative flex size-20 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10">
              <span className="absolute inset-0 animate-pulse-glow rounded-2xl border border-accent/30" />
              <Nfc className="size-9 text-accent" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Reserva seleccionada
              </p>
              <p className="text-xl font-bold text-foreground">{selected.name}</p>
              <p className="text-sm text-muted-foreground">
                {selected.duration} · {formatMXN(selected.priceMXN)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReserve}
            disabled={status === 'sending'}
            className="inline-flex items-center gap-3 rounded-xl bg-accent px-6 py-4 font-bold text-accent-foreground transition-all glow-border-strong hover:brightness-110 disabled:opacity-70"
          >
            {status === 'sending' ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-1">
                <Nfc className="size-5" />
                <QrCode className="size-5" />
              </span>
            )}
            {status === 'sending' ? 'Enviando webhook…' : 'Reservar Ahora vía NFC/QR'}
          </button>
        </div>

        {result ? (
          <div
            className={cn(
              'mt-6 flex items-start gap-3 rounded-xl border p-4 font-mono text-sm',
              result.ok
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-destructive/40 bg-destructive/10 text-destructive',
            )}
          >
            <Check className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p>{result.message}</p>
              <p className="text-xs text-muted-foreground">
                dispatchId: {result.id} {result.simulated ? '· modo demo' : '· n8n en vivo'}
              </p>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  )
}
