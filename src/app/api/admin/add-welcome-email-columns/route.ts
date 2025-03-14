import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Check if the user is an admin (you may want to add proper authorization)
    
    // Add welcome_email_sent column if it doesn't exist
    const { error: addWelcomeEmailSentError } = await supabase.rpc(
      'execute_sql',
      {
        query: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'participants'
              AND column_name = 'welcome_email_sent'
            ) THEN
              ALTER TABLE participants
              ADD COLUMN welcome_email_sent BOOLEAN DEFAULT FALSE;
            END IF;
          END $$;
        `
      }
    );
    
    if (addWelcomeEmailSentError) {
      console.error('Error adding welcome_email_sent column:', addWelcomeEmailSentError);
      return NextResponse.json({ 
        error: 'Failed to add welcome_email_sent column',
        details: addWelcomeEmailSentError.message
      }, { status: 500 });
    }
    
    // Add welcome_email_sent_at column if it doesn't exist
    const { error: addWelcomeEmailSentAtError } = await supabase.rpc(
      'execute_sql',
      {
        query: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'participants'
              AND column_name = 'welcome_email_sent_at'
            ) THEN
              ALTER TABLE participants
              ADD COLUMN welcome_email_sent_at TIMESTAMP WITH TIME ZONE;
            END IF;
          END $$;
        `
      }
    );
    
    if (addWelcomeEmailSentAtError) {
      console.error('Error adding welcome_email_sent_at column:', addWelcomeEmailSentAtError);
      return NextResponse.json({ 
        error: 'Failed to add welcome_email_sent_at column',
        details: addWelcomeEmailSentAtError.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Welcome email columns added successfully'
    });
    
  } catch (error) {
    console.error('Error adding welcome email columns:', error);
    return NextResponse.json({ 
      error: 'Failed to add welcome email columns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}