import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles, Zap, Shield, Edit2 } from 'lucide-react'
import HeroSlider from '@/components/ui/HeroSlider'
import SliderManagementModal from '@/components/admin/SliderManagementModal'
import FloatingParticles from '@/components/effects/FloatingParticles'
import { useAdmin } from '@/contexts/AdminContext'
import type { Slide } from '@/types/product'
import { useState } from 'react'

function AnimatedSphere() {
  const ref = useRef<any>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.2
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })
  
  return (
    <Sphere ref={ref} args={[1, 100, 100]} scale={2.5}>
      <MeshDistortMaterial
        color="#00ffff"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  )
}

export default function HeroSection() {
  const { isAdmin } = useAdmin()
  const [slides, setSlides] = useState<Slide[]>([])
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement | null>(null)

  // Load slides from API
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/slides');
        if (response.ok) {
          const data = await response.json();
          setSlides(data);
          // Also save to localStorage as backup
          localStorage.setItem('heroSlides', JSON.stringify(data));
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('heroSlides');
          if (saved) {
            setSlides(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Failed to load slides:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('heroSlides');
        if (saved) {
          setSlides(JSON.parse(saved));
        } else {
          // Default slides
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
          setSlides(defaultSlides);
        }
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
      // Fallback to localStorage only
      setSlides(slidesToSave);
      localStorage.setItem('heroSlides', JSON.stringify(slidesToSave));
      alert('Slides saved locally but failed to sync with database');
    }
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      if (canvasWrapRef.current) {
        gsap.fromTo(
          canvasWrapRef.current,
          { scale: 1, y: 0 },
          {
            scale: 0.9,
            y: 30,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/40 via-transparent to-[#020304]/40 backdrop-blur-sm">
      {/* Floating Particles Background */}
      <FloatingParticles count={40} />
      
      {/* Full-Width Hero Slider */}
      <div ref={canvasWrapRef} className="relative h-[50vh] min-h-[400px] md:h-[65vh] lg:h-[75vh] overflow-hidden bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 will-change-transform">
        {slides.length > 0 ? (
          <>
            <HeroSlider slides={slides} />
            {/* Admin Edit Button */}
            {isAdmin && (
              <button
                onClick={() => setIsSliderModalOpen(true)}
                className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 text-cyan-100 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/50 transition-all group shadow-lg shadow-cyan-500/20"
              >
                <Edit2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span className="font-semibold text-sm">Edit Slider</span>
              </button>
            )}
          </>
        ) : (
          <>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00ffff" />
              <Suspense fallback={null}>
                <AnimatedSphere />
              </Suspense>
            </Canvas>
          </>
        )}
        
        {/* Gradient Overlay for smooth transition */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e1a]/60" />
        
        {/* Animated Glow Effects */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
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
