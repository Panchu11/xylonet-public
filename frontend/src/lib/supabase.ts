import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface User {
  id: string;
  wallet_address: string;
  twitter_handle: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  task_type: 'social' | 'onchain';
  action_url: string | null;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
  verified: boolean;
  tx_hash: string | null;
}

export interface LeaderboardEntry {
  wallet_address: string;
  total_points: number;
  rank: number;
}

// Helper functions
export async function getOrCreateUser(walletAddress: string): Promise<User | null> {
  const normalizedAddress = walletAddress.toLowerCase();
  
  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', normalizedAddress)
    .single();
  
  if (existingUser) {
    return existingUser as User;
  }
  
  // Create new user
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({ wallet_address: normalizedAddress })
    .select()
    .single();
  
  if (createError) {
    console.error('Error creating user:', createError);
    return null;
  }
  
  return newUser as User;
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return data as Task[];
}

export async function getUserCompletions(userId: string): Promise<TaskCompletion[]> {
  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching completions:', error);
    return [];
  }
  
  return data as TaskCompletion[];
}

export async function completeTask(userId: string, taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('task_completions')
    .insert({ user_id: userId, task_id: taskId });
  
  if (error) {
    console.error('Error completing task:', error);
    return false;
  }
  
  return true;
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('users')
    .select('wallet_address, total_points')
    .order('total_points', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
  
  return (data || []).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  })) as LeaderboardEntry[];
}

export async function getUserRank(walletAddress: string): Promise<number | null> {
  const normalizedAddress = walletAddress.toLowerCase();
  
  // Get user's points
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('total_points')
    .eq('wallet_address', normalizedAddress)
    .single();
  
  if (userError || !user) {
    return null;
  }
  
  // Count users with more points
  const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('total_points', user.total_points);
  
  if (countError) {
    return null;
  }
  
  return (count || 0) + 1;
}

export async function getTotalUsers(): Promise<number> {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    return 0;
  }
  
  return count || 0;
}
