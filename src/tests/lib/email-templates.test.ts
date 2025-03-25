import { getParticipantWelcomeEmailTemplate } from '@/lib/email-templates';

describe('Participant Welcome Email Template', () => {
  const mockParticipant = {
    id: 'test-participant-id',
    husband_first_name: 'John',
    husband_last_name: 'Doe',
    husband_email: 'john.doe@example.com',
    husband_temp_password: 'TestPassword123!',
    wife_first_name: 'Jane',
    wife_last_name: 'Doe',
    wife_email: 'jane.doe@example.com',
    wife_temp_password: 'AnotherTest456@',
    retreat_date: '2025-06-15',
    access_expires_at: '2025-06-20T23:59:59.999Z'
  };

  test('generates email template with temporary passwords', () => {
    const emailHtml = getParticipantWelcomeEmailTemplate(mockParticipant);

    // Check that the email contains both participants' names
    expect(emailHtml).toContain('Dear John and Jane');
    
    // Verify husband's login credentials are in the email
    expect(emailHtml).toContain('John\'s Login:');
    expect(emailHtml).toContain('john.doe@example.com');
    expect(emailHtml).toContain('TestPassword123!');
    
    // Verify wife's login credentials are in the email
    expect(emailHtml).toContain('Jane\'s Login:');
    expect(emailHtml).toContain('jane.doe@example.com');
    expect(emailHtml).toContain('AnotherTest456@');
  });

  test('handles missing temporary passwords', () => {
    const participantWithoutPasswords = {
      ...mockParticipant,
      husband_temp_password: undefined,
      wife_temp_password: undefined
    };

    const emailHtml = getParticipantWelcomeEmailTemplate(participantWithoutPasswords);

    // Check fallback message when passwords are missing
    expect(emailHtml).toContain('Please use the password reset option if you forgot your password');
  });

  test('includes debug information', () => {
    const emailHtml = getParticipantWelcomeEmailTemplate(mockParticipant);

    // Check for debug section
    expect(emailHtml).toContain('DEBUG INFORMATION');
    
    // Verify debug details for husband's password
    expect(emailHtml).toContain('Husband Temp Password:');
    expect(emailHtml).toContain('Exists: true');
    expect(emailHtml).toContain('Type: string');
    expect(emailHtml).toContain(`Length: ${mockParticipant.husband_temp_password.length}`);
    expect(emailHtml).toContain(`Value: ${mockParticipant.husband_temp_password}`);

    // Verify debug details for wife's password
    expect(emailHtml).toContain('Wife Temp Password:');
    expect(emailHtml).toContain('Exists: true');
    expect(emailHtml).toContain('Type: string');
    expect(emailHtml).toContain(`Length: ${mockParticipant.wife_temp_password.length}`);
    expect(emailHtml).toContain(`Value: ${mockParticipant.wife_temp_password}`);
  });
});