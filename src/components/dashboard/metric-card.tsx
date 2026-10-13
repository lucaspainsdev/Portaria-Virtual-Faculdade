import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  trend?: {
    value: string
    positive: boolean
  }
  icon: LucideIcon
  accentColor: 'red' | 'green' | 'blue' | 'amber'
}

const accentStyles = {
  red: {
    bg: 'bg-[#cc0000]/10',
    text: 'text-[#cc0000]',
    ring: 'ring-[#cc0000]/20',
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    ring: 'ring-emerald-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    ring: 'ring-blue-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    ring: 'ring-amber-500/20',
  },
}

export function MetricCard({ title, value, trend, icon: Icon, accentColor }: MetricCardProps) {
  const styles = accentStyles[accentColor]

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/60">
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-heading text-2xl font-semibold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.positive ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value} vs mês anterior</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl ring-1',
            styles.bg,
            styles.ring
          )}
        >
          <Icon className={cn('h-6 w-6', styles.text)} />
        </div>
      </div>
    </div>
  )
}
