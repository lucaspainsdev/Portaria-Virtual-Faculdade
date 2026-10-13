import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export { Skeleton }

// ── Compostos ─────────────────────────────────────────────────────────────────

export function SkeletonLine({ width = '100%', short, className }: { width?: string | number; short?: boolean; className?: string }) {
  return <Skeleton className={cn(short ? 'h-3' : 'h-4', className)} style={{ width }} />
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className='bg-card border border-border rounded-xl p-5 flex flex-col gap-3'>
      <div className='flex items-center gap-2.5 mb-1'>
        <Skeleton className='w-9 h-9 rounded-lg flex-shrink-0' />
        <div className='flex-1 flex flex-col gap-1.5'>
          <Skeleton className='h-3.5 w-3/5' />
          <Skeleton className='h-3 w-2/5' />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className='h-3.5' style={{ width: i === lines - 1 ? '70%' : '100%' }} />
      ))}
    </div>
  )
}

export function SkeletonCardGrid({ count = 6, cols = 2 }: { count?: number; cols?: number }) {
  return (
    <div className='grid gap-4' style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  const widths = ['40%', '60%', '30%', '25%', '15%']
  return (
    <tr className='border-b border-border'>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className='px-4 py-3.5'>
          <Skeleton className='h-3.5' style={{ width: widths[i % widths.length] }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className='bg-card border border-border rounded-xl overflow-hidden'>
      <div className='flex gap-6 px-4 py-3 border-b border-border'>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className='h-2.5' style={{ width: `${60 + (i % 3) * 20}px` }} />
        ))}
      </div>
      <table className='w-full border-collapse'>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => <SkeletonTableRow key={i} cols={cols} />)}
        </tbody>
      </table>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className='bg-card border border-border rounded-xl p-5 flex flex-col gap-2.5'>
      <Skeleton className='h-2.5 w-2/5' />
      <Skeleton className='h-8 w-3/5 rounded-md' />
      <Skeleton className='h-3 w-2/5' />
    </div>
  )
}

export function SkeletonPageHeader() {
  return (
    <div className='flex justify-between items-start mb-7'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-8 w-56 rounded-md' />
        <Skeleton className='h-3.5 w-40' />
      </div>
      <Skeleton className='h-9 w-36 rounded-md' />
    </div>
  )
}
