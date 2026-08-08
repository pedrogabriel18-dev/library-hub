import path from 'path'

export function getAppRoot() {
  return process.env.STORAGE_ROOT
    ? path.resolve(process.env.STORAGE_ROOT)
    : path.resolve(__dirname, '../../..')
}

export function resolveAppPath(relativePath: string) {
  return path.resolve(getAppRoot(), relativePath)
}

export function resolveSafeAppPath(relativePath: string): string | null {
  const root = getAppRoot()
  const resolved = path.resolve(root, relativePath)
  if (!resolved.startsWith(root)) {
    return null
  }
  return resolved
}
