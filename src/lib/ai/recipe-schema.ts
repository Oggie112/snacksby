import { z } from 'zod'

import { UNITS } from '@/lib/units'

export const IngredientSchema = z.object({
	name: z.string().describe('Ingredient name'),
	amount: z.number().positive().describe('Numeric quantity'),
	unit: z
		.enum(UNITS)
		.nullable()
		.describe(
			'Unit of measurement, or null for countable items (e.g. eggs, apples)',
		),
})

export const MethodStepSchema = z.object({
	step: z.number().int().positive(),
	instruction: z.string(),
})

export const RecipeProposalSchema = z.object({
	title: z.string().min(1),
	description: z.string().nullable().optional(),
	servings: z.number().int().positive().nullable().optional(),
	prep_time: z
		.number()
		.int()
		.nonnegative()
		.nullable()
		.optional()
		.describe('Prep time in minutes'),
	cook_time: z
		.number()
		.int()
		.nonnegative()
		.nullable()
		.optional()
		.describe('Cook time in minutes'),
	ingredients: z.array(IngredientSchema).min(1),
	method: z.array(MethodStepSchema).min(1),
	tags: z.array(z.string()).default([]),
	visibility: z.enum(['private', 'public']).default('private'),
})

export type RecipeProposal = z.infer<typeof RecipeProposalSchema>
