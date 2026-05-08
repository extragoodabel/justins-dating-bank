import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { ThemeContext } from './themeContext'
import {
  applyThemeToDocument,
  initialThemeMode,
  type ThemeMode,
  writeStoredTheme,
} from './themeStorage'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => initialThemeMode())

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    writeStoredTheme(mode)
    applyThemeToDocument(mode)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
