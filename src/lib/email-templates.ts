type ApplicationData = {
  retreat_date: string;
  his_name: { first: string; last: string };
  her_name: { first: string; last: string };
  his_email: string;
  her_email: string;
  // ... other fields if needed
};

// Participant data type for welcome emails
type ParticipantData = {
  id: string;
  husband_first_name: string;
  husband_last_name: string;
  husband_email: string;
  wife_first_name: string;
  wife_last_name: string;
  wife_email: string;
  retreat_date: string;
  fee_amount: number;
  has_payment_plan: boolean;
  payment_plan_type?: 'fixed' | 'variable';
  payment_cadence?: string;
  number_of_payments?: number;
  variable_payments?: Array<{amount: number; dueDate: string}>;
  applications?: Array<{
    retreat_date: string;
    [key: string]: any;
  }>;
  // Added field to store the actual meaning of participant.retreat_date
  profile_creation_date?: string;
};

export function getWelcomeEmailTemplate(data: ParticipantData) {
  // Log the retreat date for debugging
  console.log('Retreat date in email template:', {
    retreat_date: data.retreat_date,
    retreat_date_type: typeof data.retreat_date,
    profile_creation_date: data.profile_creation_date
  });
  
  // Calculate payment details if there's a payment plan
  let paymentDetails = '';
  if (data.has_payment_plan) {
    if (data.payment_plan_type === 'fixed' && data.number_of_payments) {
      const paymentAmount = (data.fee_amount / data.number_of_payments).toFixed(2);
      
      // Calculate payment dates based on retreat date and payment cadence
      const retreatDate = new Date(data.retreat_date);
      const paymentDates = [];
      
      for (let i = 0; i < data.number_of_payments; i++) {
        let dueDate = new Date(retreatDate);
        
        // For the first payment, use retreat date
        if (i === 0) {
          dueDate = retreatDate;
        } else {
          // For subsequent payments, add time based on cadence and index
          if (data.payment_cadence === 'monthly') {
            dueDate.setMonth(retreatDate.getMonth() + i);
          } else if (data.payment_cadence === 'biweekly') {
            dueDate.setDate(retreatDate.getDate() + (i * 14));
          } else if (data.payment_cadence === 'weekly') {
            dueDate.setDate(retreatDate.getDate() + (i * 7));
          }
        }
        
        paymentDates.push(dueDate);
      }
      
      paymentDetails = `
        <p>Your payment plan details:</p>
        <ul>
          <li>Plan Type: Fixed (Equal Payments)</li>
          <li>Payment Cadence: ${data.payment_cadence}</li>
          <li>Number of Payments: ${data.number_of_payments}</li>
          <li>Payment Amount: $${paymentAmount} per payment</li>
        </ul>
        
        <p>Payment Schedule:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Payment #</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Amount</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${paymentDates.map((date, index) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${paymentAmount}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${date.toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (data.payment_plan_type === 'variable' && data.variable_payments) {
    } else if (data.payment_plan_type === 'variable' && data.variable_payments) {
      paymentDetails = `
        <p>Your payment plan details:</p>
        <ul>
          <li>Plan Type: Variable (Custom Payments)</li>
          <li>Payment Schedule:</li>
        </ul>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Payment #</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Amount</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${data.variable_payments.map((payment, index) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${payment.amount}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(payment.dueDate).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  } else {
    // For full payment (no payment plan), calculate a due date 1 week before the retreat
    let dueDate = new Date(data.retreat_date);
    
    // If retreat date is in format "March 5-9, 2025", parse it
    if (typeof data.retreat_date === 'string' && data.retreat_date.includes('-')) {
      const match = data.retreat_date.match(/([A-Za-z]+)\s+(\d+)[-–]\d+,\s+(\d{4})/);
      if (match) {
        const [_, month, day, year] = match;
        dueDate = new Date(`${month} ${day}, ${year}`);
        console.log(`Parsed retreat date for full payment due date: ${month} ${day}, ${year} -> ${dueDate.toISOString()}`);
      }
    }
    
    // Subtract 7 days to get the due date (1 week before retreat)
    dueDate.setDate(dueDate.getDate() - 7);
    console.log(`Full payment due date (1 week before retreat): ${dueDate.toLocaleDateString()}`);
    
    paymentDetails = `
      <p>Your payment of $${data.fee_amount.toFixed(2)} is due by <strong>${dueDate.toLocaleDateString()}</strong> (one week before the retreat).</p>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to the Oasis Marriage Retreat!</h2>
      
      <p>Dear ${data.husband_first_name} and ${data.wife_first_name},</p>
      
      <p>We're thrilled to welcome you to the upcoming Oasis Marriage Intensive Retreat! We're looking forward to meeting you and embarking on this journey together.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3 style="margin-top: 0;">Your Retreat Details</h3>
        <p><strong>Date:</strong> ${data.retreat_date}</p>
        <p><strong>Participants:</strong> ${data.husband_first_name} ${data.husband_last_name} & ${data.wife_first_name} ${data.wife_last_name}</p>
      </div>
      
      <h3>Payment Information</h3>
      ${paymentDetails}
      
      <h3>What to Expect</h3>
      <p>Here's what you should know before the retreat:</p>
      <ul style="margin: 20px 0;">
        <li>The retreat will begin at 9:00 AM on the scheduled date</li>
        <li>Please arrive 15-30 minutes early to check in</li>
        <li>Lunch and refreshments will be provided</li>
        <li>Bring a notebook and pen for personal reflections</li>
        <li>Dress comfortably - casual attire is appropriate</li>
      </ul>
      
      <h3>Preparing for the Retreat</h3>
      <p>To make the most of your retreat experience, we recommend:</p>
      <ul style="margin: 20px 0;">
        <li>Set aside some time to discuss your goals for the retreat as a couple</li>
        <li>Get plenty of rest the night before</li>
        <li>Come with an open mind and heart</li>
      </ul>
      
      <p>If you have any questions or need to make any changes to your registration, please don't hesitate to contact us.</p>
      
      <p style="margin-top: 30px;">
        We're looking forward to seeing you soon!<br>
        <br>
        Blessings,<br>
        The Oasis Retreat Team
      </p>
    </div>
  `;
}

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