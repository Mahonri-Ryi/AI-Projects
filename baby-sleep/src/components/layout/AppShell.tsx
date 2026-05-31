import type { ReactNode } from 'react'
import { IconBook, IconChart, IconHome, IconList, IconSettings } from '../icons'

export type AppTab = 'home' | 'insights' | 'history' | 'guide' | 'settings'

interface AppShellProps {
  tab: AppTab
  onTabChange: (tab: AppTab) => void
  childName: string
  ageLabel: string | null
  statusPill?: { label: string; variant: 'awake' | 'asleep' }
  children: ReactNode
}

const NAV: { id: AppTab; label: string; Icon: typeof IconHome }[] = [
  { id: 'home', label: 'Dashboard', Icon: IconHome },
  { id: 'insights', label: 'Insights', Icon: IconChart },
  { id: 'history', label: 'History', Icon: IconList },
  { id: 'guide', label: 'Guide', Icon: IconBook },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
]

export function AppShell({
  tab,
  onTabChange,
  childName,
  ageLabel,
  statusPill,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="top-bar__brand">
          <div className="top-bar__logo" aria-hidden>
            <span className="top-bar__logo-inner">LD</span>
          </div>
          <div>
            <p className="top-bar__product">Little Dream</p>
            <p className="top-bar__child">
              {childName}
              {ageLabel ? ` · ${ageLabel}` : ''}
            </p>
          </div>
        </div>
        {statusPill && (
          <span className={`status-pill status-pill--${statusPill.variant}`}>
            <span className="status-pill__dot" />
            {statusPill.label}
          </span>
        )}
      </header>

      <main className="app-main">{children}</main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`bottom-nav__item ${tab === id ? 'bottom-nav__item--active' : ''}`}
            onClick={() => onTabChange(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
