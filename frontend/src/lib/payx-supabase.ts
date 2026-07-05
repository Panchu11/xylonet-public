import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for read-only operations (client-side safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for write operations (server-side only, bypasses RLS)
// Falls back to anon key if service role key is not available (client-side)
let _serviceClient: SupabaseClient | null = null;
function getServiceClient(): SupabaseClient {
  if (_serviceClient) return _serviceClient;
  if (supabaseServiceKey) {
    _serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } else {
    // Fallback: use anon key (will fail on RLS-protected writes)
    console.warn('[PayX] SUPABASE_SERVICE_ROLE_KEY not set - write operations may fail due to RLS');
    _serviceClient = supabase;
  }
  return _serviceClient;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYX TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PayXUser {
  id: string;
  wallet_address: string | null;
  x_handle: string | null;
  total_sent: number;
  total_received: number;
  tip_count: number;
  first_seen: string;
  last_active: string;
  created_at: string;
}

export interface PayXTip {
  id: string;
  tx_hash: string;
  from_address: string;
  to_handle: string;
  amount: number;
  fee: number;
  message: string | null;
  timestamp: string;
  block_number: number;
  indexed_at: string;
}

export interface PayXStats {
  total_volume: number;
  total_tips: number;
  total_users: number;
  unique_tippers: number;
  unique_recipients: number;
  volume_24h: number;
  tips_24h: number;
  avg_tip: number;
  updated_at: string;
}

export interface RecentTip {
  id: string;
  from_address: string;
  to_handle: string;
  amount: number;
  message: string | null;
  timestamp: string;
  tx_hash: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function getOrCreatePayXUser(
  walletAddress?: string,
  xHandle?: string
): Promise<PayXUser | null> {
  if (!walletAddress && !xHandle) return null;

  const normalizedWallet = walletAddress?.toLowerCase();
  const normalizedHandle = xHandle?.toLowerCase();

  // Try to find existing user
  let query = supabase.from('payx_users').select('*');
  
  if (normalizedWallet) {
    query = query.eq('wallet_address', normalizedWallet);
  } else if (normalizedHandle) {
    query = query.eq('x_handle', normalizedHandle);
  }

  const { data: existingUser } = await query.single();

  if (existingUser) {
    return existingUser as PayXUser;
  }

  // Create new user
  const { data: newUser, error } = await getServiceClient()
    .from('payx_users')
    .insert({
      wallet_address: normalizedWallet,
      x_handle: normalizedHandle,
      total_sent: 0,
      total_received: 0,
      tip_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[PayX] Error creating user:', error);
    return null;
  }

  return newUser as PayXUser;
}

export async function updateUserStats(
  walletAddress: string,
  amountSent: number
): Promise<void> {
  const normalizedWallet = walletAddress.toLowerCase();

  // Get or create user
  let { data: user } = await getServiceClient()
    .from('payx_users')
    .select('*')
    .eq('wallet_address', normalizedWallet)
    .single();

  if (!user) {
    // Create user
    const { data: newUser } = await getServiceClient()
      .from('payx_users')
      .insert({
        wallet_address: normalizedWallet,
        total_sent: amountSent,
        tip_count: 1,
      })
      .select()
      .single();
    return;
  }

  // Update existing user
  await getServiceClient()
    .from('payx_users')
    .update({
      total_sent: (user.total_sent || 0) + amountSent,
      tip_count: (user.tip_count || 0) + 1,
      last_active: new Date().toISOString(),
    })
    .eq('wallet_address', normalizedWallet);
}

export async function updateRecipientStats(
  xHandle: string,
  amountReceived: number
): Promise<void> {
  const normalizedHandle = xHandle.toLowerCase();

  // Get or create user by handle
  let { data: user } = await getServiceClient()
    .from('payx_users')
    .select('*')
    .eq('x_handle', normalizedHandle)
    .single();

  if (!user) {
    // Create user
    await getServiceClient()
      .from('payx_users')
      .insert({
        x_handle: normalizedHandle,
        total_received: amountReceived,
      });
    return;
  }

  // Update existing user
  await getServiceClient()
    .from('payx_users')
    .update({
      total_received: (user.total_received || 0) + amountReceived,
      last_active: new Date().toISOString(),
    })
    .eq('x_handle', normalizedHandle);
}

// ═══════════════════════════════════════════════════════════════════════════
// TIP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function indexTip(tip: Omit<PayXTip, 'id' | 'indexed_at'>): Promise<boolean> {
  const { error } = await getServiceClient()
    .from('payx_tips')
    .upsert(
      {
        tx_hash: tip.tx_hash,
        from_address: tip.from_address.toLowerCase(),
        to_handle: tip.to_handle.toLowerCase(),
        amount: tip.amount,
        fee: tip.fee,
        message: tip.message,
        timestamp: tip.timestamp,
        block_number: tip.block_number,
      },
      { onConflict: 'tx_hash' }
    );

  if (error) {
    console.error('[PayX] Error indexing tip:', error);
    return false;
  }

  // Update user stats
  await updateUserStats(tip.from_address, tip.amount);
  await updateRecipientStats(tip.to_handle, tip.amount);

  return true;
}

export async function getRecentTips(limit: number = 10): Promise<RecentTip[]> {
  const { data, error } = await supabase
    .from('payx_tips')
    .select('id, from_address, to_handle, amount, message, timestamp, tx_hash')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[PayX] Error fetching recent tips:', error);
    return [];
  }

  return data as RecentTip[];
}

export async function getTipsByHandle(handle: string, limit: number = 20): Promise<PayXTip[]> {
  const { data, error } = await supabase
    .from('payx_tips')
    .select('*')
    .eq('to_handle', handle.toLowerCase())
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[PayX] Error fetching tips by handle:', error);
    return [];
  }

  return data as PayXTip[];
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function getPayXStats(): Promise<PayXStats> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Get total count first (Supabase default limit is 1000, so we need count separately)
  const { count: totalTipCount } = await supabase
    .from('payx_tips')
    .select('*', { count: 'exact', head: true });

  // Get total volume using aggregation - fetch in batches to avoid 1000 row limit
  let allTips: { amount: number; fee: number; from_address: string; to_handle: string; timestamp: string }[] = [];
  let offset = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data: batch } = await supabase
      .from('payx_tips')
      .select('amount, fee, from_address, to_handle, timestamp')
      .range(offset, offset + batchSize - 1);
    
    if (!batch || batch.length === 0) break;
    allTips = allTips.concat(batch);
    
    if (batch.length < batchSize) break;
    offset += batchSize;
  }

  // Get 24h stats - these should be under 1000 typically
  const { data: recentTips } = await supabase
    .from('payx_tips')
    .select('amount')
    .gte('timestamp', yesterday.toISOString())
    .limit(10000); // Explicit high limit for 24h stats

  // Get unique users count
  const { count: totalUsers } = await supabase
    .from('payx_users')
    .select('*', { count: 'exact', head: true });

  const tips = allTips;
  const recent = recentTips || [];

  // Calculate stats
  const totalVolume = tips.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalTips = totalTipCount || tips.length;
  const volume24h = recent.reduce((sum, t) => sum + (t.amount || 0), 0);
  const tips24h = recent.length;
  const avgTip = totalTips > 0 ? totalVolume / totalTips : 0;

  // Get unique tippers and recipients
  const uniqueTippers = new Set(tips.map(t => t.from_address?.toLowerCase())).size;
  const uniqueRecipients = new Set(tips.map(t => t.to_handle?.toLowerCase())).size;

  return {
    total_volume: totalVolume,
    total_tips: totalTips,
    total_users: totalUsers || 0,
    unique_tippers: uniqueTippers,
    unique_recipients: uniqueRecipients,
    volume_24h: volume24h,
    tips_24h: tips24h,
    avg_tip: avgTip,
    updated_at: now.toISOString(),
  };
}

export async function getTotalPayXUsers(): Promise<number> {
  const { count, error } = await supabase
    .from('payx_users')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return 0;
  }

  return count || 0;
}

export async function getActiveUsers24h(): Promise<number> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { count, error } = await supabase
    .from('payx_users')
    .select('*', { count: 'exact', head: true })
    .gte('last_active', yesterday.toISOString());

  if (error) {
    return 0;
  }

  return count || 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// INDEXER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export async function getLastIndexedBlock(): Promise<number> {
  const { data, error } = await supabase
    .from('payx_tips')
    .select('block_number')
    .order('block_number', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.block_number;
}

export async function getFirstIndexedBlock(): Promise<number> {
  const { data, error } = await supabase
    .from('payx_tips')
    .select('block_number')
    .order('block_number', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.block_number;
}

export async function bulkIndexTips(tips: Omit<PayXTip, 'id' | 'indexed_at'>[]): Promise<number> {
  if (tips.length === 0) return 0;

  // Bulk insert tips in batches to avoid payload limits
  const BATCH_SIZE = 500;
  let totalIndexed = 0;
  const client = getServiceClient();
  
  for (let i = 0; i < tips.length; i += BATCH_SIZE) {
    const batch = tips.slice(i, i + BATCH_SIZE);
    
    const { data, error } = await client
      .from('payx_tips')
      .upsert(
        batch.map(tip => ({
          tx_hash: tip.tx_hash,
          from_address: tip.from_address.toLowerCase(),
          to_handle: tip.to_handle.toLowerCase(),
          amount: tip.amount,
          fee: tip.fee,
          message: tip.message,
          timestamp: tip.timestamp,
          block_number: tip.block_number,
        })),
        { onConflict: 'tx_hash' }
      )
      .select();

    if (error) {
      console.error(`[PayX] Error bulk indexing tips batch ${i}-${i+BATCH_SIZE}:`, error);
    } else {
      totalIndexed += data?.length || 0;
    }
  }
  
  // NOTE: User stats are synced separately via syncUsersFromTips()
  // Do NOT update users here - it's too slow for bulk operations
  
  return totalIndexed;
}

// Sync payx_users from existing payx_tips (one-time or repair function)
export async function syncUsersFromTips(): Promise<{ tippers: number; recipients: number }> {
  const client = getServiceClient();
  
  // Get all tips (reads work with anon key too, but use service for consistency)
  const { data: tips, error } = await client
    .from('payx_tips')
    .select('from_address, to_handle, amount');

  if (error || !tips) {
    console.error('[PayX] Error fetching tips for sync:', error);
    return { tippers: 0, recipients: 0 };
  }

  // Aggregate by tipper
  const tipperStats = new Map<string, { total: number; count: number }>();
  const recipientStats = new Map<string, number>();

  for (const tip of tips) {
    const addr = tip.from_address.toLowerCase();
    const handle = tip.to_handle.toLowerCase();
    const amount = tip.amount || 0;

    // Tipper stats
    const existing = tipperStats.get(addr) || { total: 0, count: 0 };
    tipperStats.set(addr, { total: existing.total + amount, count: existing.count + 1 });

    // Recipient stats
    recipientStats.set(handle, (recipientStats.get(handle) || 0) + amount);
  }

  // Upsert tippers
  for (const [wallet, stats] of tipperStats) {
    await client
      .from('payx_users')
      .upsert(
        {
          wallet_address: wallet,
          total_sent: stats.total,
          tip_count: stats.count,
          last_active: new Date().toISOString(),
        },
        { onConflict: 'wallet_address' }
      );
  }

  // Upsert recipients
  for (const [handle, total] of recipientStats) {
    await client
      .from('payx_users')
      .upsert(
        {
          x_handle: handle,
          total_received: total,
          last_active: new Date().toISOString(),
        },
        { onConflict: 'x_handle' }
      );
  }

  return { tippers: tipperStats.size, recipients: recipientStats.size };
}
