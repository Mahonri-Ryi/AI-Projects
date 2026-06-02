import { parseISO } from 'date-fns'

export function toLocalDateTimeInput(iso: string): string {
  const d = parseISO(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalDateTimeInput(value: string): string {
  return new Date(value).toISOString()
}
