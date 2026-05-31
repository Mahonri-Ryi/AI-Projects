import { differenceInMinutes, format } from 'date-fns'
import { formatInUntilWithTime } from './timeDisplay'
import type {
  GlanceSummary,
  NextBedtimePrediction,
  NextNapPrediction,
  SleepStatus,
} from '../types'

export function getGlanceSummary(
  status: SleepStatus,
  prediction: NextNapPrediction | null,
  bedtimePrediction: NextBedtimePrediction | null,
  needsProfile: boolean,
  now = new Date(),
): GlanceSummary {
  if (needsProfile) {
    return {
      kind: 'profile',
      headline: 'Complete profile',
      subline: 'Add birth date to unlock nap and bedtime timing',
    }
  }

  if (status.isAsleep && status.asleepSince) {
    const kind = status.currentSession?.kind === 'night' ? 'night sleep' : 'nap'
    return {
      kind: 'asleep',
      headline: `Sleeping · ${kind}`,
      subline: `Since ${format(status.asleepSince, 'h:mm a')}`,
    }
  }

  const candidates: { mins: number; label: string; kind: GlanceSummary['kind'] }[] = []

  if (prediction) {
    const mins = differenceInMinutes(prediction.sweetSpot, now)
    if (mins > -30) {
      candidates.push({
        mins,
        label:
          mins > 0
            ? `Nap wind-down ${formatInUntilWithTime(mins, prediction.sweetSpot)}`
            : 'Nap window — wind down now',
        kind: 'nap-soon',
      })
    }
  }

  if (bedtimePrediction) {
    const mins = differenceInMinutes(bedtimePrediction.sweetSpot, now)
    if (mins > -30) {
      candidates.push({
        mins,
        label:
          mins > 60
            ? `Bedtime around ${format(bedtimePrediction.sweetSpot, 'h:mm a')}`
            : mins > 0
              ? `Bedtime ${formatInUntilWithTime(mins, bedtimePrediction.sweetSpot)}`
              : 'Bedtime window now',
        kind: 'bed-soon',
      })
    }
  }

  if (candidates.length === 0) {
    return {
      kind: 'awake',
      headline: 'Awake',
      subline: 'Log sleep to refresh timing',
    }
  }

  candidates.sort((a, b) => a.mins - b.mins)
  const next = candidates[0]
  return {
    kind: next.kind,
    headline: next.label,
    subline: candidates.length > 1 ? `Also: ${candidates[1].label}` : 'Based on age and your logs',
  }
}
