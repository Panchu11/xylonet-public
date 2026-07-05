// @xylofacilitator/sdk - AI Agent SDK for x402 payments on Arc
export { XyloClient, createXyloClient } from './client';
export { signTransferAuthorization } from './signer';
export { requestFaucet, checkFaucetStatus } from './faucet';
export {
  ARC_CHAIN_ID,
  USDC_ADDRESS,
  DEFAULT_FACILITATOR_URL,
  EIP712_DOMAIN,
  TRANSFER_WITH_AUTHORIZATION_TYPES,
} from './constants';
export type {
  XyloConfig,
  X402Acceptance,
  X402Response,
  PaymentResult,
  FaucetResult,
  XyloFetchOptions,
} from './types';
