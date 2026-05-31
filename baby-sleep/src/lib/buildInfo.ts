/** Injected at build time (git SHA on CI, "dev" locally). */
export function getBuildId(): string {
  return typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev'
}

export function formatBuildLabel(buildId: string): string {
  if (buildId === 'dev') return 'Development build'
  if (/^[a-f0-9]{7,40}$/i.test(buildId)) {
    return `Release ${buildId.slice(0, 7)}`
  }
  return buildId
}

export function isProductionBuild(buildId: string): boolean {
  return buildId !== 'dev'
}
