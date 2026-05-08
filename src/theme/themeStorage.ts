/** Must match inline boot script in index.html */
export const THEME_STORAGE_KEY = 'eg-theme-mode-v1'

export type ThemeMode = 'light' | 'dark'

export function readStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
    return null
  } catch {
    return null
  }
}

export function writeStoredTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    /* ignore quota / private mode */
  }
}

export function initialThemeMode(): ThemeMode {
  const stored = readStoredTheme()
  if (stored) return stored
  return 'light'
}

export function applyThemeToDocument(mode: ThemeMode): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = mode
}
