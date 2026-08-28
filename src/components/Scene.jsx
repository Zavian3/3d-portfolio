import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/* ─── Material presets ──────────────────────────────────────────── */
const W = { color: '#f0f6fc', metalness: 0.06, roughness: 0.52 }          // white body
const EYE = { color: '#7ecce8', emissive: '#7ecce8', emissiveIntensity: 2.2 }
const WARM = { color: '#ffc49b', emissive: '#ffc49b', emissiveIntensity: 1.0 }
const WARM_DIM = { color: '#ffc49b', emissive: '#ffc49b', emissiveIntensity: 0.55 }
const JOINT = { color: '#d8e8f5', metalness: 0.12, roughness: 0.45 }

/* ─── Cute robot character ──────────────────────────────────────── */
function CuteRobot({ progress, mouse }) {
  const root      = useRef()
  const headGroup = useRef()
  const rightArm  = useRef()
  const leftArm   = useRef()
  const antOrb    = useRef()
  const eyeL      = useRef()
  const eyeR      = useRef()
  const thrGlow   = useRef()

  /* Smoothed world position that follows cursor */
  const pos    = useRef({ x: 0.8, y: 0 })
  const prevMx = useRef(0)

  useFrame(({ clock }) => {
    const t  = clock.elapsedTime
    const p  = progress.current
    const mx = mouse.current.x
    const my = mouse.current.y

    /* Target in world-space (biased slightly right so robot stays visible) */
    const targetX = mx * 2.2 + 0.55
    const targetY = my * 1.55 - p * 1.1

    /* Smooth follow */
    const LERP = 0.055
    pos.current.x += (targetX - pos.current.x) * LERP
    pos.current.y += (targetY - pos.current.y) * LERP

    /* Velocity-based lean */
    const vx = mx - prevMx.current
    prevMx.current = mx

    if (root.current) {
      /* Fly to cursor + gentle float */
      root.current.position.x = pos.current.x
      root.current.position.y = pos.current.y + Math.sin(t * 1.35) * 0.13
      root.current.position.z = 0
      /* Lean into movement direction */
      root.current.rotation.z += (-vx * 5 - root.current.rotation.z) * 0.12
      /* Subtle sway */
      root.current.rotation.y = Math.sin(t * 0.45) * 0.04
    }

    /* Head always looks toward cursor */
    if (headGroup.current) {
      const relX =  mx - pos.current.x / 3.5
      const relY = -my + pos.current.y / 2.2
      headGroup.current.rotation.y += (relX * 0.55 - headGroup.current.rotation.y) * 0.09
      headGroup.current.rotation.x += (relY * 0.32 - headGroup.current.rotation.x) * 0.09
    }

    /* Eye blink every ~5s */
    if (eyeL.current && eyeR.current) {
      const bc    = t % 5
      const blink = bc < 0.1 ? Math.max(0.05, Math.sin((bc / 0.1) * Math.PI)) : 1
      eyeL.current.scale.y = blink
      eyeR.current.scale.y = blink
    }

    /* Antenna orb pulse */
    if (antOrb.current) {
      antOrb.current.scale.setScalar(1 + Math.sin(t * 2.6) * 0.3)
    }

    /* Thruster glow flicker */
    if (thrGlow.current) {
      thrGlow.current.material.opacity = 0.38 + Math.sin(t * 4.1) * 0.16
      thrGlow.current.scale.setScalar(1 + Math.sin(t * 4.1) * 0.08)
    }

    /* Arm gestures keyed to scroll section */
    if (rightArm.current && leftArm.current) {
      let rz, lz
      if (p < 0.18) {
        rz = Math.PI * 0.7 + Math.sin(t * 3.4) * 0.3  /* wave hello */
        lz = -0.1
      } else if (p < 0.42) {
        rz = Math.PI * 0.48                             /* arms open, presenting */
        lz = -Math.PI * 0.48
      } else if (p < 0.62) {
        rz = Math.PI * 0.32                             /* one arm point guide */
        lz = -0.12
      } else if (p < 0.82) {
        rz = Math.PI * 0.5                              /* both raised, active */
        lz = -Math.PI * 0.5
      } else {
        rz = Math.PI * 0.74 + Math.sin(t * 3) * 0.25  /* farewell wave */
        lz = -(Math.PI * 0.74) + Math.sin(t * 3 + 0.7) * 0.25
      }
      rightArm.current.rotation.z += (rz - rightArm.current.rotation.z) * 0.05
      leftArm.current.rotation.z  += (lz - leftArm.current.rotation.z)  * 0.05
    }
  })

  return (
    <group ref={root} position={[0.8, 0, 0]}>

      {/* ── HEAD ─────────────────────────────── */}
      <group ref={headGroup} position={[0, 0.7, 0]}>
        {/* Main sphere */}
        <mesh>
          <sphereGeometry args={[0.38, 30, 30]} />
          <meshStandardMaterial {...W} />
        </mesh>
        {/* Face panel */}
        <mesh position={[0, 0, 0.34]}>
          <circleGeometry args={[0.27, 28]} />
          <meshStandardMaterial color="#cce8f6" emissive="#7ecce8" emissiveIntensity={0.2} />
        </mesh>
        {/* Left eye */}
        <mesh ref={eyeL} position={[-0.105, 0.07, 0.345]} scale={[1, 1.35, 1]}>
          <circleGeometry args={[0.068, 22]} />
          <meshStandardMaterial {...EYE} />
        </mesh>
        {/* Right eye */}
        <mesh ref={eyeR} position={[0.105, 0.07, 0.345]} scale={[1, 1.35, 1]}>
          <circleGeometry args={[0.068, 22]} />
          <meshStandardMaterial {...EYE} />
        </mesh>
        {/* Smile — half torus */}
        <mesh position={[0, -0.098, 0.345]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.068, 0.014, 8, 20, Math.PI]} />
          <meshStandardMaterial {...WARM_DIM} />
        </mesh>
        {/* Cheek blush left */}
        <mesh position={[-0.2, -0.02, 0.33]}>
          <circleGeometry args={[0.042, 16]} />
          <meshStandardMaterial color="#ffb8a0" emissive="#ff8552" emissiveIntensity={0.4} transparent opacity={0.65} />
        </mesh>
        {/* Cheek blush right */}
        <mesh position={[0.2, -0.02, 0.33]}>
          <circleGeometry args={[0.042, 16]} />
          <meshStandardMaterial color="#ffb8a0" emissive="#ff8552" emissiveIntensity={0.4} transparent opacity={0.65} />
        </mesh>
        {/* Antenna stem */}
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.22, 6]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
        {/* Antenna orb */}
        <mesh ref={antOrb} position={[0, 0.57, 0]}>
          <sphereGeometry args={[0.033, 12, 12]} />
          <meshStandardMaterial {...WARM} />
        </mesh>
        {/* Eye glow */}
        <pointLight position={[0, 0.05, 0.45]} intensity={1.2} color="#7ecce8" distance={0.6} />
      </group>

      {/* ── BODY ─────────────────────────────── */}
      <mesh position={[0, 0.02, 0]}>
        <capsuleGeometry args={[0.24, 0.36, 10, 20]} />
        <meshStandardMaterial {...W} />
      </mesh>
      {/* Belly accent */}
      <mesh position={[0, 0.1, 0.24]}>
        <circleGeometry args={[0.072, 18]} />
        <meshStandardMaterial {...WARM} />
      </mesh>
      {/* Body light ring */}
      <pointLight position={[0, 0.1, 0.35]} intensity={0.8} color="#ffc49b" distance={0.5} />

      {/* ── LEFT ARM ─────────────────────────── */}
      <mesh position={[-0.3, 0.24, 0]}>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
      <group ref={leftArm} position={[-0.3, 0.16, 0]}>
        <mesh position={[0, -0.17, 0]}>
          <capsuleGeometry args={[0.07, 0.24, 6, 12]} />
          <meshStandardMaterial {...W} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.32, 0]}>
          <sphereGeometry args={[0.072, 10, 10]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
      </group>

      {/* ── RIGHT ARM ────────────────────────── */}
      <mesh position={[0.3, 0.24, 0]}>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
      <group ref={rightArm} position={[0.3, 0.16, 0]}>
        <mesh position={[0, -0.17, 0]}>
          <capsuleGeometry args={[0.07, 0.24, 6, 12]} />
          <meshStandardMaterial {...W} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.32, 0]}>
          <sphereGeometry args={[0.072, 10, 10]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
      </group>

      {/* ── HOVER BASE ───────────────────────── */}
      <mesh position={[0, -0.5, 0]}>
        <capsuleGeometry args={[0.15, 0.08, 6, 14]} />
        <meshStandardMaterial {...W} />
      </mesh>
      {/* Thruster ring */}
      <mesh position={[0, -0.64, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.012, 8, 30]} />
        <meshStandardMaterial color="#ffc49b" emissive="#ffc49b" emissiveIntensity={1.2} />
      </mesh>
      {/* Thruster glow disc */}
      <mesh ref={thrGlow} position={[0, -0.7, 0]}>
        <circleGeometry args={[0.13, 20]} />
        <meshBasicMaterial color="#ffc49b" transparent opacity={0.42} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.75, 0]} intensity={3} color="#ffc49b" distance={1.3} />
    </group>
  )
}

/* ─── Sparse dust particles in the background ───────────────────── */
function BackgroundDust() {
  const pts      = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(60 * 3)
    for (let i = 0; i < 60; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 3
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (pts.current) {
      pts.current.rotation.y = clock.elapsedTime * 0.012
    }
  })

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#adb6c4"
        sizeAttenuation
        transparent
        opacity={0.28}
        depthWrite={false}
      />
    </points>
  )
}

/* ─── Camera: gentle mouse parallax only ───────────────────────── */
function CameraRig({ mouse }) {
  useFrame((state) => {
    const t = new THREE.Vector3(mouse.current.x * 0.18, mouse.current.y * 0.12, 5)
    state.camera.position.lerp(t, 0.035)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function MouseBridge({ mouse }) {
  useEffect(() => {
    const h = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', h, { passive: true })
    return () => window.removeEventListener('pointermove', h)
  }, [mouse])
  return null
}

/* ─── Scene root ────────────────────────────────────────────────── */
function SceneContent({ progress, reduced, mouse }) {
  return (
    <>
      <color attach="background" args={['#001b2e']} />
      <fog attach="fog" args={['#001b2e', 9, 22]} />

      <ambientLight intensity={0.28} />
      <pointLight position={[5, 4, 3]}  intensity={16} color="#7ecce8" distance={16} />
      <pointLight position={[-4, -3, 2]} intensity={9}  color="#ffc49b" distance={14} />
      <spotLight  position={[0, 6, 2]}  angle={0.55} penumbra={1} intensity={7} color="#ffefd3" />

      <CuteRobot progress={progress} mouse={mouse} />
      <BackgroundDust />

      <MouseBridge mouse={mouse} />
      <CameraRig mouse={mouse} />

      {!reduced && (
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.1} intensity={1.2} mipmapBlur radius={0.65} />
        </EffectComposer>
      )}
    </>
  )
}

export default function Scene({ progress }) {
  const mouse   = useRef({ x: 0, y: 0 })
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
