import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { robotState, panelRects, speechState } from '../robotState.js'

/* ─── Panel avoidance helpers ───────────────────────────────────── */
// World-space half-width at z=0 with camera at z=5, fov=45, 16:9
const WORLD_HALF_W = 5 * Math.tan((45 / 2) * (Math.PI / 180)) * (16 / 9)

function screenXtoWorld(px) {
  return (px / window.innerWidth * 2 - 1) * WORLD_HALF_W
}

/* Returns the minimum world-X the robot may occupy without entering any
   visible frosted panel. If no panel is blocking, returns -Infinity. */
function safeMinWorldX() {
  let minX = -Infinity
  const W = window.innerWidth
  const H = window.innerHeight
  for (const r of panelRects) {
    if (r.bottom < 0 || r.top > H) continue          // off-screen
    const worldRight = screenXtoWorld(r.right)
    if (worldRight > minX) minX = worldRight
  }
  return minX === -Infinity ? -Infinity : minX + 0.28 /* margin */
}

/* ─── Materials ─────────────────────────────────────────────────── */
// White body — no emissive so bloom doesn't blow it out
const W    = { color: '#ddeaf5', metalness: 0.05, roughness: 0.58 }
const JNT  = { color: '#c8dcea', metalness: 0.08, roughness: 0.5  }
// Eyes / accents — emissive but modest so face stays readable
const EYE  = { color: '#5ec4e8', emissive: '#5ec4e8', emissiveIntensity: 1.1 }
const WARM = { color: '#ffc49b', emissive: '#ffc49b', emissiveIntensity: 0.7 }
const BLSH = { color: '#ff9580', emissive: '#ff7a60', emissiveIntensity: 0.35, transparent: true, opacity: 0.6 }

/* ─── Robot ─────────────────────────────────────────────────────── */
function CuteRobot({ progress, mouse }) {
  const root      = useRef()
  const headGroup = useRef()
  const rightArm  = useRef()
  const leftArm   = useRef()
  const antOrb    = useRef()
  const eyeL      = useRef()
  const eyeR      = useRef()
  const thrGlow   = useRef()

  const pos    = useRef({ x: 2.2, y: 0 })   // start right of center
  const prevMx = useRef(0)

  useFrame(({ clock, camera, size }) => {
    const t  = clock.elapsedTime
    const p  = progress.current
    const mx = mouse.current.x
    const my = mouse.current.y

    /* When speaking, slide to a fixed right-side position;
       otherwise follow cursor but stay outside every frosted panel. */
    let targetX, targetY
    const minX = safeMinWorldX()

    if (speechState.active) {
      /* Speaking position: right side of screen, vertically centered */
      const speakX = Math.max(minX, WORLD_HALF_W * 0.7)
      targetX = speakX
      targetY = my * 0.6 - p * 0.5     /* gentle vertical drift only */
    } else {
      /* Normal cursor follow, clamped outside panels */
      targetX = mx * 2.0 + 0.55
      targetY = my * 1.5 - p * 1.0
      if (minX > -Infinity) targetX = Math.max(targetX, minX)
    }

    /* Slower lerp when speaking so the slide feels deliberate */
    const LERP = speechState.active ? 0.04 : 0.055
    pos.current.x += (targetX - pos.current.x) * LERP
    pos.current.y += (targetY - pos.current.y) * LERP

    /* Velocity lean */
    const vx = mx - prevMx.current
    prevMx.current = mx

    if (root.current) {
      root.current.position.x = pos.current.x
      root.current.position.y = pos.current.y + Math.sin(t * 1.35) * 0.13
      root.current.rotation.z += (-vx * 4.5 - root.current.rotation.z) * 0.10

      /* Project head to screen so SpeechBubble can follow the robot */
      const headWorld = new THREE.Vector3(
        root.current.position.x,
        root.current.position.y + 1.05,   /* just above antenna */
        0
      )
      headWorld.project(camera)
      robotState.screenX = ((headWorld.x + 1) / 2) * size.width
      robotState.screenY = (-(headWorld.y - 1) / 2) * size.height
    }

    /* Head looks at cursor */
    if (headGroup.current) {
      const rx =  mx - pos.current.x / 3.5
      const ry = -my + pos.current.y / 2.2
      headGroup.current.rotation.y += (rx * 0.45 - headGroup.current.rotation.y) * 0.09
      headGroup.current.rotation.x += (ry * 0.28 - headGroup.current.rotation.x) * 0.09
    }

    /* Blink */
    if (eyeL.current && eyeR.current) {
      const bc    = t % 5
      const blink = bc < 0.1 ? Math.max(0.06, Math.sin((bc / 0.1) * Math.PI)) : 1
      eyeL.current.scale.y = blink
      eyeR.current.scale.y = blink
    }

    /* Antenna pulse */
    if (antOrb.current) antOrb.current.scale.setScalar(1 + Math.sin(t * 2.6) * 0.28)

    /* Thruster flicker */
    if (thrGlow.current) {
      thrGlow.current.material.opacity = 0.3 + Math.sin(t * 4.2) * 0.12
    }

    /* Arm gestures */
    if (rightArm.current && leftArm.current) {
      let rz, lz
      if      (p < 0.18) { rz = Math.PI * 0.68 + Math.sin(t * 3.4) * 0.28; lz = -0.08 }
      else if (p < 0.42) { rz = Math.PI * 0.46;  lz = -Math.PI * 0.46 }
      else if (p < 0.62) { rz = Math.PI * 0.30;  lz = -0.1 }
      else if (p < 0.82) { rz = Math.PI * 0.50;  lz = -Math.PI * 0.50 }
      else               { rz = Math.PI * 0.72 + Math.sin(t * 3) * 0.24; lz = -(Math.PI * 0.72) + Math.sin(t * 3 + 0.7) * 0.24 }
      rightArm.current.rotation.z += (rz - rightArm.current.rotation.z) * 0.05
      leftArm.current.rotation.z  += (lz - leftArm.current.rotation.z)  * 0.05
    }
  })

  return (
    <group ref={root} position={[0.6, 0, 0]}>

      {/* ── HEAD ── */}
      <group ref={headGroup} position={[0, 0.7, 0]}>
        {/* Skull */}
        <mesh>
          <sphereGeometry args={[0.36, 30, 30]} />
          <meshStandardMaterial {...W} />
        </mesh>
        {/* Dark face visor — creates contrast so eyes are visible */}
        <mesh position={[0, 0.02, 0.3]}>
          <circleGeometry args={[0.24, 28]} />
          <meshStandardMaterial color="#08182a" emissive="#0f2d50" emissiveIntensity={0.28} />
        </mesh>
        {/* Eyes */}
        <mesh ref={eyeL} position={[-0.1, 0.07, 0.31]} scale={[1, 1.32, 1]}>
          <circleGeometry args={[0.065, 22]} />
          <meshStandardMaterial {...EYE} />
        </mesh>
        <mesh ref={eyeR} position={[0.1, 0.07, 0.31]} scale={[1, 1.32, 1]}>
          <circleGeometry args={[0.065, 22]} />
          <meshStandardMaterial {...EYE} />
        </mesh>
        {/* Smile */}
        <mesh position={[0, -0.09, 0.31]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.064, 0.013, 8, 18, Math.PI]} />
          <meshStandardMaterial {...WARM} />
        </mesh>
        {/* Cheeks */}
        <mesh position={[-0.18, -0.01, 0.295]}>
          <circleGeometry args={[0.038, 16]} />
          <meshStandardMaterial {...BLSH} />
        </mesh>
        <mesh position={[0.18, -0.01, 0.295]}>
          <circleGeometry args={[0.038, 16]} />
          <meshStandardMaterial {...BLSH} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0, 0.41, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
          <meshStandardMaterial {...JNT} />
        </mesh>
        <mesh ref={antOrb} position={[0, 0.53, 0]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial {...WARM} />
        </mesh>
      </group>

      {/* ── BODY ── */}
      <mesh position={[0, 0.02, 0]}>
        <capsuleGeometry args={[0.22, 0.34, 10, 20]} />
        <meshStandardMaterial {...W} />
      </mesh>
      {/* Belly dot */}
      <mesh position={[0, 0.1, 0.22]}>
        <circleGeometry args={[0.062, 18]} />
        <meshStandardMaterial {...WARM} />
      </mesh>

      {/* ── SHOULDERS ── */}
      <mesh position={[-0.28, 0.24, 0]}><sphereGeometry args={[0.08, 10, 10]} /><meshStandardMaterial {...JNT} /></mesh>
      <mesh position={[ 0.28, 0.24, 0]}><sphereGeometry args={[0.08, 10, 10]} /><meshStandardMaterial {...JNT} /></mesh>

      {/* ── LEFT ARM ── */}
      <group ref={leftArm} position={[-0.28, 0.16, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.065, 0.22, 6, 12]} />
          <meshStandardMaterial {...W} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.062, 10, 10]} />
          <meshStandardMaterial {...JNT} />
        </mesh>
      </group>

      {/* ── RIGHT ARM ── */}
      <group ref={rightArm} position={[0.28, 0.16, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.065, 0.22, 6, 12]} />
          <meshStandardMaterial {...W} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.062, 10, 10]} />
          <meshStandardMaterial {...JNT} />
        </mesh>
      </group>

      {/* ── HOVER BASE ── */}
      <mesh position={[0, -0.46, 0]}>
        <capsuleGeometry args={[0.14, 0.08, 6, 14]} />
        <meshStandardMaterial {...W} />
      </mesh>
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.011, 8, 28]} />
        <meshStandardMaterial {...WARM} />
      </mesh>
      <mesh ref={thrGlow} position={[0, -0.66, 0]}>
        <circleGeometry args={[0.12, 18]} />
        <meshBasicMaterial color="#ffc49b" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.7, 0]} intensity={2} color="#ffc49b" distance={1.1} />
    </group>
  )
}

/* ─── Background dust ────────────────────────────────────────────── */
function BackgroundDust() {
  const pts       = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(55 * 3)
    for (let i = 0; i < 55; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 3
    }
    return arr
  }, [])
  useFrame(({ clock }) => { if (pts.current) pts.current.rotation.y = clock.elapsedTime * 0.01 })
  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#adb6c4" sizeAttenuation transparent opacity={0.22} depthWrite={false} />
    </points>
  )
}

/* ─── Camera ─────────────────────────────────────────────────────── */
function CameraRig({ mouse }) {
  useFrame((state) => {
    const t = new THREE.Vector3(mouse.current.x * 0.15, mouse.current.y * 0.1, 5)
    state.camera.position.lerp(t, 0.03)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function MouseBridge({ mouse }) {
  useEffect(() => {
    const h = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth)  * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', h, { passive: true })
    return () => window.removeEventListener('pointermove', h)
  }, [mouse])
  return null
}

/* ─── Scene root ─────────────────────────────────────────────────── */
function SceneContent({ progress, reduced, mouse }) {
  return (
    <>
      <color attach="background" args={['#001b2e']} />
      <fog   attach="fog"        args={['#001b2e', 9, 22]} />

      <ambientLight intensity={0.35} />
      {/* Key light — warm top-left */}
      <pointLight position={[-3, 5, 3]}  intensity={12} color="#ffefd3" distance={18} />
      {/* Fill light — cool right */}
      <pointLight position={[5, 0, 2]}   intensity={6}  color="#7ecce8" distance={14} />
      {/* Rim */}
      <pointLight position={[0, -4, -2]} intensity={3}  color="#ffc49b" distance={10} />

      <CuteRobot  progress={progress} mouse={mouse} />
      <BackgroundDust />
      <MouseBridge mouse={mouse} />
      <CameraRig   mouse={mouse} />

      {!reduced && (
        <EffectComposer enableNormalPass={false}>
          {/* High threshold — only genuinely emissive elements glow; white body is unaffected */}
          <Bloom luminanceThreshold={0.55} intensity={0.65} mipmapBlur radius={0.55} />
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
