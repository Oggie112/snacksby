import { describe, expect, it } from 'vitest'

import { parseQuantityString, sumIngredients } from './units'

describe('parseQuantityString', () => {
	it('returns an empty array for null', () => {
		expect(parseQuantityString(null)).toEqual([])
	})

	it('returns an empty array for an empty string', () => {
		expect(parseQuantityString('')).toEqual([])
	})

	it('returns an empty array for a whitespace-only string', () => {
		expect(parseQuantityString('   ')).toEqual([])
	})

	it('parses a quantity with a known unit', () => {
		expect(parseQuantityString('200 g')).toEqual([{ amount: 200, unit: 'g' }])
	})

	it('parses a quantity whose unit is not in the UNITS list as null', () => {
		expect(parseQuantityString('3 eggs')).toEqual([{ amount: 3, unit: null }])
	})

	it('parses a unitless quantity', () => {
		expect(parseQuantityString('2')).toEqual([{ amount: 2, unit: null }])
	})

	it('parses a multi-part string separated by " + "', () => {
		expect(parseQuantityString('200 g + 1 kg')).toEqual([
			{ amount: 200, unit: 'g' },
			{ amount: 1, unit: 'kg' },
		])
	})

	it('skips malformed parts and parses valid ones', () => {
		expect(parseQuantityString('abc + 100 ml')).toEqual([
			{ amount: 100, unit: 'ml' },
		])
	})
})

describe('sumIngredients', () => {
	it('returns an empty string for an empty array', () => {
		expect(sumIngredients([])).toBe('')
	})

	it('sums quantities with the same unit', () => {
		expect(
			sumIngredients([
				{ amount: 200, unit: 'g' },
				{ amount: 300, unit: 'g' },
			]),
		).toBe('500 g')
	})

	it('normalises kg to g before summing then promotes back', () => {
		expect(
			sumIngredients([
				{ amount: 500, unit: 'g' },
				{ amount: 1, unit: 'kg' },
			]),
		).toBe('1.5 kg')
	})

	it('promotes g to kg when total reaches 1000', () => {
		expect(
			sumIngredients([
				{ amount: 500, unit: 'g' },
				{ amount: 500, unit: 'g' },
			]),
		).toBe('1 kg')
	})

	it('does not promote g to kg below the 1000 threshold', () => {
		expect(
			sumIngredients([
				{ amount: 400, unit: 'g' },
				{ amount: 599, unit: 'g' },
			]),
		).toBe('999 g')
	})

	it('normalises L to ml before summing then promotes back', () => {
		expect(
			sumIngredients([
				{ amount: 500, unit: 'ml' },
				{ amount: 1, unit: 'L' },
			]),
		).toBe('1.5 L')
	})

	it('sums unitless quantities independently of unit quantities', () => {
		const result = sumIngredients([
			{ amount: 2, unit: null },
			{ amount: 3, unit: null },
			{ amount: 100, unit: 'g' },
		])
		expect(result).toContain('5')
		expect(result).toContain('100 g')
	})

	it('rounds to 2 decimal places', () => {
		expect(
			sumIngredients([
				{ amount: 1 / 3, unit: 'g' },
				{ amount: 1 / 3, unit: 'g' },
			]),
		).toBe('0.67 g')
	})
})
