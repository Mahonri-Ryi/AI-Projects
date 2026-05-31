import { differenceInMinutes, format } from 'date-fns'
import type { SleepSession } from '../types'
import { getSleepStatus } from './sleepLogic'

export interface ForgotToLogPrompt {
  message: string
  awakeSinceLabel: string
  awakeMinutes: number
}

export function getForgotToLogPrompt(
  sessions: SleepSession[],
  maxWakeMinutes: number,
  now = new Date(),
): ForgotToLogPrompt | null {
  const status = getSleepStatus(sessions)
  if (status.isAsleep || !status.awakeSince) return null

  const awakeMinutes = differenceInMinutes(now, status.awakeSince)
  if (awakeMinutes < maxWakeMinutes) return null

  const last = status.lastEndedSession
  const context =
    last?.kind === 'nap'
      ? 'after that nap'
      : last?.kind === 'night'
        ? 'since morning wake-up'
        : 'with no sleep logged yet'

  return {
    awakeMinutes,
    awakeSinceLabel: format(status.awakeSince, 'h:mm a'),
    message: `Still awake since ${format(status.awakeSince, 'h:mm a')} (${awakeMinutes}m) ${context}. Everything okay?`,
  }
}
