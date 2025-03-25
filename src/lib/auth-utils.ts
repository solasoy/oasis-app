import crypto from 'crypto';

/**
 * Generates a secure temporary password with guaranteed complexity
 * @param length The length of the password to generate (default: 12)
 * @returns A randomly generated password meeting complexity requirements
 */
export function generateTemporaryPassword(length = 12): string {
  // Define character sets with cryptographically secure random selection
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*';
  
  // Combine all character sets
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Generate password with guaranteed complexity
  const passwordChars: string[] = [
    uppercaseChars[crypto.randomInt(uppercaseChars.length)],
    lowercaseChars[crypto.randomInt(lowercaseChars.length)],
    numberChars[crypto.randomInt(numberChars.length)],
    specialChars[crypto.randomInt(specialChars.length)]
  ];
  
  // Fill the rest of the password with cryptographically secure random selection
  while (passwordChars.length < length) {
    passwordChars.push(allChars[crypto.randomInt(allChars.length)]);
  }
  
  // Cryptographically secure shuffle
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }
  
  return passwordChars.join('');
}

/**
 * Validates password complexity with detailed feedback
 * @param password The password to validate
 * @returns Validation result with detailed information
 */
export function validatePasswordComplexity(password: string): {
  isValid: boolean;
  details: {
    length: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  }
} {
  if (!password) return {
    isValid: false,
    details: {
      length: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false
    }
  };
  
  const validationDetails = {
    length: password.length >= 10,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password)
  };

  return {
    isValid: Object.values(validationDetails).every(check => check),
    details: validationDetails
  };
}

/**
 * Creates a participant account in Supabase Auth with enhanced logging and error handling
 * @param supabase Supabase client instance
 * @param email Participant's email address
 * @param password Generated temporary password
 * @param role 'husband' or 'wife'
 * @returns The created user data or null if creation failed
 */
export async function createParticipantAccount(
  supabase: any,
  email: string,
  password: string,
  role: 'husband' | 'wife'
) {
  try {
    // Validate password complexity with detailed feedback
    const passwordValidation = validatePasswordComplexity(password);

    if (!passwordValidation.isValid) {
      console.error(`Invalid password complexity for ${role} account`, {
        email,
        validationDetails: passwordValidation.details
      });
      return null;
    }

    // Create user in Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role,
        account_type: 'participant'
      }
    });

    if (userError) {
      console.error(`Error creating ${role} account`, {
        email,
        errorDetails: userError,
        errorCode: userError.code,
        errorMessage: userError.message
      });
      return null;
    }

    console.log(`Successfully created ${role} account`, {
      email,
      userId: userData.user.id
    });

    return userData.user;
  } catch (error) {
    console.error(`Unexpected error in createParticipantAccount for ${role}`, {
      email,
      errorDetails: error,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * Checks if a participant's access has expired
 * @param expirationDate The date when access expires
 * @returns Boolean indicating if access has expired
 */
export function hasAccessExpired(expirationDate: string | Date): boolean {
  const expDate = new Date(expirationDate);
  const today = new Date();
  
  // Set both dates to midnight for accurate comparison
  expDate.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);
  
  return today > expDate;
}

/**
 * Generates a secure but memorable password
 * @returns A randomly generated password
 */
export function generateMemorablePassword(): string {
  const adjectives = ['Happy', 'Sunny', 'Brave', 'Bright', 'Calm', 'Clever', 'Eager', 'Gentle', 'Kind', 'Lively'];
  const nouns = ['Mountain', 'River', 'Forest', 'Ocean', 'Desert', 'Meadow', 'Valley', 'Garden', 'Canyon', 'Island'];
  const numbers = Math.floor(crypto.randomInt(900)) + 100; // 3-digit number
  const specialChars = ['!', '@', '#', '$', '%', '&', '*'];
  const specialChar = specialChars[crypto.randomInt(specialChars.length)];
  
  const adjective = adjectives[crypto.randomInt(adjectives.length)];
  const noun = nouns[crypto.randomInt(nouns.length)];
  
  return `${adjective}${noun}${numbers}${specialChar}`;
}