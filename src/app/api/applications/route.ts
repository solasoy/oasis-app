import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { applicantEmailTemplate, adminEmailTemplate } from '@/lib/email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    console.log('Received form data:', formData);
    
    // The data is already in the correct format, just rename the fields
    const applicationData = {
      status: formData.status,
      retreat_date: formData.retreat_date,
      his_name: formData.his_name,
      his_age: formData.his_age,
      his_phone: formData.his_phone,
      his_email: formData.his_email,
      her_name: formData.her_name,
      her_age: formData.her_age,
      her_phone: formData.her_phone,
      her_email: formData.her_email,
      address: formData.address,
      is_occ_member: formData.is_occ_member,
      is_christ_follower: formData.is_christ_follower,
      wedding_date: formData.wedding_date,
      living_arrangement: formData.living_arrangement,
      children: formData.children,
      previous_marriage: formData.previous_marriage,
      retreat_reason: formData.retreat_reason,
      previous_therapy: formData.previous_therapy,
      submitted_at: formData.submitted_at
    };

    console.log('Data to insert:', applicationData);

    // Insert into Supabase
    const { data: application, error: dbError } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: dbError.message,
        details: dbError.details
      }, { 
        status: 400 
      });
    }

    // Send confirmation emails
    try {
      await resend.emails.send({
        from: 'Oasis Retreat <onboarding@resend.dev>',
        to: [applicationData.his_email, applicationData.her_email],
        subject: 'Application Received - Oasis Marriage Retreat',
        html: applicantEmailTemplate(applicationData)
      });

      await resend.emails.send({
        from: 'Oasis Retreat <onboarding@resend.dev>',
        to: 'admin@oasisretreat.com',
        subject: 'New Retreat Application Received',
        html: adminEmailTemplate({ ...applicationData, id: application.id })
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit application',
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    });
  }
} 