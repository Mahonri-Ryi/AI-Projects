import { getAgeInMonths } from '../data/sleepScience'

export interface NapTransitionTip {
  id: string
  title: string
  signs: string[]
  tips: string[]
}

export function getNapTransitionTips(birthDate: string, now = new Date()): NapTransitionTip | null {
  const months = getAgeInMonths(birthDate, now)

  if (months >= 5 && months < 9) {
    return {
      id: 'to-2-naps',
      title: 'Moving toward 2 naps',
      signs: [
        'Shortening third nap or skipping it',
        'Longer morning wake window',
        'Night sleep staying solid',
      ],
      tips: [
        'Cap the last nap so bedtime stays steady',
        'Watch for overtired fussiness before bed',
      ],
    }
  }

  if (months >= 12 && months < 20) {
    return {
      id: 'to-1-nap',
      title: 'Ready to drop to 1 nap?',
      signs: [
        'Fighting the second nap',
        'Very long morning wake',
        'Bedtime pushed late or night wakes',
      ],
      tips: [
        'Shift the single nap later gradually (post-lunch)',
        'Earlier bedtime on transition days can help',
      ],
    }
  }

  if (months >= 20 && months < 30) {
    return {
      id: 'drop-nap',
      title: 'Dropping the last nap',
      signs: [
        'Bedtime battles when nap was late',
        'Sleeping through or extra night sleep',
        'Mood fine without afternoon nap some days',
      ],
      tips: [
        'Use quiet time instead of forced naps',
        'Keep bedtime consistent as naps fade',
      ],
    }
  }

  return null
}
