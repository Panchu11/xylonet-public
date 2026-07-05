// Token Logo Components - Using official downloaded icons
import Image from 'next/image'

interface TokenLogoProps {
  size?: number
  className?: string
}

// Token icons using downloaded official images
export function USDCLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/tokens/usdc.png"
      alt="USDC"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function EURCLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/tokens/eurc.png"
      alt="EURC"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function USYCLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/tokens/usyc.png"
      alt="USYC"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function TokenLogo({ symbol, size = 32, className = '' }: TokenLogoProps & { symbol: string }) {
  switch (symbol.toUpperCase()) {
    case 'USDC':
      return <USDCLogo size={size} className={className} />
    case 'EURC':
      return <EURCLogo size={size} className={className} />
    case 'USYC':
      return <USYCLogo size={size} className={className} />
    default:
      return (
        <div 
          className={`rounded-full bg-gradient-to-br from-[#0A786A] to-[#01C38E] flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
            {symbol[0]}
          </span>
        </div>
      )
  }
}

// Official Chain Logos - Using downloaded official images

export function EthereumLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/ethereum.svg"
      alt="Ethereum"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function ArbitrumLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/arbitrum.svg"
      alt="Arbitrum"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function BaseLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/base.jpg"
      alt="Base"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function OptimismLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/optimism.svg"
      alt="Optimism"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function PolygonLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/polygon.svg"
      alt="Polygon"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function AvalancheLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/avalanche.svg"
      alt="Avalanche"
      width={size}
      height={size}
      className={className}
    />
  )
}

// Arc Logo - Uses XyloNet branding
export function ArcLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/branding/xylonet-gradient.svg"
      alt="Arc"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

// New Chain Logos - Using downloaded official images

export function LineaLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/linea.png"
      alt="Linea"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function SonicLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/sonic.png"
      alt="Sonic"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function UnichainLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/unichain.png"
      alt="Unichain"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function WorldchainLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/worldchain.png"
      alt="World Chain"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function HyperEVMLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/hyperevm.png"
      alt="HyperEVM"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function InkLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/ink.png"
      alt="Ink"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function PlumeLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/plume.png"
      alt="Plume"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function SeiLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/sei.png"
      alt="Sei"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function CodexLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/codex.png"
      alt="Codex"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function XDCLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/xdc.png"
      alt="XDC"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

// Monad
export function MonadLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/monad.svg"
      alt="Monad"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

// Morph
export function MorphLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/morph.jpg"
      alt="Morph"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

// Edge
export function EdgeLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/edgeX.jpg"
      alt="Edge"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

// XyloNet Logo
export function XyloNetLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image 
      src="/branding/xylonet-gradient.svg" 
      alt="XyloNet" 
      width={size} 
      height={size} 
      className={`rounded-lg ${className}`}
    />
  )
}

// XyloNet Logo Fallback (when no custom logo provided)
export function XyloNetLogoFallback({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
      <defs>
        <linearGradient id="xyloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#132D46"/>
          <stop offset="50%" stopColor="#0A786A"/>
          <stop offset="100%" stopColor="#01C38E"/>
        </linearGradient>
      </defs>
      <circle cx="128" cy="128" r="128" fill="url(#xyloGrad)"/>
    </svg>
  )
}

export function ChainLogo({ name, size = 32, className = '' }: TokenLogoProps & { name: string }) {
  const chainName = name.toLowerCase()
  
  if (chainName.includes('ethereum') || chainName === 'sepolia') {
    return <EthereumLogo size={size} className={className} />
  }
  if (chainName.includes('arbitrum')) {
    return <ArbitrumLogo size={size} className={className} />
  }
  if (chainName.includes('base')) {
    return <BaseLogo size={size} className={className} />
  }
  if (chainName.includes('optimism')) {
    return <OptimismLogo size={size} className={className} />
  }
  if (chainName.includes('polygon') || chainName.includes('amoy')) {
    return <PolygonLogo size={size} className={className} />
  }
  if (chainName.includes('avalanche') || chainName.includes('fuji')) {
    return <AvalancheLogo size={size} className={className} />
  }
  if (chainName.includes('arc')) {
    return <ArcLogo size={size} className={className} />
  }
  if (chainName.includes('linea')) {
    return <LineaLogo size={size} className={className} />
  }
  if (chainName.includes('sonic')) {
    return <SonicLogo size={size} className={className} />
  }
  if (chainName.includes('unichain')) {
    return <UnichainLogo size={size} className={className} />
  }
  if (chainName.includes('world')) {
    return <WorldchainLogo size={size} className={className} />
  }
  if (chainName.includes('hyper')) {
    return <HyperEVMLogo size={size} className={className} />
  }
  if (chainName.includes('ink')) {
    return <InkLogo size={size} className={className} />
  }
  if (chainName.includes('plume')) {
    return <PlumeLogo size={size} className={className} />
  }
  if (chainName.includes('sei')) {
    return <SeiLogo size={size} className={className} />
  }
  if (chainName.includes('codex')) {
    return <CodexLogo size={size} className={className} />
  }
  if (chainName.includes('xdc')) {
    return <XDCLogo size={size} className={className} />
  }
  if (chainName.includes('monad')) {
    return <MonadLogo size={size} className={className} />
  }
  if (chainName.includes('morph')) {
    return <MorphLogo size={size} className={className} />
  }
  if (chainName.includes('edge')) {
    return <EdgeLogo size={size} className={className} />
  }
  
  // Generic fallback for any unknown chain
  return (
    <div 
      className={`rounded-full bg-gradient-to-br from-[#0A786A] to-[#01C38E] flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {name[0]}
      </span>
    </div>
  )
}
