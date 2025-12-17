import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

interface Product3DImageProps {
  imageUrl: string
  onClick?: () => void
  isHovered?: boolean
  opacity?: number
}

export function Product3DImage({ imageUrl, onClick, isHovered = false, opacity = 1 }: Product3DImageProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Fallback to placeholder if no image URL provided
  const fallbackImageUrl = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#111827"/>
      <text x="200" y="180" font-size="80" text-anchor="middle" fill="#6b7280">📦</text>
      <text x="200" y="250" font-size="24" text-anchor="middle" fill="#6b7280">No Image</text>
    </svg>
  `)}`
  
  const validImageUrl = imageUrl || fallbackImageUrl
  
  // Load the product image as a texture with error handling
  const texture = useLoader(
    TextureLoader, 
    validImageUrl, 
    undefined, 
    () => {
      // On error, the fallback URL will be used
      console.warn('Failed to load image:', validImageUrl)
    }
  )
  
  // Rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      // Gentle floating
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
      
      // Scale up on hover, scale down on delete (smooth transitions)
      const targetScale = opacity === 0 ? 0.01 : (isHovered ? 1.15 : 1)
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        opacity === 0 ? 0.05 : 0.1 // Slower lerp for delete animation
      )
    }
  })

  return (
    <mesh 
      ref={meshRef} 
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {/* Front face with image - pure transparent glass */}
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial 
        map={texture}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        emissive="#000000"
        emissiveIntensity={0}
        metalness={0}
        roughness={1}
      />
    </mesh>
  )
}
