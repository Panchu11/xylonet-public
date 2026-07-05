/** Arc Testnet constants */
export const ARC_CHAIN_ID = 5042002;
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const;
export const DEFAULT_FACILITATOR_URL = 'https://api.xylonet.xyz';
export const DEFAULT_AUTO_FUND_THRESHOLD = 1_000_000n; // 1 USDC

/** EIP-712 domain for USDC on Arc Testnet (EIP-3009) */
export const EIP712_DOMAIN = {
  name: 'USDC',
  version: '2',
  chainId: ARC_CHAIN_ID,
  verifyingContract: USDC_ADDRESS,
} as const;

/** EIP-3009 TransferWithAuthorization types */
export const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;
