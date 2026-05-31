import { useState } from 'react'
import { normalizeState } from '../lib/migrate'
import { encodeSyncLink } from '../lib/sync'
import type { AppState } from '../types'
import { Card } from './ui/Card'

interface Props {
  state: AppState
  onImport: (state: AppState) => void
}

export function SyncPanel({ state, onImport }: Props) {
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState('')

  const shareUrl = encodeSyncLink(state, window.location.origin + window.location.pathname)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setImportText(shareUrl)
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Little Dream — sync sleep data',
          text: 'Open this link to sync our baby sleep log',
          url: shareUrl,
        })
        return
      } catch {
        /* cancelled */
      }
    }
    await copyLink()
  }

  const openImport = () => {
    const payload = importText.trim()
    if (!payload.startsWith('http')) {
      window.location.href = payload.includes('?') ? payload : `?sync=${payload}`
      return
    }
    window.location.href = payload
  }

  return (
    <>
      <Card title="Family sync" subtitle="Share all children and sleep logs across devices">
        <p className="prose" style={{ marginBottom: '1rem' }}>
          Send a secure link to your partner. Opening it merges every child&apos;s profile and sleep history.
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn--primary" onClick={shareNative}>
            Share link
          </button>
          <button type="button" className="btn btn--ghost" onClick={copyLink}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="prose" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          Tip: Add to Home Screen for a native app experience (Share → Add to Home Screen).
        </p>
      </Card>

      <Card title="Import backup" subtitle="Restore from a link or file">
        <textarea
          className="sync-textarea"
          placeholder="Paste sync URL here…"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />
        <button type="button" className="btn btn--ghost" style={{ width: '100%' }} onClick={openImport}>
          Import from link
        </button>
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = `little-dream-${new Date().toISOString().slice(0, 10)}.json`
              a.click()
            }}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'application/json'
              input.onchange = () => {
                const file = input.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  try {
                    const data = JSON.parse(reader.result as string)
                    onImport(normalizeState(data))
                  } catch {
                    alert('Invalid backup file')
                  }
                }
                reader.readAsText(file)
              }
              input.click()
            }}
          >
            Restore JSON
          </button>
        </div>
      </Card>
    </>
  )
}
