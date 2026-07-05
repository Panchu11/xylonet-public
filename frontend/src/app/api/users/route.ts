import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase environment variables are not set');
}

const supabase = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return Response.json({ error: 'Supabase is not configured properly' }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const countOnly = searchParams.get('count');
    
    // Return total user count if requested
    if (countOnly === 'true') {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error counting users:', error);
        return Response.json({ count: 0 });
      }
      
      return Response.json({ count: count || 0 });
    }
    
    if (!walletAddress) {
      return Response.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Normalize wallet address to lowercase
    const normalizedAddress = walletAddress.toLowerCase();
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .single();
    
    if (existingUser) {
      return Response.json(existingUser);
    }
    
    // Create new user if doesn't exist
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ wallet_address: normalizedAddress })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating user:', createError);
      return Response.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    return Response.json(newUser);
  } catch (error) {
    console.error('Error in users API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return Response.json({ error: 'Supabase is not configured properly' }, { status: 500 });
    }
    
    const { wallet_address, twitter_handle } = await request.json();
    
    if (!wallet_address) {
      return Response.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const normalizedAddress = wallet_address.toLowerCase();
    
    // Update user
    const { data, error } = await supabase
      .from('users')
      .upsert({ wallet_address: normalizedAddress, twitter_handle })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return Response.json({ error: 'Failed to update user' }, { status: 500 });
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('Error in users POST API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
