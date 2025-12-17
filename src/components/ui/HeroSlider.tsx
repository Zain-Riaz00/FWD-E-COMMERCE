import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Slide } from '@/types/product'

interface HeroSliderProps {
  slides: Slide[]
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()
  
  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slides.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [slides.length])
  
  if (slides.length === 0) return null
  
  const currentSlide = slides[currentIndex]
  
  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }
  
  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }
  
  function handleSlideClick() {
    if (currentSlide.linkTo) {
      navigate(currentSlide.linkTo)
    }
  }
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r dark:from-black/80 dark:via-black/50 dark:to-transparent from-white/80 via-white/50 to-transparent" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center px-6">
            <div className="max-w-md">
              <motion.h2
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold text-white dark:text-white text-slate-900 mb-3 leading-tight"
              >
                {currentSlide.title}
              </motion.h2>
              
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm sm:text-base text-cyan-100/90 dark:text-cyan-100/90 text-slate-700 mb-4 leading-relaxed"
              >
                {currentSlide.description}
              </motion.p>
              
              {currentSlide.buttonText && (
                <motion.button
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleSlideClick}
                  className="px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/20 from-blue-600 to-indigo-600 text-white font-semibold text-sm ring-1 dark:ring-cyan-400/40 ring-blue-400/60 backdrop-blur-md transition-all dark:hover:from-cyan-500/30 dark:hover:to-blue-500/30 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg dark:hover:shadow-cyan-500/30 hover:shadow-blue-500/40 transform hover:scale-105 rounded-lg"
                >
                  {currentSlide.buttonText}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 bg-black/40 dark:bg-black/40 bg-white/80 hover:bg-black/60 dark:hover:bg-black/60 hover:bg-white/95 text-white dark:text-white text-slate-900 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 bg-black/40 dark:bg-black/40 bg-white/80 hover:bg-black/60 dark:hover:bg-black/60 hover:bg-white/95 text-white dark:text-white text-slate-900 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}
      
      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 bg-cyan-500' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
