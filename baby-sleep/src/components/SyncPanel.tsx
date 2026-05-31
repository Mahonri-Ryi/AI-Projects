import { useState } from 'react'
import { format, parseISO } from 'date-fns'
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
  const [partnerCopied, setPartnerCopied] = useState(false)

  const shareUrl = encodeSyncLink(state, window.location.origin + window.location.pathname)
  const syncMeta = state.syncMeta

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setImportText(shareUrl)
    }
  }

  const copyForPartner = async () => {
    const message = `Little Dream sleep log sync — open this link on your phone to merge our baby's sleep data:\n\n${shareUrl}`
    try {
      await navigator.clipboard.writeText(message)
      setPartnerCopied(true)
      setTimeout(() => setPartnerCopied(false), 2500)
    } catch {
      await copyLink()
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
      <Card title="Family sync" subtitle="Share all children, markers, and sleep logs">
        {syncMeta?.lastSyncedAt && (
          <p className="prose" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Last merged: {format(parseISO(syncMeta.lastSyncedAt), 'MMM d, h:mm a')}
            {syncMeta.lastSyncLabel ? ` — ${syncMeta.lastSyncLabel}` : ''}
            {syncMeta.mergeCount > 0 ? ` (${syncMeta.mergeCount} merges)` : ''}
          </p>
        )}
        <p className="prose" style={{ marginBottom: '1rem' }}>
          Send a link to your partner. Opening it <strong>merges</strong> sessions (newer end times win on
          conflicts). Share after logging so they get the latest.
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn--primary" onClick={shareNative}>
            Share link
          </button>
          <button type="button" className="btn btn--ghost" onClick={copyForPartner}>
            {partnerCopied ? 'Copied for partner' : 'Copy for partner'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={copyLink}>
            {copied ? 'Copied' : 'Copy URL'}
          </button>
        </div>
      </Card>

      <Card title="Import backup" subtitle="Restore from a link or JSON file">
        <textarea
          className="sync-textarea"
          placeholder="Paste sync URL here…"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          aria-label="Paste sync URL"
        />
        <button type="button" className="btn btn--ghost" style={{ width: '100%' }} onClick={openImport}>
          Import from link
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          style={{ width: '100%', marginTop: '0.75rem' }}
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
          Restore JSON file
        </button>
      </Card>
    </>
  )
}
