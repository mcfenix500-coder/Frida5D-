'use client'

import { useEffect, useRef } from 'react'

// Lluvia de código binario dorado sobre fondo oscuro (decorativo).
export function BinaryRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let width = 0
    let height = 0
    let columns: number[] = []
    const fontSize = 14

    const resize = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const colCount = Math.floor(width / fontSize)
      columns = new Array(colCount).fill(0).map(() => Math.random() * -height)
    }

    resize()
    window.addEventListener('resize', resize)

    let last = 0
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (t - last < 70) return
      last = t

      ctx.fillStyle = 'rgba(18, 8, 32, 0.22)'
      ctx.fillRect(0, 0, width, height)
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < columns.length; i++) {
        const char = Math.random() > 0.5 ? '1' : '0'
        const x = i * fontSize
        const y = columns[i]
        // destellos dorados intercalados con fucsia tenue
        ctx.fillStyle = Math.random() > 0.85 ? 'rgba(240, 200, 80, 0.85)' : 'rgba(214, 92, 214, 0.28)'
        ctx.fillText(char, x, y)
        if (y > height && Math.random() > 0.975) columns[i] = 0
        else columns[i] = y + fontSize
      }
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
    />
  )
}
