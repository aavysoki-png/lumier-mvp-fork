'use client'

import { useEffect, useRef } from 'react'

interface LifeLine {
  id: number
  // Current head position
  x: number
  y: number
  // Direction
  angle: number
  speed: number
  // Wobble (perpendicular sine wave)
  wobbleOffset: number
  wobbleSpeed: number
  wobbleAmp: number
  // Lifecycle
  life: number
  maxLife: number
  // Trail of past positions
  trail: { x: number; y: number }[]
  // Visual
  baseOpacity: number
  thickness: number
}

interface LifeEvent {
  x: number
  y: number
  life: number
  maxLife: number
  radius: number
}

let _nextId = 0

function spawnLine(W: number, H: number): LifeLine {
  const edge = Math.floor(Math.random() * 4)
  let x = 0, y = 0, angle = 0

  // Spawn at edge, angle biased toward opposite side
  if (edge === 0) {        // top
    x = Math.random() * W; y = -8
    angle = (Math.PI * 0.15) + Math.random() * (Math.PI * 0.7)
  } else if (edge === 1) { // right
    x = W + 8; y = Math.random() * H
    angle = Math.PI * 0.65 + Math.random() * (Math.PI * 0.7)
  } else if (edge === 2) { // bottom
    x = Math.random() * W; y = H + 8
    angle = Math.PI * 1.15 + Math.random() * (Math.PI * 0.7)
  } else {                 // left
    x = -8; y = Math.random() * H
    angle = -Math.PI * 0.35 + Math.random() * (Math.PI * 0.7)
  }

  return {
    id: _nextId++,
    x, y, angle,
    speed:       0.18 + Math.random() * 0.28,
    wobbleOffset: Math.random() * Math.PI * 2,
    wobbleSpeed:  0.008 + Math.random() * 0.012,
    wobbleAmp:    0.15 + Math.random() * 0.35,
    life: 0,
    maxLife: 900 + Math.random() * 700,
    trail: [],
    baseOpacity: 0.18 + Math.random() * 0.14,
    thickness:   0.5 + Math.random() * 0.6,
  }
}

function segmentIntersection(
  ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, dx: number, dy: number,
): { x: number; y: number } | null {
  const dxAB = bx - ax, dyAB = by - ay
  const dxCD = dx - cx, dyCD = dy - cy
  const denom = dxAB * dyCD - dyAB * dxCD
  if (Math.abs(denom) < 1e-6) return null
  const t = ((cx - ax) * dyCD - (cy - ay) * dxCD) / denom
  const u = ((cx - ax) * dyAB - (cy - ay) * dxAB) / denom
  if (t < 0 || t > 1 || u < 0 || u > 1) return null
  return { x: ax + t * dxAB, y: ay + t * dyAB }
}

function run(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
    let W = 0, H = 0
    let raf: number
    let frame = 0

    let lines: LifeLine[] = []
    let events: LifeEvent[] = []

    function resize() {
      W = window.innerWidth;  cv.width  = W
      H = window.innerHeight; cv.height = H
    }
    resize()
    window.addEventListener('resize', resize)

    // Stagger-init several lines so the canvas isn't empty on load
    for (let i = 0; i < 10; i++) {
      const l = spawnLine(W, H)
      l.life = Math.floor(Math.random() * l.maxLife * 0.6)
      // Pre-fill trail
      for (let j = 0; j < l.life; j++) {
        const wobble = Math.sin(l.wobbleOffset + j * l.wobbleSpeed) * l.wobbleAmp
        l.trail.push({
          x: l.x + Math.cos(l.angle) * l.speed * j + Math.cos(l.angle + Math.PI / 2) * wobble * j * 0.02,
          y: l.y + Math.sin(l.angle) * l.speed * j + Math.sin(l.angle + Math.PI / 2) * wobble * j * 0.02,
        })
      }
      // Set head to end of trail
      if (l.trail.length > 0) {
        const last = l.trail[l.trail.length - 1]
        l.x = last.x; l.y = last.y
      }
      lines.push(l)
    }

    const TRAIL_MAX = 120
    const OFFSCREEN  = 160

    function tick() {
      frame++
      ctx.clearRect(0, 0, W, H)

      // ── Spawn new lines ──────────────────────────────────────────────
      if (lines.length < 14 && frame % 90 === 0) {
        lines.push(spawnLine(W, H))
      }

      // ── Update lines ─────────────────────────────────────────────────
      const dead: number[] = []

      for (const ln of lines) {
        ln.life++

        // Perpendicular wobble applied as position nudge
        const wobble = Math.sin(ln.wobbleOffset + ln.life * ln.wobbleSpeed) * ln.wobbleAmp
        const perpX  = Math.cos(ln.angle + Math.PI / 2)
        const perpY  = Math.sin(ln.angle + Math.PI / 2)

        ln.x += Math.cos(ln.angle) * ln.speed + perpX * wobble * 0.04
        ln.y += Math.sin(ln.angle) * ln.speed + perpY * wobble * 0.04

        ln.trail.push({ x: ln.x, y: ln.y })
        if (ln.trail.length > TRAIL_MAX) ln.trail.shift()

        // Kill if too far off-screen or expired
        if (
          ln.life > ln.maxLife ||
          (ln.x < -OFFSCREEN || ln.x > W + OFFSCREEN ||
           ln.y < -OFFSCREEN || ln.y > H + OFFSCREEN)
        ) {
          dead.push(ln.id)
          continue
        }

        // ── Draw trail ────────────────────────────────────────────────
        if (ln.trail.length < 2) continue

        const lifeProgress = ln.life / ln.maxLife
        // Fade in first 10%, fade out last 15%
        const lifeFade =
          lifeProgress < 0.10 ? lifeProgress / 0.10 :
          lifeProgress > 0.85 ? (1 - lifeProgress) / 0.15 : 1

        const N = ln.trail.length
        for (let i = 1; i < N; i++) {
          const t     = i / N                        // 0 at tail, 1 at head
          const alpha = t * t * ln.baseOpacity * lifeFade

          ctx.beginPath()
          ctx.moveTo(ln.trail[i - 1].x, ln.trail[i - 1].y)
          ctx.lineTo(ln.trail[i].x,     ln.trail[i].y)
          ctx.strokeStyle = `rgba(196,150,74,${alpha.toFixed(3)})`
          ctx.lineWidth   = ln.thickness
          ctx.lineCap     = 'round'
          ctx.stroke()
        }

        // Bright head dot
        const headAlpha = ln.baseOpacity * lifeFade * 1.8
        ctx.beginPath()
        ctx.arc(ln.x, ln.y, ln.thickness * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196,150,74,${Math.min(headAlpha, 0.55).toFixed(3)})`
        ctx.fill()
      }

      lines = lines.filter(l => !dead.includes(l.id))

      // ── Intersection detection (every 4 frames) ───────────────────
      if (frame % 4 === 0 && events.length < 18) {
        const TAIL = 8  // how many recent segments to check per pair
        for (let i = 0; i < lines.length; i++) {
          for (let j = i + 1; j < lines.length; j++) {
            const ta = lines[i].trail
            const tb = lines[j].trail
            if (ta.length < 2 || tb.length < 2) continue

            const segA = ta.slice(-TAIL)
            const segB = tb.slice(-TAIL)

            outer:
            for (let ai = 1; ai < segA.length; ai++) {
              for (let bi = 1; bi < segB.length; bi++) {
                const pt = segmentIntersection(
                  segA[ai - 1].x, segA[ai - 1].y, segA[ai].x, segA[ai].y,
                  segB[bi - 1].x, segB[bi - 1].y, segB[bi].x, segB[bi].y,
                )
                if (!pt) continue

                // Don't cluster events too close together
                const tooClose = events.some(
                  e => Math.hypot(e.x - pt.x, e.y - pt.y) < 40
                )
                if (!tooClose) {
                  events.push({
                    x: pt.x, y: pt.y,
                    life: 0, maxLife: 110 + Math.random() * 60,
                    radius: 3 + Math.random() * 4,
                  })
                }
                break outer
              }
            }
          }
        }
      }

      // ── Draw life events ──────────────────────────────────────────
      events = events.filter(e => e.life < e.maxLife)
      for (const ev of events) {
        ev.life++
        const p      = ev.life / ev.maxLife
        const fadeIn  = Math.min(p / 0.18, 1)
        const fadeOut = p > 0.65 ? 1 - (p - 0.65) / 0.35 : 1
        const alpha   = fadeIn * fadeOut

        const r = ev.radius + p * ev.radius * 2.5  // expanding ring

        // Outer soft halo
        const grad = ctx.createRadialGradient(ev.x, ev.y, 0, ev.x, ev.y, r * 2.8)
        grad.addColorStop(0,   `rgba(196,150,74,${(alpha * 0.22).toFixed(3)})`)
        grad.addColorStop(0.5, `rgba(196,150,74,${(alpha * 0.08).toFixed(3)})`)
        grad.addColorStop(1,   'rgba(196,150,74,0)')
        ctx.beginPath()
        ctx.arc(ev.x, ev.y, r * 2.8, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Expanding ring stroke
        ctx.beginPath()
        ctx.arc(ev.x, ev.y, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(196,150,74,${(alpha * 0.45).toFixed(3)})`
        ctx.lineWidth   = 0.7
        ctx.stroke()

        // Centre dot
        ctx.beginPath()
        ctx.arc(ev.x, ev.y, 1.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196,150,74,${(alpha * 0.85).toFixed(3)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
}

export function LifeLinesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    return run(cv, ctx)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  )
}
