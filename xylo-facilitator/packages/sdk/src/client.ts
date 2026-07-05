import type { Account } from 'viem';
import type { XyloConfig, X402Response, XyloFetchOptions } from './types';
import { signTransferAuthorization } from './signer';
import { requestFaucet, checkFaucetStatus } from './faucet';
import { DEFAULT_FACILITATOR_URL, DEFAULT_AUTO_FUND_THRESHOLD, USDC_ADDRESS } from './constants';

/**
 * XyloFacilitator SDK Client.
 * Wraps fetch() to auto-handle HTTP 402 payments via x402/EIP-3009.
 *
 * Usage:
 * ```ts
 * import { createXyloClient } from '@xylofacilitator/sdk';
 * import { privateKeyToAccount } from 'viem/accounts';
 *
 * const client = createXyloClient({
 *   account: privateKeyToAccount('0x...'),
 *   autoFund: true, // auto-request testnet USDC
 * });
 *
 * const response = await client.fetch('https://api.xylonet.xyz/v1/proxy/weather-api');
 * const data = await response.json();
 * ```
 */
export class XyloClient {
  private account: Account;
  private facilitatorUrl: string;
  private autoFund: boolean;
  private autoFundThreshold: bigint;
  private maxRetries: number;
  private funded: boolean = false;

  constructor(config: XyloConfig) {
    this.account = config.account;
    this.facilitatorUrl = (config.facilitatorUrl || DEFAULT_FACILITATOR_URL).replace(/\/$/, '');
    this.autoFund = config.autoFund ?? false;
    this.autoFundThreshold = config.autoFundThreshold ?? DEFAULT_AUTO_FUND_THRESHOLD;
    this.maxRetries = config.maxRetries ?? 1;
  }

  /** The agent's wallet address */
  get address(): string {
    return this.account.address;
  }

  /**
   * Fetch with automatic x402 payment handling.
   * If the server returns 402, the SDK signs an EIP-3009 authorization
   * and retries with the payment header.
   */
  async fetch(url: string | URL, options?: XyloFetchOptions): Promise<Response> {
    const urlStr = url.toString();
    const fetchOpts: RequestInit = { ...options };

    // Remove our custom options from fetch
    if (options?.skipPayment) {
      return globalThis.fetch(urlStr, fetchOpts);
    }

    // Auto-fund on first request if enabled
    if (this.autoFund && !this.funded) {
      await this.ensureFunded();
    }

    // Make initial request
    const response = await globalThis.fetch(urlStr, fetchOpts);

    // If not 402, return as-is
    if (response.status !== 402) {
      return response;
    }

    // Parse 402 response
    const paymentRequired = await response.json() as X402Response;

    if (!paymentRequired.acceptances || paymentRequired.acceptances.length === 0) {
      throw new Error('Server returned 402 but no payment acceptances');
    }

    // Find an EIP-3009 acceptance we can handle
    const acceptance = paymentRequired.acceptances.find(
      a => a.paymentType === 'x402-eip3009'
    );

    if (!acceptance) {
      throw new Error(
        `No supported payment type. Server accepts: ${paymentRequired.acceptances.map(a => a.paymentType).join(', ')}`
      );
    }

    // Sign EIP-3009 transfer authorization
    const authorization = await signTransferAuthorization(this.account, {
      to: acceptance.recipient,
      value: BigInt(acceptance.amount),
    });

    // Encode as x402 payment header
    const paymentPayload = Buffer.from(JSON.stringify(authorization)).toString('base64');

    // Retry with payment header
    const paidHeaders = new Headers(fetchOpts.headers || {});
    paidHeaders.set('X-Payment', `x402 ${paymentPayload}`);

    const paidResponse = await globalThis.fetch(urlStr, {
      ...fetchOpts,
      headers: paidHeaders,
    });

    return paidResponse;
  }

  /**
   * Ensure the agent has funds. Calls the testnet faucet if needed.
   */
  private async ensureFunded(): Promise<void> {
    try {
      const status = await checkFaucetStatus(this.account.address, this.facilitatorUrl);
      if (status.funded) {
        this.funded = true;
        return;
      }
      await requestFaucet(this.account.address, this.facilitatorUrl);
      this.funded = true;
    } catch {
      // Non-fatal: agent may already have USDC from another source.
      // Do NOT set this.funded = true here — leave it false so the SDK
      // retries funding on the next request instead of silently skipping.
    }
  }

  /**
   * Manually request testnet USDC from the faucet.
   */
  async requestFunds() {
    return requestFaucet(this.account.address, this.facilitatorUrl);
  }

  /**
   * Check faucet status for this agent.
   */
  async checkFundingStatus() {
    return checkFaucetStatus(this.account.address, this.facilitatorUrl);
  }
}

/**
 * Create a new XyloFacilitator client for an AI agent.
 */
export function createXyloClient(config: XyloConfig): XyloClient {
  return new XyloClient(config);
}
