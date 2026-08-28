import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/* ── Shared material descriptors (spread into R3F material props) ─── */
const BODY = {
  color: '#0c1e38',
  metalness: 0.92,
  roughness: 0.12,
  emissive: '#061226',
  emissiveIntensity: 0.55,
}
const ACCENT = {
  color: '#38bdf8',
  emissive: '#38bdf8',
  emissiveIntensity: 1.6,
}
const JOINT = {
  color: '#1a3a6a',
  metalness: 0.88,
  roughness: 0.18,
  emissive: '#0a1e3a',
  emissiveIntensity: 0.4,
}

/* ── Holographic rings that orbit the robot ─────────────────────── */
function HoloRings() {
  const r1 = useRef()
  const r2 = useRef()
  const r3 = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (r1.current) {
      r1.current.rotation.z = t * 0.55
      r1.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.3) * 0.12
    }
    if (r2.current) {
      r2.current.rotation.y = -t * 0.38
      r2.current.rotation.x = Math.PI / 3.2
    }
    if (r3.current) {
      r3.current.rotation.z = t * 0.22
      r3.current.rotation.x = Math.PI / 1.9
    }
  })

  return (
    <>
      <mesh ref={r1}>
        <torusGeometry args={[1.05, 0.011, 12, 90]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[1.38, 0.007, 8, 70]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.32} />
      </mesh>
      <mesh ref={r3}>
        <torusGeometry args={[0.78, 0.009, 8, 60]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.22} />
      </mesh>
    </>
  )
}

/* ── Robot character ─────────────────────────────────────────────── */
function Robot({ progress, mouse }) {
  const root       = useRef()
  const headGroup  = useRef()
  const eyeL       = useRef()
  const eyeR       = useRef()
  const antOrb     = useRef()
  const rightArm   = useRef()
  const leftArm    = useRef()
  const thruster   = useRef()
  const thrGlow    = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const p = progress.current

    /* Floating & breathing */
    if (root.current) {
      root.current.position.y = Math.sin(t * 1.05) * 0.18
      root.current.rotation.z = Math.sin(t * 0.5) * 0.032
    }

    /* Head follows cursor */
    if (headGroup.current) {
      const tx =  mouse.current.x * 0.38
      const ty = -mouse.current.y * 0.28
      headGroup.current.rotation.y += (tx - headGroup.current.rotation.y) * 0.065
      headGroup.current.rotation.x += (ty - headGroup.current.rotation.x) * 0.065
    }

    /* Eye blink every ~5s */
    if (eyeL.current && eyeR.current) {
      const bc = t % 5
      const blink = bc < 0.1 ? Math.max(0.06, Math.sin((bc / 0.1) * Math.PI)) : 1
      eyeL.current.scale.y = blink
      eyeR.current.scale.y = blink
    }

    /* Antenna orb pulse */
    if (antOrb.current) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.28
      antOrb.current.scale.setScalar(pulse)
    }

    /* Thruster glow */
    if (thruster.current) {
      thruster.current.rotation.y = t * 1.8
    }
    if (thrGlow.current) {
      thrGlow.current.material.opacity = 0.32 + Math.sin(t * 3.2) * 0.14
      thrGlow.current.scale.setScalar(1 + Math.sin(t * 3.2) * 0.1)
    }

    /* ── Arm gestures keyed to scroll progress ── */
    if (rightArm.current && leftArm.current) {
      let rz, lz

      if (p < 0.18) {
        /* Hero — right arm waving hello */
        rz = Math.PI * 0.68 + Math.sin(t * 3.2) * 0.28
        lz = 0
      } else if (p < 0.38) {
        /* About / Academia — arms open, presenting */
        const a = (p - 0.18) / 0.2
        rz = (Math.PI * 0.68) * (1 - a) + Math.PI * 0.42 * a
        lz = 0 * (1 - a) + (-Math.PI * 0.42) * a
      } else if (p < 0.58) {
        /* Work — one arm pointing downward, guiding */
        rz = Math.PI * 0.32
        lz = -Math.PI * 0.15
      } else if (p < 0.78) {
        /* Projects / System — arms slightly raised, active */
        rz = Math.PI * 0.48
        lz = -Math.PI * 0.48
      } else {
        /* Contact — both arms up, farewell wave */
        rz = Math.PI * 0.72 + Math.sin(t * 2.8) * 0.22
        lz = -(Math.PI * 0.72) + Math.sin(t * 2.8 + 0.6) * 0.22
      }

      rightArm.current.rotation.z += (rz - rightArm.current.rotation.z) * 0.04
      leftArm.current.rotation.z  += (lz - leftArm.current.rotation.z)  * 0.04
    }
  })

  return (
    <group ref={root} position={[1.55, 0, 0]}>

      {/* ── Thruster base ── */}
      <mesh position={[0, -0.96, 0]}>
        <cylinderGeometry args={[0.26, 0.17, 0.3, 14]} />
        <meshStandardMaterial {...BODY} />
      </mesh>
      <mesh ref={thruster} position={[0, -1.12, 0]}>
        <torusGeometry args={[0.18, 0.014, 8, 36]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
      <mesh ref={thrGlow} position={[0, -1.16, 0]}>
        <circleGeometry args={[0.2, 18]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.38} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -1.2, 0]} intensity={4} color="#38bdf8" distance={1.4} />

      {/* ── Torso ── */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.56, 0.78, 0.38]} />
        <meshStandardMaterial {...BODY} />
      </mesh>
      {/* Chest panel */}
      <mesh position={[0, 0.02, 0.2]}>
        <boxGeometry args={[0.2, 0.2, 0.018]} />
        <meshStandardMaterial {...ACCENT} />
      </mesh>
      {/* Chest wireframe overlay */}
      <mesh position={[0, 0.02, 0.21]}>
        <boxGeometry args={[0.2, 0.2, 0.001]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.55} />
      </mesh>
      {/* Side accent strips */}
      <mesh position={[-0.29, -0.06, 0.18]}>
        <boxGeometry args={[0.018, 0.38, 0.018]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0.29, -0.06, 0.18]}>
        <boxGeometry args={[0.018, 0.38, 0.018]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
      </mesh>

      {/* ── Neck ── */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.095, 0.12, 0.24, 8]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>

      {/* ── Head ── */}
      <group ref={headGroup} position={[0, 0.84, 0]}>
        {/* Main head box */}
        <mesh>
          <boxGeometry args={[0.6, 0.54, 0.44]} />
          <meshStandardMaterial {...BODY} />
        </mesh>
        {/* Top ridge */}
        <mesh position={[0, 0.31, 0]}>
          <boxGeometry args={[0.4, 0.08, 0.3]} />
          <meshStandardMaterial {...BODY} />
        </mesh>
        {/* Visor plate */}
        <mesh position={[0, 0.04, 0.23]}>
          <boxGeometry args={[0.44, 0.26, 0.008]} />
          <meshStandardMaterial
            color="#0a2a50"
            emissive="#0ea5e9"
            emissiveIntensity={0.35}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Left eye */}
        <mesh ref={eyeL} position={[-0.13, 0.07, 0.23]}>
          <sphereGeometry args={[0.072, 14, 14]} />
          <meshStandardMaterial {...ACCENT} />
        </mesh>
        {/* Right eye */}
        <mesh ref={eyeR} position={[0.13, 0.07, 0.23]}>
          <sphereGeometry args={[0.072, 14, 14]} />
          <meshStandardMaterial {...ACCENT} />
        </mesh>
        {/* Mouth LED */}
        <mesh position={[0, -0.13, 0.23]}>
          <boxGeometry args={[0.2, 0.022, 0.008]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.75} />
        </mesh>
        {/* Antenna stem */}
        <mesh position={[0, 0.41, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.22, 6]} />
          <meshStandardMaterial color="#60a5fa" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Antenna orb */}
        <mesh ref={antOrb} position={[0, 0.54, 0]}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2.2} />
        </mesh>
        {/* Head glow light */}
        <pointLight position={[0, 0, 0.5]} intensity={2} color="#38bdf8" distance={0.8} />
      </group>

      {/* ── Left shoulder ── */}
      <mesh position={[-0.37, 0.23, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
      {/* ── Left arm (pivots at shoulder) ── */}
      <group ref={leftArm} position={[-0.37, 0.14, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.065, 0.058, 0.4, 8]} />
          <meshStandardMaterial {...BODY} />
        </mesh>
        <mesh position={[0, -0.41, 0]}>
          <sphereGeometry args={[0.068, 8, 8]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.055, 0.048, 0.4, 8]} />
          <meshStandardMaterial {...BODY} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.85, 0]}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
      </group>

      {/* ── Right shoulder ── */}
      <mesh position={[0.37, 0.23, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
      {/* ── Right arm (pivots at shoulder) ── */}
      <group ref={rightArm} position={[0.37, 0.14, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.065, 0.058, 0.4, 8]} />
          <meshStandardMaterial {...BODY} />
        </mesh>
        <mesh position={[0, -0.41, 0]}>
          <sphereGeometry args={[0.068, 8, 8]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.055, 0.048, 0.4, 8]} />
          <meshStandardMaterial {...BODY} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.85, 0]}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
      </group>

      {/* Holographic orbit rings around the robot */}
      <HoloRings />
    </group>
  )
}

/* ── Ambient dust particles ─────────────────────────────────────── */
function AmbientDust() {
  const pts = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(80 * 3)
    for (let i = 0; i < 80; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 12
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!pts.current) return
    pts.current.rotation.y = clock.elapsedTime * 0.018
    pts.current.rotation.x = Math.sin(clock.elapsedTime * 0.008) * 0.04
  })

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#38bdf8"
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Camera: subtle mouse parallax, no drastic scroll zoom ─────── */
function CameraRig({ mouse }) {
  useFrame((state) => {
    const mx = mouse.current.x
    const my = mouse.current.y
    const target = new THREE.Vector3(mx * 0.3, my * 0.2, 5.0)
    state.camera.position.lerp(target, 0.04)
    state.camera.lookAt(mx * 0.1, my * 0.05, 0)
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

/* ── Scene assembly ─────────────────────────────────────────────── */
function SceneContent({ progress, reduced, mouse }) {
  return (
    <>
      <color attach="background" args={['#020817']} />
      <fog attach="fog" args={['#020817', 8, 22]} />

      {/* Key lights */}
      <ambientLight intensity={0.22} />
      <pointLight position={[4, 3, 3]}  intensity={18} color="#38bdf8" distance={14} />
      <pointLight position={[-4, -2, 2]} intensity={10} color="#818cf8" distance={12} />
      <spotLight  position={[0, 5, 2]}  angle={0.6} penumbra={1} intensity={8} color="#e0f2fe" />

      <Robot progress={progress} mouse={mouse} />
      <AmbientDust />

      {!reduced && (
        <Sparkles
          count={40}
          scale={10}
          size={1.2}
          speed={0.25}
          color="#38bdf8"
          opacity={0.28}
        />
      )}

      <MouseBridge mouse={mouse} />
      <CameraRig mouse={mouse} />

      {!reduced && (
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.08} intensity={1.1} mipmapBlur radius={0.62} />
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
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <SceneContent progress={progress} reduced={reduced} mouse={mouse} />
    </Canvas>
  )
}
