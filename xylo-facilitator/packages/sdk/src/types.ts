import type { Account, WalletClient, PublicClient } from 'viem';

export interface XyloConfig {
  /** XyloFacilitator backend URL (default: https://api.xylonet.xyz) */
  facilitatorUrl?: string;
  /** Agent's viem Account (privateKeyToAccount) */
  account: Account;
  /** Optional: auto-fund via testnet faucet if balance < threshold */
  autoFund?: boolean;
  /** Optional: minimum balance before triggering auto-fund (default: 1 USDC = 1_000_000) */
  autoFundThreshold?: bigint;
  /** Optional: max retries on 402 (default: 1) */
  maxRetries?: number;
}

export interface X402Acceptance {
  paymentType: string;
  scheme: string;
  network: string;
  asset: string;
  amount: string;
  recipient: string;
  developer?: string;
  description?: string;
}

export interface X402Response {
  error: string;
  x402Version: string;
  acceptances: X402Acceptance[];
}

export interface PaymentResult {
  txHash: string;
  amount: string;
  from: string;
  to: string;
  blockNumber: number;
}

export interface FaucetResult {
  success: boolean;
  txHash: string;
  amount: string;
  asset: string;
  network: string;
  recipient: string;
  blockNumber: number;
}

export interface XyloFetchOptions extends RequestInit {
  /** Skip x402 payment handling for this request */
  skipPayment?: boolean;
}
