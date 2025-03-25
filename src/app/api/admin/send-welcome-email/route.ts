import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Enhanced logging function
function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage, data || '');

  // Additional file logging
  try {
    const logDir = path.join(process.cwd(), 'debug-logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFilePath = path.join(logDir, `debug-${new Date().toISOString().split('T')[0]}.log`);
    
    fs.appendFileSync(logFilePath, `${logMessage}\n${JSON.stringify(data, null, 2)}\n\n`);
  } catch (error) {
    console.error('Failed to write debug log', error);
  }
}

// Validate Resend configuration
function validateResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use Resend's development email in dev mode
  const fromEmail = isDevelopment 
    ? 'onboarding@resend.dev' 
    : (process.env.RESEND_FROM_EMAIL || 'noreply@oasisretreat.org');

  const ownerEmail = process.env.RESEND_OWNER_EMAIL || 'solasoy2000@gmail.com';

  debugLog('Resend Configuration Verification', {
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey?.length,
    fromEmail,
    ownerEmail,
    isDevelopment
  });

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  return {
    apiKey,
    fromEmail,
    ownerEmail,
    isDevelopment
  };
}

// Configure Resend with error handling
function createResendClient() {
  try {
    const { apiKey } = validateResendConfig();
    return new Resend(apiKey);
  } catch (error) {
    debugLog('Resend Client Creation Failed', {
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// Create Resend client
const resend = createResendClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Parse retreat date to get the first day with correct year
function parseRetreatStartDate(retreatDateString: string): string {
  try {
    // Extract year from the original date string
    const yearMatch = retreatDateString.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear();

    // Regex to extract month and day
    const dateRegex = /(\w+ \d{1,2})/;
    const match = retreatDateString.match(dateRegex);

    if (match) {
      // Construct a date with the extracted year
      const parsedDate = new Date(`${match[0]}, ${year}`);
      
      debugLog('Retreat Date Parsing', {
        originalDateString: retreatDateString,
        extractedYear: year,
        parsedDate: parsedDate.toISOString()
      });

      return parsedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    // Fallback to original string if parsing fails
    return retreatDateString;
  } catch (error) {
    debugLog('Retreat Date Parsing Error', { 
      retreatDateString, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return retreatDateString;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      participantId, 
      role = 'both',
    } = body;

    debugLog('Welcome Email Request Received', { 
      participantId, 
      role 
    });

    // Fetch participant details with associated application
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('*, applications(*)')
      .eq('id', participantId)
      .single();

    if (fetchError || !participant) {
      debugLog('Participant Fetch Failed', { 
        participantId, 
        error: fetchError 
      });
      return NextResponse.json({ 
        error: 'Participant not found',
        details: { participantId, fetchError }
      }, { status: 404 });
    }

    // Get retreat date from associated application
    const retreatDate = participant.applications?.retreat_date || 'Retreat Date Not Found';
    const formattedRetreatDate = parseRetreatStartDate(retreatDate);

    // Get Resend configuration
    const { fromEmail, ownerEmail, isDevelopment } = validateResendConfig();

    const emails = [];
    const sendEmailPromises = [];

    // Send email based on role
    const sendEmail = async (firstName: string, email: string, password: string, role: 'husband' | 'wife') => {
      if (!email || !password) {
        debugLog(`Skipping ${role} email - missing email or password`, { email, passwordExists: !!password });
        return null;
      }

      const recipientEmail = isDevelopment ? ownerEmail : email;

      const emailMessage = {
        from: fromEmail,
        to: [recipientEmail],
        subject: 'Welcome to Oasis Retreat!',
        text: `Welcome to Oasis Retreat!

Dear ${firstName},

We're thrilled that you'll be joining us for the Oasis Retreat on ${formattedRetreatDate}. Your application has been approved, and we're excited to begin this journey with you.

Your Login Credentials

Password: ${password}

Note: You can reset your passwords from the login page. Your access will expire on ${formattedRetreatDate}.

Please log in to your participant dashboard at /participant/login to complete your retreat preparation steps.

If you have any questions, please don't hesitate to contact us.

Warm regards,
The Oasis Retreat Team${
          isDevelopment ? `\n\nOriginal Recipient: ${email}` : ''
        }`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Welcome to Oasis Retreat!</h1>
            
            <p>Dear ${firstName},</p>
            
            <p>We're thrilled that you'll be joining us for the Oasis Retreat on <strong>${formattedRetreatDate}</strong>. Your application has been approved, and we're excited to begin this journey with you.</p>
            
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #333;">Your Login Credentials</h2>
              <p>Password: <strong>${password}</strong></p>
            </div>
            
            <p><em>Note: You can reset your passwords from the login page. Your access will expire on ${formattedRetreatDate}.</em></p>
            
            <p>Please log in to your participant dashboard at <a href="/participant/login">/participant/login</a> to complete your retreat preparation steps.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Warm regards,<br>The Oasis Retreat Team</p>
            
            ${isDevelopment ? `<p style="color: #888; font-size: 0.8em;">Original Recipient: ${email}</p>` : ''}
          </div>
        `
      };

      debugLog(`Preparing ${role} email`, {
        originalRecipient: email,
        finalRecipient: recipientEmail,
        retreatDate: formattedRetreatDate,
        isDevelopment,
        fromEmail
      });

      try {
        const response = await resend.emails.send(emailMessage);
        
        debugLog(`${role.toUpperCase()} Email Sent`, {
          response,
          originalRecipient: email,
          finalRecipient: recipientEmail
        });

        return response;
      } catch (error) {
        debugLog(`Failed to send ${role} email`, {
          error: error instanceof Error ? error.message : String(error),
          originalRecipient: email,
          finalRecipient: recipientEmail,
          fullError: error
        });
        throw error;
      }
    };

    // Send emails based on role
    if (role === 'husband' || role === 'both') {
      const husbandEmailPromise = sendEmail(
        participant.husband_first_name, 
        participant.husband_email, 
        participant.husband_temp_password, 
        'husband'
      );
      
      if (husbandEmailPromise) {
        sendEmailPromises.push(husbandEmailPromise);
        emails.push(isDevelopment ? ownerEmail : participant.husband_email);
      }
    }

    if (role === 'wife' || role === 'both') {
      const wifeEmailPromise = sendEmail(
        participant.wife_first_name, 
        participant.wife_email, 
        participant.wife_temp_password, 
        'wife'
      );
      
      if (wifeEmailPromise) {
        sendEmailPromises.push(wifeEmailPromise);
        emails.push(isDevelopment ? ownerEmail : participant.wife_email);
      }
    }

    // Wait for all emails to be sent
    const emailResults = await Promise.allSettled(sendEmailPromises);

    const successfulEmails = emailResults.filter(result => result.status === 'fulfilled');
    const failedEmails = emailResults.filter(result => result.status === 'rejected');

    debugLog('Email Sending Summary', {
      totalAttempts: emailResults.length,
      successfulEmails: successfulEmails.length,
      failedEmails: failedEmails.length,
      emails
    });

    // Update participant record
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        welcome_email_sent: successfulEmails.length > 0,
        welcome_email_sent_at: new Date().toISOString()
      })
      .eq('id', participantId);

    if (updateError) {
      debugLog('Failed to update welcome email status', updateError);
    }

    return NextResponse.json({ 
      success: true, 
      emailsSent: successfulEmails.length,
      emails,
      failures: failedEmails.length,
      isDevelopment,
      fromEmail,
      ownerEmail
    });

  } catch (error) {
    debugLog('Catastrophic Email Sending Failure', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({ 
      error: 'Failed to send welcome emails',
      details: String(error)
    }, { status: 500 });
  }
}