import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_BYTES = 32
const IV_BYTES = 12
const TAG_LENGTH = 16

function getMasterKey(): Buffer {
	const raw = process.env.AI_KEY_ENCRYPTION_SECRET
	if (!raw) throw new Error('AI_KEY_ENCRYPTION_SECRET is not set')
	const key = Buffer.from(raw, 'base64')
	if (key.length !== KEY_BYTES)
		throw new Error(
			`AI_KEY_ENCRYPTION_SECRET must decode to ${KEY_BYTES} bytes`,
		)
	return key
}

export interface EncryptedKey {
	ciphertext: string
	iv: string
	auth_tag: string
}

export function encryptApiKey(plaintext: string): EncryptedKey {
	const key = getMasterKey()
	const iv = randomBytes(IV_BYTES)
	const cipher = createCipheriv(ALGORITHM, key, iv, {
		authTagLength: TAG_LENGTH,
	})
	const encrypted = Buffer.concat([
		cipher.update(plaintext, 'utf8'),
		cipher.final(),
	])
	return {
		ciphertext: encrypted.toString('base64'),
		iv: iv.toString('base64'),
		auth_tag: cipher.getAuthTag().toString('base64'),
	}
}

export function decryptApiKey(encrypted: EncryptedKey): string {
	const key = getMasterKey()
	const iv = Buffer.from(encrypted.iv, 'base64')
	const tag = Buffer.from(encrypted.auth_tag, 'base64')
	const ciphertext = Buffer.from(encrypted.ciphertext, 'base64')
	const decipher = createDecipheriv(ALGORITHM, key, iv, {
		authTagLength: TAG_LENGTH,
	})
	decipher.setAuthTag(tag)
	return Buffer.concat([
		decipher.update(ciphertext),
		decipher.final(),
	]).toString('utf8')
}
