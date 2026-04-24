'use client'

export default function TerminalTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 left-5 z-[90] glass rounded-full px-3 py-2 text-xs font-mono text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-white md:hidden"
      aria-label="Open command terminal"
    >
      ⌘K
    </button>
  )
}
