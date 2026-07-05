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

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return Response.json({ error: 'Supabase is not configured properly' }, { status: 500 });
    }
    
    const { userId, taskId } = await request.json();
    
    if (!userId || !taskId) {
      return Response.json({ 
        error: 'User ID and Task ID are required' 
      }, { status: 400 });
    }

    // Check if task completion already exists
    const { data: existingCompletion, error: fetchError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();
    
    if (existingCompletion) {
      return Response.json({ 
        error: 'Task already completed by this user' 
      }, { status: 400 });
    }

    // Insert task completion
    const { data: completion, error: insertError } = await supabase
      .from('task_completions')
      .insert({ 
        user_id: userId, 
        task_id: taskId 
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error completing task:', insertError);
      return Response.json({ error: 'Failed to complete task' }, { status: 500 });
    }

    // Get the task to get points
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('points')
      .eq('id', taskId)
      .single();
    
    if (taskError || !task) {
      console.error('Error fetching task for points:', taskError);
      return Response.json({ error: 'Failed to fetch task' }, { status: 500 });
    }

    // Update user's total points
    const { error: updateError } = await supabase.rpc('update_user_points', {
      user_id: userId
    });
    
    if (updateError) {
      console.error('Error updating user points:', updateError);
      // This is not a critical error, we can continue
    }

    return Response.json({ 
      success: true, 
      completion,
      pointsEarned: task.points
    });
  } catch (error) {
    console.error('Error in complete task API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
