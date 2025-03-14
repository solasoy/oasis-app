// This script creates a test profile for an existing application
// Run with: node src/scripts/create-test-profile-direct.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
    // Get the first application with 'sdas' as the husband's first name
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'approved')
      .limit(1)
      .single();
    
    if (appError) {
      console.error('Error fetching application:', appError);
      return;
    }
    
    console.log('Found application:', application.id);
    
    // Create a participant profile for this application
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        application_id: application.id,
        retreat_date: '2025-03-05',
        husband_first_name: application.his_name.first,
        husband_last_name: application.his_name.last,
        husband_email: application.his_email,
        wife_first_name: application.her_name.first,
        wife_last_name: application.her_name.last,
        wife_email: application.her_email,
        fee_amount: 3500.00,
        has_payment_plan: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (participantError) {
      console.error('Error creating participant:', participantError);
      return;
    }
    
    console.log('Created participant profile:', participant.id);
    
    // Update the application to mark profile as created
    const { error: updateError } = await supabase
      .from('applications')
      .update({ profile_created: true })
      .eq('id', application.id);
    
    if (updateError) {
      console.error('Error updating application:', updateError);
      return;
    }
    
    console.log('Updated application profile_created to true');
    console.log('Test profile created successfully');
  } catch (error) {
    console.error('Error creating test profile:', error);
  }
}

createTestProfile();