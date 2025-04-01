import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getApplicationConfirmationTemplate, getAdminApplicationNotificationTemplate } from '@/lib/email-templates';

// Add logging for environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('API Config:', {
  hasSupabaseUrl: !!SUPABASE_URL,
  hasSupabaseKey: !!SUPABASE_KEY,
  supabaseUrlLength: SUPABASE_URL?.length,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Add type checking
type Name = {
  first: string;
  last: string;
};

type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country?: string;
};

export async function POST(request: Request) {
  try {
    // 1. Log environment variables
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
    });

    // 2. Parse request body
    const formData = await request.json();
    console.log('Raw form data received:', {
      children_details: formData.children_details,
      previous_marriage_details: formData.previous_marriage_details
    });

    if (!formData) {
      return new NextResponse(JSON.stringify({
        error: 'Invalid request body',
        details: 'Could not parse JSON data'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!formData.hisName?.first || !formData.hisName?.last) {
      return new NextResponse(JSON.stringify({
        error: 'Validation error',
        details: 'His name is required (first and last)'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Add logging at the start
    console.log('API received form data:', formData);

    // 3. Transform data for database
    const applicationData = {
      status: 'pending',
      retreat_date: formData.retreatDate,
      his_name: {
        first: formData.hisName.first.trim(),
        last: formData.hisName.last.trim()
      },
      his_age: formData.hisAge,
      his_phone: formData.hisPhone,
      his_email: formData.hisEmail,
      her_name: {
        first: formData.herName.first.trim(),
        last: formData.herName.last.trim()
      },
      her_age: formData.herAge,
      her_phone: formData.herPhone,
      her_email: formData.herEmail,
      address: {
        line1: formData.address.line1.trim(),
        line2: formData.address.line2?.trim() || '',
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        postal: formData.address.postal.trim(),
        country: formData.address.country?.trim() || 'US'
      },
      is_occ_member: formData.isOCCMember,
      is_christ_follower: formData.isChristFollower,
      wedding_date: formData.weddingDate,
      living_arrangement: formData.livingArrangement,
      children_details: formData.children_details || '',
      previous_marriage_details: formData.previous_marriage_details || '',
      retreat_reason: formData.retreatReason,
      previous_therapy: formData.previousTherapy,
      submitted_at: new Date().toISOString()
    };

    // Add logging after transformation
    console.log('API transformed data:', applicationData);

    // Log before database insert
    console.log('Data being inserted:', {
      children_details: applicationData.children_details,
      previous_marriage_details: applicationData.previous_marriage_details
    });

    // 4. Insert into database
    const { data: application, error: dbError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new NextResponse(JSON.stringify({
        error: 'Database error',
        details: dbError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // After database insert
    console.log('Inserted data:', application);

    // After successful database insert, send emails
    const emailErrors = [];

    try {
      // Log email addresses before sending
      console.log('Sending emails to:', {
        his: applicationData.his_email,
        her: applicationData.her_email,
        admin: process.env.ADMIN_EMAIL
      });

      // Send to both applicants and admin
      const emailResults = await Promise.all([
        // His email
        resend.emails.send({
          from: 'Oasis Retreat <onboarding@resend.dev>',
          to: [applicationData.his_email],
          subject: 'Your Oasis Retreat Application',
          html: getApplicationConfirmationTemplate(applicationData)
        }).catch(e => {
          console.error('Error sending his email:', e);
          return null;
        }),

        // Her email
        resend.emails.send({
          from: 'Oasis Retreat <onboarding@resend.dev>',
          to: [applicationData.her_email],
          subject: 'Your Oasis Retreat Application',
          html: getApplicationConfirmationTemplate(applicationData)
        }).catch(e => {
          console.error('Error sending her email:', e);
          return null;
        }),

        // Admin notification
        resend.emails.send({
          from: 'Oasis Retreat <onboarding@resend.dev>',
          to: [process.env.ADMIN_EMAIL!],
          subject: 'New Oasis Retreat Application',
          html: getAdminApplicationNotificationTemplate(applicationData)
        }).catch(e => {
          console.error('Error sending admin email:', e);
          return null;
        })
      ]);

      // Log results
      console.log('Email sending results:', emailResults);

      // Check for any failed emails
      emailResults.forEach((result, index) => {
        if (!result) {
          const recipient = index === 0 ? 'his' : index === 1 ? 'her' : 'admin';
          emailErrors.push(`Failed to send email to ${recipient}`);
        }
      });

    } catch (emailError) {
      console.error('Email error:', emailError);
      emailErrors.push(emailError instanceof Error ? emailError.message : 'Email error');
    }

    // 6. Return success response
    return new NextResponse(JSON.stringify({
      success: true,
      data: application,
      emailStatus: emailErrors.length === 0 ? 'success' : 'partial',
      emailErrors: emailErrors.length > 0 ? emailErrors : undefined
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Application submission error:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}