import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export type NavigationType = 'push' | 'pop' | 'replace'

// Define routes where animations should play
const ANIMATE_TO_ROUTES = ['/cart', '/products/immersive', '/products/gallery']

export function useNavigationType(): NavigationType {
  const location = useLocation()
  const prevPathnameRef = useRef(location.pathname)
  const navigationTypeRef = useRef<NavigationType>('push')

  useEffect(() => {
    const currentPath = location.pathname
    const prevPath = prevPathnameRef.current

    // Detect if navigating TO an animate route (play animation)
    const isNavigatingToAnimatedRoute = ANIMATE_TO_ROUTES.some(route => 
      currentPath.includes(route)
    )

    // Detect if navigating FROM an animate route (skip animation)
    const isNavigatingFromAnimatedRoute = ANIMATE_TO_ROUTES.some(route => 
      prevPath.includes(route)
    )

    if (isNavigatingToAnimatedRoute && !isNavigatingFromAnimatedRoute) {
      navigationTypeRef.current = 'push' // Play animation
    } else if (isNavigatingFromAnimatedRoute) {
      navigationTypeRef.current = 'pop' // Skip animation (going back)
    } else {
      navigationTypeRef.current = 'push' // Default behavior
    }

    prevPathnameRef.current = currentPath
  }, [location])

  return navigationTypeRef.current
}
