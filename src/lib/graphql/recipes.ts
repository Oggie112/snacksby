import { gql } from '@apollo/client'

export interface RecipeNode {
	id: string
	title: string
	description: string | null
	servings: number | null
	tags: string[]
}

export interface RecipesCollectionData {
	recipesCollection: {
		edges: Array<{ node: RecipeNode }>
	}
}

export const GET_PUBLIC_RECIPES = gql`
	query GetPublicRecipes {
		recipesCollection(filter: { visibility: { eq: public } }) {
			edges {
				node {
					id
					title
					description
					servings
					tags
				}
			}
		}
	}
`

export interface Ingredient {
	name: string
	quantity: string
}

export interface MethodStep {
	step: number
	instruction: string
}

export interface RecipeDetail {
	id: string
	title: string
	description: string | null
	servings: number | null
	prep_time: number | null
	cook_time: number | null
	ingredients: string
	method: string
	tags: string[]
}

export interface RecipeDetailData {
	recipesCollection: {
		edges: Array<{ node: RecipeDetail }>
	}
}

export const GET_RECIPE = gql`
	query GetRecipe($id: UUID!) {
		recipesCollection(filter: { id: { eq: $id } }) {
			edges {
				node {
					id
					title
					description
					servings
					prep_time
					cook_time
					ingredients
					method
					tags
				}
			}
		}
	}
`

export const GET_MY_RECIPES = gql`
	query GetMyRecipes($householdId: UUID, $userId: UUID!) {
		recipesCollection(
			filter: {
				or: [
					{ householdId: { eq: $householdId } }
					{ createdBy: { eq: $userId } }
				]
			}
		) {
			edges {
				node {
					id
					title
					description
					servings
					tags
				}
			}
		}
	}
`
