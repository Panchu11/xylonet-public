'use client'

import { useRef, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TiltCardProps {
  children: ReactNode
  className?: string
  tiltAmount?: number
  glareEnabled?: boolean
  scale?: number
  perspective?: number
}

export function TiltCard({
  children,
  className,
  tiltAmount = 10,
  glareEnabled = true,
  scale = 1.02,
  perspective = 1000,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -tiltAmount
    const rotateY = ((x - centerX) / centerX) * tiltAmount

    setTransform(
      `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
    )

    // Update glare position
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    setGlarePosition({ x: glareX, y: glareY })
  }, [tiltAmount, scale, perspective])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setTransform('')
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative transition-all duration-200 ease-out will-change-transform',
        className
      )}
      style={{
        transform: transform,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
      
      {/* Glare Effect */}
      {glareEnabled && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-inherit overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        >
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundImage: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              opacity: isHovered ? 1 : 0,
            }}
          />
        </div>
      )}

      {/* Holographic shine effect */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(
                ${105 + (glarePosition.x - 50) * 0.5}deg,
                transparent 0%,
                rgba(122, 110, 239, 0.3) 25%,
                rgba(157, 148, 255, 0.2) 50%,
                rgba(0, 201, 167, 0.3) 75%,
                transparent 100%
              )`,
              backgroundSize: '200% 200%',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
      )}
    </div>
  )
}

// Floating card with continuous animation
interface FloatingCardProps {
  children: ReactNode
  className?: string
  floatAmount?: number
  duration?: number
}

export function FloatingCard({
  children,
  className,
  floatAmount = 10,
  duration = 4,
}: FloatingCardProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
      }}
    >
      {children}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-${floatAmount}px); }
        }
      `}</style>
    </div>
  )
}

// Magnetic effect wrapper
interface MagneticWrapperProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function MagneticWrapper({
  children,
  className,
  strength = 0.3,
}: MagneticWrapperProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    setTransform(`translate(${deltaX}px, ${deltaY}px)`)
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    setTransform('')
  }, [])

  return (
    <div
      ref={elementRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('transition-transform duration-200 ease-out', className)}
      style={{ transform }}
    >
      {children}
    </div>
  )
}

// Glass card with enhanced blur
interface GlassCardProps {
  children: ReactNode
  className?: string
  blur?: number
  opacity?: number
}

export function GlassCard({
  children,
  className,
  blur = 20,
  opacity = 0.1,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden',
        className
      )}
      style={{
        backgroundColor: `rgba(26, 26, 58, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      }}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
      
      {/* Bottom highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
