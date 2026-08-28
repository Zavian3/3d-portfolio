import { useEffect, useRef, useState } from 'react'
import { robotState } from '../robotState.js'

export default function SpeechBubble() {
  const [displayed, setDisplayed] = useState('')
  const [visible,   setVisible]   = useState(false)
  const [pos,       setPos]       = useState({ x: 0, y: 0 })

  const words       = useRef([])
  const wordIdx     = useRef(0)
  const intervalRef = useRef(null)
  const rafRef      = useRef(null)

  /* Update bubble position every animation frame so it tracks the robot */
  useEffect(() => {
    const loop = () => {
      setPos({ x: robotState.screenX, y: robotState.screenY })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  /* Start word-by-word reveal */
  const startTyping = (text) => {
    clearInterval(intervalRef.current)
    /* Strip emoji characters */
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim()
    words.current   = clean.split(' ')
    wordIdx.current = 0
    setDisplayed('')
    setVisible(true)

    intervalRef.current = setInterval(() => {
      wordIdx.current++
      setDisplayed(words.current.slice(0, wordIdx.current).join(' '))
      if (wordIdx.current >= words.current.length) clearInterval(intervalRef.current)
    }, 88)
  }

  const hide = () => {
    clearInterval(intervalRef.current)
    setVisible(false)
    setDisplayed('')
  }

  useEffect(() => {
    const onSay  = (e) => startTyping(e.detail)
    const onHide = ()  => hide()
    window.addEventListener('robotsay',  onSay)
    window.addEventListener('robothide', onHide)
    return () => {
      window.removeEventListener('robotsay',  onSay)
      window.removeEventListener('robothide', onHide)
      clearInterval(intervalRef.current)
    }
  }, [])

  /* Bubble sits directly above the robot's head (screen coords from robotState) */
  const bubbleW = 220
  const left    = Math.max(8, Math.min(window.innerWidth - bubbleW - 8, pos.x - bubbleW / 2))
  const top     = Math.max(8, pos.y - 14)   /* robotState.screenY is already above antenna */

  if (!visible && !displayed) return null

  return (
    <div
      className={`speech-bubble ${visible ? 'bubble-show' : ''}`}
      style={{ left, top, width: bubbleW }}
      aria-live="polite"
    >
      {displayed}
      <span className="bubble-cursor">|</span>
    </div>
  )
}
