'use client'

import { useEffect, useState } from 'react'
import { Zap, Flame, User, Phone, MapPin, Sparkles, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import { Panel, SectionTitle } from '@/components/frida-ui'
import { geoOptions } from '@/lib/data'
import { sendTherapistSignupWebhook, type WebhookResult } from '@/lib/webhook'
import { cn } from '@/lib/utils'

const specialties = [
  'Masaje Terapéutico Profundo',
  'Aromaterapia & Cempasúchil',
  'Drenaje Linfático',
  'Reflexología',
  'Sonoterapia Binaural 5D',
  'Piedras Volcánicas',
]

const allZones = [
  ...geoOptions.cuadrantes,
  ...geoOptions.turisticas,
  ...geoOptions.pueblosMagicos.map((p) => `Pueblo Mágico ${p}`),
]

export function RecruitPanel() {
  // Contador de urgencia estilo Temu
  const [spots, setSpots] = useState(7)
  const [viewers, setViewers] = useState(34)

  useEffect(() => {
    const t = setInterval(() => {
      setViewers((v) => Math.max(18, Math.min(89, v + Math.floor(Math.random() * 7) - 3)))
      // Baja de lugares ocasionalmente para reforzar la urgencia
      if (Math.random() > 0.7) {
        setSpots((s) => (s > 2 ? s - 1 : s))
      }
    }, 3200)
    return () => clearInterval(t)
  }, [])

  const [form, setForm] = useState({ name: '', phone: '', zone: allZones[0], specialty: specialties[0] })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<WebhookResult | null>(null)

  const canSubmit = form.name.trim().length > 1 && form.phone.trim().length >= 8

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || sending) return
    setSending(true)
    setResult(null)
    const res = await sendTherapistSignupWebhook({
      therapist: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        zone: form.zone,
        specialty: form.specialty,
      },
      campaign: 'registro-terapeutas-frida5d',
    })
    setResult(res)
    setSending(false)
    if (res.ok) setSpots((s) => (s > 2 ? s - 1 : s))
  }

  return (
    <div className="space-y-8">
      {/* Encabezado de alto impacto */}
      <div className="relative overflow-hidden rounded-2xl border border-accent/40 bg-card/70 p-6 backdrop-blur-sm glow-border md:p-8">
        <div className="relative z-10 space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-gold text-glow-gold">
            <Sparkles className="size-3.5" />
            Reclutamiento Exclusivo
          </p>
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Registro de Terapeutas <span className="text-accent text-glow-accent">Frida5D</span>
          </h1>
          <p className="max-w-xl text-pretty text-sm text-muted-foreground md:text-base">
            Únete a la red de bienestar cibernético mejor pagada de México. Certifícate, activa tu zona y empieza a
            generar ganancias inmediatas con cada escaneo NFC/QR.
          </p>
        </div>
      </div>

      {/* Contadores de urgencia estilo Temu */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel className="border-destructive/40 p-5">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <Flame className="size-6 animate-pulse-glow" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Últimos lugares en tu zona
              </p>
              <p className="text-3xl font-bold text-destructive text-glow-primary">
                {spots} <span className="text-base font-medium text-muted-foreground">disponibles</span>
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-destructive transition-all duration-700"
              style={{ width: `${(spots / 12) * 100}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[11px] text-destructive/90">¡Cupos cerrando rápido! No pierdas tu plaza.</p>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Zap className="size-6" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Viendo esta oferta ahora</p>
              <p className="text-3xl font-bold text-foreground text-glow-accent">
                {viewers} <span className="text-base font-medium text-muted-foreground">terapeutas</span>
              </p>
            </div>
          </div>
          <p className="mt-4 font-mono text-[11px] text-muted-foreground">
            <span className="mr-1 inline-block size-2 animate-pulse-glow rounded-full bg-accent align-middle" />
            Actividad en tiempo real · captación activa
          </p>
        </Panel>
      </div>

      {/* Formulario rápido */}
      <Panel className="p-6 md:p-8">
        <SectionTitle
          eyebrow="Registro Rápido · 30 segundos"
          title="Activa tu perfil y empieza a ganar"
          className="mb-6"
        />

        {result?.ok ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="size-14 text-accent text-glow-accent" />
            <p className="text-xl font-bold text-foreground">¡Registro enviado, {form.name.split(' ')[0]}!</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Estamos validando tu certificación. Recibirás la activación por WhatsApp muy pronto.
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {result.simulated ? 'Enviado a n8n (modo demo).' : 'Datos enviados a n8n correctamente.'} ID:{' '}
              <span className="text-gold">{result.id}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setResult(null)
                setForm({ name: '', phone: '', zone: allZones[0], specialty: specialties[0] })
              }}
              className="mt-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Registrar otra terapeuta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <User className="size-3.5" /> Nombre completo
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej. Citlali Vega"
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <Phone className="size-3.5" /> Teléfono (NFC/WhatsApp)
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Ej. 55 1234 5678"
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <MapPin className="size-3.5" /> Ubicación / Zona
                </span>
                <select
                  value={form.zone}
                  onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
                >
                  {allZones.map((z) => (
                    <option key={z} value={z} className="bg-card">
                      {z}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="size-3.5" /> Especialidad
                </span>
                <select
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
                >
                  {specialties.map((s) => (
                    <option key={s} value={s} className="bg-card">
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {result && !result.ok ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {result.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || sending}
              className={cn(
                'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 text-base font-bold transition-all',
                canSubmit && !sending
                  ? 'bg-accent text-accent-foreground glow-border hover:brightness-110'
                  : 'cursor-not-allowed bg-muted/40 text-muted-foreground',
              )}
            >
              {sending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Validando certificación...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-5" />
                  Validar Certificación y Activar Ganancias Inmediatas
                </>
              )}
            </button>

            <p className="text-center font-mono text-[11px] text-muted-foreground">
              Al registrarte aceptas la comisión corporativa del 10%. Tus datos se envían de forma segura a nuestra
              central n8n.
            </p>
          </form>
        )}
      </Panel>
    </div>
  )
}
