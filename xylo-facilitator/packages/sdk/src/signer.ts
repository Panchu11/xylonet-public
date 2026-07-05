import type { Account } from 'viem';
import { EIP712_DOMAIN, TRANSFER_WITH_AUTHORIZATION_TYPES } from './constants';

/**
 * Sign an EIP-3009 TransferWithAuthorization for USDC on Arc.
 * Returns the signature components (v, r, s) and the typed data params.
 */
export async function signTransferAuthorization(
  account: Account,
  params: {
    to: string;
    value: bigint;
    validAfter?: bigint;
    validBefore?: bigint;
    nonce?: `0x${string}`;
  }
) {
  const from = account.address;
  const validAfter = params.validAfter ?? 0n;
  const validBefore = params.validBefore ?? BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour
  const nonce = params.nonce ?? generateNonce();

  const message = {
    from,
    to: params.to as `0x${string}`,
    value: params.value,
    validAfter,
    validBefore,
    nonce,
  };

  // Use account's signTypedData
  if (!account.signTypedData) {
    throw new Error('Account must support signTypedData (use privateKeyToAccount from viem/accounts)');
  }

  const signature = await account.signTypedData({
    domain: EIP712_DOMAIN,
    types: TRANSFER_WITH_AUTHORIZATION_TYPES,
    primaryType: 'TransferWithAuthorization',
    message,
  });

  // Split signature into v, r, s
  const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
  const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
  const v = parseInt(signature.slice(130, 132), 16);

  return {
    from,
    to: params.to,
    value: params.value.toString(),
    validAfter: validAfter.toString(),
    validBefore: validBefore.toString(),
    nonce,
    v,
    r,
    s,
  };
}

/** Generate a random bytes32 nonce */
function generateNonce(): `0x${string}` {
  const bytes = new Uint8Array(32);
  if (typeof globalThis.crypto !== 'undefined') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Node.js fallback
    const { randomBytes } = require('crypto');
    const buf = randomBytes(32);
    bytes.set(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
  }
  return `0x${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}
