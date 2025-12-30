import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function SectionDivider() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const width = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "100%", "0%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])

  return (
    <div ref={ref} className="relative py-8 overflow-hidden">
      <motion.div
        style={{ width, opacity }}
        className="h-px mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-xl" style={{ width: '100%' }} />
    </div>
  )
}
