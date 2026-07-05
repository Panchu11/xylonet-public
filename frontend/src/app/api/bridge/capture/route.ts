import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user_address, amount, source_chain, destination_chain, state, uses_forwarder, burn_tx, mint_tx, error_message } = body;

    // Validate required fields
    if (!user_address || !amount || !source_chain || !destination_chain || !state) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_address, amount, source_chain, destination_chain, state' },
        { status: 400 }
      );
    }

    if (!['success', 'pending', 'error'].includes(state)) {
      return NextResponse.json(
        { success: false, error: 'Invalid state. Must be: success, pending, or error' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Insert bridge transaction record
    const { error: insertError } = await supabase
      .from('bridge_transactions')
      .insert({
        user_address: user_address.toLowerCase(),
        amount: parsedAmount,
        source_chain,
        destination_chain,
        state,
        uses_forwarder: uses_forwarder || false,
        burn_tx: burn_tx || null,
        mint_tx: mint_tx || null,
        error_message: error_message || null,
      });

    if (insertError) {
      console.error('Bridge capture insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Database insert failed' },
        { status: 500 }
      );
    }

    // Update user's cumulative_bridge_volume if state is success
    if (state === 'success') {
      const addr = user_address.toLowerCase();

      // Get current volume
      const { data: userData } = await supabase
        .from('users')
        .select('cumulative_bridge_volume')
        .eq('address', addr)
        .single();

      if (userData) {
        const currentVolume = parseFloat(userData.cumulative_bridge_volume) || 0;
        const { error: updateError } = await supabase
          .from('users')
          .update({ cumulative_bridge_volume: currentVolume + parsedAmount })
          .eq('address', addr);

        if (updateError) {
          console.error('Bridge volume update error:', updateError);
          // Non-fatal — the transaction record was already saved
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bridge capture API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
