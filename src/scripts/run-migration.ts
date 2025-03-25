/**
 * Script to run SQL migrations on the Supabase database
 * 
 * Usage:
 * npm run migrate -- src/scripts/migrations/add-auth-fields-to-participants.sql
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    // Get the migration file path from command line arguments
    const migrationFilePath = process.argv[2];
    
    if (!migrationFilePath) {
      console.error('Error: Migration file path is required');
      console.log('Usage: npm run migrate -- <path-to-migration-file>');
      process.exit(1);
    }
    
    // Read the migration file
    const fullPath = path.resolve(process.cwd(), migrationFilePath);
    console.log(`Reading migration file: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: Migration file not found: ${fullPath}`);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(fullPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        process.exit(1);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();