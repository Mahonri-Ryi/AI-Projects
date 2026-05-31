import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWeeklyReportToBlob } from './shareReportImage'

describe('renderWeeklyReportToBlob', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillStyle: '',
      fillRect: vi.fn(),
      font: '',
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 10 })),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext

    HTMLCanvasElement.prototype.toBlob = function (
      cb: BlobCallback,
      type?: string,
    ) {
      cb(new Blob(['png'], { type: type ?? 'image/png' }))
    }
  })

  it('returns a PNG blob', async () => {
    const blob = await renderWeeklyReportToBlob('Test Baby', {
      periodLabel: 'May 24 – May 30',
      avgTotalHours: 13.2,
      avgNapCount: 2,
      avgBedtime: '7:15 PM',
      bedtimeDriftMinutes: null,
      highlights: ['Solid week of logging'],
    })
    expect(blob).toBeTruthy()
    expect(blob?.type).toBe('image/png')
  })
})
