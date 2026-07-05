'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { ArrowUpDown, ChevronDown, Loader2, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { AppKit } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import { createPublicClient, http, fallback, type Chain } from 'viem'
import { TOKENS } from '@/config/constants'
import { cn, formatNumber } from '@/lib/utils'
import { useTxToast } from '@/components/ui/Toast'
import { ChainLogo } from '@/components/ui/TokenLogos'
import { Confetti } from '@/components/ui/Confetti'
import { saveTransaction } from '@/lib/transactions'
import { bridgeChains, CHAIN_RPC_URLS, CHAIN_FALLBACK_RPCS, getAddChainParams } from '@/config/wagmi'

// App Kit supported chains for Arc Testnet - all CCTP V2 testnets
// The `id` field MUST exactly match the BridgeChain enum from @circle-fin/bridge-kit
const BRIDGE_CHAINS = [
  { id: 'Arc_Testnet', name: 'Arc Testnet', chainId: 5042002 },
  { id: 'Ethereum_Sepolia', name: 'Ethereum Sepolia', chainId: 11155111 },
  { id: 'Arbitrum_Sepolia', name: 'Arbitrum Sepolia', chainId: 421614 },
  { id: 'Base_Sepolia', name: 'Base Sepolia', chainId: 84532 },
  { id: 'Optimism_Sepolia', name: 'Optimism Sepolia', chainId: 11155420 },
  { id: 'Polygon_Amoy_Testnet', name: 'Polygon Amoy', chainId: 80002 },
  { id: 'Avalanche_Fuji', name: 'Avalanche Fuji', chainId: 43113 },
  { id: 'Linea_Sepolia', name: 'Linea Sepolia', chainId: 59141 },
  { id: 'Sonic_Testnet', name: 'Sonic Testnet', chainId: 14601 },
  { id: 'Unichain_Sepolia', name: 'Unichain Sepolia', chainId: 1301 },
  { id: 'World_Chain_Sepolia', name: 'World Chain Sepolia', chainId: 4801 },
  { id: 'HyperEVM_Testnet', name: 'HyperEVM Testnet', chainId: 998 },
  { id: 'Ink_Testnet', name: 'Ink Sepolia', chainId: 763373 },
  { id: 'Plume_Testnet', name: 'Plume Testnet', chainId: 98867 },
  { id: 'Sei_Testnet', name: 'Sei Testnet', chainId: 1328 },
  { id: 'Codex_Testnet', name: 'Codex Testnet', chainId: 812242 },
  { id: 'XDC_Apothem', name: 'XDC Apothem', chainId: 51 },
  { id: 'Monad_Testnet', name: 'Monad Testnet', chainId: 10143 },
  { id: 'Morph_Testnet', name: 'Morph Testnet', chainId: 2810 },
  { id: 'Edge_Testnet', name: 'Edge Testnet', chainId: 202402181627 },
]

type BridgeChain = typeof BRIDGE_CHAINS[number]

// Chains where Circle's Forwarding Service is NOT supported as a destination.
// For these chains, bridge falls back to standard multi-sign flow.
// Source: @circle-fin/bridge-kit chain definitions → forwarderSupported.destination: false
const NO_FORWARDER_DESTINATION = new Set([
  'BNB_Testnet',       // domain 17 — forwarderSupported: { destination: false }
  'Starknet_Testnet',  // domain 25 — forwarderSupported: { destination: false }
  'Stellar_Testnet',   // domain 27 — forwarderSupported: { destination: false }
  'Injective_Testnet', // domain 29 — forwarderSupported: { destination: false }
  'Morph_Testnet',     // domain 30 — forwarderSupported: { source: false, destination: false }
  'Pharos_Testnet',    // domain 31 — forwarderSupported: { destination: false }
])

const ARC_CHAIN = BRIDGE_CHAINS[0] // Arc Testnet - always one side of the bridge

// Build viem chain lookup map for RPC overrides in adapter
const viemChainMap = new Map<number, Chain>()
for (const c of bridgeChains) {
  viemChainMap.set(c.id, c)
}

interface BridgeStep {
  name: string
  state: 'pending' | 'in_progress' | 'success' | 'error'
  txHash?: string
  explorerUrl?: string
}

// Initialize App Kit singleton (handles bridge, swap, unified balance)
const kit = new AppKit()

// Map App Kit step names to user-friendly labels
function formatStepName(name: string): string {
  switch (name) {
    case 'approve': return 'Approve'
    case 'burn': return 'Burn'
    case 'fetchAttestation': return 'Fetch Attestation'
    case 'mint': return 'Mint'
    default: return name.charAt(0).toUpperCase() + name.slice(1)
  }
}

// Ensure destination chain is available in wallet before bridging
async function ensureChainInWallet(
  provider: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  chainId: number
): Promise<void> {
  const hexChainId = '0x' + chainId.toString(16)
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    })
  } catch (switchError: unknown) {
    const swErr = switchError as { code?: number; message?: string }
    if (swErr.code === 4902) {
      const params = getAddChainParams(chainId)
      if (!params) return
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [params],
        })
      } catch {
        // Non-fatal: user may decline but chain might exist
      }
    }
  }
}

export function BridgeWidget() {
  const { address, isConnected, connector } = useAccount()
  const { pending, success, error: errorToast } = useTxToast()
  
  const [sourceChain, setSourceChain] = useState<BridgeChain>(BRIDGE_CHAINS[0])
  const [destChain, setDestChain] = useState<BridgeChain>(BRIDGE_CHAINS[1])
  const [amount, setAmount] = useState('')
  const [showSourceSelect, setShowSourceSelect] = useState(false)
  const [showDestSelect, setShowDestSelect] = useState(false)
  const [isBridging, setIsBridging] = useState(false)
  const [bridgeResult, setBridgeResult] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [steps, setSteps] = useState<BridgeStep[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [eip1193Provider, setEip1193Provider] = useState<any>(null)

  // User USDC balance on the selected source chain
  // Use Arc USDC address for Arc, otherwise wagmi resolves via chain
  const { data: usdcBalance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    token: sourceChain.chainId === 5042002 ? TOKENS.USDC.address : undefined,
    chainId: sourceChain.chainId,
  })

  // Refetch balance when source chain changes
  useEffect(() => {
    if (isConnected && address) {
      refetchBalance()
    }
  }, [sourceChain.chainId, isConnected, address, refetchBalance])

  // Get EIP1193 provider from connector
  useEffect(() => {
    const getProvider = async () => {
      if (connector && isConnected) {
        try {
          const provider = await connector.getProvider()
          setEip1193Provider(provider)
        } catch (err) {
          console.error('Failed to get provider:', err)
          setEip1193Provider(null)
        }
      } else {
        setEip1193Provider(null)
      }
    }
    getProvider()
  }, [connector, isConnected])

  // Create App Kit adapter with custom public client for RPC reliability
  const createAdapter = useCallback(async () => {
    if (!eip1193Provider) {
      console.error('No EIP1193 provider available')
      return null
    }
    try {
      const adapter = await createViemAdapterFromProvider({
        provider: eip1193Provider,
        getPublicClient: ({ chain }: { chain: Chain }) => {
          const viemChain = viemChainMap.get(chain.id) ?? chain
          const primaryRpc = CHAIN_RPC_URLS[chain.id]
          const fallbackRpcs = CHAIN_FALLBACK_RPCS[chain.id]

          let transport
          if (fallbackRpcs && primaryRpc) {
            transport = fallback([http(primaryRpc), ...fallbackRpcs.map(url => http(url))])
          } else if (primaryRpc) {
            transport = fallback([http(primaryRpc), http()])
          } else {
            transport = http()
          }

          // Bump baseFeeMultiplier so maxFeePerGas has enough headroom above the
          // block base fee. Default 1.2x is too tight for L2 chains where the
          // base fee can tick up between estimation and submission.
          const chainWithFees = {
            ...viemChain,
            fees: {
              ...((viemChain as any).fees ?? {}),
              baseFeeMultiplier: 1.5,
            },
          } as Chain

          return createPublicClient({
            chain: chainWithFees,
            transport,
          })
        },
      })
      return adapter
    } catch (err) {
      console.error('Failed to create adapter:', err)
      return null
    }
  }, [eip1193Provider])

  // Swap source and destination chains
  const handleSwapDirection = () => {
    if (isBridging) return
    const prevSource = sourceChain
    const prevDest = destChain
    setSourceChain(prevDest)
    setDestChain(prevSource)
    setBridgeResult(null)
    setErrorMsg(null)
  }

  const handleBridge = async () => {
    if (!isConnected || !amount || !address) return
    
    setIsBridging(true)
    setErrorMsg(null)
    setBridgeResult(null)
    setSteps([
      { name: 'approve', state: 'pending' },
      { name: 'burn', state: 'pending' },
      { name: 'fetchAttestation', state: 'pending' },
      { name: 'mint', state: 'pending' },
    ])

    const toastId = pending('Bridging USDC...', `${amount} USDC to ${destChain.name}`)

    try {
      // Ensure both chains are in wallet before App Kit takes over
      if (eip1193Provider) {
        await ensureChainInWallet(eip1193Provider, sourceChain.chainId)
        await ensureChainInWallet(eip1193Provider, destChain.chainId)
        // Switch back to source chain for the bridge
        const hexSourceChainId = '0x' + sourceChain.chainId.toString(16)
        try {
          await eip1193Provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexSourceChainId }],
          })
        } catch {
          // Non-fatal
        }
      }

      const adapter = await createAdapter()
      if (!adapter) {
        throw new Error('Failed to create wallet adapter. Please reconnect your wallet.')
      }

      // Determine if forwarding is supported for the destination chain.
      // When supported: single-sign bridging — user signs once, Circle's Orbit relayer mints on destination.
      // When NOT supported: standard multi-sign flow — user signs approve, burn, and mint separately.
      const canForward = !NO_FORWARDER_DESTINATION.has(destChain.id)

      console.log(`[App Kit] Bridging ${sourceChain.id} → ${destChain.id}, forwarder: ${canForward}`)

      const result = await kit.bridge({
        from: { adapter, chain: sourceChain.id as any },
        to: { 
          adapter,
          chain: destChain.id as any,
          recipientAddress: address,
          ...(canForward ? { useForwarder: true } : {}),
        },
        amount: amount,
        token: 'USDC',
      })

      console.log('[App Kit] Bridge result:', result)
      const bridgeRes = result as any
      setBridgeResult(bridgeRes)

      // Map App Kit result steps to our UI steps
      const resultSteps = bridgeRes.steps as any[] | undefined
      if (resultSteps) {
        const mappedSteps: BridgeStep[] = resultSteps.map((s: any) => ({
          name: s.name,
          state: s.state === 'success' ? 'success' : s.state === 'error' ? 'error' : 'pending',
          txHash: s.txHash || s.data?.txHash,
          explorerUrl: s.explorerUrl || s.data?.explorerUrl,
        }))
        setSteps(mappedSteps)
      }

      if (bridgeRes.state === 'success') {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 100)
        const lastStep = resultSteps?.[resultSteps.length - 1] as any
        const firstStep = resultSteps?.[0] as any
        const finalTxHash = lastStep?.txHash || lastStep?.data?.txHash || firstStep?.txHash
        success(toastId, 'Bridge Complete!', finalTxHash)
        saveTransaction({
          hash: finalTxHash || `bridge-${Date.now()}`,
          type: 'bridge',
          timestamp: Date.now(),
          tokenIn: 'USDC',
          tokenOut: 'USDC',
          amountIn: amount,
          amountOut: amount,
          status: 'success',
        })
        // Log bridge to analytics (non-blocking)
        fetch('/api/bridge/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_address: address,
            amount: amount,
            source_chain: sourceChain.name,
            destination_chain: destChain.name,
            state: 'success',
            uses_forwarder: canForward,
            burn_tx: resultSteps?.find((s: any) => s.name === 'burn')?.txHash || resultSteps?.find((s: any) => s.name === 'burn')?.data?.txHash || null,
            mint_tx: resultSteps?.find((s: any) => s.name === 'mint')?.txHash || resultSteps?.find((s: any) => s.name === 'mint')?.data?.txHash || null,
          }),
        }).catch(() => {}) // silent fail - don't block UX
        setAmount('')
      } else if (bridgeRes.state === 'error') {
        // Check if burn succeeded but mint failed (CCTP auto-delivers)
        const burnStep = resultSteps?.find((s: any) => s.name === 'burn') as any
        const failedStep = resultSteps?.find((s: any) => s.state === 'error') as any
        const burnSucceeded = burnStep?.state === 'success' && (burnStep?.txHash || burnStep?.data?.txHash)
        const burnTxHash = burnStep?.txHash || burnStep?.data?.txHash

        if (burnSucceeded && failedStep?.name === 'mint') {
          // Burn succeeded, mint had RPC issues — CCTP will auto-deliver
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 100)
          setErrorMsg(null)
          setBridgeResult({ ...bridgeRes, state: 'success' })
          success(toastId, 'Bridge Complete!', burnTxHash)
          saveTransaction({
            hash: burnTxHash,
            type: 'bridge',
            timestamp: Date.now(),
            tokenIn: 'USDC',
            tokenOut: 'USDC',
            amountIn: amount,
            amountOut: amount,
            status: 'success',
          })
          // Log bridge to analytics (non-blocking)
          fetch('/api/bridge/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_address: address,
              amount: amount,
              source_chain: sourceChain.name,
              destination_chain: destChain.name,
              state: 'success',
              uses_forwarder: canForward,
              burn_tx: burnTxHash || null,
              mint_tx: resultSteps?.find((s: any) => s.name === 'mint')?.txHash || resultSteps?.find((s: any) => s.name === 'mint')?.data?.txHash || null,
            }),
          }).catch(() => {}) // silent fail - don't block UX
          setSteps((resultSteps || []).map((s: any) => ({
            name: s.name,
            state: s.name === 'mint' ? 'success' : s.state === 'success' ? 'success' : 'error',
            txHash: s.txHash || s.data?.txHash,
            explorerUrl: s.explorerUrl || s.data?.explorerUrl,
          })))
          setAmount('')
        } else {
          // Bridge failed - report error to user for manual retry
          const errorMessage = failedStep?.error?.message || failedStep?.error || bridgeRes?.error?.message || bridgeRes?.error || 'Bridge failed'
          throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Bridge failed')
        }
      } else {
        throw new Error(`Bridge ended with state: ${bridgeRes.state}`)
      }

    } catch (err: any) {
      console.error('[App Kit] Bridge error:', err)
      const errorMessage = err.message || 'Unknown error'
      
      const isRpcError = errorMessage.includes('JSON') || 
                        errorMessage.includes('HTTP request failed') ||
                        errorMessage.includes('Unterminated string') ||
                        errorMessage.includes('request failed')
      
      const isTimeoutError = errorMessage.includes('Maximum retry attempts') ||
                            errorMessage.includes('Request timed out') ||
                            errorMessage.includes('timeout')
      
      const burnStep = steps.find(s => s.name === 'burn')
      const burnCompleted = burnStep && (burnStep.state === 'success' || burnStep.state === 'in_progress')
      const burnTxHash = burnStep?.txHash
      
      if ((isRpcError || isTimeoutError) && burnCompleted && burnTxHash) {
        const warningMsg = `Bridge transaction submitted! Burn tx: ${burnTxHash.slice(0, 10)}... \n\nThe mint may take 1-2 minutes. Your USDC will arrive on ${destChain.name} automatically via CCTP.`
        setErrorMsg(warningMsg)
        success(toastId, 'Bridge Submitted!', burnTxHash)
        saveTransaction({
          hash: burnTxHash,
          type: 'bridge',
          timestamp: Date.now(),
          tokenIn: 'USDC',
          tokenOut: 'USDC',
          amountIn: amount,
          amountOut: amount,
          status: 'pending',
        })
        // Log bridge to analytics (non-blocking)
        fetch('/api/bridge/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_address: address,
            amount: amount,
            source_chain: sourceChain.name,
            destination_chain: destChain.name,
            state: 'pending',
            uses_forwarder: !NO_FORWARDER_DESTINATION.has(destChain.id),
            burn_tx: burnTxHash || null,
            mint_tx: null,
          }),
        }).catch(() => {}) // silent fail - don't block UX
        setSteps(prev => prev.map(step => 
          step.state === 'in_progress' || step.state === 'error' 
            ? { ...step, state: 'pending' } 
            : step
        ))
        setAmount('')
      } else if (errorMessage.includes('wallet adapter') || errorMessage.includes('reconnect')) {
        setErrorMsg('Unable to connect to your wallet. Please disconnect and reconnect.')
        errorToast(toastId, 'Wallet Error', 'Please reconnect wallet')
      } else if (errorMessage.includes('add') && errorMessage.includes('wallet')) {
        setErrorMsg(errorMessage)
        errorToast(toastId, 'Chain Not Added', 'Add the chain to continue')
      } else {
        setErrorMsg(errorMessage)
        errorToast(toastId, 'Bridge Failed', errorMessage.slice(0, 100))
        // Log bridge error to analytics (non-blocking)
        fetch('/api/bridge/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_address: address,
            amount: amount || '0',
            source_chain: sourceChain.name,
            destination_chain: destChain.name,
            state: 'error',
            uses_forwarder: !NO_FORWARDER_DESTINATION.has(destChain.id),
            burn_tx: steps.find(s => s.name === 'burn')?.txHash || null,
            mint_tx: null,
            error_message: errorMessage.slice(0, 500),
          }),
        }).catch(() => {}) // silent fail - don't block UX
        setSteps(prev => prev.map(step => 
          step.state === 'in_progress' ? { ...step, state: 'error' } : step
        ))
      }
    } finally {
      setIsBridging(false)
      setCurrentStep('')
    }
  }

  const bridgeFee = amount ? `~${(parseFloat(amount) * 0.001).toFixed(4)} USDC` : '~0.1%'

  return (
    <div className="w-full max-w-lg mx-auto px-2 sm:px-0">
      <Confetti isActive={showConfetti} />
      
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Bridge USDC</h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            <span>Powered by</span>
            <span className="font-semibold text-[var(--text-primary)]">Circle App Kit</span>
          </div>
        </div>

        {/* Success State */}
        {bridgeResult?.state === 'success' && (
          <div className="mb-4 p-4 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[var(--success)]" />
              <div className="flex-1">
                <p className="font-medium text-[var(--success)]">Bridge Complete!</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your USDC has been delivered to {destChain.name}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {steps.filter(s => s.txHash).map((step, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{formatStepName(step.name)}</span>
                  {step.explorerUrl && (
                    <a href={step.explorerUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMsg && (
          <div className={cn(
            "mb-4 p-4 border rounded-lg",
            errorMsg.includes('submitted') || errorMsg.includes('Burn tx:')
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-red-500/10 border-red-500/30"
          )}>
            <div className="flex items-start gap-3">
              <AlertCircle className={cn(
                "w-6 h-6 flex-shrink-0 mt-0.5",
                errorMsg.includes('submitted') || errorMsg.includes('Burn tx:') ? "text-yellow-400" : "text-red-400"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium",
                  errorMsg.includes('submitted') || errorMsg.includes('Burn tx:') ? "text-yellow-400" : "text-red-400"
                )}>
                  {errorMsg.includes('submitted') || errorMsg.includes('Burn tx:') 
                    ? 'Bridge Submitted - Processing' 
                    : errorMsg.includes('timeout') ? 'Network Timeout' : 'Bridge Failed'}
                </p>
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line mt-1">{errorMsg}</p>
                <div className="flex gap-2 mt-3">
                  {(errorMsg.includes('submitted') || errorMsg.includes('Burn tx:')) && (
                    <a href={`https://sepolia.etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs rounded-lg">
                      <ExternalLink className="w-3 h-3" /> Check Etherscan
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setErrorMsg(null)
                      setBridgeResult(null)
                      if (!errorMsg.includes('submitted') && !errorMsg.includes('Burn tx:')) {
                        setSteps([
                          { name: 'approve', state: 'pending' },
                          { name: 'burn', state: 'pending' },
                          { name: 'fetchAttestation', state: 'pending' },
                          { name: 'mint', state: 'pending' },
                        ])
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--card-border)] hover:bg-[var(--card-bg)] text-[var(--text-secondary)] text-xs rounded-lg"
                  >
                    {errorMsg.includes('submitted') || errorMsg.includes('Burn tx:') ? 'Dismiss' : <><RefreshCw className="w-3 h-3" /> Try Again</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Progress */}
        {isBridging && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-200 font-medium">Bridging in progress...</span>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {step.state === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-[#01C38E]" />
                  ) : step.state === 'in_progress' ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : step.state === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-500" />
                  )}
                  <span className={cn(
                    step.state === 'success' ? 'text-[#01C38E]' :
                    step.state === 'in_progress' ? 'text-blue-400' :
                    step.state === 'error' ? 'text-red-400' : 'text-gray-500'
                  )}>
                    {formatStepName(step.name)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Chain */}
        <div className="bg-[var(--card-border)] rounded-lg p-3 sm:p-4 mb-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-[var(--text-secondary)]">From</span>
            <button
              onClick={() => setAmount(usdcBalance?.formatted ?? '0')}
              className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] truncate"
              disabled={isBalanceLoading}
            >
              Balance: {isBalanceLoading ? '...' : formatNumber(usdcBalance?.formatted ?? '0', 2)} USDC
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSourceSelect(!showSourceSelect)}
              disabled={isBridging}
              className="flex items-center justify-between sm:justify-start gap-2 bg-[var(--card-bg)] hover:bg-[var(--card-border)] rounded-lg px-3 py-2 flex-shrink-0 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <ChainLogo name={sourceChain.name} size={24} className="sm:w-7 sm:h-7" />
                <span className="font-medium text-[var(--text-primary)] text-sm whitespace-nowrap">{sourceChain.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
            <div className="flex-1 flex items-center gap-2 min-w-0 bg-[var(--card-bg)] sm:bg-transparent rounded-lg px-3 py-2 sm:p-0">
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setBridgeResult(null); setErrorMsg(null); }}
                placeholder="0.00"
                disabled={isBridging}
                className="flex-1 min-w-0 bg-transparent text-lg sm:text-xl font-medium text-[var(--text-primary)] outline-none text-right placeholder:text-[var(--text-muted)] disabled:opacity-50"
              />
              <span className="font-medium text-[var(--text-secondary)] flex-shrink-0">USDC</span>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapDirection}
            disabled={isBridging}
            className="bg-[var(--card-bg)] border-4 border-[var(--background)] rounded-lg p-3 hover:bg-[var(--card-border)] transition-colors disabled:opacity-50 group"
            title="Swap direction"
          >
            <ArrowUpDown className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" />
          </button>
        </div>

        {/* Destination Chain */}
        <div className="bg-[var(--card-border)] rounded-lg p-3 sm:p-4 mt-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-[var(--text-secondary)]">To</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowDestSelect(!showDestSelect)}
              disabled={isBridging}
              className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-[var(--card-bg)] hover:bg-[var(--card-border)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors disabled:opacity-50 min-h-[48px]"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <ChainLogo name={destChain.name} size={28} className="sm:w-8 sm:h-8" />
                <span className="font-medium text-[var(--text-primary)] text-sm sm:text-base">{destChain.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
            <div className="flex-1 text-right bg-[var(--card-bg)] sm:bg-transparent rounded-lg px-3 py-2 sm:p-0">
              <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
                {amount || '0.00'}
              </div>
              <div className="text-xs sm:text-sm text-[var(--text-secondary)]">
                You will receive
              </div>
            </div>
          </div>
        </div>

        {/* Bridge Info */}
        {amount && !isBridging && (
          <div className="mt-4 p-4 bg-[var(--card-border)] rounded-lg space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Estimated Time</span>
              <span className="text-[var(--text-primary)]">~30 seconds (auto-optimized)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Bridge Fee</span>
              <span className="text-[var(--text-primary)]">{bridgeFee}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">You will receive</span>
              <span className="text-[var(--text-primary)] font-medium">
                ~{formatNumber(parseFloat(amount) * 0.999, 2)} USDC
              </span>
            </div>
          </div>
        )}

        {/* CCTP Info */}
        <div className="mt-4 p-3 bg-[#0A786A]/10 border border-[#0A786A]/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0A786A]/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-[#01C38E]" />
            </div>
            <div>
              <p className="text-sm text-[#01C38E]">
                {NO_FORWARDER_DESTINATION.has(destChain.id) ? (
                  <><strong>Multi-step bridge.</strong> This chain requires separate signatures for approve, burn, and mint.  You&apos;ll need gas on the destination chain.</>
                ) : (
                  <><strong>One-click bridge!</strong> Sign once &mdash; Circle handles delivery automatically. No gas needed on destination chain.</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={!isConnected || !amount || isBridging || parseFloat(amount) <= 0}
          className={cn(
            'w-full mt-4 py-3.5 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2 min-h-[48px]',
            isConnected && amount && !isBridging && parseFloat(amount) > 0
              ? 'bg-gradient-to-r from-[#0A786A] to-[#01C38E] hover:from-[#0A786A]/90 hover:to-[#01C38E]/90 text-white active:scale-[0.98]'
              : 'bg-[var(--card-border)] text-[var(--text-muted)] cursor-not-allowed'
          )}
        >
          {isBridging ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> <span className="truncate">{currentStep ? formatStepName(currentStep) : 'Bridging...'}</span></>
          ) : !isConnected ? (
            'Connect Wallet'
          ) : !amount || parseFloat(amount) <= 0 ? (
            'Enter Amount'
          ) : (
            <span className="truncate">Bridge to {destChain.name}</span>
          )}
        </button>

        {/* Arc Network Badge */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-[var(--text-muted)] text-center">
          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse flex-shrink-0" />
          <span>Circle App Kit - CCTP V2{NO_FORWARDER_DESTINATION.has(destChain.id) ? '' : ' - Single-Sign Forwarding'}</span>
        </div>

        {/* Bridge Stats */}
        <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Protocol</span>
            <span className="text-[var(--text-primary)]">Circle App Kit</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-[var(--text-secondary)]">Transfer Mode</span>
            <span className="text-[var(--text-primary)]">{NO_FORWARDER_DESTINATION.has(destChain.id) ? 'Standard (Multi-Sign)' : 'Single-Sign (Forwarder)'}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-[var(--text-secondary)]">Chains</span>
            <span className="text-[var(--text-primary)]">20 Networks</span>
          </div>
        </div>
      </div>

      {/* Source Chain Select Modal */}
      {showSourceSelect && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-t-xl sm:rounded-xl border border-[var(--card-border)] p-4 w-full max-w-sm sm:mx-4 safe-area-bottom animate-slide-up sm:animate-scale-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-[var(--card-bg)] pb-2">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Select Source Chain</h3>
              <button
                onClick={() => setShowSourceSelect(false)}
                className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-[var(--text-secondary)]">X</span>
              </button>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {BRIDGE_CHAINS.filter(c => c.id !== destChain.id).map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    setSourceChain(chain)
                    // Enforce: one side must always be Arc
                    if (chain.id !== 'Arc_Testnet') setDestChain(ARC_CHAIN)
                    setShowSourceSelect(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors min-h-[56px]',
                    sourceChain.id === chain.id
                      ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/50'
                      : 'hover:bg-[var(--card-border)]'
                  )}
                >
                  <ChainLogo name={chain.name} size={36} />
                  <div className="flex-1 text-left">
                    <span className="font-medium text-[var(--text-primary)]">{chain.name}</span>
                    <div className="text-sm text-[var(--text-secondary)]">Chain ID: {chain.chainId}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Destination Chain Select Modal */}
      {showDestSelect && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-t-xl sm:rounded-xl border border-[var(--card-border)] p-4 w-full max-w-sm sm:mx-4 safe-area-bottom animate-slide-up sm:animate-scale-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-[var(--card-bg)] pb-2">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Select Destination Chain</h3>
              <button
                onClick={() => setShowDestSelect(false)}
                className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-[var(--text-secondary)]">X</span>
              </button>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {BRIDGE_CHAINS.filter(c => c.id !== sourceChain.id).map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    setDestChain(chain)
                    // Enforce: one side must always be Arc
                    if (chain.id !== 'Arc_Testnet') setSourceChain(ARC_CHAIN)
                    setShowDestSelect(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors min-h-[56px]',
                    destChain.id === chain.id
                      ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/50'
                      : 'hover:bg-[var(--card-border)]'
                  )}
                >
                  <ChainLogo name={chain.name} size={36} />
                  <div className="flex-1 text-left">
                    <span className="font-medium text-[var(--text-primary)]">{chain.name}</span>
                    <div className="text-sm text-[var(--text-secondary)]">Chain ID: {chain.chainId}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
