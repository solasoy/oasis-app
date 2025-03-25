import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { email } = requestBody;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Check if the email belongs to a participant
    const { data: husbandData } = await supabase
      .from('participants')
      .select('*')
      .eq('husband_email', email)
      .maybeSingle();

    const { data: wifeData } = await supabase
      .from('participants')
      .select('*')
      .eq('wife_email', email)
      .maybeSingle();

    // If the email doesn't belong to a participant, we still return success
    // for security reasons (to prevent email enumeration)
    if (!husbandData && !wifeData) {
      return NextResponse.json(
        { success: true, message: 'If your email is registered, you will receive a password reset link' },
        { status: 200 }
      );
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/reset-password`,
    });

    if (error) {
      console.error('Error sending reset password email:', error);
      return NextResponse.json(
        { error: 'Failed to send reset password email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Password reset email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reset-password-request API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}