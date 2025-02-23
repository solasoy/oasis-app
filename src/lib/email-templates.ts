export const applicantEmailTemplate = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1>Thank You for Your Application</h1>
      </div>
      <div style="margin-bottom: 30px;">
        <p>Dear ${data.hisName.first} and ${data.herName.first},</p>
        <p>We have received your application for the Marriage Retreat on ${data.retreatDate}.</p>
        <p>Our team will review your application and respond within 5-7 business days.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      </div>
      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Best regards,<br>The Oasis Team</p>
      </div>
    </div>
  `;
};

export const adminEmailTemplate = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="margin-bottom: 30px;">
        <h1>New Retreat Application</h1>
      </div>
      <div style="margin-bottom: 30px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>His Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.hisName.first} ${data.hisName.last}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Her Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.herName.first} ${data.herName.last}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Retreat Date:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.retreatDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Church Members:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.isOCCMember}</td>
          </tr>
        </table>
      </div>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${data.id}">View Full Application</a></p>
    </div>
  `;
}; 