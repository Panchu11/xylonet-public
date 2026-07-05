'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  rotation: number
  size: number
}

interface ConfettiProps {
  isActive: boolean
  duration?: number
  pieceCount?: number
}

const COLORS = [
  '#7a6eef', // primary
  '#9d94ff', // secondary
  '#5a4fcf', // accent
  '#00c9a7', // success
  '#ffc107', // warning
  '#ff6b6b', // error
  '#ffffff', // white
]

export function Confetti({ isActive, duration = 3000, pieceCount = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = []
      for (let i = 0; i < pieceCount; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          delay: Math.random() * 0.5,
          rotation: Math.random() * 360,
          size: 6 + Math.random() * 8,
        })
      }
      setPieces(newPieces)

      const timer = setTimeout(() => {
        setPieces([])
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isActive, duration, pieceCount])

  if (!mounted || pieces.length === 0) return null

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${2 + Math.random()}s ease-out ${piece.delay}s forwards`,
          }}
        />
      ))}
    </div>,
    document.body
  )
}

// Success celebration component with confetti and message
interface SuccessCelebrationProps {
  isVisible: boolean
  title?: string
  message?: string
  onClose?: () => void
}

export function SuccessCelebration({ 
  isVisible, 
  title = 'Success!', 
  message = 'Transaction completed successfully.',
  onClose 
}: SuccessCelebrationProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowContent(true)
      const timer = setTimeout(() => {
        setShowContent(false)
        onClose?.()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible && !showContent) return null

  return (
    <>
      <Confetti isActive={isVisible} />
      {showContent && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
          <div className="bg-[var(--card-bg)] border border-[var(--success)]/50 rounded-2xl p-8 text-center animate-scale-in shadow-2xl pointer-events-auto">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-[var(--success)]/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" className="check-animate" />
                </svg>
              </div>
              <div className="success-ring" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
            <p className="text-[var(--text-secondary)]">{message}</p>
          </div>
        </div>
      )}
    </>
  )
}
