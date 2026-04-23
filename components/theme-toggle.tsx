'use client'

import { useState, useSyncExternalStore } from 'react'

type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'site-theme'

function getTheme(): ThemeMode {
  if (typeof document === 'undefined') {
    return 'dark'
  }

  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  window.localStorage.setItem(STORAGE_KEY, theme)
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const resolvedTheme = isClient ? getTheme() : theme
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => {
        const updatedTheme = nextTheme
        applyTheme(updatedTheme)
        setTheme(updatedTheme)
      }}
      className="fixed bottom-5 right-5 z-[90] glass rounded-full px-4 py-2.5 text-sm font-medium text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_65px_rgba(0,0,0,0.18)]"
      aria-label={resolvedTheme === 'dark' ? 'Switch to Apple light mode' : 'Switch to dark mode'}
    >
      <span className="flex items-center gap-2">
        <span
          className="theme-toggle-orb flex h-7 w-7 items-center justify-center rounded-full border border-current/10 bg-current/5"
          aria-hidden="true"
        >
          {resolvedTheme === 'light' ? (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3c-.01.2-.01.39-.01.59A7.5 7.5 0 0018.41 11c.2 0 .39 0 .59-.01z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
            </svg>
          )}
        </span>
        <span>{resolvedTheme === 'light' ? 'Midnight' : 'Apple Light'}</span>
      </span>
    </button>
  )
}
