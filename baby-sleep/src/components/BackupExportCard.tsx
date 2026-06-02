import type { AppState, ChildProfile, SleepSession } from '../types'
import { exportCsv, exportJson, exportPediatricianText, printPediatricianReport } from '../lib/export'
import { Card } from './ui/Card'

interface Props {
  state: AppState
  activeChild: ChildProfile | null
  childSessions: SleepSession[]
}

export function BackupExportCard({ state, activeChild, childSessions }: Props) {
  return (
    <Card title="Backup & export" subtitle="Download or print your data">
      <p className="prose" style={{ marginBottom: '1rem' }}>
        Exports include all children and sessions in this browser. Your data stays on this device unless
        you share a sync link.
      </p>
      <div className="btn-row">
        <button type="button" className="btn btn--ghost" onClick={() => exportJson(state)}>
          JSON backup
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => exportCsv(state)}>
          CSV sessions
        </button>
      </div>
      {activeChild && (
        <div className="btn-row" style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() =>
              exportPediatricianText(
                activeChild,
                childSessions,
                (state.nightWakes ?? []).filter((w) => w.childId === activeChild.id),
              )
            }
          >
            Visit summary (text)
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() =>
              printPediatricianReport(
                activeChild,
                childSessions,
                (state.nightWakes ?? []).filter((w) => w.childId === activeChild.id),
              )
            }
          >
            Print PDF
          </button>
        </div>
      )}
    </Card>
  )
}
