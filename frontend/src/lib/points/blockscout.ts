// ============================================
// BLOCKSCOUT REST API CLIENT (V2)
// Fast, indexed blockchain data fetching
// Fixed: Proper PayX TipSent event log decoding
// ============================================

import type {
  SwapEvent,
  VaultEvent,
  PayXTipEvent,
} from './types';

// ============================================
// CONFIGURATION
// ============================================

const BLOCKSCOUT_API_URL = 'https://testnet.arcscan.app/api';
const MAX_RESULTS_PER_PAGE = 1000;
const MAX_PAGES_PER_CONTRACT = 100;
const API_RATE_LIMIT_MS = 100;
const INITIAL_CHUNK_SIZE = 500000;
const MIN_CHUNK_SIZE = 200;

// ============================================
// CONTRACT ADDRESSES (Arc Testnet)
// ============================================

export const CONTRACTS = {
  ROUTER: '0x73742278c31a76dBb0D2587d03ef92E6E2141023',
  USDC_EURC_POOL: '0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1',
  USDC_USYC_POOL: '0x8296cC7477A9CD12cF632042fDDc2aB89151bb61',
  VAULT: '0x240Eb85458CD41361bd8C3773253a1D78054f747',
  TOKEN_MESSENGER: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  USDC: '0x3600000000000000000000000000000000000000',
};

// PayX Contract (from environment)
export const PAYX_CONTRACT = process.env.NEXT_PUBLIC_PAYX_CONTRACT_ADDRESS || '';

// ============================================
// EVENT TOPIC SIGNATURES (keccak256 hashes)
// ============================================

export const EVENT_TOPICS = {
  // Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, address to)
  SWAP: '0x54787c404bb33c88e86f4baf88183a3b0141d0a848e6a9f7a13b66ae3a9b73d1',

  // Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)
  VAULT_DEPOSIT: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',

  // Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)
  VAULT_WITHDRAW: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',

  // TipSent(string indexed handleHash, string handle, address indexed tipper, uint256 amount, uint256 fee, string message, uint256 timestamp)
  PAYX_TIP: '0x531a63334fe69fa9f4697e7cf8d0683d1bef9243a4c7a1046c8f95dede07680f',
};

// ============================================
// API TYPES
// ============================================

interface BlockscoutLogResult {
  address: string;
  blockNumber: string;
  data: string;
  gasPrice: string;
  gasUsed: string;
  logIndex: string;
  timeStamp: string;
  topics: string[];
  transactionHash: string;
  transactionIndex: string;
}

interface BlockscoutApiResponse {
  message: string;
  result: BlockscoutLogResult[];
  status: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function hexToBigInt(hex: string): bigint {
  if (!hex || hex === '0x') return 0n;
  return BigInt(hex);
}

function hexToNumber(hex: string): number {
  if (!hex || hex === '0x') return 0;
  return parseInt(hex, 16);
}

function topicToAddress(topic: string): string {
  if (!topic || topic.length < 42) return '';
  return '0x' + topic.slice(-40).toLowerCase();
}

function parseDataField(data: string): bigint[] {
  if (!data || data === '0x') return [];
  const cleanData = data.startsWith('0x') ? data.slice(2) : data;
  const chunks: bigint[] = [];
  for (let i = 0; i < cleanData.length; i += 64) {
    const chunk = cleanData.slice(i, i + 64);
    if (chunk.length === 64) {
      chunks.push(BigInt('0x' + chunk));
    }
  }
  return chunks;
}

/**
 * Decode a dynamic string from ABI-encoded data at a given byte offset
 */
function decodeDynamicString(data: string, offsetSlot: number): string {
  const cleanData = data.startsWith('0x') ? data.slice(2) : data;
  // The offset slot contains a pointer (byte offset) to the string data
  const pointerHex = cleanData.slice(offsetSlot * 64, (offsetSlot + 1) * 64);
  const pointer = parseInt(pointerHex, 16);
  // Convert byte offset to hex char offset
  const charOffset = (pointer / 32) * 64;
  // Read length
  const lengthHex = cleanData.slice(charOffset, charOffset + 64);
  const length = parseInt(lengthHex, 16);
  if (length === 0 || length > 1000) return '';
  // Read string bytes
  const stringHex = cleanData.slice(charOffset + 64, charOffset + 64 + length * 2);
  try {
    // Decode hex to UTF-8 string
    const bytes = [];
    for (let i = 0; i < stringHex.length; i += 2) {
      bytes.push(parseInt(stringHex.slice(i, i + 2), 16));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return '';
  }
}

// ============================================
// BLOCKSCOUT API FETCHER
// ============================================

const MAX_RETRIES = 3;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<BlockscoutApiResponse> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const text = await res.text();
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        throw new Error('Got HTML error page instead of JSON');
      }
      return JSON.parse(text) as BlockscoutApiResponse;
    } catch (err) {
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error('fetchWithRetry: exhausted retries');
}

// Fetch a single block range without chunking - returns logs + whether it hit the cap
async function fetchLogsSingle(
  address: string,
  topic0: string,
  fromBlock: number,
  toBlock: number
): Promise<{ logs: BlockscoutLogResult[]; hitCap: boolean }> {
  const allLogs: BlockscoutLogResult[] = [];
  let page = 1;
  let hasMore = true;
  let hitCap = false;

  while (hasMore && page <= MAX_PAGES_PER_CONTRACT) {
    const url = new URL(BLOCKSCOUT_API_URL);
    url.searchParams.set('module', 'logs');
    url.searchParams.set('action', 'getLogs');
    url.searchParams.set('address', address);
    url.searchParams.set('topic0', topic0);
    url.searchParams.set('fromBlock', fromBlock.toString());
    url.searchParams.set('toBlock', toBlock.toString());
    url.searchParams.set('page', page.toString());
    url.searchParams.set('offset', MAX_RESULTS_PER_PAGE.toString());

    try {
      const data = await fetchWithRetry(url.toString());

      if (data.status === '1' && data.result && data.result.length > 0) {
        allLogs.push(...data.result);
        if (data.result.length >= MAX_RESULTS_PER_PAGE) {
          page++;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Blockscout API error for ${address}:`, error);
      hasMore = false;
    }

    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, API_RATE_LIMIT_MS));
    }
  }

  if (page > MAX_PAGES_PER_CONTRACT) hitCap = true;
  return { logs: allLogs, hitCap };
}

// Adaptive fetch: if a chunk hits the 100k ceiling, split it in half and retry
async function fetchLogsAdaptive(
  address: string,
  topic0: string,
  fromBlock: number,
  toBlock: number
): Promise<BlockscoutLogResult[]> {
  const { logs, hitCap } = await fetchLogsSingle(address, topic0, fromBlock, toBlock);

  if (!hitCap) {
    if (logs.length > 0) {
      console.log(`  Blocks ${fromBlock}-${toBlock}: ${logs.length} logs`);
    }
    return logs;
  }

  // Hit the 100k cap - split in half if range is large enough
  const range = toBlock - fromBlock;
  if (range <= MIN_CHUNK_SIZE) {
    console.warn(`  WARN: ${fromBlock}-${toBlock} (${range} blocks) capped at ${logs.length} logs at min chunk size`);
    return logs;
  }

  const mid = fromBlock + Math.floor(range / 2);
  console.log(`  Splitting ${fromBlock}-${toBlock} (${logs.length} capped) at ${mid}`);

  // Sequential to avoid excessive concurrent requests and deep stacks
  const left = await fetchLogsAdaptive(address, topic0, fromBlock, mid);
  const right = await fetchLogsAdaptive(address, topic0, mid + 1, toBlock);
  return left.concat(right);
}

// Main entry: split into initial large chunks, then adaptively subdivide dense ones
async function fetchLogsFromBlockscout(
  address: string,
  topic0: string,
  fromBlock: number,
  toBlock: number
): Promise<BlockscoutLogResult[]> {
  let allLogs: BlockscoutLogResult[] = [];
  for (let start = fromBlock; start < toBlock; start += INITIAL_CHUNK_SIZE) {
    const end = Math.min(start + INITIAL_CHUNK_SIZE - 1, toBlock);
    const logs = await fetchLogsAdaptive(address, topic0, start, end);
    allLogs = allLogs.concat(logs);
  }
  console.log(`  Total for ${address.slice(0, 10)}...: ${allLogs.length} logs`);
  return allLogs;
}

// ============================================
// SWAP EVENTS
// ============================================

export async function fetchSwapEventsBlockscout(
  fromBlock: number,
  toBlock: number
): Promise<SwapEvent[]> {
  const events: SwapEvent[] = [];
  const pools = [CONTRACTS.USDC_EURC_POOL, CONTRACTS.USDC_USYC_POOL];

  for (const pool of pools) {
    console.log(`Fetching swaps from ${pool} (blocks ${fromBlock}-${toBlock})`);
    const logs = await fetchLogsFromBlockscout(pool, EVENT_TOPICS.SWAP, fromBlock, toBlock);
    console.log(`Found ${logs.length} swap logs from ${pool}`);

    for (const log of logs) {
      const dataFields = parseDataField(log.data);

      if (dataFields.length >= 3 && log.topics.length >= 4) {
        events.push({
          txHash: log.transactionHash,
          sender: topicToAddress(log.topics[1]),
          tokenIn: topicToAddress(log.topics[2]),
          tokenOut: topicToAddress(log.topics[3]),
          amountIn: dataFields[0],
          amountOut: dataFields[1],
          to: '0x' + dataFields[2].toString(16).padStart(40, '0').slice(-40),
          blockNumber: BigInt(hexToNumber(log.blockNumber)),
          timestamp: hexToNumber(log.timeStamp),
        });
      }
    }
  }

  return events;
}

// ============================================
// VAULT EVENTS
// ============================================

export async function fetchVaultEventsBlockscout(
  fromBlock: number,
  toBlock: number
): Promise<VaultEvent[]> {
  const events: VaultEvent[] = [];

  // Fetch deposits
  console.log(`Fetching vault deposits (blocks ${fromBlock}-${toBlock})`);
  const depositLogs = await fetchLogsFromBlockscout(
    CONTRACTS.VAULT,
    EVENT_TOPICS.VAULT_DEPOSIT,
    fromBlock,
    toBlock
  );
  console.log(`Found ${depositLogs.length} vault deposit logs`);

  for (const log of depositLogs) {
    const dataFields = parseDataField(log.data);

    if (dataFields.length >= 2 && log.topics.length >= 3) {
      events.push({
        txHash: log.transactionHash,
        sender: topicToAddress(log.topics[1]),
        owner: topicToAddress(log.topics[2]),
        assets: dataFields[0],
        shares: dataFields[1],
        blockNumber: BigInt(hexToNumber(log.blockNumber)),
        timestamp: hexToNumber(log.timeStamp),
        eventType: 'deposit',
      });
    }
  }

  // Fetch withdraws
  console.log(`Fetching vault withdraws (blocks ${fromBlock}-${toBlock})`);
  const withdrawLogs = await fetchLogsFromBlockscout(
    CONTRACTS.VAULT,
    EVENT_TOPICS.VAULT_WITHDRAW,
    fromBlock,
    toBlock
  );
  console.log(`Found ${withdrawLogs.length} vault withdraw logs`);

  for (const log of withdrawLogs) {
    const dataFields = parseDataField(log.data);

    if (dataFields.length >= 2 && log.topics.length >= 4) {
      events.push({
        txHash: log.transactionHash,
        sender: topicToAddress(log.topics[1]),
        owner: topicToAddress(log.topics[3]),
        assets: dataFields[0],
        shares: dataFields[1],
        blockNumber: BigInt(hexToNumber(log.blockNumber)),
        timestamp: hexToNumber(log.timeStamp),
        eventType: 'withdraw',
      });
    }
  }

  return events;
}

// ============================================
// PAYX TIP EVENTS (V2 - Proper log decoding)
// TipSent(string indexed handleHash, string handle, address indexed tipper,
//         uint256 amount, uint256 fee, string message, uint256 timestamp)
// ============================================

export async function fetchPayXTipEventsBlockscout(
  fromBlock: number,
  toBlock: number
): Promise<PayXTipEvent[]> {
  if (!PAYX_CONTRACT) {
    console.warn('PayX contract address not configured');
    return [];
  }

  const events: PayXTipEvent[] = [];

  console.log(`Fetching PayX TipSent logs from ${PAYX_CONTRACT} (blocks ${fromBlock}-${toBlock})`);
  const logs = await fetchLogsFromBlockscout(
    PAYX_CONTRACT,
    EVENT_TOPICS.PAYX_TIP,
    fromBlock,
    toBlock
  );
  console.log(`Found ${logs.length} PayX TipSent logs`);

  for (const log of logs) {
    try {
      // Topics:
      //   [0] = TipSent event signature
      //   [1] = handleHash (indexed keccak256 of handle string)
      //   [2] = tipper address (indexed)
      // Data (ABI encoded):
      //   slot 0: offset to handle string
      //   slot 1: amount (uint256)
      //   slot 2: fee (uint256)
      //   slot 3: offset to message string
      //   slot 4: timestamp (uint256)
      //   ... dynamic string data follows

      if (log.topics.length < 3) continue;

      const tipper = topicToAddress(log.topics[2]);
      const cleanData = log.data.startsWith('0x') ? log.data.slice(2) : log.data;

      // We need at least 5 static slots (handle offset, amount, fee, message offset, timestamp)
      if (cleanData.length < 5 * 64) continue;

      // Decode handle string (slot 0 = offset pointer)
      const handle = decodeDynamicString(log.data, 0);

      // Decode amount (slot 1)
      const amount = BigInt('0x' + cleanData.slice(64, 128));

      // Decode fee (slot 2)
      const fee = BigInt('0x' + cleanData.slice(128, 192));

      // Decode message (slot 3 = offset pointer)
      const message = decodeDynamicString(log.data, 3);

      // Decode timestamp (slot 4)
      const eventTimestamp = parseInt(cleanData.slice(256, 320), 16);

      events.push({
        txHash: log.transactionHash,
        handle: handle,
        tipper: tipper,
        amount: amount,
        fee: fee,
        message: message,
        blockNumber: BigInt(hexToNumber(log.blockNumber)),
        timestamp: eventTimestamp || hexToNumber(log.timeStamp),
      });
    } catch (error) {
      console.error(`Failed to decode PayX tip log ${log.transactionHash}:`, error);
    }
  }

  console.log(`Successfully decoded ${events.length} PayX tip events`);
  return events;
}

// ============================================
// COMBINED FETCH (V2 - No bridge)
// ============================================

export interface AllEventsBlockscout {
  swaps: SwapEvent[];
  vaultDeposits: VaultEvent[];
  payxTips: PayXTipEvent[];
  fromBlock: number;
  toBlock: number;
}

export async function fetchAllEventsBlockscout(
  fromBlock: number,
  toBlock: number
): Promise<AllEventsBlockscout> {
  console.log(`\n========================================`);
  console.log(`Blockscout API: Fetching all events`);
  console.log(`Block range: ${fromBlock} to ${toBlock} (${toBlock - fromBlock} blocks)`);
  console.log(`========================================\n`);

  const startTime = Date.now();

  // Fetch all event types in parallel
  const [swaps, vaultDeposits, payxTips] = await Promise.all([
    fetchSwapEventsBlockscout(fromBlock, toBlock),
    fetchVaultEventsBlockscout(fromBlock, toBlock),
    fetchPayXTipEventsBlockscout(fromBlock, toBlock),
  ]);

  const elapsed = Date.now() - startTime;
  const totalEvents = swaps.length + vaultDeposits.length + payxTips.length;

  console.log(`\n========================================`);
  console.log(`Blockscout fetch complete in ${elapsed}ms`);
  console.log(`Total events: ${totalEvents}`);
  console.log(`  - Swaps: ${swaps.length}`);
  console.log(`  - Vault: ${vaultDeposits.length}`);
  console.log(`  - PayX: ${payxTips.length}`);
  console.log(`========================================\n`);

  return {
    swaps,
    vaultDeposits,
    payxTips,
    fromBlock,
    toBlock,
  };
}

// ============================================
// GET CURRENT BLOCK
// ============================================

export async function getCurrentBlockNumber(): Promise<number> {
  try {
    const response = await fetch(
      'https://testnet.arcscan.app/api?module=block&action=getblocknobytime&timestamp=9999999999&closest=before'
    );
    const data = await response.json();
    if (data.status === '1' && data.result) {
      // API returns either a string or { blockNumber: "..." }
      const blockNum = typeof data.result === 'object' ? data.result.blockNumber : data.result;
      const parsed = parseInt(blockNum);
      if (!isNaN(parsed)) return parsed;
    }
    return 30000000;
  } catch (error) {
    console.error('Error getting current block:', error);
    return 30000000;
  }
}

// ============================================
// EXPORTS
// ============================================

export { BLOCKSCOUT_API_URL, MAX_RESULTS_PER_PAGE };
