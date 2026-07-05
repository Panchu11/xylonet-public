"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  left: string;
  backgroundColor: string;
  animationDuration: string;
  animationDelay: string;
}

export function ConfettiEffect({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      const colors = [
        '#01C38E', '#0A786A', '#132D46', '#f59e0b', '#10b981', 
        '#06b6d4', '#14b8a6', '#0d9488', '#059669', '#0891b2'
      ];
      
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDuration: `${2 + Math.random() * 2}s`,
        animationDelay: `${Math.random() * 0.5}s`,
      }));

      setPieces(newPieces);

      // Clean up after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 payx-confetti"
          style={{
            left: piece.left,
            top: '-10px',
            backgroundColor: piece.backgroundColor,
            animationDuration: piece.animationDuration,
            animationDelay: piece.animationDelay,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}
