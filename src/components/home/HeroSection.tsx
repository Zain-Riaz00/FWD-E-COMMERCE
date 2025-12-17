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

  // Load slides from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('heroSlides')
    if (saved) {
      setSlides(JSON.parse(saved))
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
      ]
      setSlides(defaultSlides)
      localStorage.setItem('heroSlides', JSON.stringify(defaultSlides))
    }
  }, [])
  
  function handleSaveSlides(newSlides: Slide[]) {
    setSlides(newSlides)
    localStorage.setItem('heroSlides', JSON.stringify(newSlides))
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
      <div className="container grid gap-8 py-14 md:grid-cols-2 md:py-20">
        <div ref={textRef} className="flex flex-col justify-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex w-fit"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r dark:from-cyan-500/10 dark:to-blue-500/10 from-blue-100/80 to-indigo-100/80 px-3 py-1.5 text-xs font-medium text-cyan-300 dark:text-cyan-300 text-blue-700 ring-1 dark:ring-cyan-400/30 ring-blue-400/60 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              New Collection Available
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl"
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Elevate your setup.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
            className="mb-4 max-w-prose text-cyan-200/70"
          >
            Premium gear, crafted for creators. Explore our latest collection with immersive 3D previews.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 flex flex-wrap gap-3"
          >
            {[
              { icon: Zap, text: '3D Preview' },
              { icon: Shield, text: 'Premium Quality' },
              { icon: Sparkles, text: 'Latest Tech' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 text-cyan-300/70 dark:text-cyan-300/70 text-cyan-700 text-sm">
                <feature.icon className="h-3.5 w-3.5" />
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="flex items-center gap-3 relative z-10"
          >
            <Link 
              to="/products" 
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-cyan-500/50 ring-2 ring-cyan-400 backdrop-blur-sm transition-all hover:shadow-cyan-500/70 hover:scale-105 hover:-translate-y-1"
            >
              Shop Now
            </Link>
            <Link 
              to="/products" 
              className="rounded-lg border-2 border-cyan-400 bg-transparent px-6 py-3 text-base font-semibold text-cyan-100 shadow-sm backdrop-blur-sm transition-all hover:border-cyan-300 hover:bg-cyan-500/20 hover:scale-105 hover:-translate-y-1"
            >
              Browse Catalog
            </Link>
          </motion.div>
        </div>

        {/* 3D Model Section - Now with Slider */}
        <div ref={canvasWrapRef} className="relative h-[320px] overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 ring-1 ring-inset ring-cyan-400/10 sm:h-[420px] will-change-transform backdrop-blur-sm">
          {slides.length > 0 ? (
            <>
              <HeroSlider slides={slides} />
              {/* Admin Edit Button - Styled like profile back button */}
              {isAdmin && (
                <button
                  onClick={() => setIsSliderModalOpen(true)}
                  className="absolute top-2 right-2 z-30 flex items-center gap-1.5 text-[10px] text-cyan-200/70 hover:text-cyan-100 transition-colors group"
                >
                  <Edit2 className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                  <span className="font-medium">Edit</span>
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
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-cyan-400/5" />
        </div>
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
