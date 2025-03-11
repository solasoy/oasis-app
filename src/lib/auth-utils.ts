/**
 * Authentication utilities for the Oasis Retreat application
 */

/**
 * Generates a secure temporary password of specified length
 * @param length The length of the password to generate (default: 10)
 * @returns A randomly generated password
 */
export function generateTemporaryPassword(length = 10) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}