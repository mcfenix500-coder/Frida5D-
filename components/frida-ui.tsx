import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'glow-border rounded-2xl border border-border bg-card/70 backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string
  title: string
  className?: string
}) {
  return (
    <div className={cn('space-y-1', className)}>
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent text-glow-accent">{eyebrow}</p>
      ) : null}
      <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
    </div>
  )
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-medium',
        active
          ? 'border-accent/50 bg-accent/10 text-accent'
          : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-2 rounded-full',
          active ? 'bg-accent animate-pulse-glow' : 'bg-muted-foreground',
        )}
      />
      {active ? 'Activa' : 'Inactiva'}
    </span>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
}) {
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground text-glow-primary">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? <span className="text-accent">{icon}</span> : null}
      </div>
    </Panel>
  )
}
