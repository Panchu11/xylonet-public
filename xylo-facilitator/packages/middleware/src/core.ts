import type { PaywallConfig, X402Payment, SettlementResult, PaymentRequiredResponse } from './types';
import { DEFAULT_FACILITATOR_URL, ARC_CHAIN_ID, USDC_ADDRESS, FACILITATOR_CONTRACT } from './constants';

/**
 * Parse x402 payment from request header.
 * Accepts both "X-Payment: x402 <base64>" and "Authorization: x402 <base64>".
 */
export function parsePaymentHeader(headerValue: string | null | undefined): X402Payment | null {
  if (!headerValue || !headerValue.startsWith('x402 ')) {
    return null;
  }

  try {
    const payload = headerValue.slice(5);
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return {
      from: decoded.from,
      to: decoded.to,
      value: decoded.value,
      validAfter: decoded.validAfter,
      validBefore: decoded.validBefore,
      nonce: decoded.nonce,
      v: decoded.v,
      r: decoded.r,
      s: decoded.s,
    };
  } catch {
    return null;
  }
}

/**
 * Build the 402 Payment Required response body.
 */
export function buildPaymentRequired(config: PaywallConfig): PaymentRequiredResponse {
  const priceInUnits = Math.floor(config.priceUsd * 1e6);
  return {
    error: 'Payment Required',
    x402Version: '1',
    acceptances: [{
      paymentType: 'x402-eip3009',
      scheme: 'https',
      network: config.network || ARC_CHAIN_ID,
      asset: USDC_ADDRESS,
      amount: String(priceInUnits),
      recipient: FACILITATOR_CONTRACT,
      description: config.description || `API access: $${config.priceUsd} USDC`,
    }],
  };
}

/**
 * Delegate settlement to the XyloFacilitator backend.
 * The backend settles on-chain and returns the tx hash.
 */
export async function settlePayment(
  payment: X402Payment,
  config: PaywallConfig
): Promise<SettlementResult> {
  const baseUrl = (config.facilitatorUrl || DEFAULT_FACILITATOR_URL).replace(/\/$/, '');

  const response = await fetch(`${baseUrl}/v1/facilitator/settle-for-developer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify({
      from: payment.from,
      to: payment.to,
      value: payment.value,
      validAfter: payment.validAfter,
      validBefore: payment.validBefore,
      nonce: payment.nonce,
      v: payment.v,
      r: payment.r,
      s: payment.s,
    }),
  });

  const data: any = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Settlement failed: ${response.status}`);
  }

  return data as SettlementResult;
}

/**
 * Validate that the payment amount meets the price requirement.
 */
export function validatePaymentAmount(payment: X402Payment, priceUsd: number): boolean {
  const requiredUnits = BigInt(Math.floor(priceUsd * 1e6));
  return BigInt(payment.value) >= requiredUnits;
}

/**
 * Validate that the payment is directed to the facilitator contract.
 */
export function validatePaymentRecipient(payment: X402Payment): boolean {
  return payment.to.toLowerCase() === FACILITATOR_CONTRACT.toLowerCase();
}
