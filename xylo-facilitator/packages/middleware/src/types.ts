/** Configuration for the x402 payment middleware */
export interface PaywallConfig {
  /** Developer's XyloFacilitator API key */
  apiKey: string;
  /** Price in USD for this endpoint (e.g., 0.01 for 1 cent) */
  priceUsd: number;
  /** XyloFacilitator backend URL (default: https://api.xylonet.xyz) */
  facilitatorUrl?: string;
  /** Optional description shown to agents */
  description?: string;
  /** Network chain ID (default: 5042002 for Arc Testnet) */
  network?: string;
}

/** Parsed x402 payment from request header */
export interface X402Payment {
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
  v: number;
  r: string;
  s: string;
}

/** Settlement result from the facilitator */
export interface SettlementResult {
  success: boolean;
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  amount: number;
  amountUSD: string;
  feeUSD: string;
}

/** The 402 response body sent to agents */
export interface PaymentRequiredResponse {
  error: string;
  x402Version: string;
  acceptances: Array<{
    paymentType: string;
    scheme: string;
    network: string;
    asset: string;
    amount: string;
    recipient: string;
    description?: string;
  }>;
}
