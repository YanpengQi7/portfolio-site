'use client'

import Link, { type LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children?: ReactNode
    /** Optional shared-element name. Applied to this link before navigation so the
     * target page's element with the same `view-transition-name` morphs from it. */
    transitionName?: string
  }

/**
 * Drop-in replacement for <Link> that uses the native View Transitions API
 * to cross-fade (or shared-element morph) between route changes.
 * Degrades gracefully to a normal Link on browsers without support.
 */
const ViewTransitionLink = forwardRef<HTMLAnchorElement, Props>(function ViewTransitionLink(
  { href, onClick, transitionName, style, ...rest },
  ref,
) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return

    // Only intercept plain left-clicks on same-origin internal links
    if (
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
      e.button !== 0 ||
      rest.target === '_blank' ||
      typeof href !== 'string'
    ) return

    const start = (document as Document & {
      startViewTransition?: (cb: () => void | Promise<void>) => unknown
    }).startViewTransition

    if (typeof start !== 'function') return

    e.preventDefault()

    if (transitionName) {
      e.currentTarget.style.viewTransitionName = transitionName
    }

    start.call(document, () => {
      router.push(href)
    })
  }

  return (
    <Link
      ref={ref}
      href={href}
      onClick={handleClick}
      style={style}
      {...rest}
    />
  )
})

export default ViewTransitionLink
