import { describe, expect, it } from 'vitest'

import { RecipeProposalSchema } from './recipe-schema'

const minimalValid = {
	title: 'Pasta',
	ingredients: [{ name: 'pasta', amount: 200, unit: 'g' as const }],
	method: [{ step: 1, instruction: 'Cook pasta until al dente.' }],
}

describe('RecipeProposalSchema', () => {
	it('accepts a minimal valid recipe', () => {
		expect(RecipeProposalSchema.safeParse(minimalValid).success).toBe(true)
	})

	it('rejects a recipe with no title', () => {
		expect(
			RecipeProposalSchema.safeParse({ ...minimalValid, title: '' }).success,
		).toBe(false)
	})

	it('rejects a recipe with an empty ingredients array', () => {
		expect(
			RecipeProposalSchema.safeParse({ ...minimalValid, ingredients: [] })
				.success,
		).toBe(false)
	})

	it('rejects an ingredient with an amount of zero', () => {
		const withZeroAmount = {
			...minimalValid,
			ingredients: [{ name: 'pasta', amount: 0, unit: 'g' as const }],
		}
		expect(RecipeProposalSchema.safeParse(withZeroAmount).success).toBe(false)
	})

	it('rejects an ingredient with a negative amount', () => {
		const withNegativeAmount = {
			...minimalValid,
			ingredients: [{ name: 'pasta', amount: -100, unit: 'g' as const }],
		}
		expect(RecipeProposalSchema.safeParse(withNegativeAmount).success).toBe(
			false,
		)
	})

	it('accepts unit: null for countable items', () => {
		const withNullUnit = {
			...minimalValid,
			ingredients: [{ name: 'eggs', amount: 2, unit: null }],
		}
		expect(RecipeProposalSchema.safeParse(withNullUnit).success).toBe(true)
	})

	it('defaults tags to an empty array when omitted', () => {
		const result = RecipeProposalSchema.safeParse(minimalValid)
		expect(result.success && result.data.tags).toEqual([])
	})

	it('defaults visibility to private when omitted', () => {
		const result = RecipeProposalSchema.safeParse(minimalValid)
		expect(result.success && result.data.visibility).toBe('private')
	})

	it('rejects a recipe with an empty method array', () => {
		expect(
			RecipeProposalSchema.safeParse({ ...minimalValid, method: [] }).success,
		).toBe(false)
	})
})
