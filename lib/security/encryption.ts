import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
// Fallback key for development, should be set in environment variables
const ENCRYPTION_KEY = process.env.PAYMENT_ENCRYPTION_KEY || process.env.SUPABASE_JWT_SECRET?.slice(0, 32) || 'a_very_secure_default_key_32_chars_';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Combine IV + AuthTag + EncryptedData
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(hash: string): string {
  const [ivHex, tagHex, encryptedHex] = hash.split(':');
  
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
