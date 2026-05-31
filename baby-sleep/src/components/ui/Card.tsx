import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: ReactNode
  action?: ReactNode
  padding?: 'md' | 'lg' | 'none'
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = 'md',
}: CardProps) {
  return (
    <section className={`card ${padding === 'none' ? 'card--flat' : ''} ${className}`}>
      {(title || action) && (
        <header className="card__header">
          <div>
            {title && <h2 className="card__title">{title}</h2>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={padding === 'none' ? '' : 'card__body'}>{children}</div>
    </section>
  )
}

interface StatCardProps {
  label: string
  value: string
  hint?: string
  trend?: string
  trendUp?: boolean
  accent?: 'default' | 'primary' | 'success' | 'warning'
}

export function StatCard({ label, value, hint, trend, trendUp, accent = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {hint && <span className="stat-card__hint">{hint}</span>}
      {trend && (
        <span className={`stat-card__trend ${trendUp ? 'up' : 'down'}`}>{trend}</span>
      )}
    </div>
  )
}
