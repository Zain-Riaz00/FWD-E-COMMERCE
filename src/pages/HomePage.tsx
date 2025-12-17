import HeroSection from '@/components/home/HeroSection'


import Footer from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Monitor, Headphones, Keyboard, Mouse, Cpu, Camera } from 'lucide-react'

const categories = [
  { icon: Monitor, title: 'Displays' },
  { icon: Headphones, title: 'Audio' },
  { icon: Keyboard, title: 'Keyboards' },
  { icon: Mouse, title: 'Mice' },
  { icon: Cpu, title: 'CPU & Parts' },
  { icon: Camera, title: 'Cameras' },
]

export default function HomePage() {
  return (
    <div className="pt-16">
      <HeroSection />

      <section className="container py-14 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured categories</h2>
            <p className="mt-1 text-sm text-zinc-400">Shop the essentials picked by our team.</p>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
          className="grid grid-cols-2 gap-4 md:grid-cols-3"
        >
          {categories.map(({ icon: Icon, title }) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
              }}
              whileHover={{ 
                y: -8,
                rotateX: 3,
                rotateY: -3,
                scale: 1.03,
                transition: { type: 'spring', stiffness: 300, damping: 25, duration: 0.6 }
              }}
              className="card-3d group relative rounded-xl border dark:border-cyan-400/10 border-blue-200/60 bg-gradient-to-br dark:from-[#0a0e1a]/80 dark:to-[#020304]/80 from-white/70 to-white/50 p-5 shadow-lg dark:shadow-cyan-500/5 shadow-blue-500/10 backdrop-blur-sm transition-all dark:hover:border-cyan-400/50 hover:border-blue-400/80 hover:shadow-2xl dark:hover:shadow-cyan-500/30 hover:shadow-blue-500/30 cursor-pointer"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-500/20 from-blue-100 to-indigo-100 text-cyan-100 dark:text-cyan-100 text-blue-700 shadow-lg dark:shadow-cyan-500/10 shadow-blue-500/20 ring-1 dark:ring-cyan-400/20 ring-blue-400/60 backdrop-blur-sm dark:group-hover:from-cyan-500/30 dark:group-hover:to-blue-500/30 group-hover:from-blue-200 group-hover:to-indigo-200">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 dark:text-zinc-100 text-slate-900">{title}</h3>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-400 text-slate-600">Explore {title.toLowerCase()} and more.</p>
            </motion.div>
          ))}
        </motion.div>
      </section>


      {/* Outro Section */}
      <section className="border-t border-zinc-800/60 py-20">
        <div className="container text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">Ready when you are.</h2>
          <p className="mx-auto mb-6 max-w-xl text-zinc-400">Experience performance gear with immersive previews and a seamless checkout.</p>
          <button className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 from-white/80 to-white/60 px-6 py-3 text-sm font-semibold text-white dark:text-white text-blue-700 shadow-lg dark:shadow-cyan-500/30 shadow-blue-500/30 backdrop-blur-md ring-1 dark:ring-cyan-400/40 ring-blue-400/60 hover:from-white/90 hover:to-white/70 hover:ring-blue-500/80 dark:hover:from-cyan-500 dark:hover:to-blue-500 transition-all transform hover:scale-105">
            Get started
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
