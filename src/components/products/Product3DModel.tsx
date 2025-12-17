import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
/**
 * Product3DNode: bare three.js node meant to be used inside an existing R3F <Canvas>.
 * Exported for composition in parent scenes (e.g., gallery ring). No nested Canvas.
 */
export function Product3DNode() {
  const mesh = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.5
      mesh.current.rotation.x += delta * 0.3
      // Subtle floating animation
      mesh.current.position.y = Math.sin(Date.now() * 0.001) * 0.1
    }
  })

  return (
    <mesh ref={mesh} scale={0.6}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial
        color="#00FFFF"
        emissive="#00FFD1"
        emissiveIntensity={1.2}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  )
}

export default function Product3DModel() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl bg-black/80">
      <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-cyan-200/70">Loading 3D…</div>}>
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#00FFFF" />
          <Product3DNode />
          <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
        </Canvas>
      </Suspense>
    </div>
  )
}
