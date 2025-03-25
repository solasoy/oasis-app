import { User } from '@supabase/supabase-js';

export class DevAuthBypass {
  // Configurable development mode settings
  private static config = {
    adminAuthBypassed: true,
    participantAuthPreserved: true,
    mockAdminUser: {
      id: 'dev-admin-user-id',
      aud: 'authenticated',
      email: 'dev-admin@example.com',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      role: 'admin',
      app_metadata: { role: 'admin', provider: 'email' },
      user_metadata: { name: 'Development Admin' },
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as User,
    mockParticipantUser: {
      id: 'dev-participant-user-id',
      aud: 'authenticated',
      email: 'dev-participant@example.com',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      role: 'participant',
      app_metadata: { role: 'participant', provider: 'email' },
      user_metadata: { name: 'Development Participant' },
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as User
  };

  // Determine if in development mode
  static isDevMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  // Comprehensive authentication bypass tracing
  static traceAuthFlow(context: string, details?: any): void {
    if (this.isDevMode()) {
      console.log(`🔐 DEV AUTH [${context}]: ${JSON.stringify(details || {}, null, 2)}`);
    }
  }

  // Get mock admin user for development
  static getMockAdminUser(): User {
    this.traceAuthFlow('Retrieving Mock Admin User');
    return this.config.mockAdminUser;
  }

  // Get mock participant user for development
  static getMockParticipantUser(): User {
    this.traceAuthFlow('Retrieving Mock Participant User');
    return this.config.mockParticipantUser;
  }

  // Check if admin authentication should be bypassed
  static shouldBypassAdminAuth(): boolean {
    return this.isDevMode() && this.config.adminAuthBypassed;
  }

  // Check if participant authentication should be preserved
  static shouldPreserveParticipantAuth(): boolean {
    return this.isDevMode() && this.config.participantAuthPreserved;
  }
}