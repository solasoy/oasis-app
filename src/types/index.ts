export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
  }
  
  // We'll expand this as we build the application
  export interface ApplicationData {
    partner1: {
      firstName: string;
      lastName: string;
      email: string;
    };
    partner2: {
      firstName: string;
      lastName: string;
      email: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
  }