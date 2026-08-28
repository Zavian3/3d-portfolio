import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Overlay from './components/Overlay.jsx'
import Nav from './components/Nav.jsx'
import Cursor from './components/Cursor.jsx'
import Loader from './components/Loader.jsx'
import SpeechBubble from './components/SpeechBubble.jsx'

const Scene = lazy(() => import('./components/Scene.jsx'))

export default function App() {
  const progress = useRef(0)
  const [load, setLoad]   = useState(12)
  const [ready, setReady] = useState(false)

  /* Scroll → progress */
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.current = max > 0 ? window.scrollY / max : 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Fake load progress */
  useEffect(() => {
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400)
      setLoad(12 + t * 88)
      if (t < 1) frame = requestAnimationFrame(tick)
      else setTimeout(() => setReady(true), 180)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  /* Global data-speech hover → robotsay event */
  useEffect(() => {
    let last = ''
    const handler = (e) => {
      const el = e.target.closest('[data-speech]')
      const txt = el?.dataset?.speech
      if (txt && txt !== last) {
        last = txt
        window.dispatchEvent(new CustomEvent('robotsay', { detail: txt }))
      }
    }
    const reset = () => { last = '' }
    document.addEventListener('mouseover', handler)
    document.addEventListener('mouseout',  reset)
    return () => {
      document.removeEventListener('mouseover', handler)
      document.removeEventListener('mouseout',  reset)
    }
  }, [])

  return (
    <>
      <Loader progress={load} ready={ready} />
      <Cursor />
      <Suspense fallback={null}>
        <Scene progress={progress} />
      </Suspense>
      <div className="grain" />
      <div className="vignette" />
      <Nav />
      <Overlay />
      <SpeechBubble />
    </>
  )
}
