/**
 * Transaction utility with nonce management and retry logic.
 * 
 * Handles Arc v0.7.2's invalid-tx-list behavior where pending
 * transactions can be evicted from mempool after payload-builder panics.
 * Also provides dynamic gas pricing with 1.2x multiplier and 160 Gwei floor.
 */

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const MIN_GAS_PRICE = 160000000000n; // 160 Gwei floor

/**
 * Get dynamic gas price with 1.2x multiplier and minimum floor.
 * @param {object} publicClient - viem public client
 * @returns {Promise<bigint>} gas price in wei
 */
async function getDynamicGasPrice(publicClient) {
  try {
    const currentGasPrice = await publicClient.getGasPrice();
    let gasPrice = currentGasPrice * 12n / 10n; // 1.2x multiplier
    if (gasPrice < MIN_GAS_PRICE) gasPrice = MIN_GAS_PRICE;
    return gasPrice;
  } catch (err) {
    console.warn('[gas] Failed to fetch gas price, using fallback:', err.message);
    return MIN_GAS_PRICE;
  }
}

/**
 * Send a contract write transaction with nonce retry logic.
 * Automatically fetches fresh nonce and dynamic gas price on each attempt.
 * Retries on nonce errors and tx eviction (common on Arc v0.7.2).
 *
 * @param {object} walletClient - viem wallet client
 * @param {object} publicClient - viem public client
 * @param {object} txParams - Transaction parameters (address, abi, functionName, args, etc.)
 * @param {object} [options] - Options
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.timeout=30000] - Receipt wait timeout in ms
 * @returns {Promise<{hash: string, receipt: object}>}
 */
async function sendTransactionWithRetry(walletClient, publicClient, txParams, options = {}) {
  const maxRetries = options.maxRetries || MAX_RETRIES;
  const timeout = options.timeout || 30_000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Always get fresh nonce from chain state
      const nonce = await publicClient.getTransactionCount({
        address: walletClient.account.address,
        blockTag: 'pending'
      });

      // Get dynamic gas price
      const gasPrice = await getDynamicGasPrice(publicClient);

      const hash = await walletClient.writeContract({
        ...txParams,
        nonce,
        gasPrice,
      });

      // Wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout
      });

      return { hash, receipt };
    } catch (err) {
      const msg = err.message || '';
      const isNonceError = msg.includes('nonce') ||
                           msg.includes('replacement') ||
                           msg.includes('already known');
      const isEvicted = msg.includes('not found') ||
                        msg.includes('removed');

      if ((isNonceError || isEvicted) && attempt < maxRetries - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[tx-retry] Attempt ${attempt + 1} failed (${msg}), retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

module.exports = { sendTransactionWithRetry, getDynamicGasPrice, MIN_GAS_PRICE };
