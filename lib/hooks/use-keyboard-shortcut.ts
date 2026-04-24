'use client'

import { useEffect } from 'react'

type ShortcutHandler = (event: KeyboardEvent) => void

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const normalized = shortcut.toLowerCase()
  const wantsMod = normalized.includes('mod+')
  const wantsShift = normalized.includes('shift+')
  const wantsAlt = normalized.includes('alt+')
  const key = normalized.split('+').at(-1)

  if (!key) return false
  if (wantsMod && !(event.metaKey || event.ctrlKey)) return false
  if (!wantsMod && (event.metaKey || event.ctrlKey)) return false
  if (wantsShift !== event.shiftKey) return false
  if (wantsAlt !== event.altKey) return false

  return event.key.toLowerCase() === key
}

export function useKeyboardShortcut(shortcuts: string[], handler: ShortcutHandler) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeTag = (event.target as HTMLElement | null)?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea') return

      if (shortcuts.some(shortcut => matchesShortcut(event, shortcut))) {
        event.preventDefault()
        handler(event)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts, handler])
}
