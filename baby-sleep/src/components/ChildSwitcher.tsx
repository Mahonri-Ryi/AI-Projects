import type { ChildProfile } from '../types'

interface Props {
  children: ChildProfile[]
  activeChildId: string
  onSelect: (id: string) => void
  onAdd: () => void
}

export function ChildSwitcher({ children, activeChildId, onSelect, onAdd }: Props) {
  return (
    <div className="child-switcher" role="tablist" aria-label="Select child">
      <div className="child-switcher__scroll">
        {children.map((child) => {
          const active = child.id === activeChildId
          const initial = (child.name || 'B').charAt(0).toUpperCase()
          return (
            <button
              key={child.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`child-chip ${active ? 'child-chip--active' : ''}`}
              onClick={() => onSelect(child.id)}
              style={{ '--child-color': child.color } as React.CSSProperties}
            >
              <span className="child-chip__avatar">{initial}</span>
              <span className="child-chip__name">{child.name || 'Baby'}</span>
            </button>
          )
        })}
        <button type="button" className="child-chip child-chip--add" onClick={onAdd}>
          <span className="child-chip__avatar">+</span>
          <span className="child-chip__name">Add</span>
        </button>
      </div>
    </div>
  )
}
