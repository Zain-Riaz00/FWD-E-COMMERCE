import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Slide } from '@/types/product'

interface HeroSliderProps {
  slides: Slide[]
}

// Image preloader utility
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Track loaded images globally to persist across component remounts
const loadedImages = new Set<string>()

// Memoized slide content to prevent unnecessary re-renders
const SlideContent = memo(function SlideContent({ 
  slide, 
  isActive, 
  onNavigate,
  isImageLoaded
}: { 
  slide: Slide
  isActive: boolean
  onNavigate: () => void
  isImageLoaded: boolean
}) {
  return (
    <div 
      className={`absolute inset-0 transition-opacity duration-500 ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
      }`}
      style={{ willChange: isActive ? 'opacity' : 'auto' }}
    >
      {/* Background Image - Only show when loaded */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
          isImageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url(${slide.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r dark:from-black/80 dark:via-black/50 dark:to-transparent from-white/80 via-white/50 to-transparent" />
      </div>
      
      {/* Fallback gradient while loading */}
      {!isImageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#050810] to-[#0a0e1a]" />
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-6">
        <div className="max-w-md">
          {slide.title && (
            <h2 className={`text-2xl sm:text-3xl font-bold text-white dark:text-white text-slate-900 mb-3 leading-tight transition-all duration-300 ${
              isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: isActive ? '150ms' : '0ms' }}
            >
              {slide.title}
            </h2>
          )}
          
          {slide.description && (
            <p className={`text-sm sm:text-base text-cyan-100/90 dark:text-cyan-100/90 text-slate-700 mb-4 leading-relaxed transition-all duration-300 ${
              isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: isActive ? '250ms' : '0ms' }}
            >
              {slide.description}
            </p>
          )}
          
          {slide.buttonText && (
            <button
              onClick={onNavigate}
              className={`px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/20 from-blue-600 to-indigo-600 text-white font-semibold text-sm ring-1 dark:ring-cyan-400/40 ring-blue-400/60 backdrop-blur-md hover:scale-105 transition-all duration-200 rounded-lg ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ transitionDelay: isActive ? '350ms' : '0ms' }}
            >
              {slide.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

function HeroSlider({ slides }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedSlideImages, setLoadedSlideImages] = useState<Set<string>>(new Set(loadedImages))
  const navigate = useNavigate()
  const hasPreloaded = useRef(false)
  
  // Preload all slide images on mount
  useEffect(() => {
    if (slides.length === 0 || hasPreloaded.current) return
    hasPreloaded.current = true
    
    const preloadAllImages = async () => {
      const imagesToLoad = slides.filter(slide => !loadedImages.has(slide.imageUrl))
      
      await Promise.all(
        imagesToLoad.map(async (slide) => {
          try {
            await preloadImage(slide.imageUrl)
            loadedImages.add(slide.imageUrl)
            setLoadedSlideImages(new Set(loadedImages))
          } catch (error) {
            console.warn(`Failed to preload image: ${slide.imageUrl}`)
          }
        })
      )
    }
    
    preloadAllImages()
  }, [slides])
  
  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slides.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [slides.length])
  
  const handleNavigate = useCallback((linkTo: string | undefined) => {
    if (linkTo) navigate(linkTo)
  }, [navigate])
  
  if (slides.length === 0) return null
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* All slides rendered, visibility controlled by opacity */}
      {slides.map((slide, index) => (
        <SlideContent
          key={slide.id || index}
          slide={slide}
          isActive={index === currentIndex}
          onNavigate={() => handleNavigate(slide.linkTo)}
          isImageLoaded={loadedSlideImages.has(slide.imageUrl)}
        />
      ))}
      
      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 bg-cyan-500' 
                  : 'w-1.5 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(HeroSlider)
