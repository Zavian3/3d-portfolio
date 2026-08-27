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
    const jitter = 0.1 + Math.random() * 0.2
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

function NeuralField({ count = 180, radius = 3.8, progress }) {
  const group = useRef()
  const points = useMemo(() => fibonacciSphere(count, radius), [count, radius])

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    points.forEach((p, i) => {
      arr[i * 3]     = p.x
      arr[i * 3 + 1] = p.y
      arr[i * 3 + 2] = p.z
    })
    return arr
  }, [points, count])

  const linePositions = useMemo(() => {
    const verts = []
    const maxDist = 1.4
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
    group.current.rotation.y = t * 0.048 + progress.current * 1.2
    group.current.rotation.x = Math.sin(t * 0.13) * 0.07 + progress.current * 0.22
    group.current.position.y = Math.sin(t * 0.38) * 0.09
    const s = 1 + progress.current * 0.2
    group.current.scale.setScalar(s)
  })

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.048}
          color="#5ce1e6"
          sizeAttenuation
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#c084fc" transparent opacity={0.2} />
      </lineSegments>
    </group>
  )
}

function Core({ progress }) {
  const mesh   = useRef()
  const ring   = useRef()
  const ring2  = useRef()
  const ring3  = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.22
      mesh.current.rotation.z = t * 0.07
      const pulse = 1 + Math.sin(t * 1.7) * 0.028
      mesh.current.scale.setScalar(pulse)
    }
    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2.4
      ring.current.rotation.z = t * 0.32
      ring.current.scale.setScalar(1.12 + progress.current * 0.38)
    }
    if (ring2.current) {
      ring2.current.rotation.y = t * -0.2
      ring2.current.rotation.x = Math.PI / 3
    }
    if (ring3.current) {
      ring3.current.rotation.z = t * 0.14
      ring3.current.rotation.y = t * 0.28
    }
  })

  return (
    <Float speed={1.3} rotationIntensity={0.22} floatIntensity={0.42}>
      <group>
        <mesh ref={mesh}>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshStandardMaterial
            color="#080810"
            metalness={0.9}
            roughness={0.18}
            emissive="#180f30"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1.19, 1]} />
          <meshBasicMaterial color="#5ce1e6" wireframe transparent opacity={0.5} />
        </mesh>
        <mesh ref={ring}>
          <torusGeometry args={[1.88, 0.013, 16, 128]} />
          <meshBasicMaterial color="#f5c16c" transparent opacity={0.72} />
        </mesh>
        <mesh ref={ring2}>
          <torusGeometry args={[2.18, 0.009, 12, 80]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.44} />
        </mesh>
        <mesh ref={ring3}>
          <torusGeometry args={[2.48, 0.006, 8, 60]} />
          <meshBasicMaterial color="#5ce1e6" transparent opacity={0.22} />
        </mesh>
      </group>
    </Float>
  )
}

function DataStreamParticle({ startPos, speed, color }) {
  const mesh = useRef()
  const offset = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (!mesh.current) return
    const t = (state.clock.elapsedTime * speed + offset.current) % (Math.PI * 2)
    const angle = t
    const r = startPos[0]
    mesh.current.position.x = Math.cos(angle) * r
    mesh.current.position.z = Math.sin(angle) * r
    mesh.current.position.y = startPos[1] + Math.sin(t * 1.5) * 0.4
  })

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </mesh>
  )
}

function DataRing({ progress }) {
  const particles = useMemo(
    () => [
      { startPos: [2.7, 0.2, 0], speed: 0.22, color: '#5ce1e6' },
      { startPos: [2.7, 0.2, 0], speed: 0.22, color: '#5ce1e6' },
      { startPos: [3.1, -0.3, 0], speed: -0.18, color: '#c084fc' },
      { startPos: [3.1, -0.3, 0], speed: -0.18, color: '#c084fc' },
      { startPos: [3.4, 0.5, 0], speed: 0.15, color: '#f5c16c' },
      { startPos: [2.4, -0.5, 0], speed: -0.28, color: '#5ce1e6' },
    ],
    [],
  )

  return (
    <>
      {particles.map((p, i) => (
        <DataStreamParticle key={i} startPos={p.startPos} speed={p.speed} color={p.color} />
      ))}
    </>
  )
}

function OrbitingNodes({ progress }) {
  const group = useRef()
  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.17 + progress.current
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.08
  })
  const nodes = useMemo(
    () => [
      { color: '#5ce1e6', pos: [2.4, 0.4, 0.6], scale: 0.1 },
      { color: '#c084fc', pos: [-2.1, 0.8, -0.4], scale: 0.08 },
      { color: '#f5c16c', pos: [0.2, -1.7, 1.1], scale: 0.09 },
      { color: '#5ce1e6', pos: [1.6, 1.5, -1.2], scale: 0.07 },
      { color: '#c084fc', pos: [-1.4, -1.1, 1.4], scale: 0.08 },
      { color: '#f5c16c', pos: [0.8, 2.2, 0.6], scale: 0.06 },
    ],
    [],
  )
  return (
    <group ref={group}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.scale, 16, 16]} />
          <meshBasicMaterial color={n.color} />
        </mesh>
      ))}
    </group>
  )
}

function CameraRig({ progress, mouse }) {
  useFrame((state) => {
    const p = progress.current
    const mx = mouse.current.x
    const my = mouse.current.y
    const target = new THREE.Vector3(
      mx * 0.75 + Math.sin(p * Math.PI) * 0.9,
      my * 0.42 + 0.18 - p * 0.38,
      6.2 - p * 1.6,
    )
    state.camera.position.lerp(target, 0.045)
    state.camera.lookAt(mx * 0.18, 0.12 + my * 0.1, 0)
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

function SceneContent({ progress, reduced, mouse }) {
  return (
    <>
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 6, 18]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 3, 4]} intensity={22} color="#5ce1e6" distance={14} />
      <pointLight position={[-5, -2, 2]} intensity={15} color="#c084fc" distance={16} />
      <spotLight position={[0, 6, 2]} angle={0.5} penumbra={1} intensity={10} color="#f5c16c" />
      <pointLight position={[0, -5, 0]} intensity={6} color="#5ce1e6" distance={10} />
      <Core progress={progress} />
      <OrbitingNodes progress={progress} />
      <DataRing progress={progress} />
      <NeuralField count={reduced ? 90 : 190} progress={progress} />
      {!reduced && (
        <Sparkles count={70} scale={9} size={1.8} speed={0.35} color="#5ce1e6" opacity={0.4} />
      )}
      {!reduced && (
        <Sparkles count={30} scale={6} size={1.2} speed={0.55} color="#c084fc" opacity={0.3} />
      )}
      <MouseBridge mouse={mouse} />
      <CameraRig progress={progress} mouse={mouse} />
      {!reduced && (
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.12} intensity={0.95} mipmapBlur radius={0.58} />
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
