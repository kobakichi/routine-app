"use client"

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const [enabled, setEnabled] = useState(true)
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mq.matches) setEnabled(false)
      const onMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = (e.clientY / window.innerHeight) * 2 - 1
        pointer.current.x = x
        pointer.current.y = y
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }
  }, [])
  if (!enabled) return null
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 10], fov: 45 }}
      >
        <ParallaxGroup pointer={pointer}>
          {/* 薄い照明 */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />

          {/* 浮遊する柔らかいオブジェクト */}
          <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.8}>
            <mesh position={[0, -0.8, 0]}>
              <icosahedronGeometry args={[3, 32]} />
              <MeshDistortMaterial
                speed={1.3}
                distort={0.35}
                color="#7c3aed" // violet-600
                transparent
                opacity={0.22}
                roughness={0.25}
                metalness={0}
              />
            </mesh>
          </Float>

          {/* パーティクルで奥行き感 */}
          <Sparkles
            count={80}
            speed={0.6}
            opacity={0.35}
            color="#93c5fd" // sky-300
            size={4.5}
            scale={[20, 10, 5]}
            position={[0, 0, -2]}
          />
        </ParallaxGroup>
      </Canvas>
    </div>
  )
}

function ParallaxGroup({ children, pointer }: { children: React.ReactNode, pointer: React.MutableRefObject<{ x: number, y: number }> }) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!group.current) return
    const targetRotX = THREE.MathUtils.degToRad(pointer.current.y * -6) // 上下は逆に感じやすいので反転
    const targetRotY = THREE.MathUtils.degToRad(pointer.current.x * 10)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.06)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.06)

    const targetPosX = pointer.current.x * 0.6
    const targetPosY = pointer.current.y * -0.4
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetPosX, 0.05)
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetPosY, 0.05)
  })
  return <group ref={group}>{children}</group>
}
