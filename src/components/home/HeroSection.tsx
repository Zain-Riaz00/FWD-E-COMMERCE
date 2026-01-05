import { useEffect, useRef, useState } from 'react'
import { Edit2 } from 'lucide-react'
import HeroSlider from '@/components/ui/HeroSlider'
import SliderManagementModal from '@/components/admin/SliderManagementModal'
import { useAdmin } from '@/contexts/AdminContext'
import type { Slide } from '@/types/product'

// Cache for slides to prevent re-fetching
let cachedSlides: Slide[] | null = null

export default function HeroSection() {
  const { isAdmin } = useAdmin()
  const [slides, setSlides] = useState<Slide[]>(() => cachedSlides || [])
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(cachedSlides !== null)

  // Load slides from API - only if not cached
  useEffect(() => {
    if (cachedSlides && cachedSlides.length > 0) {
      setSlides(cachedSlides)
      setIsLoaded(true)
      return
    }
    
    const loadSlides = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/slides');
        if (response.ok) {
          const data = await response.json();
          cachedSlides = data
          setSlides(data);
          localStorage.setItem('heroSlides', JSON.stringify(data));
        } else {
          const saved = localStorage.getItem('heroSlides');
          if (saved) {
            const parsed = JSON.parse(saved)
            cachedSlides = parsed
            setSlides(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load slides:', error);
        const saved = localStorage.getItem('heroSlides');
        if (saved) {
          const parsed = JSON.parse(saved)
          cachedSlides = parsed
          setSlides(parsed);
        } else {
          const defaultSlides: Slide[] = [
            {
              id: '1',
              title: 'Welcome to the Future',
              description: 'Experience next-generation products',
              imageUrl: 'https://picsum.photos/seed/hero1/800/600',
              buttonText: 'Explore',
              linkTo: '/products',
              order: 0,
            },
          ];
          cachedSlides = defaultSlides
          setSlides(defaultSlides);
        }
      } finally {
        setIsLoaded(true)
      }
    };
    loadSlides();
  }, [])
  
  async function handleSaveSlides(newSlides: Slide[]) {
    // If no slides, keep at least one default slide to prevent blank screen
    const slidesToSave = newSlides.length > 0 ? newSlides : [
      {
        id: '1',
        title: 'Welcome',
        description: 'Explore our products',
        imageUrl: 'https://picsum.photos/seed/hero1/800/600',
        buttonText: 'Shop Now',
        linkTo: '/products',
        order: 0,
      }
    ];
    
    // Save to database
    try {
      const response = await fetch('http://localhost:5000/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slidesToSave),
      });
      
      if (response.ok) {
        console.log('Slides saved to database');
        setSlides(slidesToSave);
        // Also save to localStorage as backup
        localStorage.setItem('heroSlides', JSON.stringify(slidesToSave));
      } else {
        throw new Error('Failed to save slides');
      }
    } catch (error) {
      console.error('Error saving slides:', error);
      // Update cache when saving
    cachedSlides = slidesToSave;
    setSlides(slidesToSave);
    localStorage.setItem('heroSlides', JSON.stringify(slidesToSave));
    alert('Slides saved locally but failed to sync with database');
    }
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#050810]">
      {/* Full-Width Hero Slider */}
      <div className="relative h-[50vh] min-h-[400px] md:h-[65vh] lg:h-[75vh] overflow-hidden bg-[#050810]">
        {isLoaded && slides.length > 0 ? (
          <>
            <HeroSlider slides={slides} />
            {/* Admin Edit Button */}
            {isAdmin && (
              <button
                onClick={() => setIsSliderModalOpen(true)}
                className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 text-cyan-100 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/50 group shadow-lg shadow-cyan-500/20"
              >
                <Edit2 className="h-4 w-4" />
                <span className="font-semibold text-sm">Edit Slider</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-[#050810]">
            <div className="animate-pulse text-cyan-400/50">Loading...</div>
          </div>
        )}
        
        {/* Gradient Overlay for smooth transition */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050810]" />
        
        {/* Static Glow Effects */}
        <div className="absolute -top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl opacity-40" />
      </div>
      
      {/* Slider Management Modal */}
      <SliderManagementModal
        isOpen={isSliderModalOpen}
        onClose={() => setIsSliderModalOpen(false)}
        slides={slides}
        onSave={handleSaveSlides}
      />
    </section>
  )
}
