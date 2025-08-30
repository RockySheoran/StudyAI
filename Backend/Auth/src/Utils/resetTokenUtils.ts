import crypto from 'crypto';

/**
 * Generate a secure random token for password reset
 * @returns {string} A secure random token
 */
export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash the reset token for secure storage
 * @param {string} token - The plain text token
 * @returns {string} The hashed token
 */
export const hashResetToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Check if reset token has expired
 * @param {Date} expiresAt - The expiration date
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (expiresAt: Date): boolean => {
    return new Date() > expiresAt;
};
