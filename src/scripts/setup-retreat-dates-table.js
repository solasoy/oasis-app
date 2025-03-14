// This script creates the retreat_dates table in the database and seeds it with initial data
// Run this script with: node src/scripts/setup-retreat-dates-table.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setupRetreatDatesTable() {
  console.log('Setting up retreat_dates table...');

  try {
    // Check if the table exists
    const { error: checkError } = await supabase
      .from('retreat_dates')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('Table does not exist, creating it...');

      // Create the table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS retreat_dates (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          display_name TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Execute the SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });

      if (createError) {
        console.error('Error creating table:', createError);
        return;
      }

      console.log('Table created successfully');

      // Seed the table with initial data
      const initialData = [
        {
          start_date: '2025-03-05',
          end_date: '2025-03-09',
          display_name: 'March 5-9, 2025',
          is_active: true
        },
        {
          start_date: '2025-06-11',
          end_date: '2025-06-15',
          display_name: 'June 11-15, 2025',
          is_active: true
        },
        {
          start_date: '2025-09-17',
          end_date: '2025-09-21',
          display_name: 'September 17-21, 2025',
          is_active: true
        },
        {
          start_date: '2025-12-03',
          end_date: '2025-12-07',
          display_name: 'December 3-7, 2025',
          is_active: true
        }
      ];

      const { error: seedError } = await supabase
        .from('retreat_dates')
        .insert(initialData);

      if (seedError) {
        console.error('Error seeding table:', seedError);
        return;
      }

      console.log('Table seeded successfully with initial data');
    } else if (checkError) {
      console.error('Error checking table:', checkError);
    } else {
      console.log('Table already exists');
    }
  } catch (error) {
    console.error('Error setting up retreat_dates table:', error);
  }
}

// Run the setup function
setupRetreatDatesTable()
  .then(() => {
    console.log('Setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });