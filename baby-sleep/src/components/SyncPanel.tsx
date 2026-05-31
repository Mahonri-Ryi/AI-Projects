import { useState } from 'react'
import { encodeSyncLink } from '../lib/sync'
import type { AppState } from '../types'

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
          title: 'Little Dream — sync our baby sleep log',
          text: 'Open this link on your phone to sync sleep data',
          url: shareUrl,
        })
        return
      } catch {
        /* user cancelled */
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
    <section className="card sync">
      <h2>Share with family</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Send a sync link to your partner&apos;s phone. Opening it merges sleep history and profile
        (data stays on your devices — no account needed).
      </p>

      <div className="row">
        <button type="button" onClick={shareNative}>
          Share link
        </button>
        <button type="button" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>

      <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
        <strong>Tip:</strong> Add to Home Screen (Safari → Share → Add to Home Screen) for a
        full-screen app experience.
      </p>

      <h3 style={{ fontSize: '1rem', marginTop: '1.25rem' }}>Import from link</h3>
      <textarea
        placeholder="Paste sync URL here…"
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
      />
      <button
        type="button"
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'var(--accent)',
          color: 'white',
          fontWeight: 600,
        }}
        onClick={openImport}
      >
        Import
      </button>

      <h3 style={{ fontSize: '1rem', marginTop: '1.25rem' }}>Export backup</h3>
      <div className="row">
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `little-dream-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
          }}
        >
          Download JSON
        </button>
        <button
          type="button"
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
                  const data = JSON.parse(reader.result as string) as AppState
                  onImport({
                    profile: data.profile ?? state.profile,
                    sessions: data.sessions ?? [],
                    householdCode: data.householdCode ?? '',
                  })
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
    </section>
  )
}
