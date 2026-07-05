// Apply Supabase schema via Management API
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ystfmmvdlldlhjijdcyo.supabase.co';
const SUPABASE_PROJECT_ID = 'ystfmmvdlldlhjijdcyo';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGZtbXZkbGxkbGhqaWpkY3lvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM2NDY4MSwiZXhwIjoyMDgyOTQwNjgxfQ.QuD7X_fB-vSs9Bc_XdtZ0kbbghBWEqfUoIGIl-btycs';

async function applySchema() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Check if tables already exist
  const { data, error } = await supabase.from('xf_developers').select('id').limit(1);

  if (error && error.code === '42P01') {
    console.log('\n=== Supabase tables do not exist yet. ===');
    console.log('You need to apply the schema via Supabase SQL Editor.');
    console.log('');
    console.log('Steps:');
    console.log('1. Open: https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_ID + '/sql');
    console.log('2. Click "New Query"');
    console.log('3. Copy paste the contents of: xylo-facilitator/supabase-schema.sql');
    console.log('4. Click "Run"');
    console.log('');
    console.log('The backend code will work once the tables are created.');
    console.log('Proceeding with building the rest of the system...');
  } else if (error) {
    console.log('Error checking tables:', error.message);
    console.log('You may need to apply the schema manually via SQL Editor.');
  } else {
    console.log('Tables already exist! Schema is ready.');
  }
}

applySchema().catch(console.error);
