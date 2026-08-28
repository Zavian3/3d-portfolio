import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Overlay from './components/Overlay.jsx'
import Nav from './components/Nav.jsx'
import Cursor from './components/Cursor.jsx'
import Loader from './components/Loader.jsx'
import SpeechBubble from './components/SpeechBubble.jsx'
import { panelRects, speechState } from './robotState.js'

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

  /* Keep panelRects fresh so the robot avoids frosted panels */
  useEffect(() => {
    const update = () => {
      panelRects.length = 0
      document.querySelectorAll('.panel, .edu-card, .card').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width > 10 && r.height > 10)
          panelRects.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom })
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const id = setInterval(update, 300)   /* catch animation completions */
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      clearInterval(id)
    }
  }, [])

  /* Global data-speech hover → robotsay / robothide events */
  useEffect(() => {
    let current = ''

    const onOver = (e) => {
      const el  = e.target.closest('[data-speech]')
      const txt = el?.dataset?.speech ?? ''
      if (txt && txt !== current) {
        current = txt
        speechState.active = true
        window.dispatchEvent(new CustomEvent('robotsay', { detail: txt }))
      } else if (!txt && current) {
        current = ''
        speechState.active = false
        window.dispatchEvent(new CustomEvent('robothide'))
      }
    }

    const onOut = (e) => {
      const from = e.target.closest('[data-speech]')
      const to   = e.relatedTarget?.closest?.('[data-speech]')
      if (from && !to) {
        current = ''
        speechState.active = false
        window.dispatchEvent(new CustomEvent('robothide'))
      }
    }

    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout',  onOut)
    return () => {
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout',  onOut)
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
