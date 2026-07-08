import { describe, expect, it } from 'vitest'

import { guessCategory } from './shopping-list'

describe('guessCategory', () => {
	it('matches a known keyword exactly', () => {
		expect(guessCategory('chicken')).toBe('Meat & Fish')
	})

	it('matches a keyword as a substring', () => {
		expect(guessCategory('chicken breast')).toBe('Meat & Fish')
	})

	it('is case-insensitive', () => {
		expect(guessCategory('MILK')).toBe('Dairy')
	})

	it('categorises produce correctly', () => {
		expect(guessCategory('baby spinach')).toBe('Produce')
	})

	it('categorises pantry items correctly', () => {
		expect(guessCategory('olive oil')).toBe('Pantry')
	})

	it('categorises frozen items correctly', () => {
		expect(guessCategory('frozen peas')).toBe('Frozen')
	})

	it('categorises drinks correctly', () => {
		expect(guessCategory('orange juice')).toBe('Drinks')
	})

	it('returns Misc for an unknown ingredient', () => {
		expect(guessCategory('toothpaste')).toBe('Misc')
	})

	it('returns Misc for an empty string', () => {
		expect(guessCategory('')).toBe('Misc')
	})

	it('never matches via the Misc category keywords (it has none)', () => {
		// The loop skips Misc, so "misc" itself falls through to the Misc fallback.
		expect(guessCategory('misc')).toBe('Misc')
	})
})
