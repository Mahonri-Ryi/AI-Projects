import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

export function writeVersionJsonPlugin(buildId: string): Plugin {
  return {
    name: 'write-version-json',
    closeBundle() {
      const outDir = join(process.cwd(), 'dist')
      writeFileSync(
        join(outDir, 'version.json'),
        JSON.stringify({
          buildId,
          builtAt: new Date().toISOString(),
        }),
        'utf8',
      )
    },
  }
}
