'use client'

import { useEffect, useRef, useState, useMemo, ReactNode, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ============ ANIMATED NUMBER ============
interface AnimatedNumberProps {
  value: number | string
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  format?: 'number' | 'currency' | 'percent'
}

export function AnimatedNumber({
  value,
  duration = 1000,
  decimals = 2,
  prefix = '',
  suffix = '',
  className,
  format = 'number',
}: AnimatedNumberProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  const [displayValue, setDisplayValue] = useState(numValue)
  const previousValue = useRef(numValue)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = numValue
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out-expo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      const currentValue = startValue + (endValue - startValue) * easeProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = endValue
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [numValue, duration])

  const formattedValue = useMemo(() => {
    let formatted = displayValue.toFixed(decimals)
    
    if (format === 'currency') {
      formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(displayValue)
    } else if (format === 'number') {
      formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(displayValue)
    }
    
    return `${prefix}${formatted}${suffix}`
  }, [displayValue, decimals, prefix, suffix, format])

  return (
    <span className={cn('tabular-nums', className)}>
      {formattedValue}
    </span>
  )
}

// ============ COUNTING NUMBER (for big numbers) ============
interface CountingNumberProps {
  end: number
  start?: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  onComplete?: () => void
}

export function CountingNumber({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  onComplete,
}: CountingNumberProps) {
  const [current, setCurrent] = useState(start)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          
          const startTime = performance.now()
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3)
            const value = start + (end - start) * easeProgress
            
            setCurrent(value)
            
            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              onComplete?.()
            }
          }
          
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [end, start, duration, hasAnimated, onComplete])

  return (
    <span ref={elementRef} className={cn('tabular-nums', className)}>
      {prefix}
      {current.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

// ============ MAGNETIC BUTTON ============
interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function MagneticButton({
  children,
  className,
  strength = 0.4,
  onClick,
  disabled = false,
  variant = 'primary',
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [transform, setTransform] = useState('')
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    setTransform(`translate(${deltaX}px, ${deltaY}px)`)
  }, [strength, disabled])

  const handleMouseLeave = useCallback(() => {
    setTransform('')
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    // Create ripple effect
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setTimeout(() => setRipple(null), 600)
    }

    onClick?.()
  }, [disabled, onClick])

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:shadow-lg hover:shadow-[var(--primary)]/30',
    secondary: 'bg-[var(--card-border)] text-[var(--text-primary)] hover:bg-[var(--card-bg)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5',
  }

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-out',
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{ transform }}
    >
      {/* Ripple effect */}
      {ripple && (
        <span
          className="absolute bg-white/30 rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      
      {/* Glow effect on hover */}
      <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/10 to-transparent" />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

// ============ GLOW BUTTON ============
interface GlowButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  glowColor?: string
}

export function GlowButton({
  children,
  className,
  onClick,
  disabled = false,
  glowColor = 'var(--primary)',
}: GlowButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative px-6 py-3 rounded-xl font-semibold transition-all duration-300',
        'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        boxShadow: isHovered
          ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}40`
          : 'none',
      }}
    >
      {/* Animated border */}
      <span
        className="absolute inset-0 rounded-xl"
        style={{
          backgroundImage: `linear-gradient(90deg, ${glowColor}, transparent, ${glowColor})`,
          backgroundSize: '200% 100%',
          animation: isHovered ? 'shimmer 1.5s infinite' : 'none',
          opacity: 0.5,
          padding: '2px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
      />
      
      <span className="relative z-10">{children}</span>
    </button>
  )
}

// ============ PULSE DOT ============
interface PulseDotProps {
  color?: string
  size?: number
  className?: string
}

export function PulseDot({
  color = 'var(--success)',
  size = 8,
  className,
}: PulseDotProps) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
        }}
      />
    </span>
  )
}

// ============ SHIMMER TEXT ============
interface ShimmerTextProps {
  children: ReactNode
  className?: string
}

export function ShimmerText({ children, className }: ShimmerTextProps) {
  return (
    <span
      className={cn(
        'bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)] bg-[length:200%_100%] animate-shimmer',
        className
      )}
    >
      {children}
    </span>
  )
}

// ============ TYPING TEXT ============
interface TypingTextProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

export function TypingText({
  text,
  speed = 50,
  className,
  onComplete,
}: TypingTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span className={className}>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  )
}
