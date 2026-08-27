import { useEffect, useRef } from 'react'

export default function Cursor() {
  const ref = useRef(null)

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) {
      document.body.classList.add('touch')
      return
    }

    const el = ref.current
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let hovering = false

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      const target = e.target
      hovering = Boolean(target.closest('a, button, .card'))
    }

    const tick = () => {
      x += (tx - x) * 0.18
      y += (ty - y) * 0.18
      if (el) {
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
        el.classList.toggle('hover', hovering)
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove)
    let raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} className="cursor" />
}
