import { IconMoon, IconSun } from './icons'

interface Props {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: Props) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
    </button>
  )
}
