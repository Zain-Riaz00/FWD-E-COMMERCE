import { useEffect } from 'react'

// Attach a mouse-follow glow effect to an element (ref.current) by updating CSS variables
export function useMouseGlow(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const element = el as HTMLElement

    function onMove(e: MouseEvent) {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      element.style.setProperty('--glow-x', `${x}px`)
      element.style.setProperty('--glow-y', `${y}px`)
      element.style.setProperty('--glow-opacity', '1')
    }

    function onLeave() {
      element.style.setProperty('--glow-opacity', '0')
    }

    element.addEventListener('mousemove', onMove)
    element.addEventListener('mouseleave', onLeave)
    return () => {
      element.removeEventListener('mousemove', onMove)
      element.removeEventListener('mouseleave', onLeave)
    }
  }, [ref])
}
