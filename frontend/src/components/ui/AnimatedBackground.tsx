'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

interface MousePosition {
  x: number
  y: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 })
  const animationRef = useRef<number | undefined>(undefined)
  const timeRef = useRef(0)

  const colors = [
    'rgba(1, 195, 142, 0.6)',   // Primary teal #01C38E
    'rgba(10, 120, 106, 0.5)',  // Medium teal #0A786A
    'rgba(19, 45, 70, 0.4)',    // Dark slate #132D46
    'rgba(1, 195, 142, 0.3)',   // Success teal
    'rgba(30, 41, 59, 0.5)',    // Slate #1e293b
  ]

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
      life: 0,
      maxLife: Math.random() * 300 + 200,
    }
  }, [colors])

  const drawAurora = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const gradient1 = ctx.createRadialGradient(
      canvas.width * 0.3 + Math.sin(time * 0.0005) * 100,
      canvas.height * 0.3 + Math.cos(time * 0.0003) * 50,
      0,
      canvas.width * 0.3,
      canvas.height * 0.3,
      canvas.width * 0.5
    )
    gradient1.addColorStop(0, 'rgba(1, 195, 142, 0.15)')
    gradient1.addColorStop(0.5, 'rgba(1, 195, 142, 0.05)')
    gradient1.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient1
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const gradient2 = ctx.createRadialGradient(
      canvas.width * 0.7 + Math.cos(time * 0.0004) * 80,
      canvas.height * 0.6 + Math.sin(time * 0.0006) * 60,
      0,
      canvas.width * 0.7,
      canvas.height * 0.6,
      canvas.width * 0.4
    )
    gradient2.addColorStop(0, 'rgba(10, 120, 106, 0.12)')
    gradient2.addColorStop(0.5, 'rgba(10, 120, 106, 0.04)')
    gradient2.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient2
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Third aurora wave
    const gradient3 = ctx.createRadialGradient(
      canvas.width * 0.5 + Math.sin(time * 0.0003) * 120,
      canvas.height * 0.8 + Math.cos(time * 0.0005) * 40,
      0,
      canvas.width * 0.5,
      canvas.height * 0.8,
      canvas.width * 0.6
    )
    gradient3.addColorStop(0, 'rgba(19, 45, 70, 0.1)')
    gradient3.addColorStop(0.5, 'rgba(19, 45, 70, 0.03)')
    gradient3.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient3
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    const maxDistance = 150
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.15
          ctx.beginPath()
          ctx.strokeStyle = `rgba(1, 195, 142, ${opacity})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    timeRef.current += 16

    // Clear with semi-transparent black for trail effect
    ctx.fillStyle = 'rgba(15, 15, 37, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw aurora effect
    drawAurora(ctx, canvas, timeRef.current)

    // Update and draw particles
    const particles = particlesRef.current
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]

      // Mouse interaction - particles are attracted to cursor
      const dx = mouseRef.current.x - p.x
      const dy = mouseRef.current.y - p.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 200 && distance > 0) {
        const force = (200 - distance) / 200 * 0.02
        p.vx += (dx / distance) * force
        p.vy += (dy / distance) * force
      }

      // Apply velocity with damping
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.99
      p.vy *= 0.99

      // Wrap around screen
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      // Update life
      p.life++
      const lifeRatio = p.life / p.maxLife
      const fadeOpacity = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.9 ? (1 - lifeRatio) * 10 : 1

      // Draw particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity * fadeOpacity})`)
      ctx.fill()

      // Add glow effect
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
      glow.addColorStop(0, p.color.replace(/[\d.]+\)$/, `${p.opacity * fadeOpacity * 0.3})`))
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fill()

      // Remove dead particles
      if (p.life >= p.maxLife) {
        particles.splice(i, 1)
      }
    }

    // Draw connections between nearby particles
    drawConnections(ctx, particles)

    // Spawn new particles
    if (particles.length < 60 && Math.random() < 0.1) {
      particles.push(createParticle(canvas))
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [createParticle, drawAurora, drawConnections])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    // Initialize particles
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push(createParticle(canvas))
    }

    // Start animation
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, createParticle])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: 'var(--background)' }}
    />
  )
}

// Lightweight version for reduced motion preference
export function StaticBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--primary)]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--success)]/10 rounded-full blur-[80px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--secondary)]/5 rounded-full blur-[120px]" />
    </div>
  )
}

// Smart background that respects user preferences
export function SmartBackground() {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  if (prefersReducedMotion) {
    return <StaticBackground />
  }

  return <AnimatedBackground />
}
