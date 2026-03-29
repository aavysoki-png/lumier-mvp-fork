import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS)
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    // Support legacy SHA256 format (salt:hash) during migration
    if (stored.includes(':') && !stored.startsWith('$2')) {
      const { createHash, timingSafeEqual } = require('crypto')
      const [salt, hash] = stored.split(':')
      const incoming = createHash('sha256').update(salt + password).digest('hex')
      return timingSafeEqual(Buffer.from(hash), Buffer.from(incoming))
    }
    return bcrypt.compareSync(password, stored)
  } catch {
    return false
  }
}
