type ApplicationData = {
  retreat_date: string;
  his_name: { first: string; last: string };
  her_name: { first: string; last: string };
  his_email: string;
  her_email: string;
  // ... other fields if needed
};

export function getApplicantEmailTemplate(data: ApplicationData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Oasis Retreat Application Confirmation</h2>
      
      <p>Dear ${data.his_name.first} and ${data.her_name.first},</p>
      
      <p>Thank you for applying to the Oasis Marriage Intensive Retreat. We have received your application for the following session:</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <strong>Retreat Date:</strong> ${data.retreat_date}
      </div>
      
      <p>What happens next:</p>
      <ol style="margin: 20px 0;">
        <li>Our team will review your application</li>
        <li>You will receive a follow-up email within 3-5 business days</li>
        <li>If accepted, you will receive instructions for next steps</li>
      </ol>
      
      <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>
      
      <p style="margin-top: 30px;">
        Blessings,<br>
        The Oasis Retreat Team
      </p>
    </div>
  `;
}

export function getAdminEmailTemplate(data: ApplicationData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Retreat Application Received</h2>
      
      <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h3 style="margin-top: 0;">Application Details:</h3>
        <p><strong>Retreat Date:</strong> ${data.retreat_date}</p>
        <p><strong>His Name:</strong> ${data.his_name.first} ${data.his_name.last}</p>
        <p><strong>Her Name:</strong> ${data.her_name.first} ${data.her_name.last}</p>
        <p><strong>Contact:</strong></p>
        <ul>
          <li>His Email: ${data.his_email}</li>
          <li>Her Email: ${data.her_email}</li>
        </ul>
      </div>
      
      <p>Please review this application in the admin dashboard.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/applications" 
         style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
        View Application
      </a>
    </div>
  `;
} 