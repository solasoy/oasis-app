/**
 * Email templates for the Oasis Retreat application
 */

interface Participant {
  id: string;
  husband_first_name: string;
  husband_last_name: string;
  husband_email: string;
  husband_temp_password?: string;
  wife_first_name: string;
  wife_last_name: string;
  wife_email: string;
  wife_temp_password?: string;
  retreat_date: string;
  access_expires_at?: string;
  [key: string]: any;
}

/**
 * Generates a welcome email template for participants with login credentials
 * @param participant The participant data
 * @returns HTML email template
 */
export function getParticipantWelcomeEmailTemplate(participant: Participant) {
  const retreatDate = new Date(participant.retreat_date).toLocaleDateString();
  const expirationDate = participant.access_expires_at 
    ? new Date(participant.access_expires_at).toLocaleDateString()
    : 'the end of your retreat';
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oasisretreat.com';
  
  // Ensure temporary passwords have a fallback
  const husbandPassword = participant.husband_temp_password || 'Please use the password reset option if you forgot your password';
  const wifePassword = participant.wife_temp_password || 'Please use the password reset option if you forgot your password';

  // DEBUGGING: Comprehensive password information logging
  const debugInfo = `
    <div style="background-color: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #ccc; font-family: monospace;">
      <h3>DEBUG: Temporary Password Information</h3>
      <div>
        <strong>Husband Password:</strong>
        <ul>
          <li>Exists: ${participant.husband_temp_password !== undefined}</li>
          <li>Type: ${typeof participant.husband_temp_password}</li>
          <li>Length: ${participant.husband_temp_password?.length || 'N/A'}</li>
          <li>Value: ${participant.husband_temp_password || 'UNDEFINED'}</li>
        </ul>
      </div>
      <div>
        <strong>Wife Password:</strong>
        <ul>
          <li>Exists: ${participant.wife_temp_password !== undefined}</li>
          <li>Type: ${typeof participant.wife_temp_password}</li>
          <li>Length: ${participant.wife_temp_password?.length || 'N/A'}</li>
          <li>Value: ${participant.wife_temp_password || 'UNDEFINED'}</li>
        </ul>
      </div>
    </div>
  `;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a5568;">Welcome to Oasis Retreat!</h1>
      
      <p>Dear ${participant.husband_first_name} and ${participant.wife_first_name},</p>
      
      <p>We're thrilled that you'll be joining us for the Oasis Retreat on ${retreatDate}. Your application has been approved, and we're excited to begin this journey with you.</p>
      
      <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h2 style="color: #4a5568; margin-top: 0;">Your Login Credentials</h2>
        
        <div style="margin-bottom: 15px;">
          <h3 style="margin-bottom: 5px;">${participant.husband_first_name}'s Login:</h3>
          <p style="margin: 0;"><strong>Email:</strong> ${participant.husband_email}</p>
          <p style="margin: 0;"><strong>Password:</strong> ${husbandPassword}</p>
        </div>
        
        <div>
          <h3 style="margin-bottom: 5px;">${participant.wife_first_name}'s Login:</h3>
          <p style="margin: 0;"><strong>Email:</strong> ${participant.wife_email}</p>
          <p style="margin: 0;"><strong>Password:</strong> ${wifePassword}</p>
        </div>
        
        <p style="margin-top: 15px;"><strong>Note:</strong> You can reset your passwords from the login page. Your access will expire on ${expirationDate}.</p>
      </div>
      
      <p>Please log in to your participant dashboard at <a href="${appUrl}/participant/login" style="color: #4299e1;">${appUrl}/participant/login</a> to complete your retreat preparation steps.</p>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Warm regards,<br>The Oasis Retreat Team</p>

      ${debugInfo}
    </div>
  `;
}

// Other email template functions remain unchanged
export function getAdminApplicationNotificationTemplate(application: any) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oasisretreat.com';
  const submittedDate = new Date(application.submitted_at).toLocaleDateString();
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a5568;">New Oasis Retreat Application</h1>
      
      <p>A new application has been submitted for the Oasis Retreat.</p>
      
      <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h2 style="color: #4a5568; margin-top: 0;">Application Details</h2>
        
        <p><strong>Couple:</strong> ${application.his_name.first} ${application.his_name.last} & ${application.her_name.first} ${application.her_name.last}</p>
        <p><strong>Retreat Date:</strong> ${application.retreat_date}</p>
        <p><strong>Submitted:</strong> ${submittedDate}</p>
      </div>
      
      <p>Please log in to the admin dashboard to review this application: <a href="${appUrl}/admin/applications" style="color: #4299e1;">${appUrl}/admin/applications</a></p>
      
      <p>Regards,<br>Oasis Retreat System</p>
    </div>
  `;
}

export function getApplicationConfirmationTemplate(application: any) {
  const submittedDate = new Date(application.submitted_at).toLocaleDateString();
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a5568;">Oasis Retreat Application Received</h1>
      
      <p>Dear ${application.his_name.first} and ${application.her_name.first},</p>
      
      <p>Thank you for applying to the Oasis Retreat. We have received your application and will review it shortly.</p>
      
      <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h2 style="color: #4a5568; margin-top: 0;">Application Details</h2>
        
        <p><strong>Retreat Date:</strong> ${application.retreat_date}</p>
        <p><strong>Submitted:</strong> ${submittedDate}</p>
      </div>
      
      <p>We will contact you once your application has been reviewed. If you have any questions in the meantime, please don't hesitate to reach out.</p>
      
      <p>Warm regards,<br>The Oasis Retreat Team</p>
    </div>
  `;
}