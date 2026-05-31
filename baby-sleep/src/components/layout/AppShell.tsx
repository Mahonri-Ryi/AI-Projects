import type { ReactNode } from 'react'
import type { ChildProfile } from '../../types'
import { IconBook, IconChart, IconChat, IconHome, IconList, IconSettings } from '../icons'
import { ChildSwitcher } from '../ChildSwitcher'
import { ThemeToggle } from '../ThemeToggle'

export type AppTab = 'home' | 'insights' | 'coach' | 'history' | 'guide' | 'settings'

interface AppShellProps {
  tab: AppTab
  onTabChange: (tab: AppTab) => void
  children: ChildProfile[]
  activeChildId: string
  onSelectChild: (id: string) => void
  onAddChild: () => void
  ageLabel: string | null
  statusPill?: { label: string; variant: 'awake' | 'asleep' }
  contentChildren: ReactNode
  isDark: boolean
  onThemeQuickToggle: () => void
}

const NAV: { id: AppTab; label: string; Icon: typeof IconHome }[] = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'insights', label: 'Insights', Icon: IconChart },
  { id: 'coach', label: 'Coach', Icon: IconChat },
  { id: 'history', label: 'History', Icon: IconList },
  { id: 'guide', label: 'Guide', Icon: IconBook },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
]

export function AppShell({
  tab,
  onTabChange,
  children,
  activeChildId,
  onSelectChild,
  onAddChild,
  ageLabel,
  statusPill,
  contentChildren,
  isDark,
  onThemeQuickToggle,
}: AppShellProps) {
  const activeChild = children.find((c) => c.id === activeChildId)

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
              {activeChild?.name ?? 'Select child'}
              {ageLabel ? ` · ${ageLabel}` : ''}
            </p>
          </div>
        </div>
        <div className="top-bar__actions">
          <ThemeToggle isDark={isDark} onToggle={onThemeQuickToggle} />
          {statusPill && (
            <span className={`status-pill status-pill--${statusPill.variant}`}>
              <span className="status-pill__dot" />
              {statusPill.label}
            </span>
          )}
        </div>
      </header>

      {children.length > 0 && (
        <ChildSwitcher
          children={children}
          activeChildId={activeChildId}
          onSelect={onSelectChild}
          onAdd={onAddChild}
        />
      )}

      <main className="app-main">{contentChildren}</main>

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
