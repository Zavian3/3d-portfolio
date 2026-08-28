import { useEffect, useRef, useState } from 'react'

export default function SpeechBubble() {
  const [text, setText]       = useState('')
  const [visible, setVisible] = useState(false)
  const [pos, setPos]         = useState({ x: 200, y: 200 })
  const timer                 = useRef(null)

  useEffect(() => {
    /* Track cursor for bubble positioning */
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove, { passive: true })

    /* Listen for robot speech events */
    const onSay = (e) => {
      setText(e.detail)
      setVisible(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setVisible(false), 4200)
    }
    window.addEventListener('robotsay', onSay)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('robotsay', onSay)
      clearTimeout(timer.current)
    }
  }, [])

  /* Flip bubble left if cursor is near right edge */
  const flipLeft = pos.x > window.innerWidth * 0.72

  return (
    <div
      className={`speech-bubble ${visible ? 'bubble-show' : ''} ${flipLeft ? 'bubble-left' : ''}`}
      style={{
        left: flipLeft ? pos.x - 260 : pos.x + 24,
        top:  Math.max(12, pos.y - 78),
      }}
      aria-live="polite"
    >
      {text}
      <span className="bubble-tail" />
    </div>
  )
}
