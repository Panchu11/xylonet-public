/**
 * Administrative API Route to Initialize Bot Database
 * POST /api/admin/init-bot-db
 * 
 * This route uses service role to execute SQL schema
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Create service role client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if tables already exist
    const { data: existingConfig, error: configError } = await supabase
      .from('payx_bot_config')
      .select('key')
      .limit(1);

    if (!configError) {
      const { data: config } = await supabase
        .from('payx_bot_config')
        .select('*')
        .order('key');

      return NextResponse.json({
        success: true,
        message: 'Bot tables already exist',
        config: config || [],
      });
    }

    // Read SQL schema file
    const sqlPath = path.join(process.cwd(), 'sql', 'payx_bot_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    // Note: Supabase JS client doesn't support raw SQL execution
    // We need to return instructions for manual execution
    return NextResponse.json({
      success: false,
      message: 'Bot tables do not exist. Manual SQL execution required.',
      instructions: [
        'Open Supabase Dashboard SQL Editor',
        `Go to: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}`,
        'Navigate to SQL Editor',
        'Copy the SQL content below',
        'Paste and run in SQL Editor',
      ],
      sql: sqlContent,
      totalStatements: statements.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
