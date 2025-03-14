// This script creates a test profile for an existing application
// Run with: node src/scripts/create-test-profile.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'create-test-profile.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestProfile() {
  try {
    // Split the SQL into separate statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing SQL: ${statement.trim().substring(0, 50)}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('Error executing SQL:', error);
        } else {
          console.log('SQL executed successfully');
        }
      }
    }
    
    console.log('Test profile created successfully');
  } catch (error) {
    console.error('Error creating test profile:', error);
  }
}

createTestProfile();