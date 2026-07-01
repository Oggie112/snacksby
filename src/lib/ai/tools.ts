import type { SupabaseClient } from '@supabase/supabase-js'
import { tool } from 'ai'
import { z } from 'zod'

import { RecipeProposalSchema } from './recipe-schema'

interface ToolContext {
	supabase: SupabaseClient
	householdId: string
	canWrite: boolean
}

export function createAssistantTools(ctx: ToolContext) {
	const { supabase, householdId, canWrite } = ctx

	const readTools = {
		searchRecipes: tool({
			description:
				'Search for recipes in the household library. Matches against both title and tags so a query like "prawn" will find recipes tagged "prawn" even if the title says "seafood pasta". Set includePublic to true only when the user explicitly asks for inspiration or new recipe ideas from outside their household.',
			inputSchema: z.object({
				query: z
					.string()
					.describe(
						'Search term matched against recipe title and tags. Use a blank string to list all.',
					),
				includePublic: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						'Include public recipes from other households. Only use when the user asks for inspiration or to discover new recipes.',
					),
			}),
			execute: async ({ query, includePublic }) => {
				let req = supabase
					.from('recipes')
					.select('id, title, description, servings, tags')
					.limit(12)

				if (includePublic) {
					req = req.or(`household_id.eq.${householdId},visibility.eq.public`)
				} else {
					req = req.eq('household_id', householdId)
				}

				if (query) {
					req = req.or(
						`title.ilike.%${query}%,tags.cs.{${query.toLowerCase()}}`,
					)
				}

				const { data, error } = await req

				if (error) return { error: error.message }
				return { recipes: data ?? [] }
			},
		}),

		getRecipe: tool({
			description:
				'Get the full details of a single recipe by its ID, including ingredients and method steps.',
			inputSchema: z.object({
				id: z.string().uuid().describe('Recipe ID'),
			}),
			execute: async ({ id }) => {
				const { data, error } = await supabase
					.from('recipes')
					.select(
						'id, title, description, servings, prep_time, cook_time, ingredients, method, tags, visibility',
					)
					.eq('id', id)
					.single()

				if (error) return { error: error.message }
				if (!data) return { error: 'Recipe not found.' }

				return {
					...data,
					ingredients: JSON.parse(data.ingredients as string),
					method: JSON.parse(data.method as string),
				}
			},
		}),

		getMealPlan: tool({
			description:
				'Get the household meal plan for a date range. Use ISO dates (YYYY-MM-DD). Defaults to the current week if the user is vague.',
			inputSchema: z.object({
				startDate: z.string().describe('Start date in YYYY-MM-DD format'),
				endDate: z.string().describe('End date in YYYY-MM-DD format'),
			}),
			execute: async ({ startDate, endDate }) => {
				const { data, error } = await supabase
					.from('meal_plan')
					.select('id, date, meal_type, recipes(id, title)')
					.eq('household_id', householdId)
					.gte('date', startDate)
					.lte('date', endDate)
					.order('date', { ascending: true })

				if (error) return { error: error.message }
				return { entries: data ?? [] }
			},
		}),
	}

	if (!canWrite) return readTools

	const writeTools = {
		proposeAddToPlan: tool({
			description:
				'Propose adding a recipe to the meal plan. Always call getRecipe or searchRecipes first to confirm the recipe exists. Returns a proposal for the user to confirm — nothing is saved yet.',
			inputSchema: z.object({
				date: z.string().describe('Date in YYYY-MM-DD format'),
				mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
				recipeId: z.string().uuid(),
				recipeTitle: z
					.string()
					.describe('Human-readable title shown in the confirmation card'),
			}),
			execute: (args) => ({ type: 'add_to_plan' as const, ...args }),
		}),

		proposeRemoveFromPlan: tool({
			description:
				'Propose removing an entry from the meal plan. Always call getMealPlan first to get the entry ID. Returns a proposal for the user to confirm — nothing is deleted yet.',
			inputSchema: z.object({
				entryId: z
					.string()
					.uuid()
					.describe('The meal_plan row id from getMealPlan'),
				date: z.string(),
				mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
				recipeTitle: z.string(),
			}),
			execute: (args) => ({ type: 'remove_from_plan' as const, ...args }),
		}),

		proposeCreateRecipe: tool({
			description:
				'Propose saving a new recipe to the household library. Use this after finding a recipe via web search or when the user describes a recipe. Returns a proposal for the user to confirm — nothing is saved yet.',
			inputSchema: z.object({
				recipe: RecipeProposalSchema,
			}),
			execute: ({ recipe }) => ({ type: 'create_recipe' as const, recipe }),
		}),
	}

	return { ...readTools, ...writeTools }
}

export type AssistantProposal =
	| {
			type: 'add_to_plan'
			date: string
			mealType: string
			recipeId: string
			recipeTitle: string
	  }
	| {
			type: 'remove_from_plan'
			entryId: string
			date: string
			mealType: string
			recipeTitle: string
	  }
	| { type: 'create_recipe'; recipe: import('./recipe-schema').RecipeProposal }
