import { Card } from './ui/Card'

export function PrivacyCard() {
  return (
    <Card title="Privacy" subtitle="How your data is stored">
      <ul className="privacy-list">
        <li>
          <strong>On your device:</strong> Sleep logs and child profiles live in this browser’s storage
          (localStorage). They are not sent to our servers.
        </li>
        <li>
          <strong>Sync links:</strong> Only created when you tap Share. Anyone with the link can import
          that data — treat links like private messages.
        </li>
        <li>
          <strong>Backups:</strong> JSON/CSV exports are files you control. Store them securely if they
          contain health-related information.
        </li>
        <li>
          <strong>Sleep Coach (optional):</strong> If you add an OpenAI API key, questions go from your
          browser through a proxy you configure (or dev-only `/api/coach`) straight to OpenAI. Keys and
          chat history stay on this device unless you export them. Cursor <code>crsr_</code> keys are not
          used for chat.
        </li>
        <li>
          <strong>Not medical advice:</strong> Little Dream offers educational timing based on published
          research. Always consult your pediatrician for medical concerns.
        </li>
      </ul>
    </Card>
  )
}
