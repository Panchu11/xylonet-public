import type { FaucetResult } from './types';
import { DEFAULT_FACILITATOR_URL } from './constants';

/**
 * Request testnet USDC from the XyloFacilitator faucet.
 * One-time per address, 10 USDC.
 */
export async function requestFaucet(
  address: string,
  facilitatorUrl?: string
): Promise<FaucetResult> {
  const baseUrl = facilitatorUrl || DEFAULT_FACILITATOR_URL;
  const response = await fetch(`${baseUrl}/v1/agent/faucet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });

  const data: any = await response.json();

  if (!response.ok) {
    // 409 means already funded - not really an error
    if (response.status === 409) {
      return {
        success: true,
        txHash: data.txHash,
        amount: data.amount || '10.000000',
        asset: 'USDC',
        network: 'Arc Testnet',
        recipient: address,
        blockNumber: 0,
      };
    }
    throw new Error(data.error || `Faucet request failed: ${response.status}`);
  }

  return data as FaucetResult;
}

/**
 * Check if an address has already been funded.
 */
export async function checkFaucetStatus(
  address: string,
  facilitatorUrl?: string
): Promise<{ funded: boolean; txHash?: string }> {
  const baseUrl = facilitatorUrl || DEFAULT_FACILITATOR_URL;
  const response = await fetch(`${baseUrl}/v1/agent/faucet/status/${address}`);
  const data: any = await response.json();
  return { funded: data.funded, txHash: data.txHash };
}
