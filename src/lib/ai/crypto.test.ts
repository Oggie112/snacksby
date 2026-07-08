import { beforeEach, describe, expect, it } from 'vitest'

import { decryptApiKey, encryptApiKey } from './crypto'

const VALID_SECRET = Buffer.alloc(32).toString('base64')

beforeEach(() => {
	process.env.AI_KEY_ENCRYPTION_SECRET = VALID_SECRET
})

describe('encryptApiKey / decryptApiKey', () => {
	it('round-trips plaintext correctly', () => {
		const plaintext = 'sk-ant-api03-super-secret-key'
		expect(decryptApiKey(encryptApiKey(plaintext))).toBe(plaintext)
	})

	it('produces a different IV on each call', () => {
		const a = encryptApiKey('same-key')
		const b = encryptApiKey('same-key')
		expect(a.iv).not.toBe(b.iv)
		expect(a.ciphertext).not.toBe(b.ciphertext)
	})

	it('throws when the auth tag is tampered with', () => {
		const encrypted = encryptApiKey('sk-ant-api03-real-key')
		const tampered = {
			...encrypted,
			auth_tag: Buffer.alloc(16).toString('base64'),
		}
		expect(() => decryptApiKey(tampered)).toThrow()
	})

	it('throws when the ciphertext is tampered with', () => {
		const encrypted = encryptApiKey('sk-ant-api03-real-key')
		const buf = Buffer.from(encrypted.ciphertext, 'base64')
		buf[0] ^= 0xff
		expect(() =>
			decryptApiKey({ ...encrypted, ciphertext: buf.toString('base64') }),
		).toThrow()
	})
})

describe('getMasterKey (via encryptApiKey)', () => {
	it('throws when AI_KEY_ENCRYPTION_SECRET is not set', () => {
		delete process.env.AI_KEY_ENCRYPTION_SECRET
		expect(() => encryptApiKey('anything')).toThrow(
			'AI_KEY_ENCRYPTION_SECRET is not set',
		)
	})

	it('throws when the secret decodes to fewer than 32 bytes', () => {
		process.env.AI_KEY_ENCRYPTION_SECRET = Buffer.alloc(16).toString('base64')
		expect(() => encryptApiKey('anything')).toThrow('must decode to 32 bytes')
	})

	it('throws when the secret decodes to more than 32 bytes', () => {
		process.env.AI_KEY_ENCRYPTION_SECRET = Buffer.alloc(64).toString('base64')
		expect(() => encryptApiKey('anything')).toThrow('must decode to 32 bytes')
	})
})
