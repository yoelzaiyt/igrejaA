// AES-256-GCM encrypt/decrypt for per-church payment gateway credentials.
// Server-side only (api/* runs on Vercel serverless, never in the browser).
// CREDENTIAL_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).

import crypto from 'node:crypto';

function getKey() {
  const hex = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY not configured (expected 64 hex chars / 32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptCredentials(plainTextObject) {
  const key = getKey();
  const iv = crypto.randomBytes(12); // recommended IV size for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(plainTextObject), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

export function decryptCredentials({ ciphertext, iv, authTag }) {
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}
