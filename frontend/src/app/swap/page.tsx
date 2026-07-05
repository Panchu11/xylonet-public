'use client'

import { useState, useEffect } from 'react'
import { useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { SwapWidget } from '@/components/swap/SwapWidget'
import { ArrowRight, Zap, DollarSign, Globe, TrendingUp, Activity, Clock, Shield, Droplets } from 'lucide-react'
import Link from 'next/link'
import { TiltCard } from '@/components/ui/TiltCard'
import { CONTRACTS } from '@/config/constants'
import { XYLO_POOL_ABI } from '@/config/abis'
import { formatNumber } from '@/lib/utils'

export default function SwapPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [currentPrice, setCurrentPrice] = useState(0.92)
  const [priceHistory, setPriceHistory] = useState<number[]>([0.918, 0.920, 0.919, 0.921, 0.920])

  // Fetch real pool data for TVL
  // Note: Only 2 calls — well within Arc v0.7.2's 100-entry batch cap.
  // If pools expand beyond ~90, use chunkedMulticall from @/utils/rpc-error-handler
  const { data: poolData } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.USDC_EURC_POOL,
        abi: XYLO_POOL_ABI,
        functionName: 'getReserves',
      },
      {
        address: CONTRACTS.USDC_USYC_POOL,
        abi: XYLO_POOL_ABI,
        functionName: 'getReserves',
      },
    ],
  })

  // Calculate real TVL from pool reserves
  let totalTVL = 0
  if (poolData) {
    if (poolData[0]?.result) {
      const [r0, r1] = poolData[0].result as [bigint, bigint]
      totalTVL += Number(formatUnits(r0, 6)) + Number(formatUnits(r1, 6))
    }
    if (poolData[1]?.result) {
      const [r0, r1] = poolData[1].result as [bigint, bigint]
      totalTVL += Number(formatUnits(r0, 6)) + Number(formatUnits(r1, 6))
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    
    // Simulate live price updates
    const priceInterval = setInterval(() => {
      const variance = (Math.random() - 0.5) * 0.002
      setCurrentPrice(prev => {
        const newPrice = Number((prev + variance).toFixed(4))
        setPriceHistory(h => [...h.slice(-19), newPrice])
        return newPrice
      })
    }, 3000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(priceInterval)
    }
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[#0f172a]">
        {/* Dynamic Mesh Gradients */}
        <div 
          className="absolute w-[1200px] h-[1200px] rounded-full opacity-20 blur-[150px] transition-all duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(1,195,142,0.6) 0%, rgba(10,120,106,0.4) 50%, transparent 70%)',
            top: `calc(${mousePosition.y * 100}% - 600px)`,
            left: `calc(${mousePosition.x * 100}% - 600px)`,
          }}
        />
        <div 
          className="absolute w-[900px] h-[900px] rounded-full opacity-15 blur-[120px] transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(10,120,106,0.6) 0%, rgba(19,45,70,0.4) 60%, transparent 70%)',
            bottom: `calc(${(1-mousePosition.y) * 80}% - 450px)`,
            right: `calc(${(1-mousePosition.x) * 80}% - 450px)`,
          }}
        />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          animation: 'gridPulse 8s ease-in-out infinite',
        }} />
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 relative z-10">
        {/* Live Price Ticker */}
        <div className="absolute top-4 right-4 md:right-8 glass-premium rounded-full px-4 py-2 flex items-center gap-3 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#01C38E] animate-pulse" />
            <span className="text-xs text-gray-400">LIVE</span>
          </div>
          <div className="text-sm font-mono">
            <span className="text-gray-400">USDC/EURC:</span>
            <span className={`ml-2 font-bold ${currentPrice > 0.92 ? 'text-[#01C38E]' : 'text-red-400'}`}>
              ${currentPrice.toFixed(4)}
            </span>
          </div>
          <MiniSparkline data={priceHistory} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center mb-6 md:mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass-premium border border-[#0A786A]/20 rounded-full px-4 py-2 mb-4 md:mb-6 text-sm magnetic-hover">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
            </span>
            <span className="text-[#01C38E] font-medium">Trading Live on Arc Network</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6">
            <span className="block mb-2 text-white leading-tight">
              Trade Stablecoins
            </span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] text-transparent bg-clip-text animate-gradient-flow" style={{ backgroundSize: '200% 200%' }}>
                Like Lightning
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-full animate-expand blur-sm" />
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4 mb-6">
            Experience institutional-grade swaps with{' '}
            <span className="text-[#01C38E] font-semibold">near-zero slippage</span>,{' '}
            <span className="text-[#0A786A] font-semibold">sub-second finality</span>, and{' '}
            <span className="text-[#01C38E] font-semibold">$0.01 fees</span>
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#01C38E]" />
              <span className="text-gray-400">Instant Settlement</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-[#01C38E]" />
              <span className="text-gray-400">Audited Contracts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-[#0A786A]" />
              <span className="text-gray-400">Real-time Quotes</span>
            </div>
          </div>
        </div>

        {/* Swap Widget with Advanced Container */}
        <div className="w-full max-w-md mb-8 animate-scale-in">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-2xl blur-xl opacity-20 animate-pulse-slow" />
            
            <TiltCard tiltAmount={3} glareEnabled={true}>
              <div className="relative">
                <SwapWidget />
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Live Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-4xl stagger-fade">
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Avg. Gas Fee"
            value="~$0.01"
            change="Arc Network"
            gradient="from-[#01C38E] to-[#0A786A]"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Finality"
            value="<350ms"
            change="Instant"
            gradient="from-[#0A786A] to-[#01C38E]"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Swap Fee"
            value="0.04%"
            change="4 bps"
            gradient="from-[#132D46] to-[#0A786A]"
          />
          <StatCard
            icon={<Droplets className="w-5 h-5" />}
            label="Pool TVL"
            value={totalTVL > 0 ? `$${formatNumber(totalTVL)}` : '$0'}
            change="Live"
            gradient="from-[#0A786A] to-[#01C38E]"
            isLive={true}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 border-t border-white/5 py-12 md:py-16 px-4 bg-gradient-to-b from-transparent via-black/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">XyloNet</span> Swap?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built on Arc Network's cutting-edge infrastructure for unmatched trading experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-fade">
            <FeatureCard
              title="Lightning Fast"
              description="Sub-350ms deterministic finality. No waiting, no reorgs, no stress. Your trades settle before you blink."
              icon={<Zap className="w-6 h-6" />}
              gradient="from-[#0A786A] to-[#01C38E]"
              stats={[
                { label: "Settlement", value: "<1s" },
                { label: "Uptime", value: "99.9%" }
              ]}
            />
            <FeatureCard
              title="Ultra Low Cost"
              description="Pay ~$0.01 per transaction in USDC. No volatile gas tokens, no surprise fees, total cost transparency."
              icon={<DollarSign className="w-6 h-6" />}
              gradient="from-[#01C38E] to-[#0A786A]"
              stats={[
                { label: "Gas Cost", value: "$0.01" },
                { label: "Swap Fee", value: "0.04%" }
              ]}
            />
            <FeatureCard
              title="Cross-Chain Ready"
              description="Seamlessly bridge USDC using Circle CCTP. Real native USDC across 7+ chains, no wrapped tokens."
              icon={<Globe className="w-6 h-6" />}
              gradient="from-[#132D46] to-[#0A786A]"
              stats={[
                { label: "Chains", value: "7+" },
                { label: "Bridge Time", value: "~30s" }
              ]}
            />
          </div>
          
          {/* Quick Actions */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/pools" className="group glass-premium hover:border-[#01C38E]/50 rounded-xl px-6 py-3 transition-all magnetic-hover">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 group-hover:text-white">Earn from Liquidity</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#01C38E] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
            <Link href="/vault" className="group glass-premium hover:border-[#0A786A]/50 rounded-xl px-6 py-3 transition-all magnetic-hover">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 group-hover:text-white">Auto-Compound Yield</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#0A786A] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
            <Link href="/bridge" className="group glass-premium hover:border-[#01C38E]/50 rounded-xl px-6 py-3 transition-all magnetic-hover">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 group-hover:text-white">Bridge Assets</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#01C38E] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 60
    const y = 20 - ((val - min) / range) * 20
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width="60" height="20" className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-[#01C38E]"
      />
    </svg>
  )
}

function StatCard({ icon, label, value, change, gradient, isLive }: { icon: React.ReactNode; label: string; value: string; change: string; gradient: string; isLive?: boolean }) {
  return (
    <TiltCard tiltAmount={6}>
      <div className="glass-premium rounded-xl p-4 h-full holographic group hover:border-white/20 transition-all">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 text-white depth-shadow group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          {label}
          {isLive && (
            <span className="w-1.5 h-1.5 bg-[#01C38E] rounded-full animate-pulse" />
          )}
        </div>
        <div className={`text-xl md:text-2xl font-bold text-white mb-1`}>
          {value}
        </div>
        <div className="text-[10px] text-gray-500">{change}</div>
      </div>
    </TiltCard>
  )
}

function FeatureCard({ title, description, icon, gradient, stats }: { title: string; description: string; icon: React.ReactNode; gradient: string; stats: {label: string; value: string}[] }) {
  return (
    <TiltCard tiltAmount={8} glareEnabled={true}>
      <div className="glass-premium rounded-2xl p-6 h-full holographic group hover:border-white/20 transition-all">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-white depth-shadow group-hover:scale-110 group-hover:rotate-3 transition-all`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{description}</p>
        
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-[10px] text-gray-500 mb-1">{stat.label}</div>
              <div className="text-lg font-bold text-white">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TiltCard>
  )
}
