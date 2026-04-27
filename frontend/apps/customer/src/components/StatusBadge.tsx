import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type OrderStatus = 'NEW' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED'

const statusConfig = {
  NEW: {
    label: 'Новый',
    className: 'bg-[var(--color-status-new-bg)] text-[var(--color-status-new)] border-[var(--color-status-new)]',
  },
  PROCESSING: {
    label: 'В обработке',
    className: 'bg-[var(--color-status-processing-bg)] text-[var(--color-status-processing)] border-[var(--color-status-processing)]',
  },
  READY: {
    label: 'Готов к доставке',
    className: 'bg-[var(--color-status-ready-bg)] text-[var(--color-status-ready)] border-[var(--color-status-ready)]',
  },
  DELIVERED: {
    label: 'Доставлен',
    className: 'bg-[var(--color-status-delivered-bg)] text-[var(--color-status-delivered)] border-[var(--color-status-delivered)]',
  },
  CANCELLED: {
    label: 'Отменён',
    className: 'bg-[var(--color-status-cancelled-bg)] text-[var(--color-status-cancelled)] border-[var(--color-status-cancelled)]',
  },
}

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, "font-medium", className)}
    >
      {config.label}
    </Badge>
  )
}
