import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { getWelcomeEmailTemplate } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Check if environment variables are set
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: 'Server configuration error',
        details: {
          hasResendKey: !!process.env.RESEND_API_KEY,
        }
      }, { status: 500 });
    }

    // Parse request body to get participant ID
    const { participantId } = await request.json();
    
    if (!participantId) {
      return NextResponse.json({ 
        error: 'Missing participant ID' 
      }, { status: 400 });
    }

    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Fetch participant data with related application
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select(`
        *,
        applications(*)
      `)
      .eq('id', participantId)
      .single();
    
    if (participantError || !participant) {
      console.error('Error fetching participant:', participantError);
      return NextResponse.json({ 
        error: 'Failed to fetch participant data',
        details: participantError?.message
      }, { status: 404 });
    }

    // Log participant data (for debugging)
    console.log('Sending welcome email to participant:', {
      id: participant.id,
      husband: `${participant.husband_first_name} ${participant.husband_last_name}`,
      wife: `${participant.wife_first_name} ${participant.wife_last_name}`,
      retreat_date: participant.retreat_date,
      application_retreat_date: participant.applications && participant.applications[0] ? participant.applications[0].retreat_date : 'No application retreat date',
      applications_array: Array.isArray(participant.applications),
      applications_length: participant.applications ? participant.applications.length : 0,
      first_application: participant.applications && participant.applications[0] ? JSON.stringify(participant.applications[0]) : 'No applications'
    });

    // Fetch the application data directly
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', participant.application_id)
      .single();
    
    if (applicationError) {
      console.error('Error fetching application:', applicationError);
    }
    
    // Log the application data for debugging
    console.log('Application data:', {
      application_id: participant.application_id,
      application_found: !!application,
      application_retreat_date: application?.retreat_date,
      participant_retreat_date: participant.retreat_date
    });
    
    // IMPORTANT: In the participant record, the "retreat_date" field is actually storing
    // the profile creation date, not the actual retreat date. The actual retreat date is
    // stored in the application record.
    
    // Create a modified participant object for the email template
    const emailParticipant = {
      ...participant,
      // Override the retreat_date with the application's retreat_date if available
      retreat_date: application?.retreat_date || participant.retreat_date,
      // Add a field to store the actual meaning of participant.retreat_date
      profile_creation_date: participant.retreat_date
    };
    
    // Log the modified participant data for debugging
    console.log('Modified participant data for email:', {
      profile_creation_date: participant.retreat_date, // This is actually the profile creation date
      application_retreat_date: application?.retreat_date, // This is the actual retreat date
      email_retreat_date: emailParticipant.retreat_date
    });
    
    // Generate email HTML using the welcome email template with the modified participant data
    const emailHtml = getWelcomeEmailTemplate(emailParticipant);
    
    // Send emails to both husband and wife
    const emailErrors = [];
    
    try {
      // Log email addresses before sending
      console.log('Sending welcome emails to:', {
        husband: participant.husband_email,
        wife: participant.wife_email
      });
      
      // Send to both husband and wife
      const emailResults = await Promise.all([
        // Husband email
        resend.emails.send({
          from: 'Oasis Retreat <onboarding@resend.dev>',
          to: [participant.husband_email],
          subject: 'Welcome to the Oasis Marriage Retreat',
          html: emailHtml
        }).catch(e => {
          console.error('Error sending husband email:', e);
          return null;
        }),
        
        // Wife email
        resend.emails.send({
          from: 'Oasis Retreat <onboarding@resend.dev>',
          to: [participant.wife_email],
          subject: 'Welcome to the Oasis Marriage Retreat',
          html: emailHtml
        }).catch(e => {
          console.error('Error sending wife email:', e);
          return null;
        })
      ]);
      
      // Log results
      console.log('Email sending results:', emailResults);
      
      // Check for any failed emails
      emailResults.forEach((result, index) => {
        if (!result) {
          const recipient = index === 0 ? 'husband' : 'wife';
          emailErrors.push(`Failed to send email to ${recipient}`);
        }
      });
      
    } catch (emailError) {
      console.error('Email error:', emailError);
      emailErrors.push(emailError instanceof Error ? emailError.message : 'Email error');
    }

    // If any emails were sent successfully, update the participant record
    if (emailErrors.length < 2) {
      // Update participant record to mark welcome email as sent
      const { error: updateError } = await supabase
        .from('participants')
        .update({
          welcome_email_sent: true,
          welcome_email_sent_at: new Date().toISOString()
        })
        .eq('id', participantId);
      
      if (updateError) {
        console.error('Error updating participant record:', updateError);
        emailErrors.push(`Failed to update participant record: ${updateError.message}`);
      }
    }
    
    // Return success response with email status
    return NextResponse.json({
      success: true,
      participantId: participant.id,
      emailStatus: emailErrors.length === 0 ? 'success' : 'partial',
      emailErrors: emailErrors.length > 0 ? emailErrors : undefined
    }, {
      status: 200
    });
    
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send welcome email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}