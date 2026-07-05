/**
 * RPC Error Handler for Arc Network v0.7.2 compatibility
 * 
 * Handles new error codes:
 * - -32600: Batch request exceeds 100-entry cap
 * - Gas cap errors from lowered 30M limit
 */

export const ARC_RPC_ERRORS = {
  BATCH_CAP_EXCEEDED: -32600,
  GAS_CAP_EXCEEDED: -32000,
} as const;

export interface RpcError {
  code?: number;
  message?: string;
}

/**
 * Determines if an RPC error is due to the batch request cap
 */
export function isBatchCapError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as RpcError;
  return err.code === ARC_RPC_ERRORS.BATCH_CAP_EXCEEDED ||
    (err.message?.includes('-32600') ?? false) ||
    (err.message?.toLowerCase().includes('batch') && err.message?.toLowerCase().includes('limit') ? true : false);
}

/**
 * Determines if an RPC error is due to gas cap being exceeded
 */
export function isGasCapError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as RpcError;
  return (err.message?.toLowerCase().includes('gas cap') ?? false) ||
    (err.message?.toLowerCase().includes('exceeds block gas limit') ?? false);
}

/**
 * Returns a user-friendly error message for known RPC errors
 */
export function getUserFriendlyRpcError(error: unknown): string {
  if (isBatchCapError(error)) {
    return 'Network request was too large. Please try again — the request will be automatically optimized.';
  }
  if (isGasCapError(error)) {
    return 'Transaction simulation exceeded network gas limits. Please try a smaller operation.';
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'An unexpected network error occurred. Please try again.';
}

/**
 * Chunks an array of contract calls for multicall to stay under the 100-entry batch cap.
 * Returns results in the original order.
 */
export const BATCH_CHUNK_SIZE = 90; // Leave buffer below 100 cap

export async function chunkedMulticall<T>(
  multicallFn: (calls: T[]) => Promise<unknown[]>,
  calls: T[],
  chunkSize: number = BATCH_CHUNK_SIZE
): Promise<unknown[]> {
  if (calls.length <= chunkSize) {
    return multicallFn(calls);
  }

  const results: unknown[] = [];
  for (let i = 0; i < calls.length; i += chunkSize) {
    const chunk = calls.slice(i, i + chunkSize);
    try {
      const chunkResults = await multicallFn(chunk);
      results.push(...chunkResults);
    } catch (err) {
      if (isBatchCapError(err)) {
        // Further reduce chunk size and retry
        const smallerSize = Math.floor(chunkSize / 2);
        console.warn(`[rpc] Batch cap hit at chunk size ${chunkSize}, retrying with ${smallerSize}`);
        for (let j = 0; j < chunk.length; j += smallerSize) {
          const subChunk = chunk.slice(j, j + smallerSize);
          const subResults = await multicallFn(subChunk);
          results.push(...subResults);
        }
      } else {
        throw err;
      }
    }
  }
  return results;
}
