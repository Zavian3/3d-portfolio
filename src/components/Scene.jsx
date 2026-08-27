import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function fibonacciSphere(count, radius) {
  const pts = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const jitter = 0.12 + Math.random() * 0.18
    pts.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius * (0.72 + jitter),
        y * radius * (0.72 + jitter),
        Math.sin(theta) * r * radius * (0.72 + jitter),
      ),
    )
  }
  return pts
}

function NeuralField({ count = 160, radius = 3.8, progress }) {
  const group = useRef()
  const points = useMemo(() => fibonacciSphere(count, radius), [count, radius])

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    points.forEach((p, i) => {
      arr[i * 3] = p.x
      arr[i * 3 + 1] = p.y
      arr[i * 3 + 2] = p.z
    })
    return arr
  }, [points, count])

  const linePositions = useMemo(() => {
    const verts = []
    const maxDist = 1.35
    for (let i = 0; i < points.length; i++) {
      let links = 0
      for (let j = i + 1; j < points.length && links < 3; j++) {
        if (points[i].distanceTo(points[j]) < maxDist) {
          verts.push(points[i].x, points[i].y, points[i].z, points[j].x, points[j].y, points[j].z)
          links++
        }
      }
    }
    return new Float32Array(verts)
  }, [points])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!group.current) return
    group.current.rotation.y = t * 0.05 + progress.current * 1.2
    group.current.rotation.x = Math.sin(t * 0.15) * 0.08 + progress.current * 0.25
    group.current.position.y = Math.sin(t * 0.4) * 0.08
    const s = 1 + progress.current * 0.18
    group.current.scale.setScalar(s)
  })

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#5ce1e6"
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#c084fc" transparent opacity={0.22} />
      </lineSegments>
    </group>
  )
}

function Core({ progress }) {
  const mesh = useRef()
  const ring = useRef()
  const ring2 = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.25
      mesh.current.rotation.z = t * 0.08
      const pulse = 1 + Math.sin(t * 1.6) * 0.03
      mesh.current.scale.setScalar(pulse)
    }
    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2.4
      ring.current.rotation.z = t * 0.35
      ring.current.scale.setScalar(1.15 + progress.current * 0.4)
    }
    if (ring2.current) {
      ring2.current.rotation.y = t * -0.22
      ring2.current.rotation.x = Math.PI / 3
    }
  })

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.4}>
      <group>
        <mesh ref={mesh}>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshStandardMaterial
            color="#101018"
            metalness={0.85}
            roughness={0.22}
            emissive="#1a1030"
            emissiveIntensity={0.55}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1.18, 1]} />
          <meshBasicMaterial color="#5ce1e6" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh ref={ring}>
          <torusGeometry args={[1.85, 0.012, 16, 120]} />
          <meshBasicMaterial color="#f5c16c" transparent opacity={0.7} />
        </mesh>
        <mesh ref={ring2}>
          <torusGeometry args={[2.15, 0.008, 12, 80]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.45} />
        </mesh>
      </group>
    </Float>
  )
}

function CameraRig({ progress, mouse }) {
  useFrame((state) => {
    const p = progress.current
    const mx = mouse.current.x
    const my = mouse.current.y
    const target = new THREE.Vector3(
      mx * 0.7 + Math.sin(p * Math.PI) * 0.85,
      my * 0.4 + 0.15 - p * 0.4,
      6.2 - p * 1.55,
    )
    state.camera.position.lerp(target, 0.05)
    state.camera.lookAt(mx * 0.15, 0.1 + my * 0.08, 0)
  })
  return null
}

function MouseBridge({ mouse }) {
  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mouse])
  return null
}

function OrbitingNodes({ progress }) {
  const group = useRef()
  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.18 + progress.current
  })
  const nodes = useMemo(
    () => [
      { color: '#5ce1e6', pos: [2.4, 0.4, 0.6], scale: 0.09 },
      { color: '#c084fc', pos: [-2.1, 0.8, -0.4], scale: 0.07 },
      { color: '#f5c16c', pos: [0.2, -1.7, 1.1], scale: 0.08 },
      { color: '#5ce1e6', pos: [1.6, 1.5, -1.2], scale: 0.06 },
      { color: '#c084fc', pos: [-1.4, -1.1, 1.4], scale: 0.07 },
    ],
    [],
  )
  return (
    <group ref={group}>
      {nodes.map((n) => (
        <mesh key={n.color + n.pos.join(',')} position={n.pos}>
          <sphereGeometry args={[n.scale, 16, 16]} />
          <meshBasicMaterial color={n.color} />
        </mesh>
      ))}
    </group>
  )
}

function SceneContent({ progress, reduced, mouse }) {
  return (
    <>
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 6, 16]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 3, 4]} intensity={18} color="#5ce1e6" distance={12} />
      <pointLight position={[-5, -2, 2]} intensity={12} color="#c084fc" distance={14} />
      <spotLight position={[0, 6, 2]} angle={0.5} penumbra={1} intensity={8} color="#f5c16c" />
      <Core progress={progress} />
      <OrbitingNodes progress={progress} />
      <NeuralField count={reduced ? 80 : 170} progress={progress} />
      {!reduced && <Sparkles count={60} scale={8} size={2} speed={0.4} color="#5ce1e6" opacity={0.45} />}
      <MouseBridge mouse={mouse} />
      <CameraRig progress={progress} mouse={mouse} />
      {!reduced && (
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.15} intensity={0.85} mipmapBlur radius={0.55} />
        </EffectComposer>
      )}
    </>
  )
}

export default function Scene({ progress }) {
  const mouse = useRef({ x: 0, y: 0 })
  const reduced =
    typeof window !== 'undefined' &&
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 720)

  return (
    <Canvas
      className="canvas-root"
      dpr={reduced ? [1, 1.2] : [1, 1.8]}
      camera={{ position: [0, 0.2, 6.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <SceneContent progress={progress} reduced={reduced} mouse={mouse} />
    </Canvas>
  )
}
