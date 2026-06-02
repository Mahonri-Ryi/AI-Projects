import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { toLocalDateTimeInput } from '../lib/localDateTime'
import { LogTimePrompt } from './LogTimePrompt'

describe('LogTimePrompt', () => {
  const now = new Date('2026-06-02T14:00:00')
  const minTime = new Date('2026-06-02T10:00:00')

  it('shows copy for each kind', () => {
    const { rerender } = render(
      <LogTimePrompt
        kind="start-nap"
        now={now}
        minTime={minTime}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('heading', { name: /when did the nap start/i })).toBeInTheDocument()

    rerender(
      <LogTimePrompt
        kind="wake-morning"
        now={now}
        minTime={minTime}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('heading', { name: /when did she wake up/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log morning wake/i })).toBeInTheDocument()
  })

  it('confirms with current time via Use now', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <LogTimePrompt
        kind="start-bedtime"
        now={now}
        minTime={minTime}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /use now/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm.mock.calls[0][0]).toBe(now.toISOString())
  })

  it('confirms custom time within bounds', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const custom = new Date('2026-06-02T11:30:00')
    render(
      <LogTimePrompt
        kind="wake-nap"
        now={now}
        minTime={minTime}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    const input = screen.getByLabelText(/or set time/i)
    fireEvent.change(input, { target: { value: toLocalDateTimeInput(custom.toISOString()) } })
    await user.click(screen.getByRole('button', { name: /log wake up/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(new Date(onConfirm.mock.calls[0][0]).getTime()).toBe(custom.getTime())
  })

  it('rejects time before minTime', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const tooEarly = new Date('2026-06-02T08:00:00')
    render(
      <LogTimePrompt
        kind="wake-nap"
        now={now}
        minTime={minTime}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    const input = screen.getByLabelText(/or set time/i)
    fireEvent.change(input, { target: { value: toLocalDateTimeInput(tooEarly.toISOString()) } })
    await user.click(screen.getByRole('button', { name: /log wake up/i }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByText(/wake time must be after the nap started/i)).toBeInTheDocument()
  })

  it('rejects future time', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const future = new Date('2026-06-02T18:00:00')
    render(
      <LogTimePrompt
        kind="start-nap"
        now={now}
        minTime={minTime}
        maxTime={now}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    const input = screen.getByLabelText(/or set time/i)
    fireEvent.change(input, { target: { value: toLocalDateTimeInput(future.toISOString()) } })
    await user.click(screen.getByRole('button', { name: /log nap start/i }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByText(/time cannot be in the future/i)).toBeInTheDocument()
  })

  it('calls onCancel without confirming', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <LogTimePrompt
        kind="night-wake-end"
        now={now}
        minTime={minTime}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
