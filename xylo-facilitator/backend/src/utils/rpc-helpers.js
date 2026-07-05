/**
 * RPC batch request helper with automatic chunking.
 * 
 * Handles Arc v0.7.2's 100-entry batch request cap (error -32600).
 * Automatically splits large multicall batches into safe-sized chunks
 * and retries with smaller chunks if the cap is still hit.
 */

const BATCH_CHUNK_SIZE = 90; // Leave buffer below 100 cap

/**
 * Execute a multicall with automatic chunking for large batches.
 * If the batch exceeds the chunk size, it's split into smaller pieces.
 * On -32600 errors (batch cap), retries with halved chunk size.
 *
 * @param {object} publicClient - viem public client
 * @param {Array} calls - Array of contract call objects for multicall
 * @param {object} [options] - Options
 * @param {number} [options.chunkSize=90] - Max calls per batch (default 90, cap is 100)
 * @returns {Promise<Array>} Combined results from all chunks
 */
async function batchMulticall(publicClient, calls, options = {}) {
  const chunkSize = options.chunkSize || BATCH_CHUNK_SIZE;

  if (calls.length <= chunkSize) {
    return await publicClient.multicall({ contracts: calls });
  }

  // Chunk large batches
  const results = [];
  for (let i = 0; i < calls.length; i += chunkSize) {
    const chunk = calls.slice(i, i + chunkSize);
    try {
      const chunkResults = await publicClient.multicall({ contracts: chunk });
      results.push(...chunkResults);
    } catch (err) {
      if (err.code === -32600 || err.message?.includes('-32600')) {
        // Further reduce chunk size and retry
        const smallerChunk = Math.floor(chunkSize / 2);
        console.warn(`[rpc] Batch cap hit, retrying with chunk size ${smallerChunk}`);
        for (let j = 0; j < chunk.length; j += smallerChunk) {
          const subChunk = chunk.slice(j, j + smallerChunk);
          const subResults = await publicClient.multicall({ contracts: subChunk });
          results.push(...subResults);
        }
      } else {
        throw err;
      }
    }
  }
  return results;
}

module.exports = { batchMulticall, BATCH_CHUNK_SIZE };
